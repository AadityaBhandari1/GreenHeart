import React, { useState } from 'react';
import { useFirebase } from '../../context/firebase';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const SignUpPage = () => {
  const { signUpWithEmailAndPassword } = useFirebase();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState('Consumer'); // Default role is Consumer
  const [gender, setGender] = useState(''); // New gender statel̥
  const [deviceId, setDeviceId] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!name.trim() || !email.trim() || !password.trim() || !gender.trim()) {
      setError("Name, Email, Password, and Gender are required.");
      toast.error("Name, Email, Password, and Gender are required.");
      return;
    }

    if (role === "Farmer") {
      if (!farmSize.trim() || !location.trim()) {
        setError("For farmers, Farm Size and Location are required.");
        toast.error("For farmers, Farm Size and Location are required.");
        return;
      }
    }

    // Log the form data before sending to signup
    console.log({
      name,
      role,
      gender,
      deviceId,
      farmSize,
      location,
      email,
      password,
    });
    try {
      if (role === "Farmer") {
        // Pass parameters in the order: email, password, name, gender, role, deviceId, farmSize, location
        await signUpWithEmailAndPassword(email, password, name, gender, role, deviceId, farmSize, location);
      } else {
        await signUpWithEmailAndPassword(email, password, name, gender, role, deviceId);
      }
      toast.success("Sign up successful! Please sign in.");
      // Redirect to signin after a short delay (e.g., 3 seconds)
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-[100dvh] mt-20 bg-gray-100 flex items-center">
      <Toaster />
      <div className="container mx-auto px-4 ">
        <div className="mx-auto max-w-3xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-7 sm:p-9">
            <h2 className="text-4xl lg:text-4xl font-extrabold mb-3 text-gray-900 text-center">Sign Up</h2>
            <p className="text-center text-gray-600 mb-7 text-xl sm:text-lg">Create your account to get started.</p>
            {error && (
              <p className="text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-2.5 mb-4 text-base" role="alert">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-gray-800 mb-2 text-xl font-medium">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-xl"
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Role & Gender */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="role" className="block text-gray-800 mb-2 text-xl font-medium">Role</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-xl"
                  >
                    <option value="Consumer">Consumer</option>
                    <option value="Admin">Admin</option>
                    <option value="Farmer">Farmer</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="gender" className="block text-gray-800 mb-2 text-xl font-medium">Gender</label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-xl"
                    required
                  >
                    <option value="" disabled>Select your gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Farmer extra fields */}
              {role === "Farmer" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="farmSize" className="block text-gray-800 mb-2 text-xl font-medium">Farm Size</label>
                    <input
                      id="farmSize"
                      type="text"
                      value={farmSize}
                      onChange={(e) => setFarmSize(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-xl"
                      placeholder="e.g., 5 acres"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-gray-800 mb-2 text-xl font-medium">Location</label>
                    <input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-xl"
                      placeholder="Enter your farm location"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Device ID */}
              <div>
                <label htmlFor="deviceId" className="block text-gray-800 mb-2 text-xl font-medium">Device ID</label>
                <input
                  id="deviceId"
                  type="text"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-xl"
                  placeholder="Enter your device ID (if applicable)"
                />
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="email" className="block text-gray-800 mb-2 text-xl font-medium">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-xl"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-gray-800 mb-2 text-xl font-medium">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-xl"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-xl text-xl font-semibold sm:text-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Sign Up
              </button>
            </form>

            <p className="mt-5 text-center text-xl sm:text-lg">
              Already have an account?{' '}
              <Link to="/signin" className="text-green-700 font-semibold hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
