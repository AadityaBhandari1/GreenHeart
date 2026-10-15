import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { FaShoppingBasket, FaSeedling, FaChalkboardTeacher, FaMicroscope } from 'react-icons/fa';
import { getAllLandData, useFirebase } from '../../context/firebase';

function FarmerDashboard() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get userDetails from Firebase context
  const { userDetails } = useFirebase();

  // Function to get health status based on soil moisture
  const getHealthStatus = (soilMoisture) => {
    if (!soilMoisture) return { status: 'Unknown', color: 'gray' };
    const moisture = parseFloat(soilMoisture);
    if (moisture < 30) return { status: 'Needs Water', color: 'red' };
    if (moisture > 70) return { status: 'Excess Water', color: 'orange' };
    return { status: 'Healthy', color: 'green' };
  };

  // Fetch land (device) data based on the user's deviceId from profile
  useEffect(() => {
    async function fetchData() {
      if (!userDetails || !userDetails.deviceId) {
        setLands([]);
        setLoading(false);
        return;
      }
      try {
        const data = await getAllLandData();
        const landArray = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        // Filter the lands so that only the one matching the user's deviceId is used.
        const filtered = landArray.filter((land) => land.id === userDetails.deviceId);
        setLands(filtered);
      } catch (error) {
        console.error('Error fetching land data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userDetails]);

  // Derived metrics (averages) for quick glance
  const averages = (() => {
    if (!lands || lands.length === 0) return { moisture: '-', ph: '-', temp: '-' };
    const nums = (arr, key) => arr.map((l) => parseFloat(l[key])).filter((v) => !Number.isNaN(v));
    const avg = (arr) => (arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '-');
    return {
      moisture: avg(nums(lands, 'SoilMoisture')),
      ph: avg(nums(lands, 'PH')),
      temp: avg(nums(lands, 'Temperature')),
    };
  })();

  return (
    <div className="p-5 bg-gray-50">
      {/* Farmer Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl shadow-md bg-gradient-to-r from-green-600 to-green-700 text-white mb-6">
        <div className="absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">Welcome, {userDetails.name}</h2>
              <p className="text-green-100 mt-1 text-sm sm:text-base">Farm Size: {userDetails.farmSize} • Location: {userDetails.location}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${lands.length ? 'bg-emerald-200 text-emerald-900' : 'bg-yellow-200 text-yellow-900'}`}>
                  {lands.length ? 'Device Connected' : 'No Device Linked'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-full">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                  {userDetails?.gender ? (
                    userDetails.gender.toLowerCase() === 'male' ? (
                      <img src="https://i.postimg.cc/VkpGnh01/male.png" alt="Male" className="w-12 h-12" />
                    ) : userDetails.gender.toLowerCase() === 'female' ? (
                      <img src="https://i.postimg.cc/d3hnhmQD/female1.png" alt="Female" className="w-12 h-12" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                        {userDetails.gender.charAt(0).toUpperCase()}
                      </div>
                    )
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">?</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              className="w-full px-3 py-2 rounded-lg bg-white/90 text-green-700 font-medium hover:bg-white transition"
              onClick={() => window.open('https://greenheart.streamlit.app/', '_blank')}
            >
              Recommendations
            </button>
            <button
              className="w-full px-3 py-2 rounded-lg bg-white/90 text-green-700 font-medium hover:bg-white transition"
              onClick={() => window.alert('We will connect you to an expert soon.')}
            >
              Contact Expert
            </button>
            {!lands.length && (
              <button
                className="w-full px-3 py-2 rounded-lg bg-white/90 text-green-700 font-medium hover:bg-white transition col-span-2 sm:col-span-1"
                onClick={() => window.alert('Please contact support to link your device.')}
              >
                Link Device
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading your farm data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Metrics */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-xs text-gray-500">Avg Soil Moisture</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">{averages.moisture}{averages.moisture !== '-' ? '%' : ''}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-xs text-gray-500">Avg pH</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">{averages.ph}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-xs text-gray-500">Avg Temp</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">{averages.temp}{averages.temp !== '-' ? '°C' : ''}</p>
            </div>
          </div>
          {/* Farm Overview & Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <FaSeedling className="text-green-600 text-2xl mr-3" />
              <h3 className="text-xl font-semibold">Farm Overview</h3>
            </div>

            {lands.length > 0 ? (
              <div className="space-y-4">
                {lands.map((land, index) => {
                  const health = getHealthStatus(land.SoilMoisture);
                  return (
                    <div key={index} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{land.Crop || 'Plot ' + (index + 1)}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white bg-${health.color}-500`}>{health.status}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-gray-600">Soil Moisture:</span> {land.SoilMoisture || 'N/A'}
                        </div>
                        <div>
                          <span className="text-gray-600">pH:</span> {land.PH || 'N/A'}
                        </div>
                        <div>
                          <span className="text-gray-600">NPK:</span> {land.NPK || 'N/A'}
                        </div>
                        <div>
                          <span className="text-gray-600">Temp:</span> {land.Temperature || 'N/A'}°C
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="pt-3">
                  <button
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    onClick={() => window.open('https://greenheart.streamlit.app/', '_blank')}
                  >
                    <span>Get AI Recommendations</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No farm plot registered with your device.</p>
            )}
          </div>

          {/* Quality Control & Yield Prediction */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaMicroscope className="text-green-600 text-2xl mr-3" />
              <h3 className="text-xl font-semibold">Quality & Yield</h3>
            </div>

            <div className="space-y-4">
              {lands.length > 0 ? (
                <div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">Crop Health Analysis</h4>
                    <div className="h-24 bg-gray-100 rounded flex items-center justify-center">
                      <p className="text-green-600">AI analysis in progress...</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Yield Prediction</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span>Current Estimate:</span>
                        <span className="font-medium">1,200 kg/acre</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Market Value:</span>
                        <span>₹24,000 - ₹26,400</span>
                      </div>
                    </div>

                    <button className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                      <span>Request Detailed Report</span>
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Register your farm plot to get yield predictions.</p>
              )}
            </div>
          </div>

          {/* Expert Assistance & Training */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaChalkboardTeacher className="text-green-600 text-2xl mr-3" />
              <h3 className="text-xl font-semibold">Support & Learning</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <h4 className="font-medium text-green-700 mb-1">Your GreenHeart Expert</h4>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold mr-3">AS</div>
                  <div>
                    <p className="font-medium">Amit Singh</p>
                    <p className="text-sm text-gray-600">Agricultural Specialist</p>
                  </div>
                </div>
                <button className="mt-2 w-full text-sm px-3 py-1 border border-green-500 text-green-500 rounded hover:bg-green-50 transition-colors">
                  Contact Expert
                </button>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3">Services</h4>
                <div className="space-y-2">
                  {[
                    { title: 'Soil Testing', icon: <ArrowRight className="h-4 w-4" />, status: 'Completed' },
                    { title: 'Drone Monitoring', icon: <ArrowRight className="h-4 w-4" />, status: 'Scheduled' },
                    { title: 'Water Quality Test', icon: <ArrowRight className="h-4 w-4" />, status: 'Completed' },
                  ].map((service, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{service.title}</span>
                      <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded flex items-center">
                        {service.icon}
                        <span className="ml-1">{service.status}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <h4 className="font-medium text-gray-800 mb-3">Learning Resources</h4>
                <div className="space-y-2 text-sm">
                  <a href="#" className="block p-2 bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors">🎓 New farming techniques (Video)</a>
                  <a href="#" className="block p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">📋 Government subsidy scheme 2023</a>
                  <a href="#" className="block p-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors">🌱 Organic certification process</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Connection */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <FaShoppingBasket className="text-green-600 text-2xl mr-3" />
            <h3 className="text-xl font-semibold">Market Connection</h3>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">Sell Your Produce</button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left">Crop</th>
                <th className="py-3 px-4 text-left">Current Price</th>
                <th className="py-3 px-4 text-left">Trend</th>
                <th className="py-3 px-4 text-left">Best Market</th>
                <th className="py-3 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { crop: 'Wheat', price: '₹2,200/quintal', trend: 'up', market: 'Khanna Mandi' },
                { crop: 'Rice', price: '₹1,950/quintal', trend: 'down', market: 'Ludhiana Mandi' },
                { crop: 'Corn', price: '₹1,450/quintal', trend: 'stable', market: 'Jalandhar Mandi' },
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{item.crop}</td>
                  <td className="py-3 px-4 font-medium">{item.price}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-full w-3 h-3 bg-${item.trend === 'up' ? 'green' : item.trend === 'down' ? 'red' : 'yellow'}-500`}></span>
                  </td>
                  <td className="py-3 px-4">{item.market}</td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-800">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FarmerDashboard;
