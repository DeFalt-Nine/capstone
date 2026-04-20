
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import AnimatedElement from '../components/AnimatedElement';
import IntroAnimation from '../components/IntroAnimation';
import ParallaxElement from '../components/ParallaxElement';
import { fetchSiteSettings } from '../services/apiService';

const MORPHING_WORDS = ["Discover", "Explore", "Enjoy", "Love"];

const DEFAULT_HERO_IMAGES = [
    {
        url: 'https://images.unsplash.com/photo-1536481046830-9b11bb07e8b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQaGlsaXBwaW5lcyUyMG1vdW50YWluJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2MTgyNjY5N3ww&ixlib=rb-4.1.0&q=80&w=1920',
        alt: 'Sea of Clouds'
    },
    {
        url: 'https://images.unsplash.com/photo-1627346850259-33b6833eb882?q=80&w=1920&auto=format&fit=crop',
        alt: 'Strawberry Farm'
    },
    {
        url: 'https://images.unsplash.com/photo-1610410196774-728b7e7a8e79?q=80&w=1920&auto=format&fit=crop',
        alt: 'Stobosa Mural'
    }
];

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [heroImages, setHeroImages] = useState(DEFAULT_HERO_IMAGES);
    const [heroWelcomeText, setHeroWelcomeText] = useState("Welcome to the Valley of Colors");
    const [heroTitle, setHeroTitle] = useState("Limitless La Trinidad");
    const [heroSubtitle, setHeroSubtitle] = useState("Experience the Philippines' Strawberry Capital. A highland haven of culture, nature, and fresh flavors.");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [wordIndex, setWordIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const heroTextRef = useRef<HTMLDivElement>(null);

    // Fetch Site Settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await fetchSiteSettings();
                if (settings && settings.home) {
                    setHeroWelcomeText(settings.home.heroWelcomeText);
                    setHeroTitle(settings.home.heroTitle || "Limitless La Trinidad");
                    setHeroSubtitle(settings.home.heroSubtitle);
                    if (settings.home.heroImages && settings.home.heroImages.length > 0) {
                        setHeroImages(settings.home.heroImages);
                    }
                }
            } catch (error) {
                console.error('Failed to load site settings', error);
            }
        };
        loadSettings();
    }, []);

    // Word Morphing for the top line
    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setWordIndex(prev => (prev + 1) % MORPHING_WORDS.length);
                setIsAnimating(false);
            }, 400); // halfway through animation, swap the word
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Hero Text Stagger
    useEffect(() => {
        const { current: heroText } = heroTextRef;
        if (heroText) {
            const hasSeenIntro = sessionStorage.getItem('hasSeenIntro') === 'true';
            const delay = hasSeenIntro ? 0.2 : 2.5;

            const { children } = heroText;
            gsap.fromTo(
                children,
                { opacity: 0, y: 50, scale: 0.8 },
                { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1, 
                    duration: 1.2, 
                    stagger: 0.2, 
                    ease: 'back.out(1.7)',
                    delay: delay
                }
            );
        }
    }, []);

    // Image rotation logic
    useEffect(() => {
        const { length } = heroImages;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % length);
        }, 6000); // Change image every 6 seconds

        return () => clearInterval(interval);
    }, [heroImages]);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Cinematic Entry Animation */}
            <IntroAnimation />

            {/* --- Hero Section --- */}
            <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-900">
                
                {/* Dynamic Background Slideshow */}
                {heroImages.map(({ url, alt }, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <img
                            src={url}
                            alt={alt}
                            className={`w-full h-full object-cover ${index === currentImageIndex ? 'animate-ken-burns' : ''}`}
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-900/30"></div>
                    </div>
                ))}

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto" ref={heroTextRef}>
                    <div>
                        <h2 className="text-lt-yellow font-bold tracking-[0.3em] uppercase text-sm md:text-base mb-4 drop-shadow-md">
                            {heroWelcomeText}
                        </h2>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg flex flex-col items-center">
                            <span 
                                className="block opacity-90"
                                style={{ 
                                    transition: 'opacity 0.4s ease, transform 0.4s ease, filter 0.4s ease',
                                    opacity: isAnimating ? 0 : 1,
                                    transform: isAnimating ? 'translateY(-20px)' : 'translateY(0)',
                                    filter: isAnimating ? 'blur(8px)' : 'blur(0px)'
                                }}
                            >
                                {MORPHING_WORDS[wordIndex]}
                            </span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-lt-orange to-lt-yellow text-center">
                                {heroTitle}
                            </span>
                        </h1>
                    </div>
                    
                    <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto font-light drop-shadow-sm">
                        {heroSubtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button 
                            onClick={() => navigate('/tourist-spots')}
                            className="btn-shine bg-lt-yellow hover:bg-white text-slate-900 font-bold py-4 px-8 rounded-full shadow-lg shadow-lt-yellow/30 transform transition-all hover:-translate-y-1 hover:scale-105 active:scale-95 w-full sm:w-auto"
                        >
                            Start Exploring
                        </button>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <i className="fas fa-chevron-down text-white/70 text-2xl"></i>
                </div>
            </section>

            {/* --- Features Section --- */}
            <section id="features" className="py-24 bg-slate-50 relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-200/50 to-transparent opacity-50"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <AnimatedElement>
                        <div className="text-center mb-16">
                            <span className="text-lt-blue font-bold uppercase tracking-widest text-sm">Discover</span>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mt-2">Highlights of the Valley</h2>
                            <div className="w-24 h-1 bg-lt-yellow mx-auto mt-4 rounded-full"></div>
                        </div>
                    </AnimatedElement>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: 'fas fa-leaf',
                                title: 'Agri-Tourism',
                                desc: 'Pick fresh strawberries and vegetables straight from the farm.',
                                color: 'text-lt-moss',
                                bg: 'bg-lt-moss/10',
                                border: 'border-lt-moss/20',
                                direction: 'left' as const,
                                rotate: -5
                            },
                            {
                                icon: 'fas fa-palette',
                                title: 'Art & Culture',
                                desc: 'Witness the giant Stobosa mural and rich Ibaloi heritage.',
                                color: 'text-lt-blue',
                                bg: 'bg-lt-blue/10',
                                border: 'border-lt-blue/20',
                                direction: 'up' as const,
                                rotate: 0
                            },
                            {
                                icon: 'fas fa-utensils',
                                title: 'Local Flavors',
                                desc: 'Taste the sweetness of strawberry taho, wine, and cakes.',
                                color: 'text-lt-red',
                                bg: 'bg-lt-red/10',
                                border: 'border-lt-red/20',
                                direction: 'right' as const,
                                rotate: 5
                            }
                        ].map(({ direction, rotate, bg, color, border, icon, title, desc }, i) => (
                            <AnimatedElement 
                                key={i} 
                                delay={i * 150} 
                                direction={direction} 
                                distance={100} 
                                rotate={rotate}
                                scale={0.8}
                            >
                                <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 group h-full relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${bg} rounded-bl-full -mr-10 -mt-10 opacity-50 transition-transform group-hover:scale-110`}></div>
                                    <div className={`w-16 h-16 rounded-2xl ${bg} ${color} flex items-center justify-center text-3xl mb-6 shadow-sm border ${border}`}>
                                        <i className={icon}></i>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-lt-orange transition-colors">{title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{desc}</p>
                                </div>
                            </AnimatedElement>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA Section --- */}
            <section className="py-20 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <ParallaxElement speed={0.2}>
                        <AnimatedElement direction="none" duration={1.5} scale={0.5} rotate={2}>
                            <div className="bg-gradient-to-r from-lt-orange to-lt-yellow rounded-[3rem] p-12 md:p-20 text-center text-slate-900 shadow-2xl shadow-lt-orange/30 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                {/* Floating Bubbles */}
                                <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full animate-float"></div>
                                <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                                
                                <div className="relative z-10">
                                    <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Ready for your adventure?</h2>
                                    <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-80 font-medium">
                                        Let our AI guide help you plan the perfect itinerary for your trip to La Trinidad.
                                    </p>
                                    <button 
                                        onClick={() => document.querySelector<HTMLButtonElement>('button[aria-label="Open chatbot"]')?.click()}
                                        className="bg-white text-lt-orange hover:bg-slate-50 font-bold py-4 px-10 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95"
                                    >
                                        Chat with Guide
                                    </button>
                                </div>
                            </div>
                        </AnimatedElement>
                    </ParallaxElement>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
