/**
 * Login Form Component
 * Handles user authentication with email and password
 */
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import { logInfo, logError } from '@/lib/logger';
import { trackPerformance } from '@/lib/performance';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const performanceTracker = trackPerformance('login', 'auth');
      
      logInfo({
        message: 'Login attempt',
        context: 'LoginForm',
        data: { email: formData.email },
      });

      const auth = getAuth();
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      performanceTracker.stop();
      
      logInfo({
        message: 'Login successful',
        context: 'LoginForm',
        data: { email: formData.email },
      });
    } catch (error: any) {
      logError({
        message: 'Login failed',
        context: 'LoginForm',
        data: { 
          email: formData.email,
          errorCode: error.code,
          errorMessage: error.message 
        },
      });

      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold">Sign In</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="card-body">
        {errors.general && (
          <div className="error-text mb-4">{errors.general}</div>
        )}
        
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 font-medium">
            Email
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">
              <FontAwesomeIcon icon={faEnvelope} />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input pl-10"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              aria-label="Email"
            />
          </div>
          {errors.email && <div className="error-text">{errors.email}</div>}
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 font-medium">
            Password
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input pl-10"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              aria-label="Password"
            />
          </div>
          {errors.password && <div className="error-text">{errors.password}</div>}
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            icon={isLoading ? faSpinner : undefined}
          >
            Sign In
          </Button>
          
          <a href="/auth/forgot-password" className="text-blue-600 hover:text-blue-800">
            Forgot password?
          </a>
        </div>
      </form>
      
      <div className="card-footer">
        <p className="text-center">
          Don't have an account?{' '}
          <a href="/auth/register" className="text-blue-600 hover:text-blue-800">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
