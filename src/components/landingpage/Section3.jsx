import React from 'react'

import ianJayImage from '../../assets/images/aboutus/ianjay.jpeg'
import emeirImage from '../../assets/images/aboutus/emeir.png'
import angelaImage from '../../assets/images/aboutus/angela.png'

const developers = [
  {
    name: 'Ian Jay Anonuevo',
    role: 'Developer',
    image: ianJayImage,
  },
  {
    name: 'Emeir Amado',
    role: 'Developer',
    image: emeirImage,
  },
  {
    name: 'Angela Olpato',
    role: 'Developer',
    image: angelaImage,
  },
]

const Section3 = () => {
  return (
    <section
      id="about"
      className="scroll-mt-24 py-20 bg-gradient-to-br from-green-100 via-emerald-50 to-green-100"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm uppercase tracking-[0.4em] text-green-600 font-semibold">About Us</p>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-green-800">Meet the KolekTrash Developers</h2>
          <p className="mt-6 text-lg text-gray-600">
            We&apos;re a dedicated team building smarter waste management solutions for every community.
          </p>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {developers.map((developer) => (
            <div
              key={developer.name}
              className="group relative flex flex-col items-center rounded-3xl border border-green-100/70 bg-white/95 p-8 text-center shadow-lg shadow-green-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-2xl"
            >
              <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-green-200/80 shadow-xl shadow-green-100 sm:h-36 sm:w-36">
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-green-100/50 via-transparent to-green-200/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                <img
                  src={developer.image}
                  alt={developer.name}
                  className="relative z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                  srcSet={`${developer.image} 1x, ${developer.image} 2x`}
                  sizes="(min-width: 1024px) 12rem, 9rem"
                  style={{ filter: 'contrast(1.05) saturate(1.05)' }}
                />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-green-800">{developer.name}</h3>
              <p className="text-sm uppercase tracking-widest text-green-500">{developer.role}</p>
              <p className="mt-4 text-sm text-gray-600">
                Passionate about keeping KolekTrash reliable, efficient, and delightful to use.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Section3
