import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const TARGET_DATE = new Date('2025-12-30T16:01:00'); 
// const TARGET_DATE = new Date('2026-01-01T00:00:00'); // New Year 2026

function App() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isFinalCountdown, setIsFinalCountdown] = useState(false);
  const [animationStage, setAnimationStage] = useState(0); // 0: Countdown, 1: 2025, 2: Transition, 3: Full Celebration
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef(null);
  const finalAudioRef = useRef(null);

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

  const handleInteraction = () => {
    // "Unlock" audio on mobile/browsers by playing in a user gesture
    if (audioRef.current) {
        audioRef.current.play().then(() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }).catch(e => console.log("Interaction unlock failed:", e));
    }
    if (finalAudioRef.current) {
        finalAudioRef.current.play().then(() => {
            finalAudioRef.current.pause();
            finalAudioRef.current.currentTime = 0;
        }).catch(e => console.log("Interaction unlock failed:", e));
    }
    setHasInteracted(true);
  };

  useEffect(() => {
    // Preload audio
    audioRef.current = new Audio('./ticking_sound.MP3');
    audioRef.current.volume = 0.5; 
    
    finalAudioRef.current = new Audio('./final_song.MP3');
    finalAudioRef.current.volume = 1.0;

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      // Check transitions
      if (remaining.total <= 10000 && remaining.total > 0) {
        setIsFinalCountdown(true);
        // Play ticking sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
      }
      
      if (remaining.total <= 0) {
        clearInterval(timer);
        startNewYearSequence();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const startNewYearSequence = () => {
    // Stop ticking sound
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    
    // Play final song
    if (finalAudioRef.current) {
        finalAudioRef.current.play().catch(e => console.log("Final audio play failed:", e));
    }

    setIsFinalCountdown(false);
    
    // Stage 1: Show 2025 (Initial State at T-0)
    setAnimationStage(1);
    
    // Start infinite fireworks
    triggerFireworks();

    // Stage 2: Transition 5 -> 6 (after 1 seconds)
    setTimeout(() => {
      setAnimationStage(2);
    }, 1000);

    // Stage 3: Reveal "Happy New Year" text (after transition completes, approx 1s later)
    setTimeout(() => {
      setAnimationStage(3);
    }, 1500);
  };

  const triggerFireworks = () => {
    const duration = 5000; // Loop duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    // Recursive function for infinite loop
    const loop = () => {
      const interval = setInterval(function() {
        const particleCount = 20; // Fewer particles per tick, but constant stream
        
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

      // Keep running indefinitely - no clearInterval needed if we want truly infinite. 
      // However, to vary patterns, we could reset/restart, but for simple infinite stream, 
      // just letting interval run is fine. 
      // If we want bursts:
    };
    
    // Simple infinite random bursts
    const infiniteFirework = () => {
        const skew = 1;
        confetti({
            particleCount: 1,
            startVelocity: 0,
            ticks: skew,
            origin: {
                x: Math.random(),
                // since particles fall down, skew start toward the top
                y: (Math.random() * skew) - 0.2
            },
            colors: ['#ffffff'],
            shapes: ['circle'],
            gravity: randomInRange(0.4, 0.6),
            scalar: randomInRange(0.4, 1),
            drift: randomInRange(-0.4, 0.4)
        });

        // Main bursts
        if (Math.random() < 0.2) { // 20% chance every tick
             confetti({
                ...defaults,
                particleCount: 50,
                origin: { y: 0.6 },
                spread: 100,
                colors: ['#FFD700', '#FFA500', '#FF4500'] // Gold/Orange/Red theme
             });
        }
    }
    
    // Run frequently
    setInterval(infiniteFirework, 200);
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col items-center justify-center overflow-hidden font-serif">
      {/* Interaction Overlay */}
      {!hasInteracted && (
        <div 
            onClick={handleInteraction}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
        >
            <div className="text-center animate-pulse">
                <p className="text-gold-300 text-2xl font-serif tracking-widest border border-gold-500 p-6 rounded-lg bg-black/50 backdrop-blur-sm">
                    CLICK TO ENTER
                </p>
            </div>
        </div>
      )}

      {/* --------------------
          PERSISTENT LAYOUT 
         -------------------- */}
      
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('./masquerade-bg.jpg')" }}
      ></div>
      
      {/* New Year Video Background - Fades in slowly */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-3000 ease-in-out ${animationStage >= 2 ? 'opacity-100' : 'opacity-0'}`}
      >
        <source src="./final_bg.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay for Consistency */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-gray-900/80 via-black/60 to-black/80"></div>
      
      {/* Decorative Ornaments */}
      <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-amber-900/10 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-amber-900/10 to-transparent pointer-events-none"></div>

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

      {/* --------------------
          MAIN CONTENT AREA 
         -------------------- */}
      <div className={`z-10 text-center transition-all duration-1000 flex flex-col items-center justify-center w-full h-screen`}>
        
        {/* STAGE 0: NORMAL COUNTDOWN */}
        {animationStage === 0 && !isFinalCountdown && (
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

            {/* Sponsors */}
            <div className="relative z-20 mt-2 md:mt-4 flex justify-center w-full max-w-2xl mx-auto px-4 animate-float" style={{ animationDelay: '-3s' }}>
              <img src="./sponsors.png" alt="Sponsors" className="object-contain" />
            </div>
          </>
        )}

        {/* STAGE 0 (FINAL 10s): CIRCULAR COUNTDOWN */}
        {animationStage === 0 && isFinalCountdown && (
          <div className="relative z-30 flex items-center justify-center animate-pop-in">
             <div className="w-64 h-64 md:w-96 md:h-96 rounded-full border-4 border-gold-400 flex items-center justify-center relative bg-black/40 backdrop-blur-md shadow-[0_0_100px_rgba(251,191,36,0.3)] animate-pulse-gold">
                <span className="text-[10rem] md:text-[14rem] font-bold text-transparent bg-clip-text bg-linear-to-b from-white via-gold-300 to-amber-600 font-serif leading-none relative z-10 text-shadow-gold">
                  {timeLeft.seconds}
                </span>
                <div className="absolute inset-0 border-t-4 border-amber-200 rounded-full animate-spin duration-3000"></div>
                <div className="absolute inset-0 border-2 border-gold-500 rounded-full animate-ping opacity-50"></div>
             </div>
          </div>
        )}

        {/* STAGE 1 & 2 & 3: NEW YEAR TRANSITION */}
        {animationStage >= 1 && (
          <div className="z-10 text-center relative flex flex-col items-center justify-center h-full w-full">
            
            {/* BOX CONTAINER */}
            <div className="relative w-full max-w-lg md:max-w-4xl aspect-square flex items-center justify-center animate-pop-in">
                {/* Box Image */}
                <img src="./box.png" alt="Celebration Box" className="absolute inset-0 w-full h-full object-contain z-0" />

                {/* Content Inside Box */}
                <div className="relative z-10 flex flex-col items-center justify-center mt-15">
                    {/* YEAR DISPLAY: 2025 -> 2026 */}
                    <div className="h-32 md:h-64 flex items-center justify-center overflow-hidden">
                        <div className="flex text-7xl md:text-[10rem] font-bold text-gold-300 font-serif leading-none tracking-widest text-shadow-gold">
                          <span>202</span>
                          
                          {/* The changing digit */}
                          <div className="relative w-[0.6em] h-[1em] overflow-hidden flex flex-col items-center">
                              <div className={`transition-transform duration-1000 ease-in-out flex flex-col items-center ${animationStage >= 2 ? '-translate-y-1/2' : 'translate-y-0'}`}>
                                  <span className="h-[1em] flex items-center justify-center text-transparent bg-clip-text bg-linear-to-b from-amber-100 to-amber-600">5</span>
                                  <span className="h-[1em] flex items-center justify-center text-transparent bg-clip-text bg-linear-to-b from-amber-100 to-amber-600">6</span>
                              </div>
                          </div>
                        </div>
                    </div>

                    {/* "HAPPY NEW YEAR" Text - Inside Box Below Year */}
                    <div className={`transition-all duration-1000 transform animate-float ${animationStage >= 3 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90'}`}>
                        <h1 className="text-2xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-linear-to-r from-yellow-200 via-yellow-500 to-yellow-800 animate-pulse-gold drop-shadow-2xl">
                          HAPPY NEW YEAR
                        </h1>
                    </div>
                </div>
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
          className={`block text-7xl md:text-9xl font-bold bg-clip-text text-transparent bg-linear-to-b from-amber-100 to-amber-600 font-serif tabular-nums relative z-10 
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
