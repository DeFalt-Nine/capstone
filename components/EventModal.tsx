
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LocalEvent } from '../types';
import { getEventStatus, formatCountdown } from '../services/dateUtils';

interface EventModalProps {
    event: LocalEvent;
    onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
    const [status, setStatus] = useState(getEventStatus(event.date));

    useEffect(() => {
        const timer = setInterval(() => {
            setStatus(getEventStatus(event.date));
        }, 1000);
        return () => clearInterval(timer);
    }, [event.date]);

    // Format for detailed display
    const countdownLabel = status.type === 'upcoming' 
        ? `Starts in: ${formatCountdown(status.timeLeft)}`
        : status.type === 'ongoing'
            ? `Ends in: ${formatCountdown(status.timeLeft)}`
            : "Event has ended";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
                <div className="md:w-1/2 relative h-64 md:h-auto">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${status.color} ${status.type === 'ongoing' ? 'animate-pulse' : ''}`}></div>
                                        <p className="text-sm font-bold text-slate-500">{countdownLabel}</p>
                                    </div>
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
                                            <img src={img} alt={`${event.title} gallery ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
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

export default EventModal;
