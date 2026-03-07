import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { fetchLocalEvents } from '../services/apiService';
import type { LocalEvent } from '../types';

const Mascot: React.FC = () => {
    const navigate = useNavigate();
    const [upcomingEvent, setUpcomingEvent] = useState<LocalEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const mascotRef = useRef<HTMLDivElement>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkEvents = async () => {
            try {
                const events = await fetchLocalEvents();
                const now = new Date();
                
                // Find events within the next 30 days
                const nearEvent = events.find(event => {
                    // Simple date parsing for demo purposes
                    // In a real app, we'd have proper date objects from the backend
                    // Let's assume the backend provides a sortable date or we just check keywords
                    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    const currentMonth = monthNames[now.getMonth()];
                    
                    return event.date.includes(currentMonth) || event.badge === 'Main Event';
                });

                if (nearEvent) {
                    setUpcomingEvent(nearEvent);
                    // Show mascot after a short delay
                    setTimeout(() => setIsVisible(true), 3000);
                }
            } catch (err) {
                console.error("Mascot failed to fetch events:", err);
            }
        };

        checkEvents();
    }, []);

    useEffect(() => {
        if (isVisible && mascotRef.current) {
            gsap.fromTo(mascotRef.current, 
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)' }
            );
            
            if (bubbleRef.current) {
                gsap.fromTo(bubbleRef.current,
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, delay: 0.8, duration: 0.5, ease: 'back.out(2)' }
                );
            }
        }
    }, [isVisible]);

    const handleClick = () => {
        navigate('/visitor-info?tab=events');
    };

    if (!isVisible || !upcomingEvent) return null;

    return (
        <div 
            ref={mascotRef}
            className="fixed bottom-8 right-8 z-[60] flex flex-col items-end group cursor-pointer"
            onClick={handleClick}
        >
            {/* Speech Bubble */}
            <div 
                ref={bubbleRef}
                className="bg-white p-4 rounded-2xl shadow-2xl border-2 border-lt-orange mb-4 max-w-[200px] relative animate-float"
            >
                <p className="text-xs font-bold text-slate-800 leading-tight">
                    Hey there! <span className="text-lt-orange">{upcomingEvent.title}</span> is coming up! 🍓
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Click me to see details!</p>
                {/* Triangle */}
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r-2 border-b-2 border-lt-orange rotate-45"></div>
            </div>

            {/* Mascot Character (Cute Strawberry) */}
            <div className="relative w-20 h-20 transform group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
                    {/* Strawberry Body */}
                    <path 
                        d="M50 95 C20 95 5 70 5 45 C5 20 25 5 50 5 C75 5 95 20 95 45 C95 70 80 95 50 95" 
                        fill="#FF4D4D" 
                    />
                    {/* Seeds */}
                    <circle cx="30" cy="30" r="2" fill="#FFD700" opacity="0.6" />
                    <circle cx="70" cy="35" r="2" fill="#FFD700" opacity="0.6" />
                    <circle cx="50" cy="50" r="2" fill="#FFD700" opacity="0.6" />
                    <circle cx="35" cy="65" r="2" fill="#FFD700" opacity="0.6" />
                    <circle cx="65" cy="70" r="2" fill="#FFD700" opacity="0.6" />
                    
                    {/* Leaves/Stem */}
                    <path 
                        d="M50 10 L35 0 L50 5 L65 0 L50 10" 
                        fill="#2E7D32" 
                    />
                    <path 
                        d="M50 10 L40 15 L50 5 L60 15 L50 10" 
                        fill="#4CAF50" 
                    />

                    {/* Eyes */}
                    <circle cx="35" cy="40" r="4" fill="white" />
                    <circle cx="35" cy="40" r="2" fill="black" />
                    <circle cx="65" cy="40" r="4" fill="white" />
                    <circle cx="65" cy="40" r="2" fill="black" />

                    {/* Smile */}
                    <path 
                        d="M40 60 Q50 70 60 60" 
                        fill="none" 
                        stroke="black" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                    />
                </svg>
                
                {/* Badge */}
                <div className="absolute -top-2 -left-2 bg-lt-yellow text-[8px] font-black px-2 py-1 rounded-full shadow-sm border border-white uppercase">
                    Event Alert
                </div>
            </div>
        </div>
    );
};

export default Mascot;
