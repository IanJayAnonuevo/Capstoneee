import { useNavigate } from 'react-router-dom';
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FiChevronRight, FiPlay, FiStopCircle, FiXCircle, FiFileText } from 'react-icons/fi';
import { MdEvent, MdMenuBook, MdReport } from 'react-icons/md';
import eventTp from '../../assets/images/users/tp.jpg';
import eventCd from '../../assets/images/users/cd.jpg';
import eventS from '../../assets/images/users/s.jpg';
import eventAn from '../../assets/images/users/an.jpg';

// MENRO events carousel images
const eventImages = [
  {
    url: eventTp,
    title: 'Tree Planting Activity',
    date: 'October 20, 2025',
    description: 'Gaongan, Sipocot, Camarines Sur'
  },
  {
    url: eventCd,
    title: 'Clean Up Drive',
    date: 'October 24, 2025',
    description: 'Impig, Sipocot, Camarines Sur'
  },
  {
    url: eventS,
    title: 'Campaign Seminar',
    date: 'October 26, 2025',
    description: 'Caima, Sipocot, Camarines Sur'
  },
  {
    url: eventAn,
    title: 'Coastal Clean Up Drive',
    date: 'October 30, 2025',
    description: 'Anib, Sipocot, Camarines Sur'
  }
];

// Carousel Settings
const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  dotsClass: "slick-dots custom-dots",
  arrows: false,
};

