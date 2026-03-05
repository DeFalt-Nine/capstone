import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface FunFactBubbleProps {
  fact: string;
  x: number;
  y: number;
  onClose: () => void;
}

const FunFactBubble: React.FC<FunFactBubbleProps> = ({ fact, x, y, onClose }) => {
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bubble = bubbleRef.current;
    if (!bubble) return;

    // Animate in
    gsap.fromTo(
      bubble,
      { 
        opacity: 0, 
        scale: 0.5, 
        y: y + 20,
        x: x 
      },
      { 
        opacity: 1, 
        scale: 1, 
        y: y - 10, // Float slightly above the click
        duration: 0.5, 
        ease: 'back.out(1.7)' 
      }
    );

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [x, y]);

  const handleClose = () => {
    const bubble = bubbleRef.current;
    if (!bubble) {
      onClose();
      return;
    }

    gsap.to(bubble, {
      opacity: 0,
      scale: 0.5,
      y: y + 20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: onClose
    });
  };

  return (
    <div 
      ref={bubbleRef}
      className="fixed z-[100] pointer-events-none"
      style={{ 
        left: x, 
        top: y, 
        transform: 'translate(-50%, -100%)' // Center horizontally, above the point
      }}
    >
      <div className="bg-lt-yellow text-slate-900 p-4 rounded-2xl shadow-2xl border-2 border-white max-w-[250px] relative pointer-events-auto cursor-default">
        {/* Triangle pointer */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white"></div>
        
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center shrink-0">
            <i className="fas fa-lightbulb text-lt-orange"></i>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-lt-orange mb-1">Did you know?</p>
            <p className="text-xs font-medium leading-relaxed">{fact}</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fas fa-times text-[10px]"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FunFactBubble;
