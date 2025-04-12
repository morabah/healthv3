/**
 * Mock Firebase implementation for local testing
 * This allows testing authentication flows without needing Firebase emulators
 */

import { UserType, VerificationStatus } from '@/types/enums';

// Mock user storage
const mockUsers: Record<string, any> = {};
const mockUserProfiles: Record<string, any> = {};
const mockPatients: Record<string, any> = {};
const mockDoctors: Record<string, any> = {};

// Mock current user
let currentUser: any = null;

// Mock Firebase Auth
export const mockAuth = {
  currentUser: null as any,
  
  // Sign in with email and password
  signInWithEmailAndPassword: async (email: string, password: string) => {
    const user = Object.values(mockUsers).find(
      (u: any) => u.email === email && u.password === password
    );
    
    if (!user) {
      throw new Error('auth/user-not-found');
    }
    
    currentUser = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      reload: async () => {
        // Simulate reload by updating from mock storage
        const updatedUser = mockUsers[user.uid];
        if (updatedUser) {
          currentUser.emailVerified = updatedUser.emailVerified;
        }
      }
    };
    
    mockAuth.currentUser = currentUser;
    
    // Trigger onAuthStateChanged callbacks
    mockAuth._listeners.forEach((callback: any) => {
      callback(currentUser);
    });
    
    return { user: currentUser };
  },
  
  // Create user with email and password
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    // Check if user already exists
    const existingUser = Object.values(mockUsers).find(
      (u: any) => u.email === email
    );
    
    if (existingUser) {
      throw new Error('auth/email-already-exists');
    }
    
    // Create new user
    const uid = `user_${Date.now()}`;
    const newUser = {
      uid,
      email,
      password, // Note: In a real system, this would be hashed
      emailVerified: false,
      reload: async () => {
        // Simulate reload by updating from mock storage
        const updatedUser = mockUsers[uid];
        if (updatedUser) {
          currentUser.emailVerified = updatedUser.emailVerified;
        }
      }
    };
    
    mockUsers[uid] = newUser;
    currentUser = {
      uid: newUser.uid,
      email: newUser.email,
      emailVerified: newUser.emailVerified,
      reload: newUser.reload
    };
    
    mockAuth.currentUser = currentUser;
    
    // Trigger onAuthStateChanged callbacks
    mockAuth._listeners.forEach((callback: any) => {
      callback(currentUser);
    });
    
    return { user: currentUser };
  },
  
  // Sign out
  signOut: async () => {
    currentUser = null;
    mockAuth.currentUser = null;
    
    // Trigger onAuthStateChanged callbacks
    mockAuth._listeners.forEach((callback: any) => {
      callback(null);
    });
    
    return Promise.resolve();
  },
  
  // Send email verification
  sendEmailVerification: async (user: any) => {
    // In a real system, this would send an email
    console.log(`Sending verification email to ${user.email}`);
    return Promise.resolve();
  },
  
  // Verify email (mock function for testing)
  verifyEmail: async (uid: string) => {
    if (mockUsers[uid]) {
      mockUsers[uid].emailVerified = true;
      
      if (currentUser && currentUser.uid === uid) {
        currentUser.emailVerified = true;
      }
    }
    
    return Promise.resolve();
  },
  
  // Auth state change listener
  _listeners: [] as any[],
  onAuthStateChanged: (callback: any) => {
    mockAuth._listeners.push(callback);
    
    // Immediately call with current state
    callback(currentUser);
    
    // Return unsubscribe function
    return () => {
      mockAuth._listeners = mockAuth._listeners.filter(
        (cb: any) => cb !== callback
      );
    };
  }
};

