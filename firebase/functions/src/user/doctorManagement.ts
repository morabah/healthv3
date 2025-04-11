import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { DoctorProfile, DoctorAvailabilitySlot, VerificationDocument } from '../../../../src/types/doctor';
import { VerificationStatus } from '../../../../src/types/enums';
import { logInfo, logError } from '../../../../src/lib/logger';
import { trackPerformance } from '../../../../src/lib/performance';

/**
 * Creates a new doctor profile in Firestore
 * @param data Doctor profile data
 * @returns Promise resolving to the created doctor profile
 */
export const createDoctorProfile = async (
  data: DoctorProfile
): Promise<DoctorProfile> => {
  // Log function start
  logInfo({
    message: 'Creating doctor profile',
    context: 'doctorManagement',
    data: { userId: data.userId }
  });

  // Track performance
  const perfTracker = trackPerformance('createDoctorProfile', 'doctorManagement');

  try {
    // Validate required fields
    if (!data.userId) {
      throw new Error('userId is required for doctor profile');
    }

    // Save to Firestore
    await admin.firestore()
      .collection('doctors')
      .doc(data.userId)
      .set(data);

    // Log success
    logInfo({
      message: 'Doctor profile created successfully',
      context: 'doctorManagement',
      data: { userId: data.userId }
    });

    // Stop performance tracking
    perfTracker.stop({ userId: data.userId });

    return data;
  } catch (error) {
    // Log error
    logError({
      message: 'Error creating doctor profile',
      context: 'doctorManagement',
      data: { userId: data.userId, error }
    });

    // Stop performance tracking with error info
    perfTracker.stop({ userId: data.userId, error: true });

    // Re-throw the error for the caller to handle
    throw error;
  }
};

/**
 * Updates an existing doctor profile in Firestore
 * @param doctorId Doctor's user ID
 * @param updates Partial updates to apply to the doctor profile
 * @returns Promise resolving to the updated doctor profile
 */
export const updateDoctorProfile = async (
  doctorId: string,
  updates: Partial<DoctorProfile>
): Promise<DoctorProfile> => {
  // Log function start
  logInfo({
    message: 'Updating doctor profile',
    context: 'doctorManagement',
    data: { doctorId, updates }
  });

  // Track performance
  const perfTracker = trackPerformance('updateDoctorProfile', 'doctorManagement');

  try {
    // Get reference to the doctor document
    const doctorRef = admin.firestore().collection('doctors').doc(doctorId);
    
    // Get current doctor data
    const doctorDoc = await doctorRef.get();
    
    if (!doctorDoc.exists) {
      throw new Error(`Doctor profile with ID ${doctorId} not found`);
    }
    
    // Remove userId from updates if present (should not be changed)
    const { userId, ...validUpdates } = updates;
    
    // Update the document
    await doctorRef.update(validUpdates);
    
    // Get the updated doctor profile
    const updatedDoctorDoc = await doctorRef.get();
    const updatedDoctor = updatedDoctorDoc.data() as DoctorProfile;
    
    // Log success
    logInfo({
      message: 'Doctor profile updated successfully',
      context: 'doctorManagement',
      data: { doctorId }
    });
    
    // Stop performance tracking
    perfTracker.stop({ doctorId });
    
    return updatedDoctor;
  } catch (error) {
    // Log error
    logError({
      message: 'Error updating doctor profile',
      context: 'doctorManagement',
      data: { doctorId, error }
    });
    
    // Stop performance tracking with error info
    perfTracker.stop({ doctorId, error: true });
    
    // Re-throw the error for the caller to handle
    throw error;
  }
};

/**
 * Sets availability slots for a doctor
 * @param slots Array of availability slots
 * @returns Promise resolving to the created/updated slots
 */
export const setDoctorAvailability = async (
  slots: DoctorAvailabilitySlot[]
): Promise<DoctorAvailabilitySlot[]> => {
  // Log function start
  logInfo({
    message: 'Setting doctor availability slots',
    context: 'doctorManagement',
    data: { doctorId: slots[0]?.doctorId, slotCount: slots.length }
  });

  // Track performance
  const perfTracker = trackPerformance('setDoctorAvailability', 'doctorManagement');

  try {
    // Validate slots
    if (!slots.length) {
      throw new Error('At least one availability slot must be provided');
    }
    
    const doctorId = slots[0].doctorId;
    
    // Ensure all slots belong to the same doctor
    if (!slots.every(slot => slot.doctorId === doctorId)) {
      throw new Error('All availability slots must belong to the same doctor');
    }
    
    // Get reference to the availability collection
    const availabilityCollection = admin.firestore().collection('doctorAvailability');
    
    // Create a batch for multiple operations
    const batch = admin.firestore().batch();
    
    // First, delete existing slots for this doctor
    const existingSlots = await availabilityCollection
      .where('doctorId', '==', doctorId)
      .get();
    
    existingSlots.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Then, add new slots
    const createdSlots: DoctorAvailabilitySlot[] = [];
    
    for (const slot of slots) {
      const slotRef = availabilityCollection.doc();
      const slotWithId = { ...slot, id: slotRef.id };
      batch.set(slotRef, slotWithId);
      createdSlots.push(slotWithId);
    }
    
    // Commit the batch
    await batch.commit();
    
    // Log success
    logInfo({
      message: 'Doctor availability slots set successfully',
      context: 'doctorManagement',
      data: { doctorId, slotCount: slots.length }
    });
    
    // Stop performance tracking
    perfTracker.stop({ doctorId, slotCount: slots.length });
    
    return createdSlots;
  } catch (error) {
    // Log error
    logError({
      message: 'Error setting doctor availability slots',
      context: 'doctorManagement',
      data: { doctorId: slots[0]?.doctorId, error }
    });
    
    // Stop performance tracking with error info
    perfTracker.stop({ doctorId: slots[0]?.doctorId, error: true });
    
    // Re-throw the error for the caller to handle
    throw error;
  }
};

