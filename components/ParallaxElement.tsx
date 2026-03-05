import React, { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ParallaxElementProps {
  children: ReactNode;
  speed?: number; // 0.1 to 1.0 is usually good
  className?: string;
  direction?: 'vertical' | 'horizontal';
}

const ParallaxElement: React.FC<ParallaxElementProps> = ({ 
  children, 
  speed = 0.5, 
  className = '',
  direction = 'vertical'
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const movement = speed * 100;

    gsap.to(element, {
      y: direction === 'vertical' ? -movement : 0,
      x: direction === 'horizontal' ? -movement : 0,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });

    return () => {
      ScrollTrigger.getAll().filter(st => st.vars.trigger === element).forEach(st => st.kill());
    };
  }, [speed, direction]);

  return (
    <div ref={elementRef} className={`parallax-container ${className}`}>
      {children}
    </div>
  );
};

export default ParallaxElement;
