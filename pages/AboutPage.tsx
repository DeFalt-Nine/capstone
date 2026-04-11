
import React, { useState, useEffect } from 'react';
import { STATS, HISTORY_MILESTONES } from '../constants';
import AnimatedElement from '../components/AnimatedElement';
import { fetchSiteSettings } from '../services/apiService';

const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1594270433722-5b18f50b4a48?q=80&w=1920&auto=format&fit=crop";

const AboutPage: React.FC = () => {
  const [heroImage, setHeroImage] = useState(DEFAULT_HERO_IMAGE);
  const [heroTitle, setHeroTitle] = useState("About La Trinidad");
  const [heroSubtitle, setHeroSubtitle] = useState("The Strawberry Capital of the Philippines, where nature's bounty meets rich highland heritage.");
  const [storyTitle, setStoryTitle] = useState("Our Story");
  const [storyContent, setStoryContent] = useState("La Trinidad has a rich history dating back to the pre-colonial era. The municipality was named after Doña Trinidad de Leon, wife of the former Spanish Governor-General Narciso Claveria.\n\nToday, it serves as the vibrant capital of Benguet. It stands as a testament to the resilience and industriousness of its people, blending the traditions of the Ibaloi and Kankanaey with modern agricultural advancements.");
  const [journey, setJourney] = useState<any[]>([]);
  const [govSettings, setGovSettings] = useState<any>(null);

  useEffect(() => {
    const loadSettings = async () => {
        try {
            const settings = await fetchSiteSettings();
            if (settings && settings.about) {
                setHeroImage(settings.about.heroImage);
                setHeroTitle(settings.about.heroTitle);
                setHeroSubtitle(settings.about.heroSubtitle);
                setStoryTitle(settings.about.storyTitle);
                setStoryContent(settings.about.storyContent);
                setJourney(settings.about.journeyThroughTime || []);
                setGovSettings(settings.about.localGovernment);
            }
        } catch (error) {
            console.error('Failed to load site settings', error);
        }
    };
    loadSettings();
  }, []);

  return (
    <section id="about" className="bg-slate-50 overflow-hidden">
        {/* Hero Section */}
        <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
            <img 
                src={heroImage} 
                alt="La Trinidad Landscape" 
                className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
            />
            <div className="absolute inset-0 bg-slate-900/50"></div>
            <div className="relative z-10 text-center px-4">
                <AnimatedElement>
                    <span className="block text-lt-yellow font-bold tracking-widest uppercase mb-2 drop-shadow-sm">Discover</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">{heroTitle}</h1>
                    <p className="text-lg md:text-xl text-slate-100 max-w-2xl mx-auto font-light drop-shadow-md">
                        {heroSubtitle}
                    </p>
                </AnimatedElement>
            </div>
        </div>

        {/* Floating Stats */}
        <div className="container mx-auto px-4 relative z-20 -mt-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {STATS.map((stat, index) => (
                    <AnimatedElement 
                        key={index} 
                        delay={index * 100} 
                        direction="down" 
                        distance={30}
                        scale={0.5}
                        rotate={index % 2 === 0 ? -10 : 10}
                    >
                        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-xl text-center border border-slate-100 transform hover:-translate-y-1 transition-transform duration-300 h-full group">
                            <i className={`${stat.icon} text-3xl text-lt-orange mb-3 group-hover:text-lt-red transition-colors`}></i>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-lg md:text-xl font-extrabold text-slate-800 mt-1">{stat.value}</p>
                        </div>
                    </AnimatedElement>
                ))}
            </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
            
            {/* Our Story */}
            <div className="max-w-4xl mx-auto mb-24 text-center">
                <AnimatedElement delay={200}>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8 relative inline-block">
                        {storyTitle}
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-lt-orange rounded-full translate-y-3"></span>
                    </h2>
                    <div className="prose prose-lg text-slate-600 mx-auto">
                        {storyContent.split('\n\n').map((para, i) => (
                            <p key={i} className="leading-relaxed mb-6">
                                {para}
                            </p>
                        ))}
                    </div>
                </AnimatedElement>
            </div>

            {/* History Timeline Section */}
            <div className="mb-24 relative">
                <AnimatedElement>
                    <div className="text-center mb-16">
                        <span className="text-lt-blue font-bold uppercase tracking-widest text-sm">Timeline</span>
                        <h2 className="text-4xl font-bold text-slate-900 mt-2">Journey Through Time</h2>
                        <div className="w-24 h-1 bg-lt-yellow mx-auto mt-4 rounded-full"></div>
                    </div>
                </AnimatedElement>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Center Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-lt-moss/30 rounded-full hidden md:block"></div>
                    
                    {(journey.length > 0 ? journey : HISTORY_MILESTONES).map((event, index) => (
                        <AnimatedElement 
                            key={index} 
                            delay={index * 150} 
                            direction={index % 2 === 0 ? 'right' : 'left'} 
                            distance={100}
                            scale={0.8}
                            rotate={index % 2 === 0 ? 5 : -5}
                        >
                            <div className={`flex flex-col md:flex-row items-center mb-12 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                
                                {/* Content Card */}
                                <div className="w-full md:w-5/12 group">
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-2xl hover:border-lt-yellow transition-all duration-300 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-lt-yellow/10 rounded-bl-full -mr-4 -mt-4 transition-colors group-hover:bg-lt-yellow/20"></div>
                                        
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-3xl font-bold text-lt-moss/20 absolute right-4 top-4">{event.year}</span>
                                            <div className="w-10 h-10 bg-lt-orange/10 text-lt-orange rounded-full flex items-center justify-center border border-lt-orange/20">
                                                <i className={event.icon || 'fas fa-history'}></i>
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-800">{event.title}</h3>
                                        </div>
                                        
                                        <p className="text-slate-600 text-sm leading-relaxed mb-4">{event.content || event.description}</p>
                                        
                                        {event.image && (
                                            <div className="h-48 w-full rounded-lg overflow-hidden relative">
                                                <img src={event.image} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                                <span className="absolute bottom-2 left-3 text-white text-xs font-bold bg-black/30 px-2 py-1 rounded backdrop-blur-sm">{event.year}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Center Node (Timeline Dot) */}
                                <div className="w-full md:w-2/12 flex justify-center items-center my-4 md:my-0 relative">
                                    <div className="w-8 h-8 rounded-full bg-lt-moss border-4 border-white shadow-md z-10 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                    {/* Mobile Line (only visible on small screens connecting nodes vertically) */}
                                    <div className="absolute h-full w-1 bg-lt-moss/30 -z-10 md:hidden top-0"></div>
                                </div>

                                {/* Empty Space for Alignment */}
                                <div className="w-full md:w-5/12"></div>
                            </div>
                        </AnimatedElement>
                    ))}
                </div>
            </div>

            {/* Why Visit Section */}
            <AnimatedElement delay={300} direction="up" distance={40}>
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-24 border border-slate-100">
                    <div className="text-center mb-12">
                         <h2 className="text-3xl font-bold text-slate-800">Why Visit Us?</h2>
                         <p className="text-slate-500 mt-2">More than just strawberries, we offer an experience.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-6 rounded-xl shadow-sm flex items-start space-x-4 border border-slate-100">
                            <div className="bg-green-100 p-3 rounded-full flex-shrink-0 text-green-600">
                                <i className="fas fa-seedling text-xl"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">Agri-Tourism Haven</h4>
                                <p className="text-slate-600 text-sm mt-1">Experience picking fresh strawberries and vegetables straight from the source.</p>
                            </div>
                        </div>
                         <div className="bg-slate-50 p-6 rounded-xl shadow-sm flex items-start space-x-4 border border-slate-100">
                            <div className="bg-sky-100 p-3 rounded-full flex-shrink-0 text-sky-600">
                                <i className="fas fa-cloud-sun text-xl"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">Cool Mountain Breeze</h4>
                                <p className="text-slate-600 text-sm mt-1">Escape the tropical heat and enjoy our refreshing highland climate year-round.</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-xl shadow-sm flex items-start space-x-4 border border-slate-100">
                            <div className="bg-rose-100 p-3 rounded-full flex-shrink-0 text-rose-600">
                                <i className="fas fa-camera text-xl"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">Visual Delights</h4>
                                <p className="text-slate-600 text-sm mt-1">From colorful flower gardens to giant community murals, every corner is picture-perfect.</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-xl shadow-sm flex items-start space-x-4 border border-slate-100">
                            <div className="bg-amber-100 p-3 rounded-full flex-shrink-0 text-amber-600">
                                <i className="fas fa-praying-hands text-xl"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">Cultural Immersion</h4>
                                <p className="text-slate-600 text-sm mt-1">Learn about the indigenous Ibaloi and Kankanaey cultures and traditions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedElement>

            {/* Government Section */}
            <AnimatedElement delay={400}>
                <div className="relative rounded-3xl overflow-hidden bg-lt-blue text-white shadow-2xl shadow-lt-blue/30">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10 grid md:grid-cols-2 gap-0">
                        <div className="p-10 md:p-16 flex flex-col justify-center order-2 md:order-1">
                            <div className="flex items-center gap-3 mb-4 text-lt-yellow">
                                <i className="fas fa-landmark text-2xl"></i>
                                <span className="uppercase tracking-widest font-bold text-sm">The Local Government</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">{govSettings?.title || "Capital of Benguet"}</h2>
                            <div className="prose prose-invert prose-lg text-white/90 leading-relaxed mb-8">
                                {(govSettings?.content || "As the capital municipality of Benguet province, La Trinidad serves as the political, educational, and commercial hub of the Cordillera Administrative Region.\n\nThe Municipal Government, led by the Mayor and the Sangguniang Bayan, works tirelessly to balance rapid urbanization with the preservation of its rich Ibaloi culture and fragile mountain ecosystem.").split('\n\n').map((para: string, i: number) => (
                                    <p key={i} className="mb-4">{para}</p>
                                ))}
                            </div>
                            
                            {govSettings?.officials && govSettings.officials.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                                    {govSettings.officials.map((official: any, idx: number) => (
                                        <div key={idx} className="text-center group">
                                            <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-white/20 mb-2 group-hover:border-lt-yellow transition-colors">
                                                <img src={official.image || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop"} alt={official.name} className="w-full h-full object-cover" />
                                            </div>
                                            <p className="text-xs font-bold text-white truncate">{official.name}</p>
                                            <p className="text-[10px] text-white/60 truncate">{official.position}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lt-yellow border border-white/20">
                                            <i className="fas fa-flag"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Public Service</h4>
                                            <p className="text-sm text-white/70">Committed to transparency, efficiency, and good governance.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lt-yellow border border-white/20">
                                            <i className="fas fa-leaf"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Sustainable Vision</h4>
                                            <p className="text-sm text-white/70">Pioneering organic agriculture and eco-tourism initiatives.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Right Column: Visual with Official Logo */}
                        <div className="relative min-h-[300px] md:min-h-full group order-1 md:order-2 bg-gradient-to-br from-slate-700 to-lt-blue flex items-center justify-center p-10">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/woven.png')]"></div>
                            
                            {/* Official LGU Logo */}
                            <img 
                                src={govSettings?.image || "https://ltdrrmo.ph/wp-content/uploads/2021/05/lt-lg-logo.png"} 
                                alt="La Trinidad Municipal Logo" 
                                className="w-64 h-64 object-contain drop-shadow-2xl relative z-10 filter hover:brightness-110 transition-all duration-300 transform group-hover:scale-105"
                            />

                            <div className="absolute bottom-0 left-0 p-8 bg-gradient-to-t from-black/40 to-transparent w-full z-20">
                                <p className="font-bold text-white text-lg">Municipal Hall</p>
                                <p className="text-lt-yellow text-sm">Km. 5, La Trinidad, Benguet</p>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedElement>
        </div>
    </section>
  );
};

export default AboutPage;
