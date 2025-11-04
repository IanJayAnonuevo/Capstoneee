import React from 'react';
import kolekTrashLogo from '../../assets/logo/logo.png';

const BrandedLoader = ({
  visible,
  primaryText = 'KolekTrash',
  secondaryText = 'Please wait while we process your request…',
  variant = 'elevated'
}) => {
  if (!visible) return null;

  if (variant === 'login') {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        role="status"
        aria-live="assertive"
        aria-label={`${primaryText} loading`}
      >
        <div className="relative text-center p-8 bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-white/60">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white via-white to-emerald-50 opacity-70" aria-hidden="true"></div>
          <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <h3 className="mt-6 text-xl font-semibold text-gray-800">{primaryText}</h3>
            <p className="text-sm text-gray-600 mt-2">{secondaryText}</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" aria-hidden="true"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} aria-hidden="true"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-emerald-900/35 via-black/35 to-green-900/35 backdrop-blur-md px-4"
      role="status"
      aria-live="assertive"
      aria-label={`${primaryText} loading`}
    >
      <div className="relative w-full max-w-sm">
        <div className="absolute inset-0 rounded-[32px] bg-white/10 blur-2xl" aria-hidden="true"></div>
        <div className="relative flex flex-col items-center gap-5 rounded-[28px] border border-white/30 bg-white/95 p-8 shadow-[0_25px_60px_-20px_rgba(20,83,45,0.55)]">
          <img src={kolekTrashLogo} alt="KolekTrash logo" className="h-12 w-12 object-contain" />
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-100"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 border-r-emerald-400 animate-spin [animation-duration:1s]"></div>
            <div className="absolute inset-3 rounded-full bg-emerald-50" aria-hidden="true"></div>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">{primaryText}</p>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{secondaryText}</p>
          </div>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-emerald-100">
            <span className="block h-full w-1/2 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-emerald-400/80" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandedLoader;
