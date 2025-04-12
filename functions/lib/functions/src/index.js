"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const enums_1 = require("../../src/types/enums");
// Initialize Firebase Admin
admin.initializeApp();
// Database references
const db = admin.firestore();
const auth = admin.auth();
/**
 * Cloud Function to register a new user
 * Handles both patient and doctor registrations
 */
exports.registerUser = functions.https.onCall(async (data, context) => {
    const { email, password, userType, firstName, lastName, phone, patientData, doctorData } = data;
    // Log function call for debugging
    console.log('registerUser function called with data:', {
        email,
        userType,
        firstName,
        lastName,
        hasPatientData: !!patientData,
        hasDoctorData: !!doctorData
    });
    // Validate input data
    if (!email || !password || !userType || !firstName || !lastName) {
        console.error('Missing required fields:', { email, userType, firstName, lastName });
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    // Validate user type specific data
    if (userType === enums_1.UserType.PATIENT && !patientData) {
        console.error('Missing patient data for patient registration');
        throw new functions.https.HttpsError('invalid-argument', 'Missing patient data');
    }
    if (userType === enums_1.UserType.DOCTOR && !doctorData) {
        console.error('Missing doctor data for doctor registration');
        throw new functions.https.HttpsError('invalid-argument', 'Missing doctor data');
    }
    try {
        // Check if user already exists
        try {
            const userRecord = await auth.getUserByEmail(email);
            if (userRecord) {
                console.error('User already exists with email:', email);
                throw new functions.https.HttpsError('already-exists', 'The email address is already in use by another account');
            }
        }
        catch (error) {
            // If error code is auth/user-not-found, that's good - we can create the user
            if (error.code !== 'auth/user-not-found') {
                throw error;
            }
        }
        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
            disabled: false,
        });
        console.log('User created successfully:', userRecord.uid);
        // Create base user profile
        const userProfile = {
            userId: userRecord.uid,
            email,
            firstName,
            lastName,
            phone: phone || null,
            userType,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            emailVerified: false,
            phoneVerified: false,
            verificationStatus: userType === enums_1.UserType.DOCTOR
                ? enums_1.VerificationStatus.PENDING
                : enums_1.VerificationStatus.VERIFIED,
        };
        // Create user profile in Firestore
        await db.collection('users').doc(userRecord.uid).set(userProfile);
        console.log('User profile created in Firestore');
        // Create type-specific profile
        if (userType === enums_1.UserType.PATIENT && patientData) {
            const patientProfile = {
                userId: userRecord.uid,
                dateOfBirth: patientData.dateOfBirth,
                gender: patientData.gender,
                bloodType: patientData.bloodType || null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await db.collection('patients').doc(userRecord.uid).set(patientProfile);
            console.log('Patient profile created in Firestore');
        }
        else if (userType === enums_1.UserType.DOCTOR && doctorData) {
            const doctorProfile = {
                userId: userRecord.uid,
                specialty: doctorData.specialty,
                licenseNumber: doctorData.licenseNumber,
                yearsOfExperience: doctorData.yearsOfExperience,
                location: doctorData.location,
                languages: doctorData.languages,
                consultationFee: doctorData.consultationFee,
                profilePictureUrl: doctorData.profilePictureUrl,
                licenseDocumentUrl: doctorData.licenseDocumentUrl,
                verificationStatus: enums_1.VerificationStatus.PENDING,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await db.collection('doctors').doc(userRecord.uid).set(doctorProfile);
            console.log('Doctor profile created in Firestore');
        }
        // Generate email verification link
        const verificationLink = await auth.generateEmailVerificationLink(email);
        console.log('Email verification link generated');
        // In a production environment, you would send this link via email
        // For testing, we'll just return it in the response
        return {
            success: true,
            userId: userRecord.uid,
            message: 'User registered successfully',
            verificationLink: process.env.FUNCTIONS_EMULATOR ? verificationLink : undefined
        };
    }
    catch (error) {
        console.error('Error registering user:', error);
        if (error.code === 'auth/email-already-exists') {
            throw new functions.https.HttpsError('already-exists', 'The email address is already in use by another account');
        }
        if (error.code === 'auth/invalid-email') {
            throw new functions.https.HttpsError('invalid-argument', 'The email address is invalid');
        }
        if (error.code === 'auth/weak-password') {
            throw new functions.https.HttpsError('invalid-argument', 'The password is too weak');
        }
        // If it's already an HttpsError, just rethrow it
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'An error occurred while registering the user');
    }
});
//# sourceMappingURL=index.js.map