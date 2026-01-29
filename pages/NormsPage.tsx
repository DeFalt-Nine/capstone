import React from 'react';
import { LOCAL_NORMS } from '../constants';
import AnimatedElement from '../components/AnimatedElement';

const NormsPage: React.FC = () => {
  return (
    <section id="norms" className="min-h-screen bg-slate-50 overflow-hidden">
        {/* Cultural Hero Section - Uses lt-blue which is now Moss Green */}
        <div className="relative py-20 md:py-32 bg-lt-blue text-slate-100">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/woven.png')]"></div>
            <div className="container mx-auto px-4 text-center relative z-10">
                <AnimatedElement>
                    <span className="text-lt-yellow font-bold tracking-[0.2em] uppercase text-sm mb-2 block">Responsible Tourism</span>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Local Ways & Wisdom</h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90 font-light leading-relaxed">
                        To visit La Trinidad is to step into a home. We invite you to walk gently, respect our traditions, and embrace the spirit of the Cordilleras.
                    </p>
                </AnimatedElement>
            </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-20">
            
            {/* Featured Cultural Concept: Inayan */}
            <AnimatedElement>
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-16 border-t-8 border-lt-yellow relative overflow-hidden border-x border-b border-slate-100">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-lt-yellow/20 rounded-full opacity-50 blur-3xl"></div>
                    <div className="grid md:grid-cols-3 gap-8 items-center">
                        <div className="md:col-span-1 text-center md:text-left">
                            <h2 className="text-5xl font-extrabold text-lt-orange mb-2 font-serif">Inayan</h2>
                            <p className="text-sm font-bold text-lt-blue uppercase tracking-widest">Core Value</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-slate-700 text-lg leading-relaxed italic border-l-4 border-lt-yellow pl-6">
                                "Inayan" is a deep-rooted Cordilleran belief that acts as a moral compass. It essentially means holding back from doing something bad to others or the environment because of fear of supreme being or bad karma. When you visit, keep <span className="font-bold text-lt-orange">Inayan</span> in mind—do no harm to the land or its people.
                            </p>
                        </div>
                    </div>
                </div>
            </AnimatedElement>

            {/* Norms Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
                {/* Visual Header Card */}
                <div className="md:col-span-2 bg-[url('https://images.unsplash.com/photo-1594270433722-5b18f50b4a48?q=80&w=1080&auto=format&fit=crop')] bg-cover bg-center rounded-3xl shadow-lg relative group overflow-hidden min-h-[300px] border border-slate-200">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 p-8">
                        <h3 className="text-3xl font-bold text-white mb-2">The Guest's Guide</h3>
                        <p className="text-slate-200">Simple ways to show respect and make meaningful connections.</p>
                    </div>
                </div>

                {/* Norm Cards */}
                {LOCAL_NORMS.map((norm, index) => (
                    <AnimatedElement key={index} delay={index * 100} className="h-full">
                        <div className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col group border border-slate-100 hover:border-lt-yellow relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-4 -mt-4 transition-colors group-hover:bg-lt-yellow/10"></div>
                            
                            <div className="w-14 h-14 bg-lt-yellow/20 text-lt-orange rounded-2xl flex items-center justify-center text-2xl mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300 border border-lt-yellow/20">
                                <i className={norm.icon}></i>
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-lt-orange transition-colors">{norm.title}</h3>
                            <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">{norm.description}</p>
                            
                            <div className="bg-slate-50 rounded-xl p-4 group-hover:bg-slate-100 transition-colors border border-slate-100">
                                <ul className="space-y-2">
                                    {norm.points.map((point, i) => (
                                        <li key={i} className="flex items-start text-sm text-slate-600">
                                            <i className="fas fa-check-circle text-lt-blue mt-1 mr-2 text-xs"></i>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </AnimatedElement>
                ))}

                 {/* Tips Card */}
                 <div className="bg-gradient-to-br from-lt-blue to-slate-800 text-white p-8 rounded-3xl shadow-lg flex flex-col justify-center text-center border border-slate-700">
                    <i className="fas fa-lightbulb text-4xl text-lt-yellow mb-4 mx-auto"></i>
                    <h3 className="text-xl font-bold mb-2">Did You Know?</h3>
                    <p className="text-slate-300 text-sm">Most locals speak English, Tagalog, and Ilocano fluently. Don't be shy to ask for directions or recommendations!</p>
                </div>
            </div>
        </div>
    </section>
  );
};

export default NormsPage;