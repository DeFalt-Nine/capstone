import React, { useEffect, useState } from 'react';

const IntroAnimation: React.FC = () => {
  // Check session storage immediately upon initialization
  // If 'hasSeenIntro' exists, we start with show = false, preventing the animation entirely
  const [show, setShow] = useState(() => {
    const hasSeen = sessionStorage.getItem('hasSeenIntro');
    return !hasSeen;
  });
  
  const [contentVisible, setContentVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // If we shouldn't show it, do nothing (though the component returns null below anyway)
    if (!show) return;

    // 1. Start fading out the text/UI elements early
    const textTimer = setTimeout(() => {
        setContentVisible(false);
    }, 1800);

    // 2. Start fading the background container itself (The Dissolve)
    // This happens while the zoom is expanding, creating a seamless blend
    const fadeTimer = setTimeout(() => {
        setIsFading(true);
    }, 2400);

    // 3. Unmount the component entirely after animation is done
    const totalTimer = setTimeout(() => {
      setShow(false);
      // Mark as seen so it doesn't run again this session
      sessionStorage.setItem('hasSeenIntro', 'true');
    }, 3300); 

    return () => {
        clearTimeout(textTimer);
        clearTimeout(fadeTimer);
        clearTimeout(totalTimer);
    };
  }, [show]);

  // If show is false (either initialized that way or set after timeout), render nothing
  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-white transition-opacity duration-1000 ease-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* The expanding portal element */}
      <div className="relative animate-zoom-through flex items-center justify-center">
    <div className="absolute w-80 h-80 border-2 border-lt-yellow/40 rounded-full animate-pulse-glow"></div>
    <div className="absolute w-72 h-72 border border-lt-orange/30 rounded-full"></div>
    
    <div className="w-64 h-64 flex items-center justify-center relative z-10">
        <img 
            src="/logo.png" 
            alt="CultureQuest Logo" 
            className="w-full h-full object-contain drop-shadow-2xl"
        />
    </div>
</div>

      {/* Text Overlay - Fades out before the zoom completes */}
      <div 
        className={`absolute bottom-1/4 text-center transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <h1 className="text-slate-500 text-2xl font-light tracking-[0.5em] uppercase mb-2">Welcome To</h1>
        <h2 className="text-lt-orange text-4xl font-bold tracking-wider drop-shadow-sm">La Trinidad</h2>
        <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-lt-yellow rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-lt-yellow rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-lt-yellow rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;