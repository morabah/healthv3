/**
 * User API Functions
 * Callable functions for user profile management
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UserProfile } from '../../../../src/types/user';
import { PatientProfile } from '../../../../src/types/patient';
import { DoctorProfile, VerificationDocument } from '../../../../src/types/doctor';
import { UserType, VerificationStatus } from '../../../../src/types/enums';
import { createUserProfile } from '../user/userManagement';
import { createPatientProfile } from '../user/patientManagement';
import { createDoctorProfile, updateDoctorProfile, updateDoctorVerificationStatus, submitVerificationDocument } from '../user/doctorManagement';
import { validateUserRegistration } from '../utils/validation';
import { logInfo, logError, logWarn } from '../../../../src/lib/logger';
import { trackPerformance } from '../../../../src/lib/performance';

/**
 * User Registration Callable Function
 * Registers a new user with Firebase Authentication and creates associated profiles
 * @param data Registration data
 * @param context Function call context
 * @returns User ID and type
 */
export const registerUser = functions.https.onCall(async (data, context) => {
  // Start performance tracking
  const perfTracker = trackPerformance('registerUser', 'functions');
  
  try {
    // Log function start
    logInfo({
      message: 'User registration function called',
      context: 'registerUser',
      data: {
        callerUid: context.auth?.uid || 'unauthenticated',
        userType: data.userType,
        email: data.email
      }
    });
    
    // Validate input data
    const validation = validateUserRegistration(data);
    
    if (!validation.isValid) {
      logError({
        message: 'User registration validation failed',
        context: 'registerUser',
        data: { errors: validation.errors }
      });
      
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid registration data',
        validation.errors
      );
    }
    
    // Extract user data
    const {
      email,
      password,
      firstName,
      lastName,
      userType,
      phone = null,
      // Doctor specific fields
      specialty,
      licenseNumber,
      yearsOfExperience,
      education,
      bio,
      // Patient specific fields
      dateOfBirth,
      gender,
      bloodType,
      medicalHistory
    } = data;
    
    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      phoneNumber: phone,
      disabled: false
    });
    
    logInfo({
      message: 'Firebase Auth user created',
      context: 'registerUser',
      data: { userId: userRecord.uid }
    });
    
    // Create user profile in Firestore
    await createUserProfile(
      userRecord.uid,
      email,
      phone,
      firstName,
      lastName,
      userType as UserType
    );
    
    // Create type-specific profile if needed
    if (userType === UserType.PATIENT) {
      // Create patient profile
      await createPatientProfile({
        userId: userRecord.uid,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        bloodType: bloodType || null,
        medicalHistory: medicalHistory || null
      });
      
      logInfo({
        message: 'Patient profile created',
        context: 'registerUser',
        data: { userId: userRecord.uid }
      });
    } else if (userType === UserType.DOCTOR) {
      // Create doctor profile
      await createDoctorProfile({
        userId: userRecord.uid,
        specialty: specialty || '',
        licenseNumber: licenseNumber || '',
        yearsOfExperience: yearsOfExperience || 0,
        education: education || null,
        bio: bio || null,
        verificationStatus: VerificationStatus.PENDING,
        verificationNotes: null,
        location: null,
        languages: null,
        consultationFee: null,
        profilePictureUrl: null,
        licenseDocumentUrl: null,
        certificateUrl: null
      });
      
      logInfo({
        message: 'Doctor profile created',
        context: 'registerUser',
        data: { userId: userRecord.uid }
      });
    }
    
    // Stop performance tracking
    perfTracker.stop({
      userId: userRecord.uid,
      userType
    });
    
    // Return success response
    return {
      success: true,
      userId: userRecord.uid,
      userType
    };
  } catch (error: any) {
    // Log error
    logError({
      message: 'User registration failed',
      context: 'registerUser',
      data: { error }
    });
    
    // Stop performance tracking with error
    perfTracker.stop({ error: true });
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError(
        'already-exists',
        'The email address is already in use by another account.'
      );
    } else if (error.code === 'auth/invalid-password') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The password must be a string with at least 6 characters.'
      );
    } else if (error.code === 'auth/invalid-email') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The email address is not valid.'
      );
    } else {
      // Generic error
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred during user registration.',
        error
      );
    }
  }
});

/**
 * Updates the authenticated user's profile
 * @param data Profile updates
 * @param context Function call context
 * @returns Updated profile
 */
