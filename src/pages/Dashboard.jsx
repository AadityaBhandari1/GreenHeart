import React, { useState, useEffect } from 'react';
import { useFirebase } from '../context/firebase';
import AdminDashboard from './dashboard/AdminDashboard';
import FarmerDashboard from './dashboard/FarmerDashboard';

function Dashboard() {
  const { getUserDetails } = useFirebase();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const details = await getUserDetails();
        if (details) setUserDetails(details);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [getUserDetails]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-green-500"></div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="p-10 bg-gray-100 text-center">
        <h6 className="text-red-600 uppercase tracking-wide">Access Denied</h6>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Log In to Access Dashboard</h1>
        <p className="text-gray-700">You need to be logged in to view dashboard content. Please sign in to continue.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 mt-20">
      <div className="max-w-7xl mx-auto ">
        {userDetails.role === 'Admin' && <AdminDashboard />}
        {userDetails.role === 'Farmer' && <FarmerDashboard />}
      </div>
    </div>
  );
}

export default Dashboard;