// Mock Firebase Functions
export const mockFunctions = {
  httpsCallable: (name: string) => {
    // Mock registerUser function
    if (name === 'registerUser') {
      return async (data: any) => {
        const { 
          email, 
          password, 
          userType, 
          firstName, 
          lastName, 
          phone, 
          patientData, 
          doctorData 
        } = data;
        
        try {
          // Create user in mock Auth
          const { user } = await mockAuth.createUserWithEmailAndPassword(email, password);
          
          // Create user profile
          const userProfile = {
            userId: user.uid,
            email,
            firstName,
            lastName,
            phone: phone || null,
            userType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            emailVerified: false,
            phoneVerified: false,
            verificationStatus: userType === UserType.DOCTOR 
              ? VerificationStatus.PENDING 
              : VerificationStatus.VERIFIED,
          };
          
          mockUserProfiles[user.uid] = userProfile;
          
          // Create type-specific profile
          if (userType === UserType.PATIENT && patientData) {
            const patientProfile = {
              userId: user.uid,
              dateOfBirth: patientData.dateOfBirth,
              gender: patientData.gender,
              bloodType: patientData.bloodType || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            mockPatients[user.uid] = patientProfile;
          } else if (userType === UserType.DOCTOR && doctorData) {
            const doctorProfile = {
              userId: user.uid,
              specialty: doctorData.specialty,
              licenseNumber: doctorData.licenseNumber,
              yearsOfExperience: doctorData.yearsOfExperience,
              location: doctorData.location,
              languages: doctorData.languages,
              consultationFee: doctorData.consultationFee,
              profilePictureUrl: doctorData.profilePictureUrl,
              licenseDocumentUrl: doctorData.licenseDocumentUrl,
              verificationStatus: VerificationStatus.PENDING,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            mockDoctors[user.uid] = doctorProfile;
          }
          
          console.log('Mock registration successful:', {
            user,
            userProfile,
            patientData: patientData ? mockPatients[user.uid] : null,
            doctorData: doctorData ? mockDoctors[user.uid] : null
          });
          
          // Return data in the format expected by the Cloud Functions SDK
          return {
            data: {
              success: true,
              userId: user.uid,
              message: 'User registered successfully',
            }
          };
        } catch (error: any) {
          console.error('Mock registration error:', error);
          
          // Format error to match Firebase Functions error format
          throw {
            code: error.message || 'unknown-error',
            message: error.message || 'An unknown error occurred during registration'
          };
        }
      };
    }
    
    // Default mock function
    return async () => {
      return { data: { success: true } };
    };
  }
};

// Mock Firebase Firestore
export const mockFirestore = {
  // Collection references
  collection: (collectionPath: string) => {
    return {
      doc: (docId: string) => {
        return {
          get: async () => {
            let data: any = null;
            
            // Determine which mock storage to use based on collection path
            if (collectionPath === 'users' && mockUserProfiles[docId]) {
              data = mockUserProfiles[docId];
            } else if (collectionPath === 'patients' && mockPatients[docId]) {
              data = mockPatients[docId];
            } else if (collectionPath === 'doctors' && mockDoctors[docId]) {
              data = mockDoctors[docId];
            }
            
            return {
              exists: !!data,
              data: () => data,
              id: docId
            };
          },
          set: async (data: any) => {
            // Determine which mock storage to use based on collection path
            if (collectionPath === 'users') {
              mockUserProfiles[docId] = { ...data };
            } else if (collectionPath === 'patients') {
              mockPatients[docId] = { ...data };
            } else if (collectionPath === 'doctors') {
              mockDoctors[docId] = { ...data };
            }
            return Promise.resolve();
          }
        };
      }
    };
  },
  
  // Get a document reference
  doc: (path: string) => {
    const parts = path.split('/');
    const collectionName = parts[0];
    const docId = parts[1];
    
    return {
      get: async () => {
        let data: any = null;
        
        // Determine which mock storage to use based on collection path
        if (collectionName === 'users' && mockUserProfiles[docId]) {
          data = mockUserProfiles[docId];
        } else if (collectionName === 'patients' && mockPatients[docId]) {
          data = mockPatients[docId];
        } else if (collectionName === 'doctors' && mockDoctors[docId]) {
          data = mockDoctors[docId];
        }
        
        return {
          exists: !!data,
          data: () => data,
          id: docId
        };
      }
    };
  },
  
  // Get document data
  getDoc: async (docRef: any) => {
    return await docRef.get();
  },
  
  // Legacy methods for backward compatibility
  getUserProfile: async (uid: string) => {
    return mockUserProfiles[uid] || null;
  },
  
  getPatientProfile: async (uid: string) => {
    return mockPatients[uid] || null;
  },
  
  getDoctorProfile: async (uid: string) => {
    return mockDoctors[uid] || null;
  }
};

// Mock Firebase Storage
export const mockStorage = {
  uploadBytes: async () => {
    return Promise.resolve();
  },
  getDownloadURL: async () => {
    return 'https://example.com/mock-image-url.jpg';
  }
};

// Debug function to view all mock data
export const debugMockData = () => {
  return {
    users: mockUsers,
    userProfiles: mockUserProfiles,
    patients: mockPatients,
    doctors: mockDoctors,
    currentUser
  };
};