export const updateMyUserProfile = functions.https.onCall(async (data: {
  userProfile?: Partial<UserProfile>,
  patientProfile?: Partial<PatientProfile>,
  doctorProfile?: Partial<DoctorProfile>
}, context) => {
  // Start performance tracking
  const perfTracker = trackPerformance('updateMyUserProfile', 'functions');
  
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to update your profile'
      );
    }
    
    // Log function start
    logInfo({
      message: 'Update user profile function called',
      context: 'updateMyUserProfile',
      data: { 
        userId: context.auth.uid,
        hasUserUpdates: !!data.userProfile,
        hasPatientUpdates: !!data.patientProfile,
        hasDoctorUpdates: !!data.doctorProfile
      }
    });
    
    // Get user profile to determine role
    const userRef = admin.firestore().collection('users').doc(context.auth.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User profile not found'
      );
    }
    
    const userProfile = userDoc.data() as UserProfile;
    const userType = userProfile.userType;
    
    // Update user profile if provided
    if (data.userProfile) {
      // Remove fields that shouldn't be updated
      const { id, userType: newUserType, isActive, emailVerified, phoneVerified, createdAt, ...validUserUpdates } = data.userProfile;
      
      // Update user profile
      await userRef.update({
        ...validUserUpdates,
        updatedAt: admin.firestore.Timestamp.now()
      });
      
      logInfo({
        message: 'User profile updated',
        context: 'updateMyUserProfile',
        data: { 
          userId: context.auth.uid,
          updatedFields: Object.keys(validUserUpdates)
        }
      });
    }
    
    // Update type-specific profile if provided
    if (userType === UserType.PATIENT && data.patientProfile) {
      const patientRef = admin.firestore().collection('patients').doc(context.auth.uid);
      
      // Remove userId field if present
      const { userId, ...validPatientUpdates } = data.patientProfile;
      
      // Update patient profile
      await patientRef.update(validPatientUpdates);
      
      logInfo({
        message: 'Patient profile updated',
        context: 'updateMyUserProfile',
        data: { 
          userId: context.auth.uid,
          updatedFields: Object.keys(validPatientUpdates)
        }
      });
    } else if (userType === UserType.DOCTOR && data.doctorProfile) {
      // Remove fields that shouldn't be updated by the user
      const { 
        userId, 
        verificationStatus, 
        verificationNotes,
        ...validDoctorUpdates 
      } = data.doctorProfile;
      
      // Update doctor profile
      await updateDoctorProfile(context.auth.uid, validDoctorUpdates);
      
      logInfo({
        message: 'Doctor profile updated',
        context: 'updateMyUserProfile',
        data: { 
          userId: context.auth.uid,
          updatedFields: Object.keys(validDoctorUpdates)
        }
      });
    }
    
    // Get updated profiles
    const updatedUserDoc = await userRef.get();
    const updatedUserProfile = updatedUserDoc.data() as UserProfile;
    
    let updatedTypeProfile = null;
    if (userType === UserType.PATIENT) {
      const patientRef = admin.firestore().collection('patients').doc(context.auth.uid);
      const patientDoc = await patientRef.get();
      if (patientDoc.exists) {
        updatedTypeProfile = patientDoc.data() as PatientProfile;
      }
    } else if (userType === UserType.DOCTOR) {
      const doctorRef = admin.firestore().collection('doctors').doc(context.auth.uid);
      const doctorDoc = await doctorRef.get();
      if (doctorDoc.exists) {
        updatedTypeProfile = doctorDoc.data() as DoctorProfile;
      }
    }
    
    // Log success
    logInfo({
      message: 'Profile updated successfully',
      context: 'updateMyUserProfile',
      data: { userId: context.auth.uid }
    });
    
    // Stop performance tracking
    perfTracker.stop({ userId: context.auth.uid });
    
    return {
      success: true,
      userProfile: updatedUserProfile,
      typeProfile: updatedTypeProfile
    };
  } catch (error: any) {
    // Log error
    logError({
      message: 'Error updating user profile',
      context: 'updateMyUserProfile',
      data: { error }
    });
    
    // Stop performance tracking with error
    perfTracker.stop({ error: true });
    
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An error occurred while updating your profile',
      error
    );
  }
});

/**
 * Uploads a verification document for a doctor
 * @param data Document information
 * @param context Function call context
 * @returns Upload URL and document reference
 */
