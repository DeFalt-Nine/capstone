import React, { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  distance?: number;
  scale?: number;
  rotate?: number;
  ease?: string;
  scrub?: boolean | number;
}

const AnimatedElement: React.FC<AnimatedElementProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  duration = 1,
  distance = 50,
  scale = 0.9,
  rotate = 0,
  ease = 'back.out(1.4)',
  scrub = false
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let x = 0;
    let y = 0;

    if (direction === 'up') y = distance;
    else if (direction === 'down') y = -distance;
    else if (direction === 'left') x = distance;
    else if (direction === 'right') x = -distance;

    gsap.fromTo(
      element,
      { 
        opacity: 0, 
        x: x, 
        y: y,
        scale: scale,
        rotate: rotate
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        duration: duration,
        delay: delay / 1000,
        ease: ease,
        scrollTrigger: {
          trigger: element,
          start: 'top 90%', 
          toggleActions: 'play none none none',
          scrub: scrub,
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().filter(st => st.vars.trigger === element).forEach(st => st.kill());
    };
  }, [direction, distance, duration, delay, scale, rotate, ease, scrub]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

export default AnimatedElement;