/**
 * Submits a verification document for a doctor
 * @param doc Verification document data
 * @returns Promise resolving to the created verification document
 */
export const submitVerificationDocument = async (
  doc: VerificationDocument
): Promise<VerificationDocument> => {
  // Log function start
  logInfo({
    message: 'Submitting verification document',
    context: 'doctorManagement',
    data: { doctorId: doc.doctorId, documentType: doc.documentType }
  });

  // Track performance
  const perfTracker = trackPerformance('submitVerificationDocument', 'doctorManagement');

  try {
    // Validate required fields
    if (!doc.doctorId || !doc.documentType || !doc.fileUrl) {
      throw new Error('doctorId, documentType, and fileUrl are required for verification document');
    }
    
    // Set upload timestamp if not provided
    const docWithTimestamp = {
      ...doc,
      uploadedAt: doc.uploadedAt || Timestamp.now() as any
    };
    
    // Create document reference
    const docRef = admin.firestore().collection('verificationDocuments').doc();
    const docWithId = { ...docWithTimestamp, id: docRef.id };
    
    // Save to Firestore
    await docRef.set(docWithId);
    
    // Log success
    logInfo({
      message: 'Verification document submitted successfully',
      context: 'doctorManagement',
      data: { doctorId: doc.doctorId, documentId: docRef.id }
    });
    
    // Stop performance tracking
    perfTracker.stop({ doctorId: doc.doctorId, documentId: docRef.id });
    
    return docWithId;
  } catch (error) {
    // Log error
    logError({
      message: 'Error submitting verification document',
      context: 'doctorManagement',
      data: { doctorId: doc.doctorId, error }
    });
    
    // Stop performance tracking with error info
    perfTracker.stop({ doctorId: doc.doctorId, error: true });
    
    // Re-throw the error for the caller to handle
    throw error;
  }
};

/**
 * Updates a doctor's verification status
 * @param doctorId Doctor's user ID
 * @param status New verification status
 * @param notes Optional notes regarding the verification decision
 * @returns Promise resolving to the updated doctor profile
 */
export const updateDoctorVerificationStatus = async (
  doctorId: string,
  status: VerificationStatus,
  notes?: string
): Promise<DoctorProfile> => {
  // Log function start
  logInfo({
    message: 'Updating doctor verification status',
    context: 'doctorManagement',
    data: { doctorId, status, notes }
  });

  // Track performance
  const perfTracker = trackPerformance('updateDoctorVerificationStatus', 'doctorManagement');

  try {
    // Get reference to the doctor document
    const doctorRef = admin.firestore().collection('doctors').doc(doctorId);
    
    // Get current doctor data
    const doctorDoc = await doctorRef.get();
    
    if (!doctorDoc.exists) {
      throw new Error(`Doctor profile with ID ${doctorId} not found`);
    }
    
    // Update verification status and notes
    const updates: Partial<DoctorProfile> = {
      verificationStatus: status,
      verificationNotes: notes || null
    };
    
    // Update the document
    await doctorRef.update(updates);
    
    // Get the updated doctor profile
    const updatedDoctorDoc = await doctorRef.get();
    const updatedDoctor = updatedDoctorDoc.data() as DoctorProfile;
    
    // Log success
    logInfo({
      message: 'Doctor verification status updated successfully',
      context: 'doctorManagement',
      data: { doctorId, status }
    });
    
    // Stop performance tracking
    perfTracker.stop({ doctorId, status });
    
    return updatedDoctor;
  } catch (error) {
    // Log error
    logError({
      message: 'Error updating doctor verification status',
      context: 'doctorManagement',
      data: { doctorId, status, error }
    });
    
    // Stop performance tracking with error info
    perfTracker.stop({ doctorId, error: true });
    
    // Re-throw the error for the caller to handle
    throw error;
  }
};