export const uploadVerificationDocument = functions.https.onCall(async (data: {
  documentType: string,
  fileName: string,
  contentType: string
}, context) => {
  // Start performance tracking
  const perfTracker = trackPerformance('uploadVerificationDocument', 'functions');
  
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to upload verification documents'
      );
    }
    
    // Log function start
    logInfo({
      message: 'Upload verification document function called',
      context: 'uploadVerificationDocument',
      data: { 
        userId: context.auth.uid,
        documentType: data.documentType,
        fileName: data.fileName
      }
    });
    
    // Validate input
    if (!data.documentType || !data.fileName || !data.contentType) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Document type, file name, and content type are required'
      );
    }
    
    // Check if content type is valid
    const validContentTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validContentTypes.includes(data.contentType)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid content type. Supported types: PDF, JPEG, PNG, WEBP, DOC, DOCX'
      );
    }
    
    // Get user profile to verify doctor role
    const userRef = admin.firestore().collection('users').doc(context.auth.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User profile not found'
      );
    }
    
    const userProfile = userDoc.data() as UserProfile;
    if (userProfile.userType !== UserType.DOCTOR) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only doctors can upload verification documents'
      );
    }
    
    // Generate a unique file name
    const timestamp = Date.now();
    const uniqueFileName = `${data.documentType.toLowerCase().replace(/\s+/g, '_')}_${timestamp}_${data.fileName}`;
    const filePath = `doctors/${context.auth.uid}/verification/${uniqueFileName}`;
    
    // Create a reference to the file in Firebase Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(filePath);
    
    // Generate a signed URL for uploading
    const [uploadUrl] = await file.getSignedUrl({
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: data.contentType
    });
    
    // Create a verification document record in Firestore
    const verificationDoc: VerificationDocument = {
      doctorId: context.auth.uid,
      documentType: data.documentType,
      fileUrl: `gs://${bucket.name}/${filePath}`,
      uploadedAt: admin.firestore.Timestamp.now() as any
    };
    
    const savedDoc = await submitVerificationDocument(verificationDoc);
    
    // Log success
    logInfo({
      message: 'Verification document upload URL generated',
      context: 'uploadVerificationDocument',
      data: { 
        userId: context.auth.uid,
        documentId: savedDoc.id,
        filePath
      }
    });
    
    // Stop performance tracking
    perfTracker.stop({ 
      userId: context.auth.uid,
      documentId: savedDoc.id
    });
    
    return {
      success: true,
      uploadUrl,
      document: savedDoc,
      filePath
    };
  } catch (error: any) {
    // Log error
    logError({
      message: 'Error generating upload URL for verification document',
      context: 'uploadVerificationDocument',
      data: { error }
    });
    
    // Stop performance tracking with error
    perfTracker.stop({ error: true });
    
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An error occurred while processing your upload request',
      error
    );
  }
});

/**
 * Admin function to verify a doctor
 * @param data Verification information
 * @param context Function call context
 * @returns Updated doctor profile
 */
export const adminVerifyDoctor = functions.https.onCall(async (data: {
  doctorId: string,
  status: VerificationStatus,
  notes?: string
}, context) => {
  // Start performance tracking
  const perfTracker = trackPerformance('adminVerifyDoctor', 'functions');
  
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to verify doctors'
      );
    }
    
    // Log function start
    logInfo({
      message: 'Admin verify doctor function called',
      context: 'adminVerifyDoctor',
      data: { 
        adminId: context.auth.uid,
        doctorId: data.doctorId,
        status: data.status
      }
    });
    
    // Validate input
    if (!data.doctorId || !data.status) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Doctor ID and verification status are required'
      );
    }
    
    // Check if user is an admin
    const isAdmin = context.auth.token.admin === true;
    
    if (!isAdmin) {
      logWarn({
        message: 'Non-admin user attempted to verify doctor',
        context: 'adminVerifyDoctor',
        data: { 
          userId: context.auth.uid,
          doctorId: data.doctorId
        }
      });
      
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only administrators can verify doctors'
      );
    }
    
    // Update doctor verification status
    const updatedDoctor = await updateDoctorVerificationStatus(
      data.doctorId,
      data.status,
      data.notes
    );
    
    // If doctor is verified, set custom claim
    if (data.status === VerificationStatus.VERIFIED) {
      await admin.auth().setCustomUserClaims(data.doctorId, {
        doctorVerified: true
      });
      
      logInfo({
        message: 'Doctor verification custom claim set',
        context: 'adminVerifyDoctor',
        data: { doctorId: data.doctorId }
      });
    } else {
      // Remove custom claim if not verified
      await admin.auth().setCustomUserClaims(data.doctorId, {
        doctorVerified: false
      });
      
      logInfo({
        message: 'Doctor verification custom claim removed',
        context: 'adminVerifyDoctor',
        data: { doctorId: data.doctorId }
      });
    }
    
    // Log success
    logInfo({
      message: 'Doctor verification status updated successfully',
      context: 'adminVerifyDoctor',
      data: { 
        adminId: context.auth.uid,
        doctorId: data.doctorId,
        status: data.status
      }
    });
    
    // Stop performance tracking
    perfTracker.stop({ 
      doctorId: data.doctorId,
      status: data.status
    });
    
    return {
      success: true,
      doctor: updatedDoctor
    };
  } catch (error: any) {
    // Log error
    logError({
      message: 'Error verifying doctor',
      context: 'adminVerifyDoctor',
      data: { error }
    });
    
    // Stop performance tracking with error
    perfTracker.stop({ error: true });
    
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An error occurred while verifying the doctor',
      error
    );
  }
});

