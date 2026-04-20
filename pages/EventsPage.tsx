
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchLocalEvents } from '../services/apiService';
import { LocalEvent } from '../types';
import { LOCAL_EVENTS } from '../constants';
import AnimatedElement from '../components/AnimatedElement';
import ParallaxElement from '../components/ParallaxElement';
import EventModal from '../components/EventModal';
import { parseEventDates, getEventStatus, formatCountdown } from '../services/dateUtils';
import { AnimatePresence } from 'framer-motion';

const CountdownBadge: React.FC<{ dateStr: string }> = ({ dateStr }) => {
    const [status, setStatus] = useState(getEventStatus(dateStr));

    useEffect(() => {
        const timer = setInterval(() => {
            setStatus(getEventStatus(dateStr));
        }, 1000);
        return () => clearInterval(timer);
    }, [dateStr]);

    if (status.type === 'unknown') return null;

    const timeLeftStr = status.timeLeft > 0 ? formatCountdown(status.timeLeft) : "";

    return (
        <div className="absolute inset-0 z-20 flex flex-col justify-end pointer-events-none">
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
            
            {/* Content Band */}
            <div className="relative p-6 pb-8 flex flex-col gap-1 transition-transform duration-500">
                <div className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full shadow-lg ${status.color} ${status.type === 'ongoing' ? 'animate-pulse' : ''}`}></div>
                    <span className="text-white font-black tracking-[0.25em] text-[12px] uppercase drop-shadow-md">
                        {status.label}
                    </span>
                </div>
                
                {status.type === 'upcoming' && timeLeftStr && (
                    <div className="flex flex-col gap-0.5 mt-1">
                        <span className="text-white/60 text-[10px] font-black uppercase tracking-widest leading-none">Starts In</span>
                        <span className="text-white font-mono text-2xl font-black tracking-tight drop-shadow-xl">
                            {timeLeftStr}
                        </span>
                    </div>
                )}
                
                {status.type === 'ongoing' && (
                    <div className="flex flex-col gap-0.5 mt-1">
                        <span className="text-lt-yellow/60 text-[10px] font-black uppercase tracking-widest leading-none">Happening Now</span>
                        <span className="text-white font-mono text-lg font-black tracking-tight drop-shadow-xl">
                             Ends in: {timeLeftStr} 🍓
                        </span>
                    </div>
                )}

                {status.type === 'ended' && (
                    <div className="mt-2 text-white/50 font-black text-xs uppercase tracking-widest drop-shadow-lg">
                        See you next year!
                    </div>
                )}
            </div>
        </div>
    );
};

const EventsPage: React.FC = () => {
    const [events, setEvents] = useState<LocalEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<LocalEvent | null>(null);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const loadEvents = async () => {
            setLoading(true);
            try {
                let data = await fetchLocalEvents();
                
                // Fallback to static constants if API is empty
                if (!data || data.length === 0) {
                    console.log("[Events] Database empty, falling back to LOCAL_EVENTS");
                    data = LOCAL_EVENTS;
                }
                
                // Sort events (Ongoing first, then Upcoming closest, then Ended)
                const sorted = [...data].sort((a, b) => {
                    const nowTime = new Date().getTime();
                    const datesA = parseEventDates(a.date);
                    const datesB = parseEventDates(b.date);
                    
                    if (!datesA && !datesB) return 0;
                    if (!datesA) return 1;
                    if (!datesB) return -1;

                    const isOngoingA = nowTime >= datesA.start.getTime() && nowTime <= datesA.end.getTime();
                    const isOngoingB = nowTime >= datesB.start.getTime() && nowTime <= datesB.end.getTime();

                    if (isOngoingA && !isOngoingB) return -1;
                    if (!isOngoingA && isOngoingB) return 1;

                    const isEndedA = nowTime > datesA.end.getTime();
                    const isEndedB = nowTime > datesB.end.getTime();

                    if (isEndedA && !isEndedB) return 1;
                    if (!isEndedA && isEndedB) return -1;

                    // Proximity for both upcoming or both already ended
                    return datesA.start.getTime() - datesB.start.getTime();
                });

                setEvents(sorted);
                
                // Check for deep link
                const eventTitle = searchParams.get('id');
                if (eventTitle && sorted.length > 0) {
                    const found = sorted.find(e => e.title.toLowerCase().replace(/\s+/g, '-') === eventTitle.toLowerCase());
                    if (found) setSelectedEvent(found);
                }
            } catch (err) {
                console.error("Failed to load events:", err);
            } finally {
                setLoading(false);
            }
        };
        loadEvents();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-slate-900">
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1920&auto=format&fit=crop" 
                        alt="Events in La Trinidad" 
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-slate-50"></div>
                </div>
                
                <div className="relative z-10 text-center px-4">
                    <AnimatedElement direction="down" distance={50}>
                        <span className="text-lt-yellow font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Festivals & Culture</span>
                        <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl mb-6">
                            Local Events
                        </h1>
                        <p className="text-white/90 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                            Experience the vibrant spirit of La Trinidad through our colorful festivals, 
                            cultural gatherings, and seasonal celebrations.
                        </p>
                    </AnimatedElement>
                </div>
            </section>

            <div className="container mx-auto px-4 -mt-20 relative z-20">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-lt-orange border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 font-bold animate-pulse">Loading amazing events...</p>
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {events.map((event, index) => (
                            <AnimatedElement 
                                key={event._id || index} 
                                delay={index * 80} 
                                direction="up" 
                                distance={30}
                            >
                                <div 
                                    onClick={() => setSelectedEvent(event)}
                                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.2)] transition-all duration-500 group cursor-pointer border border-slate-100 flex flex-col h-full transform hover:-translate-y-3"
                                >
                                    <div className="relative h-72 overflow-hidden">
                                        <img 
                                            src={event.image} 
                                            alt={event.title} 
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" 
                                        />
                                        
                                        {/* Status Badge Top Left */}
                                        <div className="absolute top-5 left-5 z-30">
                                            <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-4 py-2 rounded-full shadow-lg border border-white/50 uppercase tracking-[0.1em]">
                                                {event.badge}
                                            </span>
                                        </div>

                                        {/* Countdown Overlay - Always Visible but interactive */}
                                        <CountdownBadge dateStr={event.date} />
                                    </div>
                                    
                                    <div className="p-8 flex-grow flex flex-col">
                                        <div className="flex items-center gap-2 text-lt-orange font-bold text-xs mb-3 uppercase tracking-widest">
                                            <i className="far fa-calendar-alt"></i>
                                            {event.date}
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-lt-orange transition-colors leading-tight">
                                            {event.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                                            {event.description}
                                        </p>
                                        
                                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center text-slate-400 text-xs font-bold">
                                                <i className="fas fa-map-marker-alt mr-2 text-lt-blue"></i>
                                                {event.location}
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-lt-orange group-hover:bg-lt-orange group-hover:text-white transition-all duration-300">
                                                <i className="fas fa-arrow-right"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedElement>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-slate-100">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 text-4xl">
                            <i className="fas fa-calendar-times"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">No events found</h3>
                        <p className="text-slate-500">Check back later for upcoming celebrations in the valley.</p>
                    </div>
                )}
            </div>

            {/* Newsletter / CTA */}
            <section className="mt-20 container mx-auto px-4">
                <ParallaxElement speed={0.1}>
                    <div className="bg-gradient-to-br from-lt-orange to-lt-yellow rounded-[3rem] p-10 md:p-16 text-center text-slate-900 shadow-2xl shadow-lt-orange/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -ml-20 -mb-20 blur-3xl"></div>
                        
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">Don't miss the next big celebration!</h2>
                            <p className="text-lg opacity-80 mb-10 font-medium">
                                Subscribe to our newsletter to get notified about upcoming events, 
                                festival schedules, and travel tips directly in your inbox.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={() => document.querySelector<HTMLButtonElement>('button[aria-label="Open chatbot"]')?.click()}
                                    className="bg-slate-900 text-white font-bold py-4 px-10 rounded-full shadow-xl hover:bg-black transition-all transform hover:scale-105 active:scale-95"
                                >
                                    Ask our AI Guide
                                </button>
                                <button 
                                    className="bg-white text-slate-900 font-bold py-4 px-10 rounded-full shadow-xl hover:bg-slate-50 transition-all transform hover:scale-105 active:scale-95"
                                >
                                    Join Newsletter
                                </button>
                            </div>
                        </div>
                    </div>
                </ParallaxElement>
            </section>

            <AnimatePresence>
                {selectedEvent && (
                    <EventModal 
                        event={selectedEvent} 
                        onClose={() => setSelectedEvent(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default EventsPage;
