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
  const handleEmailClick = (e) => {
    e.preventDefault();
    const email = 'menro.sipocot@gmail.com';
    
    // Try to open default email client
    const mailtoLink = `mailto:${email}`;
    const mailtoWindow = window.open(mailtoLink, '_self');
    
    // If it fails, copy to clipboard as fallback
    setTimeout(() => {
      if (!mailtoWindow || mailtoWindow.closed) {
        navigator.clipboard.writeText(email).then(() => {
          alert(`Email address copied to clipboard: ${email}`);
        }).catch(() => {
          alert(`Email: ${email}\n\nPlease copy this email address manually.`);
        });
      }
    }, 500);
  };

  const contactDetails = [
    {
      Icon: FaPhoneAlt,
      title: 'Call Us',
      value: '+639457627784',
      href: 'tel:+639457627784',
      description: 'Monday-Friday | 8am-5pm',
    },
    {
      Icon: FaEnvelope,
      title: 'Email Us',
      value: 'menro.sipocot@gmail.com',
      onClick: handleEmailClick,
      description: 'We responds within one business day.',
    },
    {
      Icon: FaMapMarkerAlt,
      title: 'Visit Us',
      value: 'LGU Sipocot Compound',
      href: 'https://maps.google.com/?q=LGU+Sipocot+Compound,South+Centro+Sipocot,Camarines+Sur',
      description: 'South Centro Sipocot, Camarines Sur',
    },
    {
      Icon: FaFacebook,
      title: 'Follow Us',
      value: 'Visit our official Facebook Page',
      href: 'https://www.facebook.com/profile.php?id=100068581194697',
      description: 'at facebook.com/MENROSipocot',
    },
    {
      Icon: FaClock,
      title: 'Service Hours',
      value: 'Field Operations',
      description: 'Monday-Sunday 6AM-6PM',
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
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-white/40" aria-hidden="true" />
            <h2 className="text-xl md:text-2xl font-bold tracking-wide text-white uppercase">
              Municipal Environment and Natural Resources Office
            </h2>
          </div>
          <p className="text-base md:text-lg text-white/85 leading-relaxed max-w-3xl pl-11">
            MENRO is responsible for overseeing the municipality's waste management operations, ensuring efficient collection, proper disposal, and adherence to environmental standards and policies.
          </p>
        </div>

        <div className="mt-12 max-w-5xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl shadow-green-900/20">
            <h4 className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">Sipocot Office</h4>
            <div className="mt-6 grid gap-6">
              {contactDetails.map(({ Icon, title, value, description, href, onClick }) => (
                <div key={title} className="flex items-start gap-4">
                  <span className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">{title}</p>
                    {onClick ? (
                      <button
                        onClick={onClick}
                        className="mt-1 block text-lg font-medium text-white hover:text-green-100 transition hover:underline cursor-pointer text-left"
                      >
                        {value}
                      </button>
                    ) : href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="mt-1 block text-lg font-medium text-white hover:text-green-100 transition hover:underline cursor-pointer"
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