function GarbageCollectorHome() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Attendance time window logic (5:00 AM – 6:00 AM)
  const [now, setNow] = React.useState(new Date());
  const WINDOW_START_HOUR = 5;   // 5:00 AM
  const WINDOW_END_HOUR = 6;     // 6:00 AM
  const NEAR_END_MINUTES = 5;    // 5:55–6:00 warning window

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isBetween = (date, startHour, endHour) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    const start = new Date(y, m, d, startHour, 0, 0, 0);
    const end = new Date(y, m, d, endHour, 0, 0, 0);
    return date >= start && date < end;
  };

  const computeState = (date) => {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const nearWindow = hour === WINDOW_END_HOUR - 0 && minute >= (60 - NEAR_END_MINUTES) && minute < 60;
    if (isBetween(date, WINDOW_START_HOUR, WINDOW_END_HOUR)) {
      return nearWindow ? 'near_end' : 'open';
    }
    if (hour >= WINDOW_END_HOUR) return 'closed';
    return 'pre';
  };

  const attendanceState = computeState(now);
  const timeInEnabled = attendanceState === 'open' || attendanceState === 'near_end';
  const timeOutEnabled = false; // disabled until user has timed in (out of scope here)
  const otherButtonsEnabled = timeInEnabled || attendanceState === 'closed' || attendanceState === 'pre';

  const quickActions = [
    {
      title: 'View Tasks',
      description: "Stay on top of today's assignments.",
      icon: MdReport,
      ctaLabel: 'Open tasks',
      onClick: () => navigate('/garbagecollector/tasks')
    },
    {
      title: 'View Schedule',
      description: 'Check your upcoming collection schedule.',
      icon: MdEvent,
      ctaLabel: 'See schedule',
      onClick: () => navigate('/garbagecollector/schedule')
    },
    {
      title: 'View Routes',
      description: 'Review assigned barangays and checkpoints.',
      icon: MdMenuBook,
      ctaLabel: 'Browse routes',
      onClick: () => navigate('/garbagecollector/routes')
    }
  ];

  return (
    <div className="flex-1 bg-gray-50 px-4 py-4">
      {/* Event Carousel */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden shadow-lg mb-8 mt-4 rounded-xl">
        <Slider {...carouselSettings} className="h-full">
          {eventImages.map((event, index) => (
            <div key={index} className="relative h-64 md:h-80">
              <div
                className="w-full h-full bg-cover bg-center relative rounded-xl"
                style={{ backgroundImage: `url(${event.url})` }}
                role="img"
                aria-label={`${event.title} - ${event.description}`}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-xl"></div>
                {/* Event Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <MdEvent className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">{event.date}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{event.title}</h3>
                  <p className="text-sm md:text-base text-gray-200">{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
        <style>{`
          .custom-dots {
            bottom: 20px !important;
          }
          .custom-dots li button:before {
            color: white !important;
            font-size: 12px !important;
          }
          .custom-dots li.slick-active button:before {
            color: white !important;
          }
        `}</style>
      </div>

      {/* Time-based notifications */}
      <div className="mb-3">
        {attendanceState === 'open' && (
          <div className="border-l-4 border-emerald-500 bg-emerald-50 text-emerald-800 p-3 rounded">
            <div className="text-sm"><span className="mr-1">📢</span><strong>System Notice:</strong> Time-in window is open from 5:00 AM to 6:00 AM. Please complete your attendance.</div>
          </div>
        )}
        {attendanceState === 'near_end' && (
          <div className="border-l-4 border-amber-500 bg-amber-50 text-amber-800 p-3 rounded">
            <div className="text-sm"><span className="mr-1">⏰</span><strong>You haven’t timed in yet!</strong> Please log in immediately to avoid being marked <strong>absent</strong>.</div>
          </div>
        )}
        {attendanceState === 'closed' && (
          <div className="border-l-4 border-red-500 bg-red-50 text-red-800 p-3 rounded">
            <div className="text-sm"><span className="mr-1">⛔</span><strong>Time-In Closed:</strong> The time-in period is now over. You can no longer record attendance for today.</div>
          </div>
        )}
      </div>

      {/* Attendance section styled like favorite cards */}
      <div className="mb-6">
        <div className="mb-3 text-sm font-medium text-slate-600">
          <span className="text-emerald-700">Today:</span> {today}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" disabled={!timeInEnabled} className={`group relative flex items-center justify-between rounded-2xl px-4 py-4 text-left text-white shadow-soft ${timeInEnabled ? 'bg-emerald-800' : 'bg-emerald-800/60 cursor-not-allowed'}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/30 text-emerald-200">
                <FiPlay className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold">Time In</div>
                <div className="text-xs text-emerald-100/80">Tap to record</div>
              </div>
            </div>
            <div className="h-10 w-1 rounded-full bg-gradient-to-b from-emerald-300 to-emerald-500" />
          </button>
          <button type="button" disabled={!timeOutEnabled} className={`group relative flex items-center justify-between rounded-2xl px-4 py-4 text-left text-white shadow-soft ${timeOutEnabled ? 'bg-emerald-800' : 'bg-emerald-800/60 cursor-not-allowed'}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/30 text-emerald-200">
                <FiStopCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold">Time Out</div>
                <div className="text-xs text-emerald-100/80">Tap to record</div>
              </div>
            </div>
            <div className="h-10 w-1 rounded-full bg-gradient-to-b from-emerald-300 to-emerald-500" />
          </button>
          <button type="button" disabled={!otherButtonsEnabled} className={`group relative flex items-center justify-between rounded-2xl px-4 py-4 text-left text-white shadow-soft ${otherButtonsEnabled ? 'bg-emerald-800' : 'bg-emerald-800/60 cursor-not-allowed'}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/30 text-emerald-200">
                <FiXCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold">Absent</div>
                <div className="text-xs text-emerald-100/80">Mark for today</div>
              </div>
            </div>
            <div className="h-10 w-1 rounded-full bg-gradient-to-b from-emerald-300 to-emerald-500" />
          </button>
          <button type="button" disabled={!otherButtonsEnabled} className={`group relative flex items-center justify-between rounded-2xl px-4 py-4 text-left text-white shadow-soft ${otherButtonsEnabled ? 'bg-emerald-800' : 'bg-emerald-800/60 cursor-not-allowed'}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/30 text-emerald-2 00">
                <FiFileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold">File Leave</div>
                <div className="text-xs text-emerald-100/80">Submit request</div>
              </div>
            </div>
            <div className="h-10 w-1 rounded-full bg-gradient-to-b from-emerald-300 to-emerald-500" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-0 py-0">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-green-800">Quick Actions</h2>
          <p className="text-sm text-slate-500">Access your key tools in just a few taps.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.title}
                type="button"
                onClick={action.onClick}
                className="group relative flex h-full w-full flex-col justify-between rounded-2xl bg-gradient-to-br from-green-700 to-green-600 p-6 text-left text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
                    <IconComponent className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-white">{action.title}</h3>
                    <p className="text-sm leading-relaxed text-white/80">{action.description}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between text-sm font-medium text-white/90">
                  <span>{action.ctaLabel}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-green-700">
                    <FiChevronRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GarbageCollectorHome;
