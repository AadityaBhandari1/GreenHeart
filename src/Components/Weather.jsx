import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const API_KEY = "LHJ4SZE9R5RK8XNR683TBU3XF"; // Replace with your Visual Crossing API key
const LOCATION = "Goverment of India Enclave, National Communications Academy (Erstwhile NTIPRIT, Kamla Nehru Nagar, Ghaziabad, Uttar Pradesh 201002";         // Replace with your location (city, state, country)

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch weather data from Visual Crossing Timeline API
  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
        LOCATION
      )}?unitGroup=metric&key=${API_KEY}&contentType=json`;
      const response = await axios.get(url);
      console.log(response.data);
      setWeatherData(response.data);
    } catch (err) {
      setError("Failed to fetch weather data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) return (
    <div className="min-h-[100dvh] mt-20 flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
    </div>
  );
  if (error) return (
    <div className="min-h-[100dvh] mt-20 flex items-center justify-center bg-white">
      <div className="text-red-600">{error}</div>
    </div>
  );
  if (!weatherData) return null;

  const current = weatherData.currentConditions;

  // Prepare daily data for charts and table
  const dailyData = weatherData.days.map((day) => ({
    date: day.datetime,
    tempmax: day.tempmax,
    tempmin: day.tempmin,
    humidity: day.humidity,
    precip: day.precip,
    windspeed: day.windspeed,
    uvindex: day.uvindex,
  }));
  return (
    <div className="min-h-[100dvh] mt-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Weather</h1>
          <p className="text-gray-600 mt-1">Forecast and current conditions for your area.</p>
        </div>

        {/* Current Conditions */}
        <section className="bg-teal-700 text-white p-4 rounded-md shadow-md mb-8">
          <h2 className="text-2xl mb-4 font-semibold">Current Conditions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div><strong>Temperature:</strong> {current.temp} °C</div>
            <div><strong>Feels Like:</strong> {current.feelslike} °C</div>
            <div><strong>Humidity:</strong> {current.humidity} %</div>
            <div><strong>Wind Speed:</strong> {current.windspeed} km/h</div>
            <div><strong>UV Index:</strong> {current.uvindex}</div>
            <div><strong>Pressure:</strong> {current.pressure} hPa</div>
            <div><strong>Cloud Cover:</strong> {current.cloudcover} %</div>
            <div><strong>Conditions:</strong> {current.conditions}</div>
          </div>
        </section>

        {/* Charts */}
        <section className="space-y-10 mb-10">
          <h2 className="text-2xl font-semibold">Weather Charts</h2>

          {/* Temperature Chart */}
          <div className="bg-teal-700 text-white p-4 rounded shadow">
            <h3 className="mb-2 font-semibold">Temperature (Max & Min)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid stroke="#0c0a09" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#0c0a09" />
                <YAxis stroke="#0c0a09" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tempmax" stroke="#f87171" name="Max Temp (°C)" activeDot={{ r: 8 }} strokeWidth={2} />
                <Line type="monotone" dataKey="tempmin" stroke="#60a5fa" name="Min Temp (°C)" activeDot={{ r: 8 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Humidity Chart */}
          <div className="bg-teal-700 text-white p-4 rounded shadow">
            <h3 className="mb-2 font-semibold">Humidity (%)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid stroke="#0c0a09" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#0c0a09" />
                <YAxis domain={[0, 100]} stroke="#0c0a09" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="humidity" stroke="#60a5fa" name="Humidity (%)" activeDot={{ r: 8 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Precipitation Chart */}
          <div className="bg-teal-700 text-white p-4 rounded shadow">
            <h3 className="mb-2 font-semibold">Precipitation (mm)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid stroke="#0c0a09" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#0c0a09" />
                <YAxis stroke="#0c0a09" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="precip" stroke="#10b981" name="Precipitation (mm)" activeDot={{ r: 8 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Daily Forecast Table */}
        <section className="overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-4">Daily Forecast</h2>
          <table className="w-full table-auto border-collapse border border-teal-200">
            <thead>
              <tr className="bg-teal-600 text-left text-white">
                {["Date", "Max Temp (°C)", "Min Temp (°C)", "Humidity (%)", "Precipitation (mm)", "Wind Speed (km/h)", "UV Index", "Conditions"].map((header) => (
                  <th key={header} className="border border-teal-200 px-3 py-2 first:min-w-[8rem] first:w-[12rem] first:whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weatherData.days.map((day) => (
                <tr key={day.datetime} className="even:bg-teal-50 odd:bg-white">
                  <td className="border border-teal-100 px-3 py-1 min-w-[8rem] whitespace-nowrap">{day.datetime}</td>
                  <td className="border border-teal-100 px-3 py-1">{day.tempmax}</td>
                  <td className="border border-teal-100 px-3 py-1">{day.tempmin}</td>
                  <td className="border border-teal-100 px-3 py-1">{day.humidity}</td>
                  <td className="border border-teal-100 px-3 py-1">{day.precip}</td>
                  <td className="border border-teal-100 px-3 py-1">{day.windspeed}</td>
                  <td className="border border-teal-100 px-3 py-1">{day.uvindex}</td>
                  <td className="border border-teal-100 px-3 py-1">{day.conditions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default Weather;
