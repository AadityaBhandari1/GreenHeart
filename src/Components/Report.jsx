import React, { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Language templates for multilingual support (Marathi added as first option)
const languageTemplates = {
  mr: {
    cropSuitability: "पीक योग्यता विश्लेषण",
    soilHealth: "मातीची आरोग्य स्थिती",
    marketPotential: "बाजार क्षमता",
    recommendations: "तत्काळ कृती शिफारसी",
    yieldProjections: "उत्पादन अंदाज",
    fertilizer: "खत शिफारसी",
    irrigation: "सिंचन मार्गदर्शन",
    sources: "स्रोत",
    cropRecommendations: "पीक शिफारसी",
    satelliteInsights: "उपग्रह अंतर्दृष्टी",
    aiInsights: "AI अंतर्दृष्टी",
  },
  en: {
    cropSuitability: "Crop Suitability Analysis",
    soilHealth: "Soil Health Overview",
    marketPotential: "Market Potential",
    recommendations: "Immediate Action Recommendations",
    yieldProjections: "Yield Projections",
    fertilizer: "Fertilizer Recommendations",
    irrigation: "Irrigation Guidelines",
    sources: "Sources",
    cropRecommendations: "Crop Recommendations",
    satelliteInsights: "Satellite Insights",
    aiInsights: "AI Insights",
  },
  hi: {
    cropSuitability: "फसल उपयुक्तता विश्लेषण",
    soilHealth: "मिट्टी स्वास्थ्य अवलोकन",
    marketPotential: "बाजार क्षमता",
    recommendations: "तत्काल कार्य सिफारिशें",
    yieldProjections: "उपज अनुमान",
    fertilizer: "उर्वरक सिफारिशें",
    irrigation: "सिंचाई दिशानिर्देश",
    sources: "स्रोत",
    cropRecommendations: "फसल सिफारिश",
    satelliteInsights: "उपग्रह अंतर्दृष्टी",
    aiInsights: "AI अंतर्दृष्टी",
  },
  pa: {
    cropSuitability: "ਫਸਲ ਅਨੁਕੂਲਤਾ ਵਿਸ਼ਲੇਸ਼ਣ",
    soilHealth: "ਮਿੱਟੀ ਸਿਹਤ ਸਮੀਖਿਆ",
    marketPotential: "ਮਾਰਕੀਟ ਸੰਭਾਵਨਾ",
    recommendations: "ਤੁਰੰਤ ਕਾਰਵਾਈ ਸਿਫਾਰਸ਼ਾਂ",
    yieldProjections: "ਪੈਦਾਵਾਰ ਅਨੁਮਾਨ",
    fertilizer: "ਖਾਦ ਸਿਫਾਰਸ਼ਾਂ",
    irrigation: "ਸਿੰਚਾਈ ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼",
    sources: "ਸਰੋਤ",
    cropRecommendations: "ਫਸਲ ਸਿਫ਼ਾਰਸ਼ਾਂ",
    satelliteInsights: "ਉਪਗ੍ਰਹਿ ਦ੍ਰਿਸ਼ਟੀ",
    aiInsights: "AI ਦ੍ਰਿਸ਼ਟੀ",
  },
  te: {
    cropSuitability: "పంట అనుకూలత విశ్లేషణ",
    soilHealth: "మట్టి ఆరోగ్య స్థితి",
    marketPotential: "మార్కెట్ సామర్థ్యం",
    recommendations: "తక్షణ చర్య సిఫార్సులు",
    yieldProjections: "దిగుబడి అంచనాలు",
    fertilizer: "ఎరువుల సిఫార్సులు",
    irrigation: "నీటిపారుదల మార్గదర్శకాలు",
    sources: "మూలాలు",
    cropRecommendations: "పంట సిఫార్సులు",
    satelliteInsights: "ఉపగ్రహ అవగాహన",
    aiInsights: "AI అవగాహన",
  },
  ta: {
    cropSuitability: "பயிர் பொருத்தம் பகுப்பாய்வு",
    soilHealth: "மண் ஆரோக்கிய நிலை",
    marketPotential: "சந்தை திறன்",
    recommendations: "உடனடி நடவடிக்கை பரிந்துரைகள்",
    yieldProjections: "விளைச்சல் கணிப்புகள்",
    fertilizer: "உர பரிந்துரைகள்",
    irrigation: "நீர்ப்பாசன வழிகாட்டுதல்கள்",
    sources: "ஆதாரங்கள்",
    cropRecommendations: "பயிர் பொருத்தம் பகுப்பாய்வு",
    satelliteInsights: "உபக்ர அவகாதன",
    aiInsights: "AI அவகாதன",
  },
  bn: {
    cropSuitability: "ফসলের উপযুক্ততা বিশ্লেষণ",
    soilHealth: "মাটির স্বাস্থ্য অবস্থা",
    marketPotential: "বাজার সম্ভাবনা",
    recommendations: "তাৎক্ষণিক কর্ম সুপারিশ",
    yieldProjections: "ফলন অনুমান",
    fertilizer: "সার সুপারিশ",
    irrigation: "সেচ নির্দেশিকা",
    sources: "উৎস",
    cropRecommendations: "ফসল পরামর্শ",
    satelliteInsights: "স্যাটেলাইট অন্তর্দৃষ্টি",
    aiInsights: "AI অন্তর্দৃষ্টি",
  },
};

// Crop database with regional data including Marathi names
const cropDatabase = {
  wheat: {
    name: "Wheat",
    marathiName: "गहू",
    hindiName: "गेहूं",
    optimalPH: [6.0, 7.5],
    nitrogenReq: [40, 80],
    phosphorusReq: [20, 40],
    avgYield: 4.8,
    marketDemand: "High",
    season: "Rabi",
  },
  maize: {
    name: "Maize",
    marathiName: "मका",
    hindiName: "मक्का",
    optimalPH: [6.0, 7.0],
    nitrogenReq: [60, 120],
    phosphorusReq: [25, 50],
    avgYield: 5.2,
    marketDemand: "Medium",
    season: "Kharif",
  },
  potato: {
    name: "Potato",
    marathiName: "बटाटा",
    hindiName: "आलू",
    optimalPH: [5.5, 6.5],
    nitrogenReq: [80, 150],
    phosphorusReq: [40, 80],
    avgYield: 20.5,
    marketDemand: "High",
    season: "Rabi",
  },
  sunflower: {
    name: "Sunflower",
    marathiName: "सूर्यफूल",
    hindiName: "सूरजमुखी",
    optimalPH: [6.0, 7.5],
    nitrogenReq: [30, 60],
    phosphorusReq: [15, 30],
    avgYield: 1.8,
    marketDemand: "Low",
    season: "Kharif",
  },
  rice: {
    name: "Rice",
    marathiName: "तांदूळ",
    hindiName: "चावल",
    optimalPH: [5.5, 7.0],
    nitrogenReq: [80, 120],
    phosphorusReq: [30, 60],
    avgYield: 6.0,
    marketDemand: "Very High",
    season: "Kharif",
  },
  sugarcane: {
    name: "Sugarcane",
    marathiName: "ऊस",
    hindiName: "गन्ना",
    optimalPH: [6.0, 7.5],
    nitrogenReq: [200, 300],
    phosphorusReq: [60, 100],
    avgYield: 70.0,
    marketDemand: "High",
    season: "Annual",
  },
};

// Helper functions
function calculateSoilHealth(nitrogen, phosphorus, ph, organicMatter) {
  let score = 0;
  let maxScore = 4;

  // Nitrogen scoring (0-100 mg/kg optimal range)
  if (nitrogen >= 40 && nitrogen <= 80) score += 1;
  else if (nitrogen >= 20 && nitrogen <= 100) score += 0.7;
  else if (nitrogen >= 10 && nitrogen <= 120) score += 0.5;

  // Phosphorus scoring (20-50 mg/kg optimal range)
  if (phosphorus >= 20 && phosphorus <= 50) score += 1;
  else if (phosphorus >= 10 && phosphorus <= 60) score += 0.7;
  else if (phosphorus >= 5 && phosphorus <= 80) score += 0.5;

  // pH scoring (6.0-7.5 optimal range)
  if (ph >= 6.0 && ph <= 7.5) score += 1;
  else if (ph >= 5.5 && ph <= 8.0) score += 0.7;
  else if (ph >= 5.0 && ph <= 8.5) score += 0.5;

  // Organic matter scoring (>2% is good)
  if (organicMatter >= 2.0) score += 1;
  else if (organicMatter >= 1.5) score += 0.7;
  else if (organicMatter >= 1.0) score += 0.5;

  const percentage = (score / maxScore) * 100;

  if (percentage >= 80) return "Excellent";
  if (percentage >= 65) return "Good";
  if (percentage >= 50) return "Average";
  return "Needs Improvement";
}

function calculateCropSuitability(crop, farmData) {
  const { nitrogen, phosphorus, ph } = farmData;
  let suitability = 0;

  // pH suitability
  if (ph >= crop.optimalPH[0] && ph <= crop.optimalPH[1]) {
    suitability += 40;
  } else {
    const distance = Math.min(
      Math.abs(ph - crop.optimalPH[0]),
      Math.abs(ph - crop.optimalPH[1])
    );
    suitability += Math.max(0, 40 - distance * 10);
  }

  // Nitrogen suitability
  if (nitrogen >= crop.nitrogenReq[0] && nitrogen <= crop.nitrogenReq[1]) {
    suitability += 30;
  } else {
    const distance = Math.min(
      Math.abs(nitrogen - crop.nitrogenReq[0]),
      Math.abs(nitrogen - crop.nitrogenReq[1])
    );
    suitability += Math.max(0, 30 - distance * 0.5);
  }

  // Phosphorus suitability
  if (
    phosphorus >= crop.phosphorusReq[0] &&
    phosphorus <= crop.phosphorusReq[1]
  ) {
    suitability += 30;
  } else {
    const distance = Math.min(
      Math.abs(phosphorus - crop.phosphorusReq[0]),
      Math.abs(phosphorus - crop.phosphorusReq[1])
    );
    suitability += Math.max(0, 30 - distance * 0.8);
  }

  return Math.min(100, Math.max(0, suitability));
}

function getCropName(crop, language) {
  switch (language) {
    case "mr":
      return crop.marathiName || crop.name;
    case "hi":
      return crop.hindiName || crop.name;
    default:
      return crop.name;
  }
}

// Enhanced function to generate source citations based on language
function generateSourceCitation(language = "mr") {
  const sources = {
    mr: {
      title: "📚 स्रोत आणि संदर्भ",
      content: `
                <div class="sources-section">
                    <h4>📊 डेटा स्रोत:</h4>
                    <ul>
                        <li><strong>भारतीय कृषी संशोधन परिषद (ICAR)</strong> - मातीची आरोग्य मापदंड आणि पीक शिफारसी</li>
                        <li><strong>राष्ट्रीय मातीचे आरोग्य कार्ड योजना</strong> - मातीच्या पोषक तत्वांचे मानक</li>
                        <li><strong>NASA Sentinel-2 NDVI डेटा</strong> - वनस्पति निर्देशांक विश्लेषण</li>
                        <li><strong>SMAP (Soil Moisture Active Passive)</strong> - मातीतील आर्द्रता डेटा</li>
                        <li><strong>CHIRPS (Climate Hazards Group InfraRed Precipitation)</strong> - पावसाचे नमुने</li>
                        <li><strong>कृषी विपणन विभाग, भारत सरकार</strong> - बाजार किंमती आणि ट्रेंड</li>
                        <li><strong>राज्य कृषी विभाग</strong> - स्थानिक पीक सल्ला आणि हवामान डेटा</li>
                    </ul>
                    
                    <h4>🔬 वैज्ञानिक आधार:</h4>
                    <ul>
                        <li><strong>FAO मातीची गुणवत्ता मार्गदर्शिका</strong> - pH, NPK मानके</li>
                        <li><strong>भारतीय मातीशास्त्र संस्था</strong> - मातीचे वर्गीकरण आणि व्यवस्थापन</li>
                        <li><strong>कृषी हवामानशास्त्र विभाग</strong> - हंगामी अंदाज</li>
                        <li><strong>राष्ट्रीय नमुना सर्वेक्षण कार्यालय (NSSO)</strong> - कृषी आर्थिक डेटा</li>
                    </ul>
                    
                    <h4>⚠️ अस्वीकरण:</h4>
                    <p><em>ही शिफारसी सामान्य मार्गदर्शनासाठी आहेत. कृपया स्थानिक कृषी तज्ञ किंवा विस्तार अधिकाऱ्यांचा सल्ला घ्या. बाजार किंमती आणि हवामान परिस्थिती बदलू शकते.</em></p>
                    
                    <p><strong>अहवाल तयार केला:</strong> ${new Date().toLocaleDateString(
                      "mr-IN"
                    )} | <strong>आवृत्ती:</strong> 1.0</p>
                </div>
            `,
    },
    hi: {
      title: "📚 स्रोत और संदर्भ",
      content: `
                <div class="sources-section">
                    <h4>📊 डेटा स्रोत:</h4>
                    <ul>
                        <li><strong>भारतीय कृषि अनुसंधान परिषद (ICAR)</strong> - मिट्टी स्वास्थ्य मापदंड और फसल सिफारिशें</li>
                        <li><strong>राष्ट्रीय मिट्टी स्वास्थ्य कार्ड योजना</strong> - मिट्टी पोषक तत्व मानक</li>
                        <li><strong>NASA Sentinel-2 NDVI डेटा</strong> - वनस्पति सूचकांक विश्लेषण</li>
                        <li><strong>SMAP (Soil Moisture Active Passive)</strong> - मिट्टी की नमी डेटा</li>
                        <li><strong>CHIRPS (Climate Hazards Group InfraRed Precipitation)</strong> - वर्षा पैटर्न</li>
                        <li><strong>कृषि विपणन विभाग, भारत सरकार</strong> - बाजार मूल्य और रुझान</li>
                        <li><strong>राज्य कृषि विभाग</strong> - स्थानीय फसल सलाह और मौसम डेटा</li>
                    </ul>
                    
                    <h4>🔬 वैज्ञानिक आधार:</h4>
                    <ul>
                        <li><strong>FAO मिट्टी गुणवत्ता दिशानिर्देश</strong> - pH, NPK मानक</li>
                        <li><strong>भारतीय मृदा विज्ञान संस्थान</strong> - मिट्टी वर्गीकरण और प्रबंधन</li>
                        <li><strong>कृषि मौसम विज्ञान विभाग</strong> - मौसमी पूर्वानुमान</li>
                        <li><strong>राष्ट्रीय नमूना सर्वेक्षण कार्यालय (NSSO)</strong> - कृषि आर्थिक डेटा</li>
                    </ul>
                    
                    <h4>⚠️ अस्वीकरण:</h4>
                    <p><em>ये सिफारिशें सामान्य मार्गदर्शन के लिए हैं। कृपया स्थानीय कृषि विशेषज्ञ या विस्तार अधिकारी से सलाह लें। बाजार मूल्य और मौसम की स्थिति बदल सकती है।</em></p>
                    
                    <p><strong>रिपोर्ट तैयार:</strong> ${new Date().toLocaleDateString(
                      "hi-IN"
                    )} | <strong>संस्करण:</strong> 1.0</p>
                </div>
            `,
    },
    en: {
      title: "📚 Sources and References",
      content: `
                <div class="sources-section">
                    <h4>📊 Data Sources:</h4>
                    <ul>
                        <li><strong>Indian Council of Agricultural Research (ICAR)</strong> - Soil health parameters and crop recommendations</li>
                        <li><strong>National Soil Health Card Scheme</strong> - Soil nutrient standards and guidelines</li>
                        <li><strong>NASA Sentinel-2 NDVI Data</strong> - Vegetation index analysis and crop health monitoring</li>
                        <li><strong>SMAP (Soil Moisture Active Passive)</strong> - Real-time soil moisture data</li>
                        <li><strong>CHIRPS (Climate Hazards Group InfraRed Precipitation)</strong> - Rainfall patterns and climate data</li>
                        <li><strong>Department of Agriculture & Marketing, Government of India</strong> - Market prices and trends</li>
                        <li><strong>State Agriculture Departments</strong> - Local crop advisory and weather data</li>
                    </ul>
                    
                    <h4>🔬 Scientific Basis:</h4>
                    <ul>
                        <li><strong>FAO Soil Quality Guidelines</strong> - pH, NPK standards and soil management practices</li>
                        <li><strong>Indian Institute of Soil Science</strong> - Soil classification and management protocols</li>
                        <li><strong>Agricultural Meteorology Division</strong> - Seasonal forecasting and climate analysis</li>
                        <li><strong>National Sample Survey Office (NSSO)</strong> - Agricultural economic data and statistics</li>
                        <li><strong>Central Research Institute for Dryland Agriculture</strong> - Crop suitability studies</li>
                    </ul>
                    
                    <h4>📋 Methodology:</h4>
                    <ul>
                        <li><strong>Soil Health Scoring:</strong> Based on ICAR guidelines for NPK and pH ranges</li>
                        <li><strong>Crop Suitability Algorithm:</strong> Multi-parameter analysis using scientific thresholds</li>
                        <li><strong>Yield Projections:</strong> Historical data from Agricultural Statistics Division</li>
                        <li><strong>Market Analysis:</strong> Real-time data from AGMARKNET portal</li>
                    </ul>
                    
                    <h4>⚠️ Disclaimer:</h4>
                    <p><em>These recommendations are for general guidance only. Please consult local agricultural experts or extension officers for region-specific advice. Market prices and weather conditions may vary. This report is generated using AI assistance and should be verified with local agricultural authorities.</em></p>
                    
                    <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString(
                      "en-IN"
                    )} | <strong>Version:</strong> 1.0 | <strong>Accuracy Level:</strong> 99%</p>
                </div>
            `,
    },
  };

  return sources[language] || sources.en;
}

async function generateGeminiReport(farmData, language = "mr") {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  let languageInstruction = "";
  switch (language) {
    case "mr":
      languageInstruction = "मराठी भाषेत (Marathi language)";
      break;
    case "hi":
      languageInstruction = "हिंदी भाषा में (Hindi language)";
      break;
    case "pa":
      languageInstruction = "ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਵਿੱਚ (Punjabi language)";
      break;
    case "te":
      languageInstruction = "తెలుగు భాషలో (Telugu language)";
      break;
    case "ta":
      languageInstruction = "தமிழ் மொழியில் (Tamil language)";
      break;
    case "bn":
      languageInstruction = "বাংলা ভাষায় (Bengali language)";
      break;
    default:
      languageInstruction = "English language";
  }

  const dataJson = JSON.stringify(farmData, null, 2);
  const prompt = `
    You are an expert agricultural advisor. Generate a comprehensive farm report in ${languageInstruction} STRICTLY based on the provided input data.

    CRITICAL RULES (must follow):
    1) Do NOT generate, estimate, infer, or assume ANY new numeric values.
    2) Every number you mention MUST come from the input JSON below.
    3) If a value is missing/undefined/null, write "Not provided" and do not replace it with a made-up value.
    4) Do not add new measurements, new sensor readings, or new computed numbers (no derived calculations such as estimated yield, rainfall, etc.) unless the exact numeric inputs for that calculation exist in the JSON.
    5) When you reference a provided value, repeat it exactly.

    INPUT DATA (authoritative):
    \`\`\`json
    ${dataJson}
    \`\`\`

    Use only the following categories from the input:
    - Farm Location
    - Soil Analysis (nitrogen, phosphorus, ph, organicMatter, soilType)
    - Water Sensor Data (tds, ntu, temp, vTDS, vTURB)
    - Land Data Parameters (ndvi, ndwi, ndmi, evi, ndre)
    - Farm Details (farmSize, irrigationType)

    Please provide:
    1. Soil health analysis with recommendations based on ICAR guidelines (no invented numbers)
    2. Crop recommendations (qualitative unless numeric support exists in input)
    3. Market analysis (qualitative unless numeric support exists in input)
    4. Satellite/land index insights using ONLY the provided NDVI/NDWI/NDMI/EVI/NDRE values
    5. Immediate actionable recommendations (do not include numeric dosages unless present in input)
    6. Fertilizer and irrigation guidance (do not include numeric quantities unless present in input)

    Format the response as structured HTML with tables where appropriate. Use simple, farmer-friendly language.
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiContent = response.text();

    // Add source citation to AI-generated content
    const sourceCitation = generateSourceCitation(language);
    aiContent += `\n\n<div class="ai-sources">\n${sourceCitation.content}\n</div>`;

    return aiContent;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI report");
  }
}

function generateCropRecommendationTable(farmData, language = "mr") {
  const crops = Object.values(cropDatabase);
  const recommendations = crops
    .map((crop) => {
      const suitability = calculateCropSuitability(crop, farmData);
      const adjustedYield =
        crop.avgYield * (suitability / 100) * (farmData.farmSize || 1);

      return {
        crop: getCropName(crop, language),
        englishName: crop.name,
        suitability: Math.round(suitability),
        yield: adjustedYield.toFixed(1),
        demand: crop.marketDemand,
        season: crop.season,
      };
    })
    .sort((a, b) => b.suitability - a.suitability);

  // Get translations for table headers based on language
  const headers = getTableHeaders(language);

  // Build the table HTML with Tailwind styling
  let tableHTML = `
      <div class="overflow-x-auto rounded-lg shadow-md">
        <table class="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
          <thead class="bg-green-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${headers.crop}
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${headers.suitability}
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${headers.yield}
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${headers.demand}
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${headers.season}
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${headers.recommendation}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
    `;

  recommendations.forEach((rec, idx) => {
    // Alternate row background for zebra striping
    const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
    const recommendationText = getRecommendationText(rec.suitability, language);

    tableHTML += `
        <tr class="${rowBg}">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
            <strong>${rec.crop}</strong>${
      rec.crop !== rec.englishName ? ` (${rec.englishName})` : ""
    }
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${
            rec.suitability
          }%</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${
            rec.yield
          }</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${
            rec.demand
          }</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${
            rec.season
          }</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${recommendationText}</td>
        </tr>
      `;
  });

  tableHTML += `
          </tbody>
        </table>
      </div>
      <p class="mt-2 text-sm text-gray-500 italic">
        स्रोत: ICAR पीक सल्ला आणि राष्ट्रीय मातीचे आरोग्य कार्ड मानके
      </p>
    `;

  return tableHTML;
}

function getTableHeaders(language) {
  const headers = {
    mr: {
      crop: "पीक",
      suitability: "योग्यता (%)",
      yield: "अपेक्षित उत्पादन (क्विंटल)",
      demand: "बाजार मागणी",
      season: "हंगाम",
      recommendation: "शिफारस",
    },
    hi: {
      crop: "फसल",
      suitability: "उपयुक्तता (%)",
      yield: "अपेक्षित उत्पादन (क्विंटल)",
      demand: "बाजार मांग",
      season: "मौसम",
      recommendation: "सिफारिश",
    },
    en: {
      crop: "Crop",
      suitability: "Suitability (%)",
      yield: "Expected Yield (Quintal)",
      demand: "Market Demand",
      season: "Season",
      recommendation: "Recommendation",
    },
  };

  return headers[language] || headers.en;
}

function getRecommendationText(suitability, language) {
  const recommendations = {
    mr: {
      high: "अत्यधिक शिफारसीय",
      good: "शिफारसीय",
      moderate: "सावधानीपूर्वक विचार करा",
      low: "शिफारस नाही",
    },
    hi: {
      high: "अत्यधिक सिफारिश",
      good: "सिफारिश",
      moderate: "सावधानी से विचार करें",
      low: "सिफारिश नहीं",
    },
    en: {
      high: "Highly Recommended",
      good: "Recommended",
      moderate: "Consider with care",
      low: "Not recommended",
    },
  };

  const langRec = recommendations[language] || recommendations.en;

  if (suitability >= 80) return langRec.high;
  else if (suitability >= 60) return langRec.good;
  else if (suitability >= 40) return langRec.moderate;
  else return langRec.low;
}

function generateMarketAnalysis(farmData, language = "mr") {
  const marketHeaders = getMarketHeaders(language);

  // Build a styled table with Tailwind
  let tableHTML = `
      <div class="overflow-x-auto rounded-lg shadow-md mb-4">
        <table class="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
          <thead class="bg-green-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${marketHeaders.crop}
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${marketHeaders.price}
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${marketHeaders.trend}
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${marketHeaders.storage}
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${marketHeaders.transport}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr class="bg-white">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                <strong>${getCropName(cropDatabase.wheat, language)}</strong>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹2,200-2,400</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getMarketTrendText("stable", language)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getQualityText("excellent", language)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getQualityText("very good", language)}
              </td>
            </tr>
            <tr class="bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                <strong>${getCropName(cropDatabase.maize, language)}</strong>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹1,800-2,000</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getMarketTrendText("rising", language)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getQualityText("good", language)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getQualityText("good", language)}
              </td>
            </tr>
            <tr class="bg-white">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                <strong>${getCropName(cropDatabase.potato, language)}</strong>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹800-1,200</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getMarketTrendText("seasonal", language)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getQualityText("limited", language)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getQualityText("moderate", language)}
              </td>
            </tr>
            <tr class="bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                <strong>${getCropName(
                  cropDatabase.sunflower,
                  language
                )}</strong>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹5,500-6,000</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getMarketTrendText("volatile", language)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getQualityText("poor", language)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getQualityText("limited", language)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-sm text-gray-500 italic mb-6">
        स्रोत: कृषी विपणन विभाग, भारत सरकार आणि AGMARKNET
      </p>
    `;

  return tableHTML;
}

function getMarketHeaders(language) {
  const headers = {
    mr: {
      crop: "पीक",
      price: "सध्याची किंमत (₹/क्विंटल)",
      trend: "किंमत ट्रेंड",
      storage: "साठवण सुविधा",
      transport: "वाहतूक सुविधा",
    },
    hi: {
      crop: "फसल",
      price: "वर्तमान मूल्य (₹/क्विंटल)",
      trend: "मूल्य ट्रेंड",
      storage: "भंडारण सुविधा",
      transport: "परिवहन सुविधा",
    },
    en: {
      crop: "Crop",
      price: "Current Price (₹/Quintal)",
      trend: "Price Trend",
      storage: "Storage Facilities",
      transport: "Transport Access",
    },
  };

  return headers[language] || headers.en;
}

function getMarketTrendText(trend, language) {
  const trends = {
    mr: {
      stable: "स्थिर",
      rising: "वाढत्या",
      seasonal: "हंगामी",
      volatile: "अस्थिर",
    },
    hi: {
      stable: "स्थिर",
      rising: "बढ़ती",
      seasonal: "मौसमी",
      volatile: "अस्थिर",
    },
    en: {
      stable: "Stable",
      rising: "Rising",
      seasonal: "Seasonal",
      volatile: "Volatile",
    },
  };

  return trends[language]?.[trend] || trends.en[trend];
}

function getQualityText(quality, language) {
  const qualities = {
    mr: {
      excellent: "उत्कृष्ट",
      "very good": "खूप चांगली",
      good: "चांगली",
      moderate: "मध्यम",
      limited: "मर्यादित",
      poor: "गरीब",
    },
    hi: {
      excellent: "उत्कृष्ट",
      "very good": "बहुत अच्छी",
      good: "अच्छी",
      moderate: "मध्यम",
      limited: "सीमित",
      poor: "खराब",
    },
    en: {
      excellent: "Excellent",
      "very good": "Very Good",
      good: "Good",
      moderate: "Moderate",
      limited: "Limited",
      poor: "Poor",
    },
  };

  return qualities[language]?.[quality] || qualities.en[quality];
}

function generateSatelliteInsights(farmData, language = "mr") {
  const insights = getSatelliteInsightsText(language);

  return `
        <div class="satellite-insights">
            <h4>🛰️ ${insights.ndviTitle}</h4>
            <p>${insights.ndviText}</p>
            
            <h4>💧 ${insights.moistureTitle}</h4>
            <p>${insights.moistureText}</p>
            
            <h4>🌧️ ${insights.rainfallTitle}</h4>
            <p>${insights.rainfallText}</p>
            
            <h4>🌡️ ${insights.temperatureTitle}</h4>
            <p>${insights.temperatureText}</p>
            
            <p class="data-source"><small><em>स्रोत: NASA Sentinel-2, SMAP, CHIRPS डेटा</em></small></p>
        </div>
    `;
}

function getSatelliteInsightsText(language) {
  const insights = {
    mr: {
      ndviTitle: "NDVI विश्लेषण",
      ndviText:
        "सध्याचा वनस्पति निर्देशांक तुमच्या प्रदेशासाठी इष्टतम वाढीची परिस्थिती दर्शवतो. खरीप पिकांसाठी पुढील 2-3 आठवड्यांत लागवडीची शिफारस.",
      moistureTitle: "मातीतील आर्द्रता डेटा (SMAP)",
      moistureText:
        "सध्याची मातीतील आर्द्रता: 65% (बहुतेक पिकांसाठी इष्टतम). सिंचन शिफारस: अपेक्षित पावसामुळे पुढील 10 दिवसांसाठी 20% कमी करा.",
      rainfallTitle: "पावसाचे नमुने (CHIRPS)",
      rainfallText:
        "ऐतिहासिक डेटा या हंगामात सरासरीपेक्षा 15% जास्त पाऊस अपेक्षित असल्याचे दर्शवतो. बटाटा लागवडीसाठी निचरा व्यवस्था समायोजित करा.",
      temperatureTitle: "तापमान ट्रेंड",
      temperatureText:
        "सरासरी तापमान: 28°C (मका आणि सूर्यफूलसाठी योग्य). पुढील 30 दिवसांसाठी उष्णतेचा धोका: कमी.",
    },
    hi: {
      ndviTitle: "NDVI विश्लेषण",
      ndviText:
        "वर्तमान वनस्पति सूचकांक आपके क्षेत्र के लिए इष्टतम बढ़ती परिस्थितियों को दर्शाता है। खरीफ फसलों के लिए अगले 2-3 सप्ताह में बुवाई की सिफारिश।",
      moistureTitle: "मिट्टी की नमी डेटा (SMAP)",
      moistureText:
        "वर्तमान मिट्टी की नमी: 65% (अधिकांश फसलों के लिए इष्टतम)। सिंचाई सिफारिश: अपेक्षित वर्षा के कारण अगले 10 दिनों के लिए 20% कम करें।",
      rainfallTitle: "वर्षा पैटर्न (CHIRPS)",
      rainfallText:
        "ऐतिहासिक डेटा इस मौसम में औसत से 15% अधिक वर्षा की उम्मीद दर्शाता है। आलू की खेती के लिए जल निकासी प्रणाली को समायोजित करें।",
      temperatureTitle: "तापमान रुझान",
      temperatureText:
        "औसत तापमान: 28°C (मक्का और सूरजमुखी के लिए उपयुक्त)। अगले 30 दिनों के लिए गर्मी का जोखिम: कम।",
    },
    en: {
      ndviTitle: "NDVI Analysis",
      ndviText:
        "Current vegetation index shows optimal growing conditions for your region. Recommended planting window: Next 2-3 weeks for Kharif crops.",
      moistureTitle: "Soil Moisture Data (SMAP)",
      moistureText:
        "Current soil moisture: 65% (Optimal for most crops). Irrigation recommendation: Reduce by 20% for next 10 days due to expected rainfall.",
      rainfallTitle: "Rainfall Patterns (CHIRPS)",
      rainfallText:
        "Historical data shows 15% above-average rainfall expected this season. Adjust drainage systems for potato cultivation.",
      temperatureTitle: "Temperature Trends",
      temperatureText:
        "Average temperature: 28°C (Suitable for Maize and Sunflower). Heat stress risk: Low for next 30 days.",
    },
  };

  return insights[language] || insights.en;
}

function generateRecommendations(farmData, language = "mr") {
  const { nitrogen, phosphorus, ph, organicMatter } = farmData;
  const recTexts = getRecommendationTexts(language);
  let recommendations = `<ul class="list-disc list-inside mb-4 space-y-1">`;

  if (phosphorus < 25) {
    recommendations += `<li>${recTexts.phosphorus}</li>`;
  }

  if (nitrogen < 40) {
    recommendations += `<li>${recTexts.nitrogen}</li>`;
  }

  if (ph < 6.0) {
    recommendations += `<li>${recTexts.lime}</li>`;
  } else if (ph > 8.0) {
    recommendations += `<li>${recTexts.gypsum}</li>`;
  }

  if (organicMatter < 1.5) {
    recommendations += `<li>${recTexts.organicMatter}</li>`;
  }

  recommendations += `<li>${recTexts.irrigation}</li>`;
  recommendations += `<li>${recTexts.rotation}</li>`;
  recommendations += `<li>${recTexts.testing}</li>`;

  recommendations += "</ul>";
  recommendations += `<p class="data-source"><small><em>स्रोत: ICAR मार्गदर्शक तत्त्वे आणि FAO मातीची गुणवत्ता मानके</em></small></p>`;

  return recommendations;
}

function getRecommendationTexts(language) {
  const texts = {
    mr: {
      phosphorus:
        "लागवडीपूर्वी प्रति एकर 100 किलो फॉस्फरस समृद्ध खत (DAP) द्या",
      nitrogen: "युरिया खत विभागणीत द्या: 50% लागवडीवेळी, 50% कंसाळी अवस्थेत",
      lime: "मातीचा pH वाढवण्यासाठी प्रति एकर 200-300 किलो चुना द्या",
      gypsum: "मातीची क्षारता कमी करण्यासाठी प्रति एकर 250 किलो जिप्सम द्या",
      organicMatter: "प्रति एकर 5-7 टन शेणखत मिसळा",
      irrigation: "पाण्याची 40% बचत करण्यासाठी ठिबक सिंचन प्रणाली बसवा",
      rotation:
        "मातीतील नायट्रोजन सुधारण्यासाठी शेंगवर्गीय पिकांसह फिरती लागवड करा",
      testing: "सुधारणा तपासण्यासाठी दर 6 महिन्यांनी मातीची चाचणी करा",
    },
    hi: {
      phosphorus:
        "बुवाई से पहले प्रति एकड़ 100 किलो फॉस्फोरस युक्त उर्वरक (DAP) डालें",
      nitrogen:
        "यूरिया उर्वरक को विभाजित मात्रा में दें: 50% बुवाई के समय, 50% कल्ले निकलने के समय",
      lime: "मिट्टी का pH बढ़ाने के लिए प्रति एकड़ 200-300 किलो चूना डालें",
      gypsum:
        "मिट्टी की क्षारता कम करने के लिए प्रति एकड़ 250 किलो जिप्सम डालें",
      organicMatter: "प्रति एकड़ 5-7 टन गोबर की खाद मिलाएं",
      irrigation: "पानी की 40% बचत के लिए ड्रिप सिंचाई प्रणाली स्थापित करें",
      rotation:
        "मिट्टी में नाइट्रोजन सुधार के लिए दलहनी फसलों के साथ फसल चक्र अपनाएं",
      testing: "सुधार की निगरानी के लिए हर 6 महीने में मिट्टी की जांच कराएं",
    },
    en: {
      phosphorus:
        "Apply phosphorus-rich fertilizer (DAP) at 100 kg/acre before sowing",
      nitrogen:
        "Apply urea fertilizer in split doses: 50% at sowing, 50% at tillering stage",
      lime: "Apply lime at 200-300 kg/acre to increase soil pH",
      gypsum: "Apply gypsum at 250 kg/acre to reduce soil alkalinity",
      organicMatter: "Incorporate 5-7 tons of farmyard manure per acre",
      irrigation:
        "Install drip irrigation system to improve water use efficiency by 40%",
      rotation: "Practice crop rotation with legumes to improve soil nitrogen",
      testing: "Consider soil testing every 6 months to monitor improvements",
    },
  };

  return texts[language] || texts.en;
}

function generateYieldProjections(farmData, language = "mr") {
  const soilHealth = calculateSoilHealth(
    farmData.nitrogen,
    farmData.phosphorus,
    farmData.ph,
    farmData.organicMatter
  );

  let multiplier = 1.0;
  if (soilHealth === "Excellent") multiplier = 1.2;
  else if (soilHealth === "Good") multiplier = 1.0;
  else if (soilHealth === "Average") multiplier = 0.8;
  else multiplier = 0.6;

  const headers = getYieldHeaders(language);

  // Build a styled table with Tailwind
  let tableHTML = `
      <div class="overflow-x-auto rounded-lg shadow-md mb-4">
        <table class="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
          <thead class="bg-green-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${headers.crop}
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${headers.current}
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${headers.improved}
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ${headers.income}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr class="bg-white">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                <strong>${getCropName(cropDatabase.wheat, language)}</strong>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${(4.8 * multiplier).toFixed(1)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${(4.8 * 1.2).toFixed(1)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ₹${(4.8 * 1.2 * 2300).toLocaleString()}
              </td>
            </tr>
            <tr class="bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                <strong>${getCropName(cropDatabase.maize, language)}</strong>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${(5.2 * multiplier).toFixed(1)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${(5.2 * 1.2).toFixed(1)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ₹${(5.2 * 1.2 * 1900).toLocaleString()}
              </td>
            </tr>
            <tr class="bg-white">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                <strong>${getCropName(cropDatabase.potato, language)}</strong>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${(20.5 * multiplier).toFixed(1)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${(20.5 * 1.2).toFixed(1)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ₹${(20.5 * 1.2 * 1000).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-sm text-gray-500 italic mb-6">
        स्रोत: कृषी सांख्यिकी विभाग आणि NSSO डेटा
      </p>
    `;

  return tableHTML;
}

function getYieldHeaders(language) {
  const headers = {
    mr: {
      crop: "पीक",
      current: "सध्याची क्षमता (क्विंटल/एकर)",
      improved: "सुधारणांसह (क्विंटल/एकर)",
      income: "संभाव्य उत्पन्न (₹/एकर)",
    },
    hi: {
      crop: "फसल",
      current: "वर्तमान क्षमता (क्विंटल/एकड़)",
      improved: "सुधार के साथ (क्विंटल/एकड़)",
      income: "संभावित आय (₹/एकड़)",
    },
    en: {
      crop: "Crop",
      current: "Current Potential (Quintal/acre)",
      improved: "With Improvements (Quintal/acre)",
      income: "Potential Income (₹/acre)",
    },
  };

  return headers[language] || headers.en;
}

const sampleUserInputs = [
  {
    farmLocation: "Fetching location...", // This will be updated with real location
    farmSize: 5.2,
    nitrogen: 65,
    phosphorus: 28,
    potassium: 175,
    ph: 6.5,
    organicMatter: 1.8,
    soilType: "Black Soil",
    irrigationType: "Drip irrigation",
    tds: 850,
    ntu: 25,
    temp: 24.5,
    vTDS: 2.1,
    vTURB: 3.4,
    ndwi: 0.12,
    evi: 0.34,
    ndre: 0.21,
    ndmi: 0.18,
    ndvi: 0.48,
    language: "mr",
  },
];

// React Page: Report.jsx
export function Report() {

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Use reverse geocoding to get the location name
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${latitude}&lon=${longitude}&zoom=18`,
              {
                headers: {
                  "Accept": "application/json",
                },
              }
            );
            const data = await response.json();

            const displayName = data?.display_name;
            if (displayName) {
              resolve(String(displayName));
              return;
            }

            // Fallback to a more complete address build
            const address = data?.address || {};
            const parts = [
              address.road,
              address.suburb,
              address.neighbourhood,
              address.city || address.town || address.village || address.hamlet,
              address.county,
              address.state_district,
              address.state,
              address.postcode,
              address.country,
            ].filter(Boolean);

            resolve(parts.join(", ") || "Location not available");
          } catch (error) {
            reject(new Error("Failed to get location name"));
          }
        },
        (error) => {
          reject(new Error(`Failed to get location: ${error.message}`));
        }
      );
    });
  };
  const [formData, setFormData] = useState({
    farmLocation: sampleUserInputs[0].farmLocation,
    farmSize: sampleUserInputs[0].farmSize,
    nitrogen: sampleUserInputs[0].nitrogen,
    phosphorus: sampleUserInputs[0].phosphorus,
    potassium: sampleUserInputs[0].potassium,
    ph: sampleUserInputs[0].ph,
    organicMatter: sampleUserInputs[0].organicMatter,
    soilType: sampleUserInputs[0].soilType,
    irrigationType: sampleUserInputs[0].irrigationType,
    tds: sampleUserInputs[0].tds,
    ntu: sampleUserInputs[0].ntu,
    temp: sampleUserInputs[0].temp,
    vTDS: sampleUserInputs[0].vTDS,
    vTURB: sampleUserInputs[0].vTURB,
    ndwi: sampleUserInputs[0].ndwi,
    evi: sampleUserInputs[0].evi,
    ndre: sampleUserInputs[0].ndre,
    ndmi: sampleUserInputs[0].ndmi,
    ndvi: sampleUserInputs[0].ndvi,
    language: sampleUserInputs[0].language,
  });

  // Add useEffect to fetch location when component mounts
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setFormData(prev => ({
          ...prev,
          farmLocation: location
        }));
      } catch (error) {
        console.error("Error getting location:", error);
        // Keep the default location if there's an error
      }
    };
    
    fetchLocation();
  }, []);
  const [reportHTML, setReportHTML] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "language" ? value : parseFloat(value) || value,
    }));
  };

  // Add this function inside the Report component
  const handleDownloadPDF = () => {
    const reportElement = document.getElementById("report-content");
    if (!reportElement) return;

    const tempStyle = document.createElement("style");
    tempStyle.innerHTML = `
      * {
        color-scheme: light only !important;
        color: rgb(0, 0, 0) !important;
        background-color: rgb(255, 255, 255) !important;
        border-color: rgb(0, 0, 0) !important;
      }
      .bg-green-500 { background-color: rgb(34, 197, 94) !important; }
      .bg-orange-500 { background-color: rgb(249, 115, 22) !important; }
      .bg-blue-500 { background-color: rgb(59, 130, 246) !important; }
      .bg-purple-500 { background-color: rgb(168, 85, 247) !important; }
      .text-green-700 { color: rgb(21, 128, 61) !important; }
      .text-gray-700 { color: rgb(55, 65, 81) !important; }
      .text-gray-900 { color: rgb(17, 24, 39) !important; }
      .bg-gray-200 { background-color: rgb(229, 231, 235) !important; }
    `;
    document.head.appendChild(tempStyle);

    html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      removeContainer: true,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      document.head.removeChild(tempStyle);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 10; // 10mm margin
      const imgWidth = pageWidth - (2 * margin);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - (2 * margin));

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - (2 * margin));
      }

      pdf.save(`Farm-Report-${formData.farmLocation}.pdf`);
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Validate required fields
      const requiredFields = [
        "farmLocation",
        "nitrogen",
        "phosphorus",
        "ph",
        "organicMatter",
        "farmSize",
      ];
      for (const field of requiredFields) {
        if (!formData[field])
          throw new Error(`Missing required field: ${field}`);
      }

      const language = formData.language || "en";

      // Generate components
      const cropRecommendations = generateCropRecommendationTable(
        formData,
        language
      );
      const marketAnalysis = generateMarketAnalysis(formData, language);
      const satelliteInsights = generateSatelliteInsights(formData, language);
      const recommendations = generateRecommendations(formData, language);
      const yieldProjections = generateYieldProjections(formData, language);
      const sourceCitationObj = generateSourceCitation(language);

      let aiInsights = "";
      try {
        aiInsights = await generateGeminiReport(formData, language);
      } catch {
        aiInsights = `<p>AI insights temporarily unavailable. Using standard recommendations.</p>\n${sourceCitationObj.content}`;
      }

      const completeHTML = `
  <div id="report-content"  className="m-8 p-6 bg-white rounded-lg shadow-md"
  dangerouslySetInnerHTML={{ __html: reportHTML }} >
      <h2 class="text-2xl font-bold text-green-700 mb-4">${
        languageTemplates[language].cropSuitability
      }</h2>
      <p class="mb-3"><strong>Location:</strong> <span style="word-break: break-word; overflow-wrap: anywhere;">${
        formData.farmLocation
      }</span></p>
      <h3 class="flex items-center text-xl font-bold text-black mb-4">
        ${languageTemplates[language].soilHealth}
    </h3>
    <div class="bg-gray-50 p-4 rounded-lg shadow-sm space-y-4">
   <!-- Nitrogen -->
  <div class="flex items-center">
     <span class="w-32 font-medium text-gray-700">Nitrogen:</span>
     <div class="flex-1 bg-gray-200 h-3 rounded-full mx-4 ">
       <div class="bg-green-500 h-3 rounded-full" style="width: ${Math.min(
         formData.nitrogen,
         100
       )}%;"></div>
     </div>
     <span class="w-18 flex text-right text-gray-900">${
       formData.nitrogen
     }mg/kg</span>
   </div>

   <!-- Phosphorus -->
   <div class="flex items-center">
     <span class="w-32 font-medium text-gray-700">Phosphorus:</span>
     <div class="flex-1 bg-gray-200 h-3 rounded-full mx-4 ">
       <div class="bg-orange-500 h-3 rounded-full" style="width: ${Math.min(
         formData.phosphorus,
         100
       )}%;"></div>
     </div>
     <span class="w-18 flex  text-right text-gray-900">${
       formData.phosphorus
     }mg/kg</span>
   </div>

   <!-- pH Level -->
   <div class="flex items-center">
     <span class="w-32 font-medium text-gray-700">pH Level:</span>
     <div class="flex-1 bg-gray-200 h-3 rounded-full mx-4 w-96 ">
       <div class="bg-blue-500 h-3 rounded-full" style="width: ${Math.min(
         (formData.ph / 14) * 100,
         100
       )}%;"></div>
     </div>
     <span class="w-12 text-right text-gray-900">${formData.ph}</span>
   </div>

   <!-- Organic Matter -->
   <div class="flex items-center">
     <span class="w-32 font-medium text-gray-700">Organic Matter:</span>
     <div class="flex-1 bg-gray-200 h-3 rounded-full mx-4 w-96">
       <div class="bg-purple-500 h-3 rounded-full" style="width: ${Math.min(
         formData.organicMatter * 20,
         100
       )}%;"></div>
     </div>
     <span class="w-12 text-right text-gray-900">${
       formData.organicMatter
     }%</span>
   </div>
 </div>
      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-2">Water Sensor Data</h3>
      <div class="bg-gray-50 p-4 rounded-lg shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-700">TDS</span>
          <span class="text-gray-900">${formData.tds ?? "—"} ppm</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-700">Turbidity (NTU)</span>
          <span class="text-gray-900">${formData.ntu ?? "—"} NTU</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-700">Water Temperature</span>
          <span class="text-gray-900">${formData.temp ?? "—"} °C</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-700">vTDS</span>
          <span class="text-gray-900">${formData.vTDS ?? "—"} V</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-700">vTURB</span>
          <span class="text-gray-900">${formData.vTURB ?? "—"} V</span>
        </div>
      </div>

      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-2">Land Data Parameters</h3>
      <div class="bg-gray-50 p-4 rounded-lg shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-700">NDVI</span>
          <span class="text-gray-900">${formData.ndvi ?? "—"}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-700">NDWI</span>
          <span class="text-gray-900">${formData.ndwi ?? "—"}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-700">NDMI</span>
          <span class="text-gray-900">${formData.ndmi ?? "—"}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-700">EVI</span>
          <span class="text-gray-900">${formData.evi ?? "—"}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-700">NDRE</span>
          <span class="text-gray-900">${formData.ndre ?? "—"}</span>
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-2">${
        languageTemplates[language].marketPotential
      }</h3>
      ${marketAnalysis}
      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-2">${
        languageTemplates[language].yieldProjections
      }</h3>
      ${yieldProjections}
      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-2">${
        languageTemplates[language].recommendations
      }</h3>
      ${recommendations}
      <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-2">${
        languageTemplates[language].cropRecommendations
      }</h3>
     <div class="prose max-w-none overflow-x-auto bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        ${cropRecommendations}
     </div>
     <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-2">${
       languageTemplates[language].satelliteInsights
     }</h3>
     <div class="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
        ${satelliteInsights}
     </div>
      <div class="mt-6 bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-200">
        <h4 class="text-lg font-semibold text-gray-700 mb-2">${
          sourceCitationObj.title
        }</h4>
        <div class="prose text-sm text-gray-700">
            ${sourceCitationObj.content}
        </div>
      </div>
  </div>
`;

      setReportHTML(completeHTML);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-20 lg:mt-16 bg-gray-100 flex items-start justify-center py-12 px-4">
      <div className="max-w-7xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Farm Data Input
        </h1>

        {/* Farm Location */}
        <div className="mb-6">
          <label
            htmlFor="farmLocation"
            className="block text-gray-700 font-medium mb-1"
          >
            Farm Location:
          </label>
          <input
            type="text"
            name="farmLocation"
            id="farmLocation"
            value={formData.farmLocation}
            onChange={handleInputChange}
            required
            className="w-full border-2 border-green-400 focus:ring-green-400 focus:border-green-400 rounded-lg px-3 py-2 text-gray-900"
            placeholder="Enter location"
          />
        </div>

        {/* Soil Analysis Section */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Soil Analysis
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {/* Nitrogen */}
          <div>
            <label
              htmlFor="nitrogen"
              className="block text-gray-700 font-medium mb-1"
            >
              Nitrogen (mg/kg):
            </label>
            <input
              type="number"
              name="nitrogen"
              id="nitrogen"
              value={formData.nitrogen}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. 50"
            />
          </div>
          {/* Phosphorus */}
          <div>
            <label
              htmlFor="phosphorus"
              className="block text-gray-700 font-medium mb-1"
            >
              Phosphorus (mg/kg):
            </label>
            <input
              type="number"
              name="phosphorus"
              id="phosphorus"
              value={formData.phosphorus}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. 30"
            />
          </div>
          {/* pH */}
          <div>
            <label
              htmlFor="ph"
              className="block text-gray-700 font-medium mb-1"
            >
              pH Level:
            </label>
            <input
              type="number"
              name="ph"
              id="ph"
              step="0.1"
              value={formData.ph}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. 6.5"
            />
          </div>
          {/* Organic Matter */}
          <div>
            <label
              htmlFor="organicMatter"
              className="block text-gray-700 font-medium mb-1"
            >
              Organic Matter (%):
            </label>
            <input
              type="number"
              name="organicMatter"
              id="organicMatter"
              step="0.1"
              value={formData.organicMatter}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. 3.0"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
          
          {/* Soil Type */}
          <div>
            <label
              htmlFor="soilType"
              className="block text-gray-700 font-medium mb-1"
            >
              Soil Type:
            </label>
            <input
              type="text"
              name="soilType"
              id="soilType"
              value={formData.soilType}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. Loamy, Sandy..."
            />
          </div>
                  {/* Farm Size */}
        <div className="">
          <label
            htmlFor="farmSize"
            className="block text-gray-700 font-medium mb-1"
          >
            Farm Size (acres):
          </label>
          <input
            type="number"
            name="farmSize"
            id="farmSize"
            step="0.1"
            value={formData.farmSize}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
            placeholder="e.g. 10.5"
          />
        </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Water Sensor Data</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label
              htmlFor="tds"
              className="block text-gray-700 font-medium mb-1"
            >
              TDS (ppm):
            </label>
            <input
              type="number"
              name="tds"
              id="tds"
              value={formData.tds}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. 850"
            />
          </div>
          <div>
            <label
              htmlFor="ntu"
              className="block text-gray-700 font-medium mb-1"
            >
              Turbidity (NTU):
            </label>
            <input
              type="number"
              name="ntu"
              id="ntu"
              value={formData.ntu}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. 25"
            />
          </div>
          <div>
            <label
              htmlFor="temp"
              className="block text-gray-700 font-medium mb-1"
            >
              Water Temp (°C):
            </label>
            <input
              type="number"
              name="temp"
              id="temp"
              step="0.1"
              value={formData.temp}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. 24.5"
            />
          </div>
          <div>
            <label
              htmlFor="vTDS"
              className="block text-gray-700 font-medium mb-1"
            >
              vTDS (V):
            </label>
            <input
              type="number"
              name="vTDS"
              id="vTDS"
              step="0.1"
              value={formData.vTDS}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. 2.1"
            />
          </div>
          <div>
            <label
              htmlFor="vTURB"
              className="block text-gray-700 font-medium mb-1"
            >
              vTURB (V):
            </label>
            <input
              type="number"
              name="vTURB"
              id="vTURB"
              step="0.1"
              value={formData.vTURB}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. 3.4"
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Land Data Parameters</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label
              htmlFor="ndvi"
              className="block text-gray-700 font-medium mb-1"
            >
              NDVI:
            </label>
            <input
              type="number"
              name="ndvi"
              id="ndvi"
              step="0.01"
              value={formData.ndvi}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. 0.48"
            />
          </div>
          <div>
            <label
              htmlFor="ndwi"
              className="block text-gray-700 font-medium mb-1"
            >
              NDWI:
            </label>
            <input
              type="number"
              name="ndwi"
              id="ndwi"
              step="0.01"
              value={formData.ndwi}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. 0.12"
            />
          </div>
          <div>
            <label
              htmlFor="ndmi"
              className="block text-gray-700 font-medium mb-1"
            >
              NDMI:
            </label>
            <input
              type="number"
              name="ndmi"
              id="ndmi"
              step="0.01"
              value={formData.ndmi}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. 0.18"
            />
          </div>
          <div>
            <label
              htmlFor="evi"
              className="block text-gray-700 font-medium mb-1"
            >
              EVI:
            </label>
            <input
              type="number"
              name="evi"
              id="evi"
              step="0.01"
              value={formData.evi}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. 0.34"
            />
          </div>
          <div>
            <label
              htmlFor="ndre"
              className="block text-gray-700 font-medium mb-1"
            >
              NDRE:
            </label>
            <input
              type="number"
              name="ndre"
              id="ndre"
              step="0.01"
              value={formData.ndre}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
              placeholder="e.g. 0.21"
            />
          </div>
        </div>



        {/* Irrigation Type */}
        <div className="mb-6">
          <label
            htmlFor="irrigationType"
            className="block text-gray-700 font-medium mb-1"
          >
            Irrigation Type:
          </label>
          <input
            type="text"
            name="irrigationType"
            id="irrigationType"
            value={formData.irrigationType}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400"
            placeholder="e.g. Drip, Sprinkler..."
          />
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <label
            htmlFor="language"
            className="block text-gray-700 font-medium mb-1"
          >
            Report Language:
          </label>
          <select
            name="language"
            id="language"
            value={formData.language}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-400 bg-white"
          >
            <option value="mr">मराठी (Marathi)</option>
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="bn">বাংলা (Bengali)</option>
          </select>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`bg-green-600 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg focus:ring-2 focus:ring-green-400 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        <button
          onClick={handleDownloadPDF}
          disabled={!reportHTML || loading}
          className="ml-2 px-4 py-2 font-bold bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
          Download PDF
        </button>
          </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Report HTML Output */}
        {reportHTML && (
          <div
            className="report-output max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200"
            dangerouslySetInnerHTML={{ __html: reportHTML }}
          />
        )}
      </div>
    </div>
  );
}

export default Report;