/**
 * Finds doctors based on search criteria
 * @param data Search parameters
 * @param context Function call context
 * @returns List of matching doctors
 */
export const findDoctors = functions.https.onCall(async (data: {
  specialty?: string,
  location?: string,
  name?: string,
  limit?: number
}, context) => {
  // Start performance tracking
  const perfTracker = trackPerformance('findDoctors', 'functions');
  
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to search for doctors'
      );
    }
    
    // Log function start
    logInfo({
      message: 'Find doctors function called',
      context: 'findDoctors',
      data: { 
        userId: context.auth.uid,
        searchParams: data
      }
    });
    
    // Set default limit
    const limit = data.limit || 20;
    
    // Start with base query for verified doctors
    let query = admin.firestore().collection('doctors')
      .where('verificationStatus', '==', VerificationStatus.VERIFIED);
    
    // Apply specialty filter if provided
    if (data.specialty) {
      query = query.where('specialty', '==', data.specialty);
    }
    
    // Apply location filter if provided
    if (data.location) {
      query = query.where('location', '==', data.location);
    }
    
    // Execute query
    const doctorsSnapshot = await query.limit(limit).get();
    const doctors: Array<DoctorProfile & { userProfile?: UserProfile }> = [];
    
    // Get doctor documents
    const doctorDocs = doctorsSnapshot.docs;
    
    // If name filter is provided, we need to get user profiles
    const userIds = doctorDocs.map(doc => doc.id);
    
    // Get user profiles for all doctors
    const userProfiles: Record<string, UserProfile> = {};
    
    if (userIds.length > 0) {
      const userProfilesSnapshot = await admin.firestore()
        .collection('users')
        .where(admin.firestore.FieldPath.documentId(), 'in', userIds)
        .get();
      
      userProfilesSnapshot.forEach(doc => {
        userProfiles[doc.id] = doc.data() as UserProfile;
      });
    }
    
    // Combine doctor profiles with user profiles and apply name filter
    for (const doc of doctorDocs) {
      const doctorProfile = doc.data() as DoctorProfile;
      const userProfile = userProfiles[doc.id];
      
      // Apply name filter if provided
      if (data.name && userProfile) {
        const fullName = `${userProfile.firstName} ${userProfile.lastName}`.toLowerCase();
        if (!fullName.includes(data.name.toLowerCase())) {
          continue; // Skip this doctor if name doesn't match
        }
      }
      
      doctors.push({
        ...doctorProfile,
        userProfile
      });
    }
    
    // Log success
    logInfo({
      message: 'Doctors found successfully',
      context: 'findDoctors',
      data: { 
        userId: context.auth.uid,
        count: doctors.length
      }
    });
    
    // Stop performance tracking
    perfTracker.stop({ 
      count: doctors.length
    });
    
    return {
      success: true,
      doctors
    };
  } catch (error: any) {
    // Log error
    logError({
      message: 'Error finding doctors',
      context: 'findDoctors',
      data: { error }
    });
    
    // Stop performance tracking with error
    perfTracker.stop({ error: true });
    
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'An error occurred while searching for doctors',
      error
    );
  }
});
