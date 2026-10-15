import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import PolygonDronePanel from './PolygonDronePanel';

export default function Tabs({
  tabs,
  activeTab,
  setActiveTab,
  // polygon selection + vegetation index
  selectedPolygon,
  selectedVegetationIndex,
  handleVegetationIndexChange,
  vegetationIndices,
  // crop selection
  selectedCrop,
  setSelectedCrop,
  cropOptions,
  allocateCrop,
  deallocateCrop,
  polygonCrops,
  // charts/data
  cropData,
  // weather
  weatherData,
  loading,
  location,
  handleLocationChange,
  fetchWeatherData,
}) {
  return (
    <div className="flex flex-col p-4 mt-4 rounded-2xl bg-teal-800 h-full">
      {/* Tab Buttons */}
      <div className="flex justify-between border-b border-teal-700 mb-4 w-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 w-full -mb-px ${
              activeTab === tab ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'Crop info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card: Polygon Selection */}
          <div className="bg-teal-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Polygon Selection</h3>
            {selectedPolygon ? (
              <p>Selected Polygon ID: {selectedPolygon}</p>
            ) : (
              <p>Click on a polygon on the map to select it</p>
            )}

            {selectedPolygon && (
              <div className="mt-4 bg-teal-700 p-4 px-0 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  {/* Landmark Name */}
                  <div>
                    <label className="block text-sm text-white">Landmark Name</label>
                    <input type="text" value={selectedPolygon} className="bg-gray-700 text-white p-2 rounded w-full" disabled />
                  </div>
                  <div>
                    <label className="text-white block text-sm">Vegetation Index:</label>
                    <select
                      className="form-control w-full bg-gray-700 text-white p-2 rounded"
                      value={selectedVegetationIndex}
                      onChange={handleVegetationIndexChange}
                    >
                      {vegetationIndices.map((index) => (
                        <option key={index} value={index}>
                          {index.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Survey/Khasra No. */}
                  <div className="mb-2">
                    <label className="block text-sm text-white">Survey/Khasra No.</label>
                    <input type="text" value="105/7" className="bg-gray-700 text-white p-2 rounded w-full" disabled />
                  </div>
                  {/* Polygon ID */}
                  <div className="mb-2">
                    <label className="block text-sm text-white">Polygon ID</label>
                    <input type="text" value="92" className="bg-gray-700 text-white p-2 rounded w-full" disabled />
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Current Crop */}
                  <div className="mb-2">
                    <label className="block text-sm text-white">Current Crop</label>
                    <select
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      className="bg-gray-800 text-white p-2 rounded w-full mb-2"
                    >
                      <option value="">Select a crop</option>
                      {cropOptions.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Irrigation */}
                  <div className="mb-2">
                    <label className="block text-sm text-white">Irrigation</label>
                    <input type="text" value="Canal" className="bg-gray-700 text-white p-2 rounded w-full" disabled />
                  </div>
                </div>

                {/* Growth Stage */}
                <div className="mb-2">
                  <label className="block text-sm text-white">Growth Stage</label>
                  <input
                    type="text"
                    value="Vegetative (NDVI: 0.65)"
                    className="bg-gray-700 text-white p-2 rounded w-full"
                    disabled
                  />
                </div>

                {/* Buttons Section */}
                <div className="flex gap-4 my-4">
                  <button onClick={allocateCrop} disabled={!selectedCrop} className="bg-green-600 hover:bg-green-700 px-6 py-3 text-white rounded w-full">
                    Allocate Crop
                  </button>
                  <button
                    onClick={deallocateCrop}
                    disabled={!polygonCrops[selectedPolygon]}
                    className="bg-red-600 hover:bg-red-700 px-6 py-3 text-white rounded w-full"
                  >
                    Deallocate Crop
                  </button>
                </div>
                <div className="mt-2 w-full">
                  <a className="bg-green-600 hover:bg-green-700 px-10 py-3 text-white rounded w-[200%] mt-4" href="/report">
                    Generate Report
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Card: Sown Area */}
          <div className="bg-teal-700 rounded-lg space-y-2">
            <div className="flex justify-between items-center bg-teal-600 text-white px-4 py-2 rounded-t-lg">
              <span>Sown area detected</span>
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path d="M12 8v4l2 2" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex py-1 p-4 justify-between items-center">
              <p className="text-black text-sm">10 May’25</p>
              <p className="text-black text-sm">Not sown</p>
            </div>
          </div>

          {/* Card: Crop Management Guide */}
          <div className="bg-teal-700 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Crop management guide</h3>
            <p className="text-gray-200 text-sm">Explore the Crop Monitoring applications for different crops here</p>
            <a href="#" className="inline-flex items-center text-white hover:underline text-sm">
              Go to guide&nbsp;
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" />
              </svg>
            </a>
          </div>
        </div>
      )}

      {activeTab === 'Chart' && (
        <div className="bg-teal-700 rounded-lg p-4">
          <div className="bg-teal-700 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1">
                <span>Growth Stages</span>
              </span>
              <button className="text-blue-500 text-sm hover:underline">Edit</button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cropData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#0c0a09" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#0c0a09" />
                <YAxis stroke="#0c0a09" />
                <Tooltip />
                <Area type="monotone" dataKey="area" stackId="1" stroke="#8884d8" fill="#8884d8" name="Area (sq m)" />
                <Area type="monotone" dataKey="yield" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Yield (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'Activities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Section: Current Risks, NDVI Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Risks */}
            <div className="bg-teal-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span>Current risks</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 8v4" strokeWidth="2" />
                </svg>
              </div>
              <p className="text-sm">
                Risk information on this field{' '}
                <a href="#" className="text-blue-500 hover:underline">
                  is available in the Essential or Professional plans
                </a>
              </p>
            </div>

            {/* NDVI values split */}
            <div className="bg-teal-700 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span>NDVI values split</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 8v4" strokeWidth="2" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Date: 10 May’25</p>
              <div className="flex items-end space-x-2 h-24">
                <div className="w-2 bg-green-400" style={{ height: '2%' }} />
                <div className="w-2 bg-yellow-400" style={{ height: '13.72%' }} />
                <div className="w-2 bg-orange-400" style={{ height: '41.05%' }} />
                <div className="w-2 bg-red-500" style={{ height: '45.23%' }} />
                <div className="w-2 bg-gray-600" style={{ height: '0%' }} />
              </div>
              <div className="text-sm space-y-1">
                <p><span className="text-green-400">•</span> Dense vegetation</p>
                <p><span className="text-yellow-400">•</span> Moderate vegetation</p>
                <p><span className="text-orange-400">•</span> Sparse vegetation</p>
                <p><span className="text-red-500">•</span> Open soil</p>
                <p><span className="text-gray-400">•</span> Cloudiness</p>
              </div>
            </div>
          </div>

          {/* Right Section: Crop Status, Weather, Field Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Crop Status */}
            <div className="bg-teal-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span>Crop Status</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 8v4" strokeWidth="2" />
                </svg>
              </div>
              <p className="text-sm">
                The current status of the crop is <span className="text-green-400">Healthy</span>. Expected to reach maturity by <span className="text-yellow-400">30th June 2025</span>.
              </p>
            </div>

            {/* Weather Information */}
            <div className="bg-teal-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold text-lg">Weather Forecast</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 8v4" strokeWidth="2" />
                </svg>
              </div>

              {loading ? (
                <p className="text-gray-400 text-sm">Loading weather data...</p>
              ) : weatherData ? (
                <div>
                  <p className="text-sm">
                    Next weather forecast: <span className="text-blue-400">{weatherData.weather[0].description}</span> for the next 48 hours.
                  </p>
                  <p className="text-sm">
                    Ideal conditions for crop growth: <span className="text-green-400">{weatherData.main.temp > 20 ? 'Moderate temperature &' : 'Low temperature &'} Moisture</span>.
                  </p>
                  <div className="mt-4">
                    <input
                      type="text"
                      value={location}
                      onChange={handleLocationChange}
                      placeholder="Enter city name"
                      className="p-2 rounded bg-teal-800 text-white w-full mb-2"
                    />
                    <button onClick={fetchWeatherData} className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                      Get Weather for {location}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-red-500 text-sm">Failed to fetch weather data</p>
              )}
            </div>

            {/* Field Data */}
            <div className="bg-teal-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span>Field Data Overview</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 8v4" strokeWidth="2" />
                </svg>
              </div>
              <p className="text-sm">Total field area: <span className="text-green-400">1500 sq. meters</span></p>
              <p className="text-sm">Irrigation status: <span className="text-yellow-400">Completed</span></p>
              <p className="text-sm">Fertilization status: <span className="text-green-400">Ongoing</span></p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Drone Allocation' && <PolygonDronePanel />}
    </div>
  );
}

