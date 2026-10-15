import { Routes, Route } from 'react-router-dom';
import Aboutus from './pages/Aboutus';
import './App.css';
import Home from './pages/Home';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Market from './pages/Market';
import Dashboard from './pages/Dashboard';
import Services from './pages/Service';
import Education from './pages/Education';
import SignUpPage from './pages/auth/SignUpPage';
import SignInPage from './pages/auth/SignInPage';
import Resource from './pages/Resource';
import Reasearch from './pages/Reasearch';
import GIS from './pages/GIS';
import Report from './Components/Report';
import SoilSensor from './pages/SoilSensor';
import Floater from './pages/Floater';
import Weather from './Components/Weather';
import DailyCropPrice from './Components/DailyCropPrice';
import { GovtPriceChart } from './Components/GovtPriceChart';

function App() {

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/market" element={<Market />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/crop" element={<DailyCropPrice />} />
        <Route path="/crop-chart" element={<GovtPriceChart />} />
        <Route path="/aboutus" element={<Aboutus />} />
        <Route path="/services" element={<Services />} />
        <Route path="/education" element={<Education />} />
        <Route path="/gis" element={<GIS />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/resource" element={<Resource />} />
        <Route path="/research" element={<Reasearch />} />
        <Route path="/report" element={<Report />} />
        <Route path="/soil" element={<SoilSensor />} />
        <Route path="/floater" element={<Floater />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
