import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const TARGET_DATE = new Date('2025-12-24T18:55:00'); // New Year 2026

function App() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isFinalCountdown, setIsFinalCountdown] = useState(false);
  const [isNewYear, setIsNewYear] = useState(false);
  const audioRef = useRef(null);

  function calculateTimeLeft() {
    const difference = +TARGET_DATE - +new Date();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const timeLeft = calculateTimeLeft();
      setTimeLeft(timeLeft);

      // Check transitions
      if (timeLeft.total <= 10000 && timeLeft.total > 0) {
        setIsFinalCountdown(true);
      }
      
      if (timeLeft.total <= 0) {
        setIsNewYear(true);
        setIsFinalCountdown(false);
        clearInterval(timer);
        triggerFireworks();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerFireworks = () => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults, 
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  if (isNewYear) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80"></div>
        <div className="z-10 text-center animate-float">
          <h1 className="text-6xl md:text-9xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-800 animate-pulse-gold drop-shadow-2xl">
            HAPPY <br/> NEW YEAR
          </h1>
          <p className="text-2xl md:text-4xl text-gold-300 mt-8 font-serif tracking-widest uppercase">
            2026
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col items-center justify-center overflow-hidden font-serif">
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('./masquerade-bg.jpg')" }}
      ></div>
      {/* <div className="absolute inset-0 bg-black/20"></div> */} {/* Dark overlay for text contrast */}
      
      {/* Decorative Ornaments */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-900/10 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-amber-900/10 to-transparent pointer-events-none"></div>

      {/* Floating Triangles (Pendulum) */}
      <div className="absolute top-10 left-10 w-24 md:w-32 animate-pendulum opacity-60 z-0">
        <img src="./triangle.png" alt="Decoration" className="w-full h-full object-contain" />
      </div>
      <div className="absolute bottom-20 right-10 w-32 md:w-48 animate-pendulum opacity-60 z-0" style={{ animationDelay: '-2s' }}>
         <img src="./triangle.png" alt="Decoration" className="w-full h-full object-contain rotate-180" />
      </div>
      <div className="absolute top-20 right-20 w-16 md:w-24 animate-pendulum opacity-40 z-0 hidden md:block" style={{ animationDelay: '-1s' }}>
         <img src="./triangle.png" alt="Decoration" className="w-full h-full object-contain" />
      </div>
      <div className="absolute bottom-20 left-20 w-24 md:w-32 animate-pendulum opacity-40 z-0 hidden md:block" style={{ animationDelay: '-1s' }}>
         <img src="./triangle.png" alt="Decoration" className="w-full h-full object-contain" />
      </div>      

      {/* Main Content */}
      <div className={`z-10 text-center transition-all duration-1000 flex flex-col items-center justify-center w-full h-screen`}>
        {!isFinalCountdown ? (
          <>
            <div className="flex justify-center w-full relative z-20 pointer-events-none">
              <img 
                src="./masquerade-logo.png" 
                alt="Masquerade Ball New Year's Eve Countdown" 
                className="w-4/5 max-w-[200px] md:max-w-lg h-auto drop-shadow-2xl animate-float"
              />
            </div>

            {/* Timer Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8 md:gap-16 p-8 relative z-10 -mt-10 md:-mt-45">
              <TimeUnit value={timeLeft.days} label="Days" />
              <TimeUnit value={timeLeft.hours} label="Hours" />
              <TimeUnit value={timeLeft.minutes} label="Minutes" />
              <TimeUnit value={timeLeft.seconds} label="Seconds" isAnimating={true} />
            </div>

            {/* Sponsors / Footer Image */}
            <div className="relative z-20 mt-8 md:mt-12 flex justify-center w-full max-w-4xl mx-auto px-4 animate-float" style={{ animationDelay: '-3s' }}>
              <img src="./sponsors.png" alt="Sponsors" className="object-contain" />
            </div>
          </>
        ) : (
          /* Final 10s Circular Countdown */
          <div className="relative z-30 flex items-center justify-center animate-pop-in">
             <div className="w-64 h-64 md:w-96 md:h-96 rounded-full border-4 border-gold-400 flex items-center justify-center relative bg-black/40 backdrop-blur-md shadow-[0_0_100px_rgba(251,191,36,0.3)] animate-pulse-gold">
                <span className="text-[10rem] md:text-[14rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-gold-300 to-amber-600 font-serif leading-none relative z-10 text-shadow-gold">
                  {timeLeft.seconds}
                </span>
                {/* Rotating ring */}
                <div className="absolute inset-0 border-t-4 border-amber-200 rounded-full animate-spin duration-3000"></div>
                {/* Ping effect */}
                <div className="absolute inset-0 border-2 border-gold-500 rounded-full animate-ping opacity-50"></div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

const TimeUnit = ({ value, label, isAnimating }) => {
  return (
    <div className={`flex flex-col items-center transform transition-all duration-300 ${isAnimating ? 'hover:scale-105' : ''}`}>
      <div className="relative">
        <span 
          key={value}
          className={`block text-7xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-amber-100 to-amber-600 font-serif tabular-nums relative z-10 
          ${isAnimating ? 'animate-pop-in' : ''} text-shadow-gold leading-none`}>
          {String(value).padStart(2, '0')}
        </span>
        {/* Glow effect behind numbers */}
        <div className={`absolute inset-0 bg-amber-500/10 blur-xl rounded-full ${isAnimating ? 'animate-pulse' : ''}`}></div>
      </div>
      <span className="text-amber-300/80 uppercase text-xs md:text-xl tracking-[0.2em] mt-4 font-sans">{label}</span>
    </div>
  );
};

export default App;
