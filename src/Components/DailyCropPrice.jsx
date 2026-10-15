import React, { useState, useEffect } from 'react'
import axios from 'axios'

const DailyCropPrice = () => {
  const [loading, setLoading] = useState(false)
  const [cropData, setCropData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const fetchCropPrices = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdc3b564546246a772a26393094f5645&offset=0&limit=100&format=json'
      )
      setCropData(response.data.records || [])
      setFilteredData(response.data.records || [])
    } catch (error) {
      console.error('Error fetching crop prices:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCropPrices()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = cropData.filter(item => 
        item.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.market.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(cropData)
    }
  }, [searchTerm, cropData])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const [day, month, year] = dateString.split('/')
    return `${day}/${month}/${year}`
  }

  return (
    <div className="min-h-[100dvh] mt-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Daily Crop Prices</h1>
          <p className="text-gray-600 mt-1">Live mandi price data from the Government of India dataset.</p>
        </div>

        <div className="mb-4">
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Search by commodity, state, district or market"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center my-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">State</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">District</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Market</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Commodity</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Variety</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Grade</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Arrival Date</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Min Price (₹)</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Max Price (₹)</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Modal Price (₹)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-700">{item.state}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-700">{item.district}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-700">{item.market}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-700">{item.commodity}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-700">{item.variety}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-700">{item.grade}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-700">{formatDate(item.arrival_date)}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-700">{item.min_price}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-700">{item.max_price}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-700">{item.modal_price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-6 text-center text-sm text-gray-500">
                      {cropData.length > 0 ? 'No matching results found' : 'No data available'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DailyCropPrice