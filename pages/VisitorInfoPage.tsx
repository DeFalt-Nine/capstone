
import React, { useState, useEffect } from 'react';
import { LOCAL_NORMS, EMERGENCY_CONTACTS, EMERGENCY_HOTLINES } from '../constants';
import { fetchLocalEvents, trackEvent } from '../services/apiService';
import type { LocalEvent } from '../types';
import AnimatedElement from '../components/AnimatedElement';

const VisitorInfoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'culture' | 'events' | 'emergency'>('culture');
  
  // Events Tab State
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Emergency Tab State
  const [emergencyFilter, setEmergencyFilter] = useState<'All' | 'Hospital' | 'Police' | 'Fire Station' | 'Rescue' | 'Vet' | 'Pharmacy'>('All');
  const [selectedContact, setSelectedContact] = useState(EMERGENCY_CONTACTS[0]);

  // Fetch Events on load
  useEffect(() => {
      const loadEvents = async () => {
          setIsLoadingEvents(true);
          try {
              const data = await fetchLocalEvents();
              setEvents(data);
          } catch (err) {
              console.error("Failed to load events:", err);
              setEventsError("Unable to load events at this time.");
          } finally {
              setIsLoadingEvents(false);
          }
      };
      loadEvents();
  }, []);

  const handleTabChange = (tab: 'culture' | 'events' | 'emergency') => {
      setActiveTab(tab);
      trackEvent('view', `tab_${tab}`, '/visitor-info');
  };

  const filteredContacts = EMERGENCY_CONTACTS.filter(
    (contact) => emergencyFilter === 'All' || contact.type === emergencyFilter
  );

  const tabClass = (tab: 'culture' | 'events' | 'emergency') => {
      const isActive = activeTab === tab;
      let activeColor = '';

      if (tab === 'culture') { activeColor = 'text-lt-blue border-lt-blue bg-lt-blue/10'; }
      if (tab === 'events') { activeColor = 'text-lt-yellow border-lt-yellow bg-lt-yellow/10'; }
      if (tab === 'emergency') { activeColor = 'text-lt-red border-lt-red bg-lt-red/10'; }

      return `flex-1 py-4 px-2 text-center font-bold text-sm md:text-base transition-all duration-300 border-b-4 rounded-t-lg flex items-center justify-center gap-2 ${
          isActive 
          ? activeColor
          : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
      }`;
  };

  return (
    <section id="visitor-info" className="min-h-screen bg-slate-50 pt-20 md:pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Hero Header */}
            <AnimatedElement>
                <div className="text-center mb-10">
                    <span className="text-slate-500 font-bold tracking-[0.2em] uppercase text-sm mb-2 block">Travel Guide</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Visitor Information</h1>
                    <p className="max-w-2xl mx-auto text-lg text-slate-600">
                        Everything you need to know for a safe, respectful, and exciting visit to La Trinidad.
                    </p>
                </div>
            </AnimatedElement>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border border-slate-100 sticky top-24 z-30">
                <div className="flex">
                    <button onClick={() => handleTabChange('culture')} className={tabClass('culture')}>
                        <i className="fas fa-book-open"></i> Culture & Norms
                    </button>
                    <button onClick={() => handleTabChange('events')} className={tabClass('events')}>
                        <i className="fas fa-calendar-alt"></i> Events
                    </button>
                    <button onClick={() => handleTabChange('emergency')} className={tabClass('emergency')}>
                        <i className="fas fa-exclamation-circle"></i> Emergency
                    </button>
                </div>
            </div>

            {/* --- CULTURE TAB --- */}
            {activeTab === 'culture' && (
                <div className="animate-fade-in">
                    {/* Inayan Feature */}
                    <AnimatedElement>
                        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-10 border-l-8 border-lt-blue relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-lt-blue/10 rounded-full opacity-50 blur-3xl"></div>
                            <div className="grid md:grid-cols-3 gap-8 items-center relative z-10">
                                <div className="md:col-span-1 text-center md:text-left">
                                    <h2 className="text-5xl font-extrabold text-lt-blue mb-2 font-serif">Inayan</h2>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Core Value</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-slate-700 text-lg leading-relaxed italic">
                                        "Inayan" is a deep-rooted Cordilleran belief acting as a moral compass. It basically means preventing oneself from doing bad to others or the environment out of fear of a supreme being. When you visit, keep <span className="font-bold text-lt-blue">Inayan</span> in mind—respect the land and its people.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </AnimatedElement>

                    {/* Norms Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {LOCAL_NORMS.map((norm, index) => (
                            <AnimatedElement key={index} delay={index * 100}>
                                <div className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col group border border-slate-100 hover:border-lt-blue relative overflow-hidden">
                                    <div className="w-14 h-14 bg-lt-blue/10 text-lt-blue rounded-2xl flex items-center justify-center text-2xl mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                                        <i className={norm.icon}></i>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-lt-blue transition-colors">{norm.title}</h3>
                                    <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">{norm.description}</p>
                                    <div className="bg-slate-50 rounded-xl p-4 group-hover:bg-slate-100 transition-colors border border-slate-100">
                                        <ul className="space-y-2">
                                            {norm.points.map((point, i) => (
                                                <li key={i} className="flex items-start text-xs text-slate-600">
                                                    <i className="fas fa-check text-lt-blue mt-1 mr-2"></i>
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </AnimatedElement>
                        ))}
                    </div>
                </div>
            )}

            {/* --- EVENTS TAB --- */}
            {activeTab === 'events' && (
                <div className="animate-fade-in">
                    <AnimatedElement>
                        <div className="bg-gradient-to-r from-lt-yellow to-lt-orange rounded-3xl p-8 text-center text-slate-900 mb-10 shadow-xl">
                            <h2 className="text-3xl font-bold mb-2">Festivities & Celebrations</h2>
                            <p className="opacity-80 font-medium">Join the vibrant community gatherings of La Trinidad.</p>
                        </div>
                    </AnimatedElement>

                    {isLoadingEvents ? (
                        <div className="text-center py-20">
                            <i className="fas fa-spinner fa-spin text-4xl text-lt-orange"></i>
                            <p className="mt-4 text-slate-500">Loading upcoming events...</p>
                        </div>
                    ) : eventsError ? (
                        <div className="text-center text-red-500 py-10 bg-red-50 rounded-xl border border-red-200">
                            <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
                            <p>{eventsError}</p>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-slate-200">
                            <p>No events scheduled at the moment.</p>
                            <p className="text-xs mt-2">(Developer: Run `npm run seed` to populate data)</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {events.map((event, index) => (
                                <AnimatedElement key={event._id || index} delay={index * 150}>
                                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row h-full border border-slate-100 hover:shadow-2xl transition-shadow duration-300 group">
                                        <div className="w-full md:w-2/5 relative h-48 md:h-auto overflow-hidden">
                                            <img src={event.image} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-lt-yellow/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase">
                                                    {event.badge}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6 w-full md:w-3/5 flex flex-col justify-center">
                                            <div className="text-lt-orange font-bold text-sm mb-1 uppercase tracking-wide">{event.date}</div>
                                            <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-lt-orange transition-colors">{event.title}</h3>
                                            <p className="text-slate-600 text-sm mb-4">{event.description}</p>
                                            <div className="mt-auto flex items-center text-xs text-slate-500 font-medium">
                                                <i className="fas fa-map-pin mr-2 text-lt-blue"></i> {event.location}
                                            </div>
                                        </div>
                                    </div>
                                </AnimatedElement>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- EMERGENCY TAB --- */}
            {activeTab === 'emergency' && (
                <div className="animate-fade-in">
                    {/* Hotlines */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {EMERGENCY_HOTLINES.map((hotline, index) => (
                            <a 
                                key={index} 
                                href={hotline.href}
                                className="bg-white border-2 border-lt-red/10 hover:border-lt-red hover:bg-red-50 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center group"
                            >
                                <i className="fas fa-phone-alt text-2xl text-lt-red mb-2 group-hover:scale-110 transition-transform"></i>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">{hotline.label}</span>
                                <span className="text-lg font-extrabold text-slate-900">{hotline.number}</span>
                            </a>
                        ))}
                    </div>

                    {/* Split Map View */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                        {/* Filter & List */}
                        <div className="lg:col-span-1 flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                            <div className="p-4 bg-slate-50 border-b border-slate-200">
                                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                    {(['All', 'Hospital', 'Police', 'Fire Station', 'Rescue', 'Vet', 'Pharmacy'] as const).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setEmergencyFilter(f)}
                                            className={`whitespace-nowrap flex-shrink-0 py-1.5 px-3 rounded-lg text-xs font-bold transition-all duration-200 ${
                                                emergencyFilter === f 
                                                ? 'bg-lt-red text-white shadow-md' 
                                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                            }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                {filteredContacts.map((contact, index) => (
                                    <div 
                                        key={index}
                                        onClick={() => setSelectedContact(contact)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                                            selectedContact.name === contact.name 
                                            ? 'border-lt-red bg-red-50' 
                                            : 'border-slate-100 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-lt-red/10 text-lt-red flex items-center justify-center shrink-0">
                                                <i className="fas fa-paw" style={{ display: contact.type === 'Vet' ? 'block' : 'none' }}></i>
                                                <i className="fas fa-pills" style={{ display: contact.type === 'Pharmacy' ? 'block' : 'none' }}></i>
                                                <i className="fas fa-fire-extinguisher" style={{ display: contact.type === 'Fire Station' ? 'block' : 'none' }}></i>
                                                <i className="fas fa-life-ring" style={{ display: contact.type === 'Rescue' ? 'block' : 'none' }}></i>
                                                <i className="fas fa-hospital" style={{ display: contact.type === 'Hospital' ? 'block' : 'none' }}></i>
                                                <i className="fas fa-shield-alt" style={{ display: contact.type === 'Police' ? 'block' : 'none' }}></i>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-sm">{contact.name}</h3>
                                                <div className="flex items-center mt-2 gap-2">
                                                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500">{contact.type}</span>
                                                    <a href={`tel:${contact.phone.split('/')[0].trim()}`} className="text-[10px] bg-lt-red text-white px-2 py-0.5 rounded hover:bg-red-700 transition-colors font-bold" onClick={(e) => e.stopPropagation()}>Call</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Map */}
                        <div className="lg:col-span-2 bg-slate-200 rounded-2xl shadow-xl overflow-hidden relative">
                            <iframe
                                key={selectedContact.name}
                                src={selectedContact.mapUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                title={`Map of ${selectedContact.name}`}
                                className="w-full h-full"
                            ></iframe>
                            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg border border-slate-200 flex items-center gap-3 max-w-md">
                                <div className="w-10 h-10 bg-lt-red text-white rounded-full flex items-center justify-center shadow-sm">
                                    <i className={selectedContact.icon}></i>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Selected Location</p>
                                    <h3 className="font-bold text-slate-900 text-sm">{selectedContact.name}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    </section>
  );
};

export default VisitorInfoPage;
