import React, { useCallback, useEffect, useRef, useState } from "react";
import { getAllLandData } from "../context/firebase";
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, Circle, Polygon, GroundOverlay, StandaloneSearchBox, } from '@react-google-maps/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Weather from "../Components/Weather";
import Chatbot from "../Components/Chatbot"; 
import InsuranceValidationModal from "../Components/InsuranceValidationModal";
import toast, { Toaster } from "react-hot-toast";
import ReportModal from "../Components/ReportModal";
import SvgMaskedOverlay from "../Components/SvgMaskedOverlay";

// API base for backend server
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const containerStyle = {
    width: '100%',
    height: '100%',
};
const startingPoint = { lat: 28.6820585, lng: 77.4542772 };
// Must be defined outside the component. A new array on every render makes the Maps script reload.
const MAP_LIBRARIES = ["places"];


// Add this component inside the GIS function component


export default function GIS() {
    const [monitoringOpen, setMonitoringOpen] = useState(true);
    const [weatherOpen, setWeatherOpen] = useState(false);
    const [overviewOpen, setOverviewOpen] = useState(false);
    const [vraOpen, setVraOpen] = useState(false);
    const [dataManagerOpen, setDataManagerOpen] = useState(false);
    const [fieldManagerOpen, setFieldManagerOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [marketplaceOpen, setMarketplaceOpen] = useState(false);
    const [lands, setLands] = useState([]);
    const toggle = setter => setter(prev => !prev);
    const tabs = ['Crop info', 'Chart', 'Activities', 'Drone Allocation'];
    const [indexType, setIndexType] = useState('NDVI');
    const [modalOpen, setModalOpen] = useState(false);
    // Add new state variables for polygon selection and crop allocation
    const [selectedPolygon, setSelectedPolygon] = useState(null);
    const [cropOptions, setCropOptions] = useState([
        'Rice (Paddy)',
        'Wheat',
        'Maize',
        'Sorghum (Jowar)',
        'Pearl Millet (Bajra)',
        'Finger Millet (Ragi)',
        'Barley',
        'Chickpea (Gram)',
        'Pigeon Pea (Arhar / Toor)',
        'Green Gram (Moong Bean)',
        'Black Gram (Urad Bean)',
        'Lentil (Masoor)',
        'Groundnut (Peanut)',
        'Rapeseed & Mustard',
        'Soybean',
        'Sunflower',
        'Sesame (Til)',
        'Sugarcane',
        'Cotton',
        'Jute',
        'Potato',
        'Onion',
        'Tomato',
        'Brinjal (Eggplant)',
        'Chilli',
        'Cabbage',
        'Cauliflower',
        'Okra (Ladyfinger / Bhindi)',
        'Mango',
        'Banana',
        'Tea',
        'Coffee',
        'Rubber',
        'Tobacco',
        'Kidney Bean (Rajma)',
        'Peas (Field/Green)',
        'Castor',
        'Linseed (Flaxseed)',
        'Niger Seed',
        'Sweet Potato',
        'Coriander (for seed)',
        'Cumin',
        'Turmeric',
        'Ginger',
        'Garlic',
        'Cucurbits (e.g., Bottle Gourd, Bitter Gourd)',
        'Guava',
        'Papaya',
        'Citrus (Oranges/Lemons)'
      ]);
    const cropColors = {
        "Wheat": "#F5DEB3",  // Wheat color
        "Rice": "#90EE90",   // Light green
        "Corn": "#FFD700",   // Gold
        "Soybean": "#8FBC8F", // Dark sea green
        "Cotton": "#F0FFFF"   // Azure
    };
    const [chatOpen, setChatOpen] = useState(false);
    const [sentinelOpen, setSentinelOpen] = useState(false);
    const [ndviOpen, setNdviOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleSentinel = () => setSentinelOpen((prev) => !prev);
    const toggleNdvi = () => setNdviOpen((prev) => !prev);
    // Date range: default start = 7 days before today, end = today
    const today = new Date();
    const formatISO = (d) => d.toISOString().slice(0, 10);
    const defaultEnd = formatISO(today);
    const defaultStart = formatISO(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(defaultEnd);
    const toggleChat = () => setChatOpen((open) => !open);
    const cropData = [
        {
            name: 'Wheat',
            area: 4000,
            growthStage: 'Vegetative',
            yield: 2400,
        },
        {
            name: 'Rice',
            area: 3000,
            growthStage: 'Flowering',
            yield: 2210,
        },
        {
            name: 'Maize',
            area: 2000,
            growthStage: 'Mature',
            yield: 2290,
        },
        {
            name: 'Soybean',
            area: 2780,
            growthStage: 'Early vegetative',
            yield: 2000,
        },
        {
            name: 'Cotton',
            area: 1890,
            growthStage: 'Flowering',
            yield: 2181,
        },
        {
            name: 'Sugarcane',
            area: 2390,
            growthStage: 'Ripening',
            yield: 2500,
        },
        {
            name: 'Barley',
            area: 3490,
            growthStage: 'Heading',
            yield: 2100,
        },
    ];
    const [selectedCrop, setSelectedCrop] = useState('');
    const [polygonCrops, setPolygonCrops] = useState({});
    const [modalOpenValidation, setModalOpenValidation] = useState(false);

    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [selectedVegetationIndex, setSelectedVegetationIndex] = useState('ndvi');
    const vegetationIndices = ['ndwi', 'evi', 'ndre', 'ndmi', 'ndvi'];
    const [selectedPolygonData, setSelectedPolygonData] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
    const [aiAnalysisError, setAiAnalysisError] = useState('');
    const [aiLanguage, setAiLanguage] = useState('English');
    // Inside your GIS component, after your map is ready…
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef(null);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [currentLocation, setCurrentLocation] = useState({ lat: 30.762357, lng: 76.598619 }); // Default fallback
    const searchBoxRef = useRef(null);
    // Add a useEffect to get the user's location when component mounts
    useEffect(() => {
        const requestLocationAccess = async () => {
            try {
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                if (permission.state === 'granted') {
                    getLocation();
                } else if (permission.state === 'prompt') {
                    toast("Please allow location access for better experience.", { icon: "📍" });
                    getLocation();
                } else {
                    toast("Location access denied. Using default location.", { icon: "⚠️" });
                }
            } catch (error) {
                console.error("Error requesting location permission:", error);
                toast.error("Could not request location permission. Using default location.");
            }
        };

        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log("Location:", latitude, longitude);
                        setCurrentLocation({ lat: latitude, lng: longitude });
                        if (setLocation) {
                            fetchLocationName(latitude, longitude);
                        }
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        toast.error("Could not get your location. Using default location.");
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
            } else {
                toast.error("Geolocation is not supported by this browser. Using default location.");
            }
        };

        requestLocationAccess();
    }, []);

    // First, add the legend data at the top of the file
    const NDVI_LEGEND = [
        { min: 0.60, max: 0.70, color: "#1a9850", label: "Dense vegetation" },
        { min: 0.50, max: 0.60, color: "#66bd63", label: "Dense vegetation" },
        { min: 0.40, max: 0.50, color: "#a6d96a", label: "Moderate vegetation" },
        { min: 0.30, max: 0.40, color: "#d9ef8b", label: "Moderate vegetation" },
        { min: 0.20, max: 0.30, color: "#fee08b", label: "Sparse vegetation" },
        { min: 0.10, max: 0.20, color: "#fdae61", label: "Bare soil" },
        { min: 0.00, max: 0.10, color: "#f46d43", label: "Bare soil" },
        { min: -0.20, max: 0.00, color: "#d73027", label: "Water/Urban/Cloud" }
    ];

    const EVI_LEGEND = [
        { min: 0.60, max: 0.80, color: "#440154", label: "Dense vegetation" },
        { min: 0.40, max: 0.60, color: "#31688e", label: "Moderate vegetation" },
        { min: 0.20, max: 0.40, color: "#35b779", label: "Sparse vegetation" },
        { min: 0.00, max: 0.20, color: "#fde725", label: "Bare soil" },
        { min: -0.20, max: 0.00, color: "#f9f871", label: "Water/Urban/Cloud" }
    ];

    const NDRE_LEGEND = [
        { min: 0.25, max: 0.30, color: "#f0f921", label: "Dense vegetation" },
        { min: 0.20, max: 0.25, color: "#f89540", label: "Moderate vegetation" },
        { min: 0.15, max: 0.20, color: "#cc4778", label: "Sparse vegetation" },
        { min: 0.05, max: 0.15, color: "#7201a8", label: "Bare soil/Other" }
    ];

    const NDMI_LEGEND = [
        { min: 0.20, max: 0.30, color: "#01665e", label: "Very moist" },
        { min: 0.10, max: 0.20, color: "#35978f", label: "Moist" },
        { min: 0.00, max: 0.10, color: "#80cdc1", label: "Slightly moist" },
        { min: -0.10, max: 0.00, color: "#dfc27d", label: "Dry" },
        { min: -0.20, max: -0.10, color: "#a6611a", label: "Very dry" }
    ];

    const NDWI_LEGEND = [
        { min: 0.20, max: 0.30, color: "#313695", label: "Bare soil/Urban" },
        { min: 0.10, max: 0.20, color: "#4575b4", label: "Dry soil" },
        { min: 0.00, max: 0.10, color: "#74add1", label: "Moist soil" },
        { min: -0.10, max: 0.00, color: "#fdae61", label: "Wetland" },
        { min: -0.30, max: -0.10, color: "#d73027", label: "Open water" }
    ];

    const VegetationLegend = ({ indexType }) => {
        // Select the appropriate legend based on the index type
        const getLegend = () => {
            switch (indexType.toLowerCase()) {
                case 'ndvi':
                    return NDVI_LEGEND;
                case 'evi':
                    return EVI_LEGEND;
                case 'ndre':
                    return NDRE_LEGEND;
                case 'ndmi':
                    return NDMI_LEGEND;
                case 'ndwi':
                    return NDWI_LEGEND;
                default:
                    return NDVI_LEGEND;
            }
        };

        const legend = getLegend();

        // Update the VegetationLegend component styling:
        return (
            <div className="absolute z-50 bottom-1 left-1 bg-white p-4 py-3 rounded-lg shadow-lg">
                <h4 className="mb-2 text-black text-sm font-semibold">{indexType.toUpperCase()} Legend</h4>
                {legend.map((item, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <div className="w-5 h-5 mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-black">{item.min.toFixed(2)} - {item.max.toFixed(2)}: {item.label}</span>
                    </div>
                ))}
            </div>
        );
    };

    const fetchLocationName = async (latitude, longitude) => {
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_KEY}`
            );

            if (response.data.results && response.data.results.length > 0) {
                const addressComponents = response.data.results[0].address_components;
                const city = addressComponents.find(comp =>
                    comp.types.includes("locality") || comp.types.includes("administrative_area_level_1")
                )?.long_name || "";

                if (setLocation) {
                    setLocation(city);
                }
            }
        } catch (error) {
            console.error("Error fetching location name:", error);
        }
    };
    // Add this function to handle vegetation index selection
    const handleVegetationIndexChange = (e) => {
        const value = e.target.value;
        setSelectedVegetationIndex(value);
        setIndexType(value.toLowerCase());

        // If a polygon is selected, update the vegetation index overlay
        if (selectedPolygon) {
            // Refresh the overlay with the new index
            updateVegetationOverlay(selectedPolygon, value);
        }
    };

    // Function to update vegetation overlay on a polygon
    const updateVegetationOverlay = (polygonId, indexType) => {
        // Find the polygon data
        let polygonPath;

        // Check if it's a custom polygon or from GeoJSON
        const customPoly = customPolygons.find(p => p.id === polygonId);

        if (customPoly) {
            polygonPath = customPoly.path;
        } else if (geoJsonData) {
            // Find the feature in GeoJSON data
            const feature = geoJsonData.features.find(f => f.properties.id === polygonId);
            if (feature) {
                // Convert GeoJSON coordinates to {lat, lng} format
                polygonPath = feature.geometry.coordinates[0].map(coord => ({
                    lat: coord[1],
                    lng: coord[0]
                }));
            }
        }

        if (!polygonPath) return;

        // Calculate bbox for the polygon
        const bbox = bboxForPath(polygonPath);

        // Set the overlay data
        setSelectedPolygonData({
            id: polygonId,
            path: polygonPath,
            indexType: indexType,
            bbox: bbox
        });
    };
    // Handle map load and set map reference
    const handleMapLoad = useCallback((mapInstance) => {
        mapRef.current = mapInstance;
        setMapLoaded(true);
    }, []);

    // Modified GeoJSON loading with polygon selection functionality
    useEffect(() => {
        if (mapLoaded) {
            fetch('/roorkee_pukhta_land.geojson')
                .then(response => response.json())
                .then(data => {
                    // Remove any existing data layers before adding new
                    data.features.forEach((feature, index) => {
                        if (!feature.properties.id) {
                            feature.properties.id = index;
                        }
                    });

                    // Remove any existing data layers before adding new
                    mapRef.current.data.forEach(feature => {
                        mapRef.current.data.remove(feature);
                    });

                    setGeoJsonData(data);
                    console.log(data);
                    mapRef.current.data.addGeoJson(data);

                    // Set style for polygons
                    mapRef.current.data.setStyle(feature => {
                        // Access properties correctly
                        const properties = {};
                        feature.forEachProperty((value, property) => {
                            properties[property] = value;
                        });

                        // Get ID from properties or use feature index
                        const polygonId = properties.id || feature.getId();
                        const cropType = polygonCrops[polygonId];

                        // Get color based on crop type
                        const cropColor = cropType ? cropColors[cropType] || '#4CAF50' : '#3388ff';

                        return {
                            fillColor: 'transparent',
                            fillOpacity: selectedPolygon === polygonId ? 0.6 : 0.4,
                            strokeColor: selectedPolygon === polygonId ? '#FF4500' : '#32CD32',
                            strokeWeight: selectedPolygon === polygonId ? 2 : 1,
                            strokeOpacity: 1
                        };
                    });


                    // Remove duplicate click listener; keep a single handler below
                    // Add click event listener for polygons
                    mapRef.current.data.addListener('click', (event) => {
                        if (drawingModeRef.current) {
                            addDraftPoint(event.latLng);
                            return;
                        }
                        const feature = event.feature;

                        // Access properties correctly
                        const properties = {};
                        feature.forEachProperty((value, property) => {
                            properties[property] = value;
                        });
                        console.log("Properties:", properties);

                        // Get the ID directly from properties or use index
                        const polygonId = properties.id || feature.getId();
                        console.log("Selected polygon with ID:", polygonId);

                        // Set the selected polygon
                        setSelectedPolygon(polygonId);

                        // Update the vegetation overlay with the currently selected index
                        updateVegetationOverlay(polygonId, selectedVegetationIndex);
                    });
                })
                .catch(error => {
                    console.error("Error loading GeoJSON:", error);
                });
        }
    }, [mapLoaded, polygonCrops, selectedPolygon]);

    // Function to allocate crop to selected polygon
    const allocateCrop = () => {
        if (selectedPolygon && selectedCrop) {
            setPolygonCrops(prev => ({
                ...prev,
                [selectedPolygon]: selectedCrop
            }));

            // Refresh the map styles
            mapRef.current.data.revertStyle();

            // Show success message
            alert(`Crop ${selectedCrop} allocated to polygon ${selectedPolygon}`);
        }
    };
    // Function to deallocate crop from selected polygon
    const deallocateCrop = () => {
        if (selectedPolygon && polygonCrops[selectedPolygon]) {
            const updatedCrops = { ...polygonCrops };
            delete updatedCrops[selectedPolygon];
            setPolygonCrops(updatedCrops);

            // Refresh the map styles
            mapRef.current.data.revertStyle();

            // Show success message
            alert(`Crop deallocated from polygon ${selectedPolygon}`);
        }
    };

    const [weatherData, setWeatherData] = useState(null);
    const [location, setLocation] = useState('Chandigarh'); // Default location
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isWeatherOpen, setIsWeatherOpen] = useState(false);
    const apiKey = 'dd3c83dcbff8dcb138dd19aac8a3a6ff'; // Replace with your API key
    const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

    useEffect(() => {
        fetchWeatherData();
    }, [location]);

    const fetchWeatherData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiUrl, {
                params: {
                    q: location,
                    appid: apiKey,
                    units: 'metric', // Change to 'imperial' for Fahrenheit
                },
            });
            setWeatherData(response.data);
        } catch (err) {
            setError('Failed to fetch weather data');
        }
        setLoading(false);
    };

    const handleLocationChange = (e) => {
        setLocation(e.target.value);
    };
    const [drawingMode, setDrawingMode] = useState(false);
    const [draftPoints, setDraftPoints] = useState([]);
    const drawingModeRef = useRef(false);
    drawingModeRef.current = drawingMode;
    const [customPolygons, setCustomPolygons] = useState([]);

    const getSelectedPolygonInfo = useCallback(() => {
        if (!selectedPolygon) return null;

        const customPoly = customPolygons.find(p => p.id === selectedPolygon);
        if (customPoly) {
            return {
                id: selectedPolygon,
                path: customPoly.path,
                bbox: bboxForPath(customPoly.path)
            };
        }

        if (selectedPolygonData?.id === selectedPolygon) {
            return {
                id: selectedPolygon,
                path: selectedPolygonData.path,
                bbox: selectedPolygonData.bbox
            };
        }

        if (geoJsonData) {
            const feature = geoJsonData.features.find(f => f.properties.id === selectedPolygon);
            if (feature) {
                const path = feature.geometry.coordinates[0].map(coord => ({
                    lat: coord[1],
                    lng: coord[0]
                }));
                return {
                    id: selectedPolygon,
                    path,
                    bbox: bboxForPath(path)
                };
            }
        }

        return null;
    }, [selectedPolygon, customPolygons, selectedPolygonData, geoJsonData]);

    const generateAiAnalysis = useCallback(async () => {
        const info = getSelectedPolygonInfo();
        if (!info?.bbox) {
            toast.error('Select or draw a polygon first');
            return;
        }

        setAiAnalysisLoading(true);
        setAiAnalysisError('');
        setAiAnalysis('');

        try {
            const indexTypes = ['ndvi', 'evi', 'ndmi', 'ndwi', 'ndre'];
            const images = indexTypes.map((t) => ({
                label: t.toUpperCase(),
                url: `${API_BASE}/api/veg?bbox=${encodeURIComponent(info.bbox)}&index_type=${encodeURIComponent(t)}&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}&auto_scale=true&crs=EPSG:3857`
            }));

            const resp = await axios.post(`${API_BASE}/api/ai/veg-analysis`, {
                images,
                language: aiLanguage
            });

            const analysisText = resp?.data?.analysis || '';
            setAiAnalysis(analysisText);
            if (!analysisText) {
                setAiAnalysisError('No analysis text returned from AI');
            }
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || 'Failed to generate AI analysis';
            setAiAnalysisError(msg);
        } finally {
            setAiAnalysisLoading(false);
        }
    }, [API_BASE, getSelectedPolygonInfo, startDate, endDate, aiLanguage]);

    // Drawing a field: click the map to add corners, then press Finish
    const addDraftPoint = (latLng) => {
        if (!latLng) return;
        setDraftPoints((prev) => [...prev, { lat: latLng.lat(), lng: latLng.lng() }]);
    };
    const undoDraftPoint = () => setDraftPoints((prev) => prev.slice(0, -1));
    const finishDrawing = () => {
        if (draftPoints.length < 3) {
            toast.error("Add at least 3 points to make a field.");
            return;
        }
        const id = `poly-${Date.now()}`;
        setCustomPolygons((prev) => [...prev, { id, path: draftPoints }]);
        setDraftPoints([]);
        setDrawingMode(false);
        toast.success("Field added.");
    };

    // compute bbox string with a tiny margin
    const bboxForPath = (path) => {
        const lats = path.map(p => p.lat), lngs = path.map(p => p.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        return `${minLng},${minLat},${maxLng},${maxLat}`;
    };


    // Function to toggle drawing mode
    const toggleDrawingMode = () => {
        if (drawingMode) {
            setDrawingMode(false);
            setDraftPoints([]);
        } else {
            setDrawingMode(true);
            setDraftPoints([]);
            toast("Click on the map to add corners, then press Finish.", { icon: "✏️" });
        }
    };

    const handleValidate = (formData) => {
        toast.success('Insurance validated report will be sent on mail');
        console.log('Validating with', formData);
        // ... call your API, show success, etc.
        setModalOpenValidation(false);
    };
    return (
        <div className="flex min-h-screen mt-20 lg:mt-16 bg-white text-white">
            <Toaster />
            {/* Left + Center Panel */}
            <div className="flex flex-1 flex-col gap-4 p-4 overflow-hidden">
                {/* Satellite + Tabs Container */}
                <div className="flex flex-1 gap-4 ">
                    {/* Left: Map + Tabs */}
                    <div className="flex flex-col  flex-1  rounded-lg overflow-hidden">
                        {/* Map (responsive height) */}
                        <div className="h-[60vh] md:h-[70vh] lg:h-[75vh]">
                            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_KEY} libraries={MAP_LIBRARIES}>
                                <GoogleMap
                                    mapContainerStyle={containerStyle}
                                    center={currentLocation}
                                    zoom={15}
                                    onLoad={handleMapLoad}
                                    mapTypeId="hybrid"
                                    onClick={(e) => { if (drawingMode) addDraftPoint(e.latLng); }}
                                    options={{ draggableCursor: drawingMode ? "crosshair" : undefined }}
                                >
                                    <StandaloneSearchBox
                                        onLoad={ref => searchBoxRef.current = ref}
                                        onPlacesChanged={() => {
                                            const places = searchBoxRef.current.getPlaces();
                                            if (places.length > 0) {
                                                const place = places[0];
                                                const newLocation = {
                                                    lat: place.geometry.location.lat(),
                                                    lng: place.geometry.location.lng()
                                                };
                                                setCurrentLocation(newLocation);
                                                mapRef.current.panTo(newLocation);
                                            }
                                        }}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Search locations"
                                            style={{
                                                boxSizing: `border-box`,
                                                border: `1px solid bg-gray-200`,
                                                backgroundColor: `grey`,
                                                width: `240px`,
                                                height: `32px`,
                                                padding: `0 12px`,
                                                borderRadius: `3px`,
                                                boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                                                fontSize: `14px`,
                                                outline: `none`,
                                                textOverflow: `ellipses`,
                                                position: "absolute",
                                                left: "50%",
                                                marginLeft: "-120px",
                                                marginTop: '8px',
                                                color: "white",
                                            }}
                                        />
                                    </StandaloneSearchBox>
                                    {drawingMode && (
                                        <>
                                            {draftPoints.length >= 2 && (
                                                <Polygon
                                                    paths={draftPoints}
                                                    options={{
                                                        fillColor: "#4CAF50",
                                                        fillOpacity: 0.2,
                                                        strokeColor: "#4CAF50",
                                                        strokeWeight: 2,
                                                        clickable: false,
                                                    }}
                                                />
                                            )}
                                            {draftPoints.map((pt, i) => (
                                                <Marker
                                                    key={i}
                                                    position={pt}
                                                    clickable={false}
                                                    icon={{
                                                        path: window.google.maps.SymbolPath.CIRCLE,
                                                        scale: 5,
                                                        fillColor: "#ffffff",
                                                        fillOpacity: 1,
                                                        strokeColor: "#4CAF50",
                                                        strokeWeight: 2,
                                                    }}
                                                />
                                            ))}
                                            <div
                                                style={{ position: "absolute", top: 52, left: 12, zIndex: 10 }}
                                                className="bg-gray-900 text-white rounded-lg p-2 flex items-center gap-2 text-sm"
                                            >
                                                <span>{draftPoints.length} point{draftPoints.length === 1 ? "" : "s"}</span>
                                                <button
                                                    onClick={undoDraftPoint}
                                                    disabled={!draftPoints.length}
                                                    className="px-3 py-1 rounded bg-gray-700 disabled:opacity-40"
                                                >
                                                    Undo
                                                </button>
                                                <button onClick={finishDrawing} className="px-3 py-1 rounded bg-green-600">
                                                    Finish
                                                </button>
                                            </div>
                                        </>
                                    )}
                                    {selectedPolygonData && (
                                        <SvgMaskedOverlay
                                            map={mapRef.current}
                                            path={selectedPolygonData.path}
                                            imageUrl={`${API_BASE}/api/veg?bbox=${selectedPolygonData.bbox}&index_type=${selectedPolygonData.indexType}&start_date=${startDate}&end_date=${endDate}&auto_scale=true&crs=EPSG:3857`}
                                            id={`veg-${selectedPolygonData.id}`}
                                        />
                                    )}

                                    {customPolygons.map(({ id, path }) => {
                                        const bbox = bboxForPath(path);
                                        const imageUrl =
                                            `${API_BASE}/api/veg`
                                            + `?bbox=${bbox}`
                                            + `&index_type=${indexType}`
                                            + `&start_date=${startDate}`
                                            + `&end_date=${endDate}`
                                            + `&auto_scale=true&crs=EPSG:3857`;

                                        return (
                                            <React.Fragment key={id}>
                                                <Polygon
                                                    paths={path}
                                                    key={id}
                                                    options={{
                                                        fillOpacity: 0,
                                                        strokeColor: "#FF4500",
                                                        strokeWeight: 2,
                                                    }}
                                                    onClick={() => setSelectedPolygon(id)}
                                                />
                                                <SvgMaskedOverlay
                                                    map={mapRef.current}
                                                    path={path}
                                                    imageUrl={imageUrl}
                                                    id={id}
                                                />
                                            </React.Fragment>
                                        );
                                    })}
                                    {/* Add this near your map component */}
                                    {(selectedPolygonData || selectedVegetationIndex) && (
                                        <div>
                                            <h1>{indexType}</h1>
                                            <VegetationLegend indexType={indexType || selectedPolygonData.indexType} />
                                        </div>
                                    )}
                                </GoogleMap>
                            </LoadScript>
                        </div>
                        {/* Add this button somewhere in your UI */}
                        <button
                            onClick={toggleDrawingMode}
                            className={`px-4 py-2 absolute right-[38rem] top-[32.6rem] rounded ${drawingMode ? 'bg-red-500' : 'bg-green-500'}`}
                        >
                            {drawingMode ? 'Cancel Drawing' : 'Draw Polygon'}
                        </button>
                        <div className="flex absolute right-[22rem] top-[32.5rem] gap-4 bg-gray-900 p-1.5 rounded-lg text-white w-max select-none">
                            {/* Sentinel-2 toggle */}
                            <div className="relative">
                                <button
                                    onClick={toggleSentinel}
                                    className={`min-w-[100px] px-4 py-1 rounded-md focus:outline-none${sentinelOpen ? 'bg-blue-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                                >
                                    Sentinel-2 {sentinelOpen ? '▲' : '▼'}
                                </button>

                                {sentinelOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg p-3 z-20">
                                        <label className="flex items-center space-x-2 mb-2 cursor-pointer">
                                            <input type="checkbox" defaultChecked className="form-checkbox text-blue-500" />
                                            <span>Sentinel-2 S2 <span className="text-sm text-gray-400">(10m)</span></span>
                                        </label>
                                        <label className="flex items-center space-x-2 mb-2 cursor-pointer">
                                            <input type="checkbox"  className="form-checkbox text-blue-500" />
                                            <span>Sentinel-1 <span className="text-sm text-gray-400">(10m)</span></span>
                                        </label>
                                        <label className="flex items-center space-x-2 mb-2 cursor-pointer">
                                            <input type="checkbox"  className="form-checkbox text-blue-500" />
                                            <span>SMAP <span className="text-sm text-gray-400">(10m)</span></span>
                                        </label>
                                        <label className="flex items-center space-x-2 mb-2 cursor-pointer">
                                            <input type="checkbox"  className="form-checkbox text-blue-500" />
                                            <span>SRTM DEM(Provide elevation) <span className="text-sm text-gray-400">(10m)</span></span>
                                        </label>
                                        <label className="flex items-center space-x-2 mb-2 cursor-pointer">
                                            <input type="checkbox"  className="form-checkbox text-blue-500" />
                                            <span>My Crops</span>
                                        </label>
                                        <label className="flex items-center space-x-2 mb-2 cursor-pointer">
                                            <input type="checkbox"  className="form-checkbox text-blue-500" />
                                            <span>Crop Classification</span>
                                        </label>
                                        {/* Add more satellite options here */}
                                    </div>
                                )}
                            </div>

                            {/* Vegetation Index toggle */}
                            <div className="relative">
                                <button
                                    onClick={toggleNdvi}
                                    className={`min-w-[100px] px-4 py-1 rounded-md focus:outline-none ${ndviOpen ? 'bg-blue-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                                >
                                    {indexType.toUpperCase()} {ndviOpen ? '▲' : '▼'}
                                </button>

                                {ndviOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-36 bg-gray-800 rounded-md shadow-lg p-3 z-20 flex flex-col">
                                        <button
                                            className={`text-left py-1 hover:bg-gray-700 rounded-md mt-1  ${indexType === 'ndwi' ? 'bg-blue-700 px-2' : ''}`}
                                            onClick={() => { setIndexType('ndwi'); setSelectedVegetationIndex('ndwi'); if (selectedPolygon) updateVegetationOverlay(selectedPolygon, 'ndwi'); }}
                                        >
                                            NDWI
                                        </button>
                                        <button
                                            className={`text-left py-1 hover:bg-gray-700 rounded-md mt-1 ${indexType === 'evi' ? 'bg-blue-700 px-2' : ''}`}
                                            onClick={() => { setIndexType('evi'); setSelectedVegetationIndex('evi'); if (selectedPolygon) updateVegetationOverlay(selectedPolygon, 'evi'); }}
                                        >
                                            EVI
                                        </button>
                                        <button
                                            className={`text-left py-1 hover:bg-gray-700 rounded-md mt-1 ${indexType === 'ndre' ? 'bg-blue-700 px-2' : ''}`}
                                            onClick={() => { setIndexType('ndre'); setSelectedVegetationIndex('ndre'); if (selectedPolygon) updateVegetationOverlay(selectedPolygon, 'ndre'); }}
                                        >
                                            NDRE
                                        </button>
                                        <button
                                            className={`text-left py-1 hover:bg-gray-700 rounded-md mt-1 ${indexType === 'ndmi' ? 'bg-blue-700 px-2' : ''}`}
                                            onClick={() => { setIndexType('ndmi'); setSelectedVegetationIndex('ndmi'); if (selectedPolygon) updateVegetationOverlay(selectedPolygon, 'ndmi'); }}
                                        >
                                            NDMI
                                        </button>
                                        <button
                                            className={`text-left py-1 hover:bg-gray-700 rounded-md mt-1 ${indexType === 'ndvi' ? 'bg-blue-700 px-2' : ''}`}
                                            onClick={() => { setIndexType('ndvi'); setSelectedVegetationIndex('ndvi'); if (selectedPolygon) updateVegetationOverlay(selectedPolygon, 'ndvi'); }}
                                        >
                                            NDVI
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Date Range Selectors */}
                        <div className="flex items-center gap-3 p-2 bg-teal-800 text-white rounded-b-xl flex-wrap">
                            {(() => {
                                // Build lists for start/end dropdowns
                                // Start: last ~90 days (approx 3 months)
                                const startDays = Array.from({ length: 90 }, (_, i) => {
                                    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
                                    return formatISO(d);
                                }).reverse(); // oldest first
                                // End: last 30 days
                                const endDays = Array.from({ length: 30 }, (_, i) => {
                                    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
                                    return formatISO(d);
                                }).reverse();
                                return (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm">Start date</label>
                                            <select
                                                className="bg-teal-700 text-white px-2 py-1 rounded-md text-sm"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            >
                                                {startDays.map((d) => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm">End date</label>
                                            <select
                                                className="bg-teal-700 text-white px-2 py-1 rounded-md text-sm"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            >
                                                {/* Keep end date default to today; include recent dates up to today */}
                                                {endDays.map((d) => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        <div className="mt-3 bg-gray-900 rounded-lg p-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="text-sm font-semibold text-white">AI Insights </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={aiLanguage}
                                        onChange={(e) => setAiLanguage(e.target.value)}
                                        disabled={aiAnalysisLoading}
                                        className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md border border-gray-700"
                                    >
                                        <option value="English">English</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Punjabi">Punjabi</option>
                                        <option value="Bengali">Bengali</option>
                                        <option value="Tamil">Tamil</option>
                                        <option value="Telugu">Telugu</option>
                                        <option value="Marathi">Marathi</option>
                                        <option value="Gujarati">Gujarati</option>
                                    </select>
                                    <button
                                        onClick={generateAiAnalysis}
                                        disabled={aiAnalysisLoading}
                                        className={`px-3 py-1 rounded-md text-sm ${aiAnalysisLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-600'}`}
                                    >
                                        {aiAnalysisLoading ? 'Generating...' : 'Generate Analysis'}
                                    </button>
                                </div>
                            </div>

                            {aiAnalysisError && (
                                <div className="mt-2 text-sm text-red-300">{aiAnalysisError}</div>
                            )}

                            {aiAnalysis && (
                                <div className="mt-2">
                                    <div className="text-[11px] text-gray-300">{aiAnalysis.length} chars</div>
                                    <div className="mt-1 text-xs text-white leading-relaxed max-h-56 overflow-auto pr-2">
                                        <ReactMarkdown
                                            components={{
                                                h1: ({ node, ...props }) => <h1 className="text-sm font-semibold mt-2" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-sm font-semibold mt-2" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-sm font-semibold mt-2" {...props} />,
                                                p: ({ node, ...props }) => <p className="mt-1" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-5 mt-1" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-5 mt-1" {...props} />,
                                                li: ({ node, ...props }) => <li className="mt-0.5" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                                                code: ({ node, ...props }) => <code className="bg-gray-800 px-1 rounded" {...props} />,
                                            }}
                                        >
                                            {aiAnalysis}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {!aiAnalysis && !aiAnalysisError && (
                                <div className="mt-2 text-xs text-gray-300">
                                    Select/draw a polygon, choose dates, then click “Generate Analysis”.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Chatbot
                isOpenExternal={chatOpen}
                onOpenChange={setChatOpen}
            />
        </div>
    );
}