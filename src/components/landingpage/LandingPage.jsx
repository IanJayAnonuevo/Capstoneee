import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Section1 from "./Section1";
import Section2 from "./Section2";
import Section3 from "./Section3";
import Section4 from "./Section4";
import Skeleton from "../shared/Skeleton";

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gray-900 overflow-hidden">
        {/* Navbar Skeleton */}
        <div className="fixed w-full z-50 bg-green-700 h-[80px] px-8 py-5 flex justify-between items-center">
          {/* Logo Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" className="w-10 h-10 bg-white/20" />
            <Skeleton className="h-6 w-24 hidden md:block bg-white/20" />
          </div>

          {/* Desktop Menu Skeleton */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-16 bg-white/20" />
              ))}
            </div>
            <Skeleton className="h-10 w-24 rounded-md bg-white/20" />
          </div>

          {/* Mobile Menu Button Skeleton */}
          <div className="md:hidden">
            <Skeleton className="h-8 w-8 rounded-md bg-white/20" />
          </div>
        </div>

        {/* Hero Section Skeleton */}
        <div className="relative h-screen flex flex-col items-center justify-center px-6 md:px-12 space-y-8">
          {/* Background overlay simulation */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center w-full max-w-4xl space-y-6">
            {/* Title Skeleton */}
            <div className="space-y-3 w-full flex flex-col items-center">
              <Skeleton className="h-8 md:h-14 w-3/4 md:w-2/3 bg-white/10" />
              <Skeleton className="h-8 md:h-14 w-1/2 md:w-1/3 bg-white/10" />
            </div>

            {/* Subtitle Skeleton */}
            <Skeleton className="h-4 md:h-6 w-2/3 md:w-1/2 bg-white/10" />

            {/* Button Skeleton */}
            <Skeleton className="h-12 w-40 rounded-full bg-white/20 mt-4" />
          </div>

          {/* Carousel Indicators Skeleton */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-40">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="circular" className="w-3 h-3 bg-white/30" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
    </div>
  );
}
