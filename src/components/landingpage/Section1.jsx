import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import oneImg from '../../assets/images/landingpage/one.png';
import twoImg from '../../assets/images/landingpage/two.png';
import threeImg from '../../assets/images/landingpage/three.png';
import fourImg from '../../assets/images/landingpage/four.png';
import fiveImg from '../../assets/images/landingpage/five.png';
import sixImg from '../../assets/images/landingpage/six.png';

const images = [oneImg, twoImg, threeImg, fourImg, fiveImg, sixImg];
const CTA_LOADING_DURATION_MS = 2000;

const Section1 = () => {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [fade, setFade] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    setTimeout(() => navigate('/signup'), CTA_LOADING_DURATION_MS);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPrev(current);
      setFade(false);
      setTimeout(() => {
        setCurrent((prevIdx) => (prevIdx + 1) % images.length);
        setFade(true);
      }, 800); 
    }, 5000);
    return () => clearInterval(interval);
  }, [current]);

  return (
  <div id="home" className="relative h-screen overflow-hidden scroll-mt-24">
      {prev !== null && prev !== current && !fade && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-100 z-10`}
          style={{
            backgroundImage: `url(${images[prev]})`,
            filter: 'contrast(1.05) saturate(1.05) brightness(1.05)'
          }}
        >
          <div className="absolute inset-0 bg-black/35 mix-blend-multiply"></div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.65) 100%)'
            }}
          ></div>
        </div>
      )}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${fade ? 'opacity-100 z-20' : 'opacity-0 z-0'}`}
        style={{
          backgroundImage: `url(${images[current]})`,
          filter: 'contrast(1.08) saturate(1.08) brightness(1.05)'
        }}
      >
        <div className="absolute inset-0 bg-black/35 mix-blend-multiply"></div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.65) 100%)'
          }}
        ></div>
      </div>
      <div className="relative z-30 flex flex-col items-center justify-center h-full text-center text-white px-6 md:px-12 space-y-6">
        <h1
          className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight landing-fade"
          style={{
            textShadow: '0 14px 40px rgba(0,0,0,0.65), 0 3px 12px rgba(0,0,0,0.55)'
          }}
        >
          Kolektrash: Waste Collection Made Simple.
        </h1>
        <p
          className="text-lg md:text-xl lg:text-2xl font-medium text-white/90 max-w-2xl landing-fade landing-delay-100"
          style={{ textShadow: '0 8px 28px rgba(0,0,0,0.55), 0 2px 12px rgba(0,0,0,0.45)' }}
        >
          For a Cleaner, Healthier Sipocot
        </p>
        <button
          type="button"
          onClick={handleGetStarted}
          disabled={isNavigating}
          className="inline-flex items-center justify-center gap-3 bg-white text-green-700 px-8 py-3 rounded-full text-base md:text-lg font-semibold shadow-[0_18px_35px_rgba(0,0,0,0.3)] hover:bg-green-50 hover:shadow-[0_22px_48px_rgba(0,0,0,0.35)] transition-all duration-200 landing-fade landing-delay-200 disabled:opacity-80 disabled:cursor-wait"
        >
          {isNavigating ? (
            <>
              <span className="flex h-5 w-5 items-center justify-center">
                <span className="h-5 w-5 rounded-full border-2 border-green-200 border-t-green-600 animate-spin"></span>
              </span>
              <span>Loading...</span>
            </>
          ) : (
            <span>Sign up now</span>
          )}
        </button>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-40">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrev(current);
              setFade(false);
              setTimeout(() => {
                setCurrent(idx);
                setFade(true);
              }, 800);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 border-2 border-white ${
              current === idx 
                ? 'bg-green-400 scale-110 border-green-400' 
                : 'bg-transparent hover:bg-white hover:bg-opacity-25'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Section1;
