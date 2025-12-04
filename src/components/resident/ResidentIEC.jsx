import React, { useState } from 'react';
import { FiDownload, FiPlay, FiBookOpen, FiCheckCircle, FiX } from 'react-icons/fi';

import { API_BASE_URL } from '../../config/api';

const getVideoId = (url) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : '';
};

const VideoModal = ({ videoUrl, onClose }) => {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <FiX className="w-6 h-6" />
        </button>
        <div className="relative pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${getVideoId(videoUrl)}?autoplay=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

const categories = [
  { id: 'segregation', label: 'Waste Segregation', icon: '🗑️' },
  { id: 'recycling', label: 'Recycling Guide', icon: '♻️' },
  { id: 'composting', label: 'Composting Tips', icon: '🌱' },
  { id: 'hazardous', label: 'Hazardous Waste', icon: '⚠️' },
];

const materials = {
  segregation: [
    {
      title: 'Proper Waste Segregation Guide',
      type: 'pdf',
      size: '631 KB',
      description: 'Learn how to properly segregate your household waste',
      fileName: 'IEC3_014120.pdf',
    },
    {
      title: 'Waste Segregation Tutorial',
      type: 'video',
      duration: '3:41',
      description: 'Learn how to properly segregate different types of waste',
      videoUrl: 'https://www.youtube.com/watch?v=0ZiD_Lb3Tm0',
    },
  ],
  recycling: [
    {
      title: 'Recyclable Materials Chart',
      type: 'pdf',
      size: '904 KB',
      description: 'Complete chart of recyclable materials',
      fileName: 'IEC4_025204.pdf',
    },
    {
      title: 'Home Recycling Tips',
      type: 'video',
      duration: '4:52',
      description: 'Easy ways to recycle at home',
      videoUrl: 'https://youtu.be/TRg-tPFbG0g',
    },
  ],
  composting: [
    {
      title: 'Backyard Composting Guide',
      type: 'pdf',
      size: '864 KB',
      description: 'Start your own compost pile',
      fileName: 'IEC5_014150.pdf',
    },
    {
      title: 'Vermicomposting Tutorial',
      type: 'video',
      duration: '4:16',
      description: 'Learn vermicomposting techniques',
      videoUrl: 'https://youtu.be/SUCVPkvRdRw',
    },
  ],
  hazardous: [
    {
      title: 'Hazardous Waste Handling',
      type: 'pdf',
      size: '1.2 MB',
      description: 'Safety guidelines for hazardous materials',
      fileName: 'IEC2_014244.pdf',
    },
    {
      title: 'Chemical Waste Disposal',
      type: 'video',
      duration: '5:07',
      description: 'Learn the proper way to dispose of chemical waste safely',
      videoUrl: 'https://youtu.be/lnTHEmavvgM',
    },
  ],
};

export default function IEC() {
  const [selectedCategory, setSelectedCategory] = useState('segregation');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Collect all videos from materials
  const allVideos = Object.values(materials)
    .flat()
    .filter(material => material.type === 'video');

  // Auto rotate featured video every 5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % allVideos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleDownload = (material) => {
    if (!material.fileName) {
      alert('PDF file not available yet. Please check back later.');
      return;
    }

    const baseUrl = API_BASE_URL.replace('/backend/api', '');
    const fileUrl = `${baseUrl}/iec/${material.fileName}`;
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {selectedVideo && (
          <VideoModal videoUrl={selectedVideo} onClose={() => setSelectedVideo(null)} />
        )}

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            Information & Education Campaign
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Access educational materials about proper waste management and environmental care.
          </p>
        </div>

        {/* Featured Video */}
        <div className="bg-green-600 rounded-lg p-4 md:p-6 mb-8 text-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex-1 w-full">
              <h2 className="text-lg md:text-xl font-bold mb-2">{allVideos[featuredIndex].title}</h2>
              <p className="mb-4 text-green-50 text-sm">
                {allVideos[featuredIndex].description}
              </p>
              <button
                onClick={() => setSelectedVideo(allVideos[featuredIndex].videoUrl)}
                className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-50 transition-colors text-sm"
              >
                <FiPlay className="w-4 h-4" />
                Watch Video
              </button>
            </div>
            <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden relative group cursor-pointer"
              onClick={() => setSelectedVideo(allVideos[featuredIndex].videoUrl)}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all flex items-center justify-center z-10">
                <FiPlay className="w-12 h-12 text-white" />
              </div>
              <img
                src={`https://img.youtube.com/vi/${getVideoId(allVideos[featuredIndex].videoUrl)}/maxresdefault.jpg`}
                alt={`${allVideos[featuredIndex].title} thumbnail`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Carousel dots */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5">
            {allVideos.map((_, index) => (
              <button
                key={index}
                onClick={() => setFeaturedIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === featuredIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg flex flex-col items-center justify-center text-center transition-all ${selectedCategory === category.id
                    ? 'bg-green-500 text-white'
                    : 'bg-white hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <span className="text-3xl mb-2">{category.icon}</span>
                <span className="text-xs font-semibold uppercase">
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {materials[selectedCategory].map((material, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-green-400 transition-all"
            >
              <div
                className={`relative aspect-video ${material.type === 'video' ? 'cursor-pointer' : 'bg-green-50'
                  }`}
                onClick={() => material.type === 'video' && setSelectedVideo(material.videoUrl)}
              >
                {material.type === 'video' ? (
                  <>
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10">
                      <FiPlay className="w-12 h-12 text-white" />
                    </div>
                    <img
                      src={`https://img.youtube.com/vi/${getVideoId(material.videoUrl)}/maxresdefault.jpg`}
                      alt={material.title}
                      className="w-full h-full object-cover"
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiBookOpen className="w-16 h-16 text-green-600" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 mb-2">
                  {material.type === 'pdf' ? `PDF • ${material.size}` : `Video • ${material.duration}`}
                </span>
                <h3 className="font-bold text-gray-900 text-base mb-1">
                  {material.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {material.description}
                </p>

                <button
                  className="w-full px-4 py-2 rounded-lg bg-green-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                  onClick={() => {
                    if (material.type === 'video' && material.videoUrl) {
                      setSelectedVideo(material.videoUrl);
                    } else if (material.type === 'pdf') {
                      handleDownload(material);
                    }
                  }}
                >
                  {material.type === 'pdf' ? (
                    <>
                      <FiDownload className="w-4 h-4" />
                      Download
                    </>
                  ) : (
                    <>
                      <FiPlay className="w-4 h-4" />
                      Watch
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiCheckCircle className="w-5 h-5 text-green-600" />
            Quick Tips for Better Waste Management
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 text-sm">
                Segregate waste into biodegradable, non-biodegradable, and recyclable categories
              </p>
            </div>
            <div className="flex items-start gap-3">
              <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 text-sm">
                Clean and dry recyclable materials before disposal
              </p>
            </div>
            <div className="flex items-start gap-3">
              <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 text-sm">
                Use separate containers for different types of waste
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
