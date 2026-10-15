import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaShoppingCart, FaBell, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import logo from '/logo1.png';
import { useFirebase } from '../context/firebase';
import Chatbot from './Chatbot';

function Navbar() {
  const { isLoggedIn, signOut, getUserDetails } = useFirebase();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isLoggedIn) {
        const details = await getUserDetails();
        setUserDetails(details);
      }
    };
    fetchUserDetails();
  }, [isLoggedIn, getUserDetails]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Common Nav Links (desktop and mobile)
  const navLinks = [
    { to: '/', label: 'Home', show: true },
    // { to: '/education', label: 'Learning', show: true }, // intentionally disabled to match desktop
    { to: '/services', label: 'Services', show: !isLoggedIn },
    { to: '/dashboard', label: 'Dashboard', show: true },
    { to: '/gis', label: 'Land Monitoring', show: true },
    { to: '/crop', label: 'Daily Crop Price', show: isLoggedIn },
    { to: '/crop-chart', label: 'Govt Price Chart', show: isLoggedIn },
    { to: '/weather', label: 'Weather', show: isLoggedIn },
    
    { to: '/report', label: 'Report', show: true },
    { to: '/market', label: 'Market', show: true },
    { to: '/resource', label: 'Resource', show: !isLoggedIn },
    { to: '/research', label: 'Research', show: true },
    { to: '/aboutus', label: 'About Us', show: !isLoggedIn },
  ].filter(link => link.show);

  return (
    <header className="fixed top-0 left-0 right-0 flex flex-wrap justify-between items-center bg-gray-100 border-b border-gray-300 h-auto min-h-[64px] px-4 md:px-10  z-50">
      <div className="h-full py-2">
        <img src={logo} alt="Logo" className="h-12 w-auto" />
      </div>

      {/* Mobile control: avatar when logged in, hamburger otherwise */}
      <div className="md:hidden z-50 p-2 mr-2">
        {isLoggedIn ? (
          <button
            onClick={toggleMenu}
            aria-label="Open menu"
            className="w-12 h-12 pt-1 text-2xl rounded-full bg-green-600 flex items-center justify-center text-white font-semibold focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            {userDetails?.name ? userDetails.name.charAt(0).toUpperCase() : '?'}
          </button>
        ) : (
          <button
            onClick={toggleMenu}
            className="text-gray-800 text-2xl"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        )}
      </div>

      {/* Navigation links - desktop (common) */}
      <nav className="hidden md:flex items-center space-x-6 text-gray-800 font-semibold">
        {navLinks.map(({ to, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "hover:text-blue-500"}>
            {label}
          </NavLink>
        ))}
      </nav>
        
        {!isLoggedIn && (
            <div className="lg:flex hidden ">
              <NavLink to="/signup" className="px-3  inline py-1.5   rounded-lg text-blue-600  font-bold transition-colors">
                Sign Up
              </NavLink>
              <NavLink to="/signin" className="px-3   inline py-1.5  rounded-lg text-green-600 font-bold  transition-colors">
                Login
              </NavLink>
            </div>
          )}

          {isLoggedIn && (
            <div className="lg:flex hidden  items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {userDetails?.name ? userDetails.name.charAt(0).toUpperCase() : '?'}
              </div>
              <button
                onClick={signOut}
                className="px-3 py-1.5 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}

      {/* Navigation links - mobile */}
      <div
        className={`fixed inset-0 bg-gray-800 bg-opacity-50 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
          }`}
        onClick={toggleMenu}
      />
      <nav
        className={`fixed top-0 right-0 h-full w-64 bg-white transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } z-40 overflow-y-auto`}
      >
        <div className="flex flex-col text-xl py-20 px-6 space-y-4 text-gray-800 font-semibold">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? "text-blue-600 font-bold p-2" : "hover:text-blue-500 p-2"} onClick={toggleMenu}>
              {label}
            </NavLink>
          ))}
          {!isLoggedIn && (
            <div className="flex flex-col gap-4">
              <NavLink to="/signup" className="px-3 w-28  inline py-1.5   rounded-lg text-blue-600  font-bold transition-colors">
                Sign Up
              </NavLink>
              <NavLink to="/signin" className="px-3 w-28  inline py-1.5  rounded-lg text-green-600 font-bold  transition-colors">
                Login
              </NavLink>
            </div>
          )}

          {isLoggedIn && (
            <button
              onClick={signOut}
              className="px-3 py-1.5 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
        {/* <div className="fle items-center gap-2 md:gap-6">
          <div className="hidden md:flex items-center gap-4">
            <FaShoppingCart className="text-2xl text-gray-800 hover:text-blue-500 cursor-pointer" />
            <FaBell className="text-2xl text-gray-800 hover:text-blue-500 cursor-pointer" />
            <FaUserCircle className="text-2xl text-gray-800 hover:text-blue-500 cursor-pointer" />
          </div>
        </div> */}
      </nav>
      <Chatbot />


    </header>
  );
}

export default Navbar;
