import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { getAllLandData, getAllProfilesData } from '../../context/firebase';
import { getFirestore, updateDoc, doc } from 'firebase/firestore';

// Fix for default icon not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function AdminDashboard() {
  const [lands, setLands] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedLand, setSelectedLand] = useState(null);
  const [selectedDevices, setSelectedDevices] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [previousDevice, setPreviousDevice] = useState("");

  // Initialize Firestore instance for updating user profiles
  const firestoreInstance = getFirestore();

  // Fetch land (device) data
  useEffect(() => {
    async function fetchData() {
      const data = await getAllLandData();
      const landArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      setLands(landArray);
    }
    fetchData();
  }, []);

  // Fetch profiles data
  useEffect(() => {
    async function fetchProfiles() {
      try {
        const profilesData = await getAllProfilesData();
        setProfiles(profilesData);
      } catch (error) {
        console.error("Error fetching profiles data:", error);
      }
    }
    fetchProfiles();
  }, []);

  // Handle user selection
  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);

    // Find the selected user profile and set the previously allocated device
    const userProfile = profiles.find(profile => profile.id === userId);
    setPreviousDevice(userProfile?.deviceId || "");
  };

  // Function to allocate or dis-allocate a device to a user
  const allocateDeviceToUserHandler = async (userId, deviceId) => {
    try {
      if (!deviceId) {
        // If no device is selected, we dis-allocate the current device
        await updateDoc(doc(firestoreInstance, "Profiles", userId), { deviceId: "" });
      } else {
        // If a device is selected, we allocate it to the user
        await updateDoc(doc(firestoreInstance, "Profiles", userId), { deviceId });
      }

      // Optionally refresh profiles data after update
      const updatedProfiles = await getAllProfilesData();
      setProfiles(updatedProfiles);
      setPreviousDevice(deviceId); // Update the previous device after allocation
      toast.success(`Device ${deviceId ? 'allocated' : 'dis-allocated'} successfully!`, {
        duration: 3000,
      });
    } catch (error) {
      console.error("Error allocating/dis-allocating device:", error);
    }
  };

  return (
    <div className="p-5 h-full">
      <Toaster />
      {/* Device Allocation Section */}
      <div className="w-full my-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Device Allocation</h2>

        {/* User selection dropdown */}
        <div className="flex justify-between">
          <div className="mb-4 w-2/5">
            <label className="block text-gray-700 mb-2">Select User</label>
            <select
              value={selectedUser}
              onChange={handleUserChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select a user</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} ({profile.email})
                </option>
              ))}
            </select>
          </div>

          {/* Device selection dropdown */}
          <div className="mb-4 w-2/5">
            <label className="block text-gray-700 mb-2">Allocate/Dis-allocate Device</label>
            <select
              value={selectedDevices[selectedUser] || previousDevice || ""}
              onChange={(e) => {
                setSelectedDevices({ ...selectedDevices, [selectedUser]: e.target.value });
              }}
              className="w-full px-3 py-2 border rounded"
              disabled={!selectedUser}
            >
              <option value="">Select a device</option>
              {lands.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.Crop} (ID: {device.id})
                </option>
              ))}
            </select>
          </div>

          {/* Action Button */}
          <div className="grid grid-cols-2 gap-2 h-10 mt-7.5">
            {/* Allocate Button */}
            <button
              onClick={() =>
                allocateDeviceToUserHandler(selectedUser, selectedDevices[selectedUser] || "")
              }
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              disabled={!selectedUser || !selectedDevices[selectedUser]}
            >
              Allocate
            </button>

            {/* De-allocate Button */}
            <button
              onClick={() =>
                allocateDeviceToUserHandler(selectedUser, "")
              }
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              disabled={!selectedUser || !previousDevice}
            >
              De-allocate
            </button>
          </div>
        </div>
      </div>

      {/* Map & Visualization Section */}
      <div className='flex'>
        <div className="h-[70vh] w-full lg:w-2/3 mb-4 lg:mb-0">
          <MapContainer center={[30.7628, 76.5983]} zoom={13} className="h-full w-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {lands.map((land, index) => (
              <Marker
                key={index}
                position={[land.Latitude, land.Longitude]}
                eventHandlers={{
                  click: () => setSelectedLand(land),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <h2 className="text-lg font-bold">{land.Crop || 'Unknown Crop'}</h2>
                    <p>
                      <strong>NPK:</strong> {land.NPK || 'N/A'}
                    </p>
                    <p>
                      <strong>PH:</strong> {land.PH || 'N/A'}
                    </p>
                    <p>
                      <strong>Soil Moisture:</strong> {land.SoilMoisture || 'N/A'}
                    </p>
                    <p>
                      <strong>Temperature:</strong> {land.Temperature || 'N/A'}
                    </p>
                    <button
                      className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      onClick={() => window.open('https://greenheart.streamlit.app/', '_blank')}
                    >
                      Get Recommendations
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          {/* Legend */}
          <div className="absolute top-28 right-6 bg-white bg-opacity-80 p-2 rounded shadow-md z-10">
            <div className="flex items-center mb-2">
              <span className="w-4 h-4 bg-blue-500 rounded-full inline-block mr-2"></span> Device
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full inline-block mr-2"></span> Subscription
            </div>
          </div>
        </div>

        {/* Metrics Panel */}
        <div className="flex-1 flex flex-col p-5 bg-gray-100 lg:w-1/3">
          <div className="bg-white border border-gray-300 rounded p-4 mb-4 shadow-md">
            Active Devices: {lands.length}
          </div>
          <div className="bg-white border border-gray-300 rounded p-4 mb-4 shadow-md">
            Connected Farmers: 40
          </div>
          <div className="bg-white border border-gray-300 rounded p-4 mb-4 shadow-md">
            Farmer Subscriptions: 15
          </div>
          <div className="bg-white border border-gray-300 rounded p-4 mb-4 shadow-md">
            Total Queries Raised: 15
          </div>
          <div className="bg-white border border-gray-300 rounded p-4 mb-4 shadow-md">
            Farmer Queries Resolved: 10
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
