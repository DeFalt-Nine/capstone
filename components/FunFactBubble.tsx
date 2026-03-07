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

    // Adjust position to prevent clipping
    const rect = bubble.getBoundingClientRect();
    const padding = 20;
    let adjustedX = x;
    let adjustedY = y;

    // Horizontal check
    if (x - rect.width / 2 < padding) {
      adjustedX = rect.width / 2 + padding;
    } else if (x + rect.width / 2 > window.innerWidth - padding) {
      adjustedX = window.innerWidth - rect.width / 2 - padding;
    }

    // Vertical check (above the click)
    if (y - rect.height - padding < 0) {
      // If not enough space above, show below
      adjustedY = y + padding;
      bubble.style.transform = 'translate(-50%, 0)';
      const pointer = bubble.querySelector('.bubble-pointer');
      if (pointer) {
        pointer.classList.remove('bottom-0', 'translate-y-full', 'border-t-white');
        pointer.classList.add('top-0', '-translate-y-full', 'border-b-white', 'border-t-0', 'border-b-[10px]');
      }
    } else {
      adjustedY = y - 10;
      bubble.style.transform = 'translate(-50%, -100%)';
    }

    bubble.style.left = `${adjustedX}px`;
    bubble.style.top = `${adjustedY}px`;

    // Animate in
    gsap.fromTo(
      bubble,
      { 
        opacity: 0, 
        scale: 0.5, 
      },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.5, 
        ease: 'back.out(1.7)' 
      }
    );

    // Auto-close after 6 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 6000);

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
      }}
    >
      <div className="bg-lt-yellow text-slate-900 p-4 rounded-2xl shadow-2xl border-2 border-white max-w-[280px] relative pointer-events-auto cursor-default">
        {/* Triangle pointer */}
        <div className="bubble-pointer absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white"></div>
        
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center shrink-0">
            <i className="fas fa-lightbulb text-lt-orange"></i>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-lt-orange mb-1">Did you know?</p>
            <p className="text-xs font-medium leading-relaxed">{fact}</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <i className="fas fa-times text-[10px]"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FunFactBubble;
