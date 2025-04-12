"use strict";
/**
 * Enumerations for the Health Appointment System
 * These enums provide type safety for various status and type fields throughout the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentStatus = exports.VerificationStatus = exports.UserType = void 0;
/**
 * User types in the system
 * PATIENT - Regular users who book appointments
 * DOCTOR - Healthcare providers who receive appointments
 * ADMIN - System administrators with elevated privileges
 */
var UserType;
(function (UserType) {
    UserType["PATIENT"] = "PATIENT";
    UserType["DOCTOR"] = "DOCTOR";
    UserType["ADMIN"] = "ADMIN";
})(UserType || (exports.UserType = UserType = {}));
/**
 * Verification status for users (particularly doctors)
 * PENDING - Initial state, awaiting verification
 * VERIFIED - Successfully verified
 * REJECTED - Verification was rejected
 */
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["VERIFIED"] = "VERIFIED";
    VerificationStatus["REJECTED"] = "REJECTED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
/**
 * Appointment status tracking
 * PENDING - Initial state when appointment is created
 * CONFIRMED - Appointment has been confirmed by the doctor
 * CANCELLED - Appointment has been cancelled by either party
 * COMPLETED - Appointment has been completed
 */
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["PENDING"] = "PENDING";
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
//# sourceMappingURL=enums.js.map