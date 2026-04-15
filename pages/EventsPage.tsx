
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchLocalEvents } from '../services/apiService';
import { LocalEvent } from '../types';
import AnimatedElement from '../components/AnimatedElement';
import ParallaxElement from '../components/ParallaxElement';
import { motion, AnimatePresence } from 'framer-motion';

const EventModal: React.FC<{ event: LocalEvent; onClose: () => void }> = ({ event, onClose }) => {
    // Helper for countdown
    const useCountdown = (dateStr: string) => {
        const [status, setStatus] = useState<{ label: string, color: string }>({ label: '', color: '' });

        useEffect(() => {
            const calculate = () => {
                const now = new Date().getTime();
                let startDate: number;
                let endDate: number;
                
                if (dateStr.includes('(')) {
                    const month = dateStr.split(' ')[0];
                    const year = new Date().getFullYear();
                    startDate = new Date(`${month} 1, ${year}`).getTime();
                    // Month-long events end at the end of the month
                    endDate = new Date(year, new Date(`${month} 1, ${year}`).getMonth() + 1, 0, 23, 59, 59).getTime();
                } else {
                    startDate = new Date(dateStr).getTime();
                    // Single day events end at the end of that day
                    endDate = startDate + (24 * 60 * 60 * 1000) - 1;
                }

                if (isNaN(startDate)) {
                    setStatus({ label: '', color: '' });
                    return;
                }

                if (now > endDate) {
                    setStatus({ label: 'Ended', color: 'bg-slate-500' });
                    return;
                }

                if (now >= startDate && now <= endDate) {
                    setStatus({ label: 'Ongoing', color: 'bg-red-500 animate-pulse' });
                    return;
                }

                const diff = startDate - now;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                
                const label = days === 0 ? `Upcoming: ${hours}h left` : `Upcoming: ${days}d ${hours}h left`;
                setStatus({ label, color: 'bg-lt-blue' });
            };

            calculate();
            const timer = setInterval(calculate, 60000);
            return () => clearInterval(timer);
        }, [dateStr]);

        return status;
    };

    const countdown = useCountdown(event.date);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
                <div className="md:w-1/2 relative h-64 md:h-auto">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                        <span className="bg-lt-yellow text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                            {event.badge}
                        </span>
                        <h2 className="text-3xl font-black text-white drop-shadow-lg leading-tight">{event.title}</h2>
                        <div className="flex items-center gap-2 text-white/90 text-sm mt-2">
                            <i className="fas fa-map-marker-alt text-lt-yellow"></i>
                            <span>{event.location}</span>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location + ' La Trinidad')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-[10px] font-bold text-lt-yellow hover:underline flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm"
                            >
                                <i className="fas fa-external-link-alt"></i> Map
                            </a>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors md:hidden"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar bg-slate-50">
                    <div className="hidden md:flex justify-end mb-6">
                        <button 
                            onClick={onClose}
                            className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-lt-orange hover:shadow-md transition-all"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h4 className="text-xs font-black text-lt-orange uppercase tracking-[0.2em] mb-3">Event Schedule</h4>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center border border-slate-100">
                                    <i className="fas fa-calendar-day text-lt-orange text-xl"></i>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-800">{event.date}</p>
                                    {countdown.label && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${countdown.color}`}></div>
                                            <p className="text-sm font-bold text-slate-500">{countdown.label}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-lt-orange uppercase tracking-[0.2em] mb-3">About the Event</h4>
                            <p className="text-slate-600 leading-relaxed text-lg">{event.description}</p>
                        </div>

                        {event.gallery && event.gallery.length > 0 && (
                            <div>
                                <h4 className="text-xs font-black text-lt-orange uppercase tracking-[0.2em] mb-4">Gallery</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {event.gallery.map((img, i) => (
                                        <div key={i} className="aspect-video rounded-2xl overflow-hidden shadow-sm group">
                                            <img src={img} alt={`${event.title} gallery ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-6">
                            <button 
                                onClick={() => {
                                    const query = encodeURIComponent(`${event.title} ${event.location} La Trinidad`);
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                                }}
                                className="w-full bg-lt-orange text-white font-bold py-4 rounded-2xl shadow-lg shadow-lt-orange/20 hover:bg-lt-moss transition-all flex items-center justify-center gap-3"
                            >
                                <i className="fas fa-directions"></i> Get Directions
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const CountdownBadge: React.FC<{ dateStr: string }> = ({ dateStr }) => {
    const [status, setStatus] = useState<{ label: string, color: string }>({ label: '', color: '' });

    useEffect(() => {
        const calculate = () => {
            const now = new Date().getTime();
            let startDate: number;
            let endDate: number;
            
            if (dateStr.includes('(')) {
                const month = dateStr.split(' ')[0];
                const year = new Date().getFullYear();
                startDate = new Date(`${month} 1, ${year}`).getTime();
                endDate = new Date(year, new Date(`${month} 1, ${year}`).getMonth() + 1, 0, 23, 59, 59).getTime();
            } else {
                startDate = new Date(dateStr).getTime();
                endDate = startDate + (24 * 60 * 60 * 1000) - 1;
            }

            if (isNaN(startDate)) {
                setStatus({ label: '', color: '' });
                return;
            }

            if (now > endDate) {
                setStatus({ label: 'Ended', color: 'bg-slate-500' });
                return;
            }

            if (now >= startDate && now <= endDate) {
                setStatus({ label: 'Ongoing', color: 'bg-red-500 animate-pulse' });
                return;
            }

            const diff = startDate - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            const label = days === 0 ? `${hours}h away` : `${days}d ${hours}h away`;
            setStatus({ label, color: 'bg-lt-blue' });
        };

        calculate();
        const timer = setInterval(calculate, 60000);
        return () => clearInterval(timer);
    }, [dateStr]);

    if (!status.label) return null;

    return (
        <div className="absolute bottom-4 left-4">
            <span className={`backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg border border-white/10 flex items-center gap-1.5 ${status.label === 'Ended' ? 'bg-slate-800/60' : 'bg-black/60'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${status.color}`}></div>
                {status.label}
            </span>
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
            try {
                const data = await fetchLocalEvents();
                
                // Sort events by date (closest first)
                const sortedData = [...data].sort((a, b) => {
                    const now = new Date().getTime();
                    
                    const getTargetDate = (dateStr: string) => {
                        if (dateStr.includes('(')) {
                            const month = dateStr.split(' ')[0];
                            const year = new Date().getFullYear();
                            return new Date(`${month} 1, ${year}`).getTime();
                        }
                        return new Date(dateStr).getTime();
                    };

                    const dateA = getTargetDate(a.date);
                    const dateB = getTargetDate(b.date);

                    const diffA = dateA - now;
                    const diffB = dateB - now;

                    // If both are in the future, sort by closest
                    if (diffA >= 0 && diffB >= 0) return diffA - diffB;
                    // If one is in the past, move it to the end
                    if (diffA < 0 && diffB >= 0) return 1;
                    if (diffA >= 0 && diffB < 0) return -1;
                    // If both are in the past, sort by most recent
                    return diffB - diffA;
                });

                setEvents(sortedData);
                
                // Check for deep link
                const eventTitle = searchParams.get('id');
                if (eventTitle && sortedData.length > 0) {
                    const found = sortedData.find(e => e.title.toLowerCase().replace(/\s+/g, '-') === eventTitle.toLowerCase());
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event, index) => (
                            <AnimatedElement 
                                key={event._id || index} 
                                delay={index * 100} 
                                direction="up" 
                                distance={50}
                            >
                                <div 
                                    onClick={() => setSelectedEvent(event)}
                                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-slate-100 flex flex-col h-full transform hover:-translate-y-2"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img 
                                            src={event.image} 
                                            alt={event.title} 
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-lt-yellow/90 backdrop-blur text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                                                {event.badge}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
