/**
 * Unit tests for validation utilities
 */
import { 
  isValidEmail, 
  isValidPhone, 
  isValidPassword, 
  isValidName, 
  isValidUserType,
  validateUserRegistration 
} from '../../utils/validation';
import { UserType } from '../../../../../src/types/enums';
import { logInfo, logWarn } from '../../../../../src/lib/logger';

// Mock logger
jest.mock('../../../../../src/lib/logger', () => ({
  logInfo: jest.fn(),
  logWarn: jest.fn(),
  logError: jest.fn(),
  logDebug: jest.fn()
}));

describe('Validation Utilities', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('user-name@domain.org')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('test')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@domain')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@domain.')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('test@domain..com')).toBe(false);
      expect(isValidEmail('test@domain com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should return true for valid phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('+12345678901')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
      expect(isValidPhone(null)).toBe(true); // Null is valid
    });

    it('should return false for invalid phone numbers', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abcdefghij')).toBe(false);
      expect(isValidPhone('123456789012345678901')).toBe(false); // Too long
    });
  });

  describe('isValidPassword', () => {
    it('should return true for valid passwords', () => {
      expect(isValidPassword('Password123')).toBe(true);
      expect(isValidPassword('Abcdef123')).toBe(true);
      expect(isValidPassword('P@ssw0rd')).toBe(true);
      expect(isValidPassword('StrongPassword123!')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('pass')).toBe(false); // Too short
      expect(isValidPassword('password')).toBe(false); // No uppercase or number
      expect(isValidPassword('PASSWORD')).toBe(false); // No lowercase or number
      expect(isValidPassword('Password')).toBe(false); // No number
      expect(isValidPassword('password123')).toBe(false); // No uppercase
      expect(isValidPassword('PASSWORD123')).toBe(false); // No lowercase
    });
  });

  describe('isValidName', () => {
    it('should return true for valid names', () => {
      expect(isValidName('John')).toBe(true);
      expect(isValidName('Jane')).toBe(true);
      expect(isValidName('J-D')).toBe(true);
      expect(isValidName('  John  ')).toBe(true); // Trims spaces
    });

    it('should return false for invalid names', () => {
      expect(isValidName('')).toBe(false);
      expect(isValidName('J')).toBe(false); // Too short
      expect(isValidName('  J  ')).toBe(false); // Too short after trim
    });
  });

  describe('isValidUserType', () => {
    it('should return true for valid user types', () => {
      expect(isValidUserType(UserType.PATIENT)).toBe(true);
      expect(isValidUserType(UserType.DOCTOR)).toBe(true);
      expect(isValidUserType(UserType.ADMIN)).toBe(true);
    });

    it('should return false for invalid user types', () => {
      expect(isValidUserType('')).toBe(false);
      expect(isValidUserType('INVALID_TYPE')).toBe(false);
      expect(isValidUserType('patient')).toBe(false); // Case sensitive
    });
  });

  describe('validateUserRegistration', () => {
    const validPatientData = {
      email: 'patient@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
      userType: UserType.PATIENT,
      phone: '+1234567890',
      dateOfBirth: '1990-01-01',
      gender: 'male'
    };

    const validDoctorData = {
      email: 'doctor@example.com',
      password: 'Password123',
      firstName: 'Jane',
      lastName: 'Smith',
      userType: UserType.DOCTOR,
      phone: '+1987654321',
      specialty: 'Cardiology',
      licenseNumber: 'MD12345',
      yearsOfExperience: 10
    };

    it('should validate a valid patient registration', () => {
      const result = validateUserRegistration(validPatientData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate a valid doctor registration', () => {
      const result = validateUserRegistration(validDoctorData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate required fields', () => {
      const result = validateUserRegistration({});
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        email: 'Email is required',
        password: 'Password is required',
        firstName: 'First name is required',
        lastName: 'Last name is required',
        userType: 'User type is required'
      });
    });

    it('should validate email format', () => {
      const result = validateUserRegistration({
        ...validPatientData,
        email: 'invalid-email'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Invalid email format');
    });

    it('should validate password strength', () => {
      const result = validateUserRegistration({
        ...validPatientData,
        password: 'weak'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Password must be at least 8 characters with uppercase, lowercase, and number');
    });

    it('should validate name length', () => {
      const result = validateUserRegistration({
        ...validPatientData,
        firstName: 'J',
        lastName: 'D'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.firstName).toBe('First name must be at least 2 characters');
      expect(result.errors.lastName).toBe('Last name must be at least 2 characters');
    });

    it('should validate user type', () => {
      const result = validateUserRegistration({
        ...validPatientData,
        userType: 'INVALID_TYPE'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.userType).toBe('Invalid user type');
    });

    it('should validate doctor-specific required fields', () => {
      const invalidDoctorData = {
        ...validDoctorData,
        specialty: '',
        licenseNumber: ''
      };
      const result = validateUserRegistration(invalidDoctorData);
      expect(result.isValid).toBe(false);
      expect(result.errors.specialty).toBe('Specialty is required for doctors');
      expect(result.errors.licenseNumber).toBe('License number is required for doctors');
    });

    it('should validate patient-specific required fields', () => {
      const invalidPatientData = {
        ...validPatientData,
        dateOfBirth: '',
        gender: ''
      };
      const result = validateUserRegistration(invalidPatientData);
      expect(result.isValid).toBe(false);
      expect(result.errors.dateOfBirth).toBe('Date of birth is required for patients');
      expect(result.errors.gender).toBe('Gender is required for patients');
    });

    it('should log validation warnings', () => {
      validateUserRegistration({
        ...validPatientData,
        email: 'invalid-email'
      });
      
      expect(logWarn).toHaveBeenCalledWith({
        message: 'User registration validation failed',
        context: 'validation',
        data: expect.objectContaining({
          errors: expect.objectContaining({
            email: 'Invalid email format'
          })
        })
      });
    });
  });
});
