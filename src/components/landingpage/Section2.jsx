import React from 'react'
import { FaTruck } from "react-icons/fa";
import { FaPeopleRoof } from "react-icons/fa6";
import { AiOutlineSchedule } from "react-icons/ai";

const Section2 = () => {
  return (
    <section id="services" className="relative bg-gradient-to-b from-white via-emerald-50/60 to-white py-24 scroll-mt-24">
      <div className="absolute inset-x-0 top-12 flex justify-center opacity-60 pointer-events-none">
        <div className="w-[90%] max-w-5xl h-48 bg-emerald-200/40 blur-[110px] rounded-full"></div>
      </div>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 relative">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-16 text-center text-emerald-700 landing-fade">
          Why KolekTrash?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          <div className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_35px_80px_rgba(24,120,67,0.18)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_45px_120px_rgba(24,120,67,0.22)] landing-fade">
            <div className="absolute inset-x-0 -top-20 h-40 bg-emerald-100/40 blur-[60px] group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
            <div className="relative flex flex-col items-center text-center px-8 py-12 space-y-5">
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-[0_18px_40px_rgba(24,120,67,0.18)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <FaPeopleRoof className="text-emerald-600" style={{ fontSize: '2.6rem' }} />
              </div>
              <h3 className="font-semibold text-xl md:text-2xl text-emerald-900">Empowering Community</h3>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                Bringing together waste collectors and residents for a cleaner Sipocot.
              </p>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_35px_80px_rgba(24,120,67,0.18)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_45px_120px_rgba(24,120,67,0.22)] landing-fade landing-delay-100">
            <div className="absolute inset-x-0 -top-20 h-40 bg-emerald-100/40 blur-[60px] group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
            <div className="relative flex flex-col items-center text-center px-8 py-12 space-y-5">
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-[0_18px_40px_rgba(24,120,67,0.18)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <FaTruck className="text-emerald-600" style={{ fontSize: '2.5rem' }} />
              </div>
              <h3 className="font-semibold text-xl md:text-2xl text-emerald-900">Reliable Service</h3>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                Making waste collection accessible and straightforward for everyone.
              </p>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_35px_80px_rgba(24,120,67,0.18)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_45px_120px_rgba(24,120,67,0.22)] landing-fade landing-delay-200">
            <div className="absolute inset-x-0 -top-20 h-40 bg-emerald-100/40 blur-[60px] group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
            <div className="relative flex flex-col items-center text-center px-8 py-12 space-y-5">
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-[0_18px_40px_rgba(24,120,67,0.18)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <AiOutlineSchedule className="text-emerald-600" style={{ fontSize: '2.6rem' }} />
              </div>
              <h3 className="font-semibold text-xl md:text-2xl text-emerald-900">Transparent Process</h3>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                Clear communication and easy access to collection schedules and updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Section2
