
import React, { useState } from 'react';
import { EMERGENCY_CONTACTS, EMERGENCY_HOTLINES } from '../constants';
import AnimatedElement from '../components/AnimatedElement';

const EmergencyPage: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Hospital' | 'Police' | 'Fire Station' | 'Rescue' | 'Vet' | 'Pharmacy'>('All');
  const [selectedContact, setSelectedContact] = useState(EMERGENCY_CONTACTS[0]);

  const filteredContacts = EMERGENCY_CONTACTS.filter(
    (contact) => filter === 'All' || contact.type === filter
  );

  return (
    <section id="emergency" className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Header - Uses the new Dark Red (lt-red) */}
      <div className="bg-lt-red text-white pt-24 pb-12 rounded-b-[3rem] shadow-xl shadow-lt-red/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedElement>
            <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-full mb-4 animate-pulse border border-white/30">
                <i className="fas fa-ambulance text-2xl text-white"></i>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">Emergency Response</h1>
            <p className="text-white/90 max-w-xl mx-auto">
              Quick access to critical services in La Trinidad. Tap on a location below to view it on the map.
            </p>
          </AnimatedElement>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20 flex-grow pb-20">
        
        {/* Hotlines Dial Pad */}
        <AnimatedElement delay={100}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {EMERGENCY_HOTLINES.map((hotline, index) => (
                    <a 
                        key={index} 
                        href={hotline.href}
                        className="group bg-white/90 backdrop-blur-md border border-slate-100 p-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 flex flex-col items-center justify-center text-center transform hover:-translate-y-1"
                    >
                        <div className="w-10 h-10 bg-lt-red/10 text-lt-red rounded-full flex items-center justify-center mb-2 group-hover:bg-lt-red group-hover:text-white transition-colors border border-lt-red/20">
                            <i className="fas fa-phone-alt"></i>
                        </div>
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{hotline.label}</span>
                        <span className="text-xl font-bold text-slate-800">{hotline.number}</span>
                    </a>
                ))}
            </div>
        </AnimatedElement>

        {/* Main Content: Split View Map & List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-300px)] min-h-[600px]">
            
            {/* Left Column: List & Filters */}
            <div className="lg:col-span-1 flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                {/* Filter Tabs */}
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {(['All', 'Hospital', 'Police', 'Fire Station', 'Rescue', 'Vet', 'Pharmacy'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`whitespace-nowrap flex-shrink-0 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    filter === f 
                                    ? 'bg-lt-red text-white shadow-md' 
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white">
                    {filteredContacts.map((contact, index) => (
                        <div 
                            key={index}
                            onClick={() => setSelectedContact(contact)}
                            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                                selectedContact.name === contact.name 
                                ? 'border-lt-red bg-lt-red/5' 
                                : 'border-transparent bg-slate-50 hover:bg-slate-100'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 bg-lt-red`}>
                                    <i className={contact.icon}></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">{contact.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{contact.address}</p>
                                    <div className="mt-2 flex items-center gap-3">
                                        <a 
                                            href={`tel:${contact.phone.split('/')[0].trim()}`} 
                                            className="text-xs bg-lt-red text-white px-3 py-1.5 rounded-md hover:bg-red-600 font-bold shadow-sm transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <i className="fas fa-phone mr-1"></i> Call
                                        </a>
                                        <span className="text-xs text-lt-red font-medium bg-red-50 px-2 py-1 rounded border border-red-100">
                                            {contact.hours}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Interactive Map */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 relative h-full">
                <iframe
                    key={selectedContact.name} // Force re-render iframe on change
                    src={selectedContact.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map of ${selectedContact.name}`}
                    className="w-full h-full"
                ></iframe>
                
                {/* Floating Map Card Info */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 md:w-auto md:max-w-sm">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-md bg-lt-red`}>
                            <i className={selectedContact.icon}></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Selected Location</p>
                            <h3 className="font-bold text-slate-900 leading-tight">{selectedContact.name}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default EmergencyPage;
