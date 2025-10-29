import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../authContext';


interface AuthFormProps {
  type: 'login' | 'register';
}

export function AuthForm({ type }: AuthFormProps) {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [certifications, setCertifications] = useState('');

const [profileImage, setProfileImage] = useState<File | null>(null);

  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (type === 'register') {
        const { apiService } = await import('../api/api');
        try {
          const registerData: any = { 
            email, 
            password,
            role,
            name: name || undefined
          };

          // Add nutritionist-specific fields if role is NUTRITIONIST
       if (role === 'NUTRITIONIST') {
  if (bio) registerData.bio = bio;
  if (certifications) registerData.certifications = certifications.split(',').map(cert => cert.trim());
  if (yearsOfExperience) registerData.yearsOfExperience = parseInt(yearsOfExperience);
  if (specialization) registerData.specialization = specialization;
  if (qualifications) registerData.qualifications = qualifications;

  // 🖼️ Handle profile image upload (only for Nutritionist)
  if (profileImage) {
    const formData = new FormData();

    // Append all nutritionist fields to FormData
    Object.entries(registerData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(key, v));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });

    // Append the uploaded image file
    formData.append('profileImage', profileImage);

    // Make the multipart/form-data request
    const response = await apiService.register(formData, true);
    console.log("Register response:", response);

    setSuccessMessage('Registration successful! You can now sign in.');
    setEmail('');
    setPassword('');
    setRole('USER');
    setName('');
    setBio('');
    setCertifications('');
    setYearsOfExperience('');
    setSpecialization('');
    setQualifications('');
    setProfileImage(null);
    setTimeout(() => navigate('/login'), 1500);
    return; // stop further code execution
  }
}

const formData = new FormData();
Object.entries(registerData).forEach(([key, value]) => {
  if (Array.isArray(value)) {
    value.forEach((v) => formData.append(key, v));
  } else if (value !== undefined && value !== null) {
    formData.append(key, value as string);
  }
});

if (profileImage) {
  formData.append("profileImage", profileImage);
}

const response = await apiService.register(formData, true); // pass multipart flag
          console.log("Register response:", response);

          setSuccessMessage('Registration successful! You can now sign in.');
          setEmail('');
          setPassword('');
          setRole('USER');
          setName('');
          setBio('');
          setCertifications('');
          setYearsOfExperience('');
          setSpecialization('');
          setQualifications('');
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        } catch (error: any) {
          const message = error instanceof Error ? error.message : 'Registration failed. Please try again.';
          setError(message);
          console.error('Register error:', message);
        }

      } else {
        // Handle Login - using the login function from useAuth
        try {
          const { success, error } = await login({ email, password });
          console.log("Login success:", success);

          if (success) {
            setSuccessMessage('Login successful! Redirecting...');
            setEmail('');
            setPassword('');
            setTimeout(() => {
              navigate('/dashboard');
            }, 500);
          } else {
            setError(error || 'Login failed. Please try again.');
          }
        } catch (error: any) {
          console.error(`${type} Error:`, error);
          setError(error.message || 'Something went wrong. Please try again.');
        }

      }
    } catch (error: any) {
      console.log(`${type} Error:`, error);

      if (type === 'register') {

        setError(
          error?.response?.data?.message || 'Registration failed. Please try again.'
        );

      } else {
        // Login error handling
        if (error?.response?.status === 401) {
          setError('Invalid email or password. Please try again.');
        } else if (error?.response?.status === 404) {
          setError('Account not found. Please check your email or sign up.');
        } else {
          setError(
            error?.response?.data?.message || 'Login failed. Please try again.'
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {type === 'login' ? 'Sign in to your account' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {type === 'login'
            ? 'Sign in to access your personalized nutrition plan'
            : 'Start your journey to better health'}
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        <div className="space-y-4">
          {type === 'register' && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="USER">User</option>
                  <option value="NUTRITIONIST">Nutritionist</option>
                </select>
              </div>

              {/* Nutritionist-specific fields */}
              {role === 'NUTRITIONIST' && (
                <div className="space-y-4 border border-emerald-200 rounded-lg p-4 bg-emerald-50">
                  <h3 className="text-lg font-semibold text-emerald-800 mb-3">Professional Information</h3>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                      placeholder="Tell us about your background and expertise"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 mb-1">
                      Qualifications
                    </label>
                    <input
                      id="qualifications"
                      name="qualifications"
                      type="text"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                      placeholder="e.g., BSc Nutrition, RD, etc."
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization
                    </label>
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                      placeholder="e.g., Sports Nutrition, Weight Management"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <input
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      type="number"
                      min="0"
                      max="50"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                      placeholder="Number of years"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-1">
                      Certifications
                    </label>
                    <input
                      id="certifications"
                      name="certifications"
                      type="text"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                      placeholder="e.g., RD, CNS, CCN (comma-separated)"
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </>
          )}
{type === 'register' && role === 'NUTRITIONIST' && (
  <div>
    <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
      Upload Profile Image
    </label>
    <input
      id="profileImage"
      name="profileImage"
      type="file"
      accept="image/*"
      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
      onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
    />
  </div>
)}


          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={type === 'login' ? 'current-password' : 'new-password'}
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : type === 'login' ? 'Sign in' : 'Sign up'}
          </button>
        </div>

        {/* Toggle between login and register */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {type === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => navigate(type === 'login' ? '/register' : '/login')}
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              {type === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}