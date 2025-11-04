import React from 'react';
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from 'react-icons/fa';

const Section4 = () => {
  const contactDetails = [
    {
      Icon: FaPhoneAlt,
      title: 'Call Us',
      value: '+639764567823',
      description: 'Monday to Friday · 8:00 AM – 5:00 PM',
    },
    {
      Icon: FaEnvelope,
      title: 'Email',
      value: 'menro.sipocot@gmail.com',
      href: 'mailto:menro.sipocot@gmail.com',
      description: 'We aim to respond within one business day.',
    },
    {
      Icon: FaMapMarkerAlt,
      title: 'Visit the Office',
      value: 'LGU Sipocot Compound',
      description: 'South Centro, Sipocot, Camarines Sur',
    },
    {
      Icon: FaClock,
      title: 'Service Hours',
      value: 'Field Operations',
      description: 'Daily monitoring to keep Sipocot clean and resilient.',
    },
  ];

  const socialLinks = [
    { Icon: FaFacebook, label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100068581194697', target: '_blank', rel: 'noopener noreferrer' },
    { Icon: FaInstagram, label: 'Instagram', href: '#' },
    { Icon: FaTwitter, label: 'Twitter', href: '#' },
  ];

  return (
    <footer
      id="contact"
      className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white scroll-mt-24"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent)]" />
        <div className="absolute right-0 top-0 h-full w-40 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.18),_transparent)]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-20 lg:px-8">
        <div className="flex items-center gap-4 text-sm uppercase tracking-[0.4em] text-white/70">
          <span className="h-px w-12 bg-white/40" aria-hidden="true" />
          Municipal Environment and Natural Resources Office
        </div>

        <div className="mt-10 grid gap-14 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-4xl md:text-5xl font-semibold leading-tight text-white">
                Let&apos;s build a cleaner, smarter Sipocot together.
              </h3>
              <p className="text-lg text-white/80 max-w-xl">
                Our team supports barangays, collectors, and residents with data-driven planning and real-time coordination. Reach out and we&apos;ll partner with you on your next sustainability initiative.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <a
                href="mailto:menro.sipocot@gmail.com"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-white text-green-900 px-7 py-3 font-medium shadow-lg shadow-green-900/30 transition hover:-translate-y-0.5 hover:bg-gray-100"
              >
                <FaEnvelope aria-hidden="true" />
                Email Our Team
              </a>
              <div className="flex items-center gap-4 text-white/80">
                {socialLinks.map(({ Icon, label, href, target, rel }) => (
                  <a
                    key={label}
                    href={href}
                    target={target}
                    rel={rel}
                    aria-label={label}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors duration-200 hover:bg-white hover:text-green-900"
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl shadow-green-900/20">
            <h4 className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">Sipocot Office</h4>
            <div className="mt-6 grid gap-6">
              {contactDetails.map(({ Icon, title, value, description, href }) => (
                <div key={title} className="flex items-start gap-4">
                  <span className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">{title}</p>
                    {href ? (
                      <a
                        href={href}
                        className="mt-1 block text-lg font-medium text-white hover:text-green-100 transition"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 text-lg font-medium text-white">{value}</p>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-white/70">{description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className="my-16 border-white/15" />

        <div className="flex flex-col gap-4 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© 2025 Municipality of Sipocot – MENRO. All rights reserved.</p>
          <p>Responsible waste management · Environmental stewardship · Community resilience</p>
        </div>
      </div>
    </footer>
  );
};

export default Section4;
