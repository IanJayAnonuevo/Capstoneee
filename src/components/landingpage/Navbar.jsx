import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../../assets/logo/logo.png";

const LOGIN_LOADING_DURATION_MS = 500;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const navigate = useNavigate();

  const handlePreLogin = () => {
    try {
      localStorage.removeItem('user');
    } catch { }
    setOpen(false);
  };

  const handleLoginClick = () => {
    if (loadingLogin) return;
    handlePreLogin();
    setLoadingLogin(true);
    setTimeout(() => navigate('/login'), LOGIN_LOADING_DURATION_MS);
  };

  const handleMenuItemClick = (href) => {
    // Smooth scroll to section first
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Then close menu with delay
    setTimeout(() => {
      setOpen(false);
    }, 100);
  };

  return (
    <nav className="fixed w-full z-50 bg-green-700">
      <div className="max-w-[1240px] mx-auto px-8 py-5 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-0.5 group" aria-label="Home">
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-auto drop-shadow-md transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-8">
            <a href="#home" onClick={(e) => { e.preventDefault(); const el = document.querySelector('#home'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="text-white hover:text-gray-200 transition-colors duration-200 cursor-pointer">Home</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); const el = document.querySelector('#services'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="text-white hover:text-gray-200 transition-colors duration-200 cursor-pointer">Services</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); const el = document.querySelector('#about'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="text-white hover:text-gray-200 transition-colors duration-200 cursor-pointer">About Us</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); const el = document.querySelector('#contact'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="text-white hover:text-gray-200 transition-colors duration-200 cursor-pointer">Contact</a>
          </div>
          <button
            type="button"
            onClick={handleLoginClick}
            disabled={loadingLogin}
            className="ml-8 px-6 py-2 bg-white hover:bg-gray-100 text-green-700 font-medium rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-80 disabled:cursor-wait"
            aria-label="Login to your account"
          >
            {loadingLogin ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-green-200 border-t-green-600 animate-spin"></span>
                <span>Redirecting...</span>
              </span>
            ) : (
              <span>Login</span>
            )}
          </button>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="focus:outline-none text-white bg-green-700"
            aria-label="Toggle menu"
          >
            {open ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 px-8 py-4 space-y-4 bg-white shadow-lg animate-slideDown">
          <a href="#home" onClick={(e) => { e.preventDefault(); handleMenuItemClick('#home'); }} className="block text-green-700 hover:text-green-600 transition-colors duration-200">Home</a>
          <a href="#services" onClick={(e) => { e.preventDefault(); handleMenuItemClick('#services'); }} className="block text-green-700 hover:text-green-600 transition-colors duration-200">Services</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); handleMenuItemClick('#about'); }} className="block text-green-700 hover:text-green-600 transition-colors duration-200">About Us</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); handleMenuItemClick('#contact'); }} className="block text-green-700 hover:text-green-600 transition-colors duration-200">Contact</a>
          <button
            type="button"
            onClick={handleLoginClick}
            disabled={loadingLogin}
            className="w-full bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors duration-200 block text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-80 disabled:cursor-wait"
            aria-label="Login to your account"
          >
            {loadingLogin ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin"></span>
                <span>Redirecting...</span>
              </span>
            ) : (
              <span>Login</span>
            )}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
