import React, { useState } from 'react';
import { useFirebase } from '../../context/firebase';
import { Link } from 'react-router-dom';

const SignInPage = () => {
  const { signInWithEmailAndPassword } = useFirebase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-7 sm:p-9">
            <h2 className="lg:text-3xl text-4xl font-extrabold mb-3 text-gray-900 text-center">Sign In</h2>
            <p className="text-center text-gray-600 mb-7 text-xl sm:text-lg">Welcome back! Please enter your details.</p>
            {error && (
              <p className="text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-2.5 mb-4 text-base" role="alert">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
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
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-xl text-base sm:text-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Sign In
              </button>
            </form>
            <p className="mt-5 text-center text-lg lg:text-xl">
              Don't have an account?{' '}
              <Link to="/signup" className="text-green-700 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Credentials / Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-7 sm:p-9">
            <h3 className="text-2xl font-semibold mb-3 text-emerald-700">Demo Credentials</h3>
            <p className="text-gray-600 text-base mb-4">Use any of the following to explore the app quickly.</p>
            <ul className="text-base sm:text-lg text-gray-700 space-y-3">
              <li className="flex items-start gap-2"><span className="font-semibold text-gray-900">Admin:</span> <span>kapilkp2003@gmail.com / kplgngwr</span></li>
              <li className="flex items-start gap-2"><span className="font-semibold text-gray-900">Farmer:</span> <span>alok9532@gmail.com / Alok@9532</span></li>
              <li className="flex items-start gap-2"><span className="font-semibold text-gray-900">Consumer:</span> <span>alok953280@gmail.com / Alok@9532</span></li>
            </ul>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-base">
              <div className="p-3.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">Secure authentication</div>
              <div className="p-3.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">Role-based access</div>
              <div className="p-3.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">Responsive UI</div>
              <div className="p-3.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">Fast navigation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
