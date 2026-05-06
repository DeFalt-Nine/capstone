import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { fetchLocalEvents, fetchTouristSpots, fetchDiningSpots } from '../services/apiService';
import { parseEventDates } from '../services/dateUtils';
import type { LocalEvent, TouristSpot } from '../types';

const VIBES = [
    { label: 'adventurous', category: 'Nature', type: 'tourist', icon: '🏔️' },
    { label: 'hungry', category: 'All', type: 'dining', icon: '🍔' },
    { label: 'cultural', category: 'Culture', type: 'tourist', icon: '🏛️' },
    { label: 'artistic', category: 'Art', type: 'tourist', icon: '🎨' },
    { label: 'shopping', category: 'Shopping', type: 'tourist', icon: '🛍️' },
];

const SURVEY_QUESTIONS = [
    {
        id: 'category',
        question: "What's the main plan for today?",
        options: [
            { label: 'Nature 🏔️', value: 'Nature' },
            { label: 'Culture 🏛️', value: 'Culture' },
            { label: 'Food 🍔', value: 'Dining' },
            { label: 'Shopping 🛍️', value: 'Shopping' }
        ]
    },
    {
        id: 'vibe',
        question: "How's the energy level?",
        options: [
            { label: 'Relaxed 🧘', value: 'relaxed' },
            { label: 'Active 🏃', value: 'active' }
        ]
    },
    {
        id: 'group',
        question: "Who are you exploring with?",
        options: [
            { label: 'Solo/Couple 👩‍❤️‍👨', value: 'small' },
            { label: 'Family/Group 👨‍👩‍👧‍👦', value: 'large' }
        ]
    },
    {
        id: 'time',
        question: "How long is your visit?",
        options: [
            { label: 'Quick stop ⏱️', value: 'short' },
            { label: 'Long stay 🌅', value: 'long' }
        ]
    },
    {
        id: 'budget',
        question: "Budget preference?",
        options: [
            { label: 'Budget-friendly 💸', value: 'budget' },
            { label: 'Any 💳', value: 'any' }
        ]
    }
];

export default function Mascot() {
    const navigate = useNavigate();
    const [upcomingEvent, setUpcomingEvent] = useState<LocalEvent | null>(null);
    const [eventStatus, setEventStatus] = useState<{ type: 'now' | 'upcoming', days?: number } | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isBubbleVisible, setIsBubbleVisible] = useState(() => {
        return localStorage.getItem('isMascotVisible') !== 'false';
    });
    const [currentVibe, setCurrentVibe] = useState(VIBES[0]);
    const [recommendations, setRecommendations] = useState<TouristSpot[]>([]);
    const [showOverlay, setShowOverlay] = useState(false);
    
    // Survey state
    const [isSurveying, setIsSurveying] = useState(false);
    const [surveyStep, setSurveyStep] = useState(0);
    const [surveyAnswers, setSurveyAnswers] = useState<Record<string, string>>({});
    const [matchCount, setMatchCount] = useState<number | null>(null);

    const mascotRef = useRef<HTMLDivElement>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateMatchCount = async () => {
            if (!isSurveying) return;
            try {
                const [touristSpots, diningSpots] = await Promise.all([
                    fetchTouristSpots(),
                    fetchDiningSpots()
                ]);
                const allSpots = [...touristSpots, ...diningSpots];
                
                // Simple count based on current answers
                const count = allSpots.filter(spot => {
                    if (surveyAnswers.category) {
                        if (surveyAnswers.category === 'Dining') {
                            if (!['Local Favorite', 'Fast Food', 'Cafe', 'Dining'].includes(spot.category)) return false;
                        } else if (spot.category !== surveyAnswers.category) return false;
                    }
                    return true;
                }).length;
                
                setMatchCount(count);
            } catch (err) {
                console.error("Match count failed:", err);
            }
        };

        updateMatchCount();
    }, [surveyAnswers, isSurveying]);

    useEffect(() => {
        const hasSeenIntro = sessionStorage.getItem('hasSeenIntro') === 'true';
        
        // Show mascot immediately
        setIsVisible(true);
        if (!hasSeenIntro) {
            sessionStorage.setItem('hasSeenIntro', 'true');
        }

        const initMascot = async () => {
            try {
                const randomVibe = VIBES[Math.floor(Math.random() * VIBES.length)];
                setCurrentVibe(randomVibe);

                let events = await fetchLocalEvents();
                if (!events || events.length === 0) {
                    const { LOCAL_EVENTS } = await import('../constants');
                    events = LOCAL_EVENTS;
                }

                const now = new Date();
                const nowTime = now.getTime();

                const evaluatedEvents = events.map(event => {
                    const dates = parseEventDates(event.date);
                    if (!dates) return null;

                    let start = dates.start.getTime();
                    let end = dates.end.getTime();

                    // If event has passed this year, check next year
                    if (nowTime > end) {
                        const nextYearStart = new Date(dates.start);
                        nextYearStart.setFullYear(nextYearStart.getFullYear() + 1);
                        const nextYearEnd = new Date(dates.end);
                        nextYearEnd.setFullYear(nextYearEnd.getFullYear() + 1);
                        start = nextYearStart.getTime();
                        end = nextYearEnd.getTime();
                    }

                    return { 
                        event, 
                        start, 
                        end,
                        isOngoing: nowTime >= start && nowTime <= end,
                        isUpcoming: nowTime < start
                    };
                }).filter(e => e !== null) as any[];

                const ongoing = evaluatedEvents.find(e => e.isOngoing);
                if (ongoing) {
                    setUpcomingEvent(ongoing.event);
                    setEventStatus({ type: 'now' });
                    return;
                }

                const upcomingEvents = evaluatedEvents
                    .filter(e => e.isUpcoming)
                    .sort((a, b) => a.start - b.start);

                if (upcomingEvents.length > 0) {
                    const nearest = upcomingEvents[0];
                    setUpcomingEvent(nearest.event);
                    const diffDays = Math.ceil((nearest.start - nowTime) / (1000 * 60 * 60 * 24));
                    setEventStatus({ type: 'upcoming', days: diffDays });
                }
            } catch (err) {
                console.error("Mascot init failed:", err);
            }
        };

        initMascot();
    }, []);

    useEffect(() => {
        if (isVisible && mascotRef.current) {
            // Initial Entrance - only if it hasn't happened yet
            gsap.fromTo(mascotRef.current, 
                { x: -160, opacity: 0 },
                { x: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)' }
            );
            
            if (bubbleRef.current) {
                gsap.fromTo(bubbleRef.current,
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, delay: 1, duration: 0.5, ease: 'back.out(2)' }
                );
            }
        }
    }, [isVisible]); // Remove isBubbleVisible from dependency array

    useEffect(() => {
        if (!mascotRef.current) return;

        localStorage.setItem('isMascotVisible', isBubbleVisible.toString());

        if (isBubbleVisible) {
            gsap.to(mascotRef.current, { x: 0, duration: 0.5, ease: 'power2.out' });
            if (bubbleRef.current) {
                gsap.fromTo(bubbleRef.current, 
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
                );
            }
        } else {
            // Tuck away completely to the left
            gsap.to(mascotRef.current, { x: -160, duration: 0.6, ease: 'power3.inOut' });
            if (bubbleRef.current) {
                gsap.to(bubbleRef.current, { scale: 0, opacity: 0, duration: 0.3 });
            }
            setShowOverlay(false);
        }
    }, [isBubbleVisible]);

    const handleVibeClick = async () => {
        try {
            const spots = currentVibe.type === 'tourist' 
                ? await fetchTouristSpots() 
                : await fetchDiningSpots();
            
            const filtered = spots
                .filter((s: TouristSpot) => currentVibe.category === 'All' || s.category === currentVibe.category)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
            
            setRecommendations(filtered);
            setShowOverlay(true);
            
            setTimeout(() => {
                if (overlayRef.current) {
                    gsap.fromTo(overlayRef.current,
                        { y: 20, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.4 }
                    );
                }
            }, 0);
        } catch (err) {
            console.error("Failed to fetch recommendations:", err);
        }
    };

    const startSurvey = () => {
        setIsSurveying(true);
        setSurveyStep(0);
        setSurveyAnswers({});
        setMatchCount(null);
        setShowOverlay(false);
    };

    const handleSurveyAnswer = async (value: string) => {
        const currentQuestion = SURVEY_QUESTIONS[surveyStep];
        const newAnswers = { ...surveyAnswers, [currentQuestion.id]: value };
        setSurveyAnswers(newAnswers);

        if (surveyStep < SURVEY_QUESTIONS.length - 1) {
            setSurveyStep(prev => prev + 1);
        } else {
            // Final step: Filter and show results
            setIsSurveying(false);
            await generateSurveyResults(newAnswers);
        }
    };

    const goBack = () => {
        if (surveyStep > 0) {
            setSurveyStep(prev => prev - 1);
            const newAnswers = { ...surveyAnswers };
            delete newAnswers[SURVEY_QUESTIONS[surveyStep-1].id];
            setSurveyAnswers(newAnswers);
        } else {
            setIsSurveying(false);
        }
    };

    const generateSurveyResults = async (answers: Record<string, string>) => {
        try {
            const [touristSpots, diningSpots] = await Promise.all([
                fetchTouristSpots(),
                fetchDiningSpots()
            ]);
            
            const allSpots = [...touristSpots, ...diningSpots];
            
            const filtered = allSpots.filter(spot => {
                // 1. Category filter
                if (answers.category === 'Dining') {
                    const isDining = ['Local Favorite', 'Fast Food', 'Cafe', 'Dining'].includes(spot.category);
                    if (!isDining) return false;
                } else if (answers.category !== 'All' && spot.category !== answers.category) {
                    return false;
                }

                // 2. Vibe/Description keyword filtering
                const desc = (spot.description || '').toLowerCase();
                const tags = spot.tags?.map(t => t.toLowerCase()) || [];
                const searchPool = desc + ' ' + tags.join(' ') + ' ' + spot.category.toLowerCase();
                
                if (answers.vibe === 'relaxed') {
                    const relaxedKeywords = ['peaceful', 'relax', 'quiet', 'calm', 'nature', 'view'];
                    if (!relaxedKeywords.some(k => searchPool.includes(k))) return false;
                }
                if (answers.vibe === 'active') {
                    const activeKeywords = ['hike', 'climb', 'walk', 'adventure', 'trek', 'explore'];
                    if (!activeKeywords.some(k => searchPool.includes(k))) return false;
                }
                
                if (answers.group === 'large') {
                    const groupKeywords = ['family', 'group', 'friends', 'spacious', 'park'];
                    if (!groupKeywords.some(k => searchPool.includes(k))) return false;
                }

                if (answers.time === 'short') {
                    // If it's a long hike, maybe skip?
                    if (desc.includes('long hike') || desc.includes('hours')) return false;
                }
                
                return true;
            });

            // Fallback if filtering is too strict - show random spots but prioritize the category
            let finalResults = filtered;
            if (finalResults.length === 0) {
                finalResults = allSpots
                    .filter(s => answers.category === 'All' || s.category === answers.category || (answers.category === 'Dining' && ['Local Favorite', 'Fast Food', 'Cafe'].includes(s.category)))
                    .sort(() => 0.5 - Math.random());
            }
            
            // If still empty, just show anything
            if (finalResults.length === 0) {
                finalResults = allSpots.sort(() => 0.5 - Math.random());
            }
            
            setRecommendations(finalResults.slice(0, 3));
            setShowOverlay(true);
            
            setTimeout(() => {
                if (overlayRef.current) {
                    gsap.fromTo(overlayRef.current,
                        { y: 20, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.4 }
                    );
                }
            }, 0);
        } catch (err) {
            console.error("Survey results failed:", err);
        }
    };

    const handleSpotClick = (spot: any) => {
        navigate(`/tourist-spots?spot=${encodeURIComponent(spot.name)}`);
        setShowOverlay(false);
    };

    if (!isVisible) return null;

    return (
        <div 
            ref={mascotRef}
            className="fixed bottom-8 left-8 z-[60] flex flex-col items-start group"
        >
            {/* Recommendations Overlay */}
            {showOverlay && (
                <div 
                    ref={overlayRef}
                    className="absolute bottom-full left-0 mb-6 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 w-[280px] overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                            {isSurveying ? "Matched for you" : "Top Picks for you"}
                        </h4>
                        <button onClick={() => setShowOverlay(false)} className="text-slate-400 hover:text-lt-red transition-colors">
                            <i className="fas fa-times text-xs"></i>
                        </button>
                    </div>
                    <div className="space-y-2">
                        {recommendations.map((spot, i) => (
                            <div 
                                key={spot._id || i}
                                onClick={() => handleSpotClick(spot)}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group/item border border-transparent hover:border-slate-100"
                            >
                                <img src={spot.image} alt={spot.name} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                                <div className="flex-grow min-w-0">
                                    <p className="text-[10px] font-bold text-slate-800 truncate group-hover/item:text-lt-orange transition-colors">{spot.name}</p>
                                    <p className="text-[8px] text-slate-500 truncate">{spot.category}</p>
                                </div>
                                <i className="fas fa-chevron-right text-[8px] text-slate-300 group-hover/item:translate-x-1 transition-transform"></i>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Speech Bubble */}
            <div 
                ref={bubbleRef}
                className={`bg-white p-4 rounded-2xl shadow-2xl border-2 border-lt-orange mb-4 w-[260px] relative animate-float ${!isBubbleVisible ? 'pointer-events-none' : ''}`}
            >
                {/* Close Button */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsBubbleVisible(false);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-lt-orange rounded-full flex items-center justify-center text-lt-orange hover:bg-lt-orange hover:text-white transition-all z-10 shadow-sm"
                >
                    <i className="fas fa-times text-[10px]"></i>
                </button>
                {isSurveying ? (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-lt-orange uppercase">Question {surveyStep + 1}/5</span>
                                {matchCount !== null && (
                                    <span className="text-[7px] text-slate-400 font-bold">{matchCount} spots matching...</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {surveyStep > 0 && (
                                    <button onClick={goBack} className="text-slate-400 hover:text-lt-orange transition-colors">
                                        <i className="fas fa-arrow-left text-[10px]"></i>
                                    </button>
                                )}
                                <button onClick={() => setIsSurveying(false)} className="text-slate-400 hover:text-lt-red transition-colors">
                                    <i className="fas fa-times text-[10px]"></i>
                                </button>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-tight">
                            {SURVEY_QUESTIONS[surveyStep].question}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {SURVEY_QUESTIONS[surveyStep].options.map((opt) => (
                                <button 
                                    key={opt.value}
                                    onClick={() => handleSurveyAnswer(opt.value)}
                                    className="bg-slate-50 hover:bg-lt-orange hover:text-white text-slate-700 text-[10px] font-bold py-2 px-2 rounded-lg transition-all border border-slate-100"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-800 leading-tight">
                            {eventStatus?.type === 'now' ? (
                                <>The <span className="text-lt-red font-black underline cursor-pointer" onClick={() => navigate(`/events?id=${encodeURIComponent(upcomingEvent?.title.toLowerCase().replace(/\s+/g, '-') || '')}`)}>
                                    {upcomingEvent?.title}
                                </span> is happening <span className="text-lt-red animate-pulse">RN!</span> See now or something else? 🍓</>
                            ) : upcomingEvent ? (
                                <>The <span className="text-lt-orange underline cursor-pointer" onClick={() => navigate(`/events?id=${encodeURIComponent(upcomingEvent.title.toLowerCase().replace(/\s+/g, '-') || '')}`)}>
                                    {upcomingEvent.title}
                                </span> is happening in <span className="text-lt-orange font-black">{eventStatus?.days === 1 ? '1 day' : `${eventStatus?.days} days`}!</span> While waiting, feeling <span className="text-lt-blue font-bold italic">{currentVibe.label}</span>? {currentVibe.icon}</>
                            ) : (
                                <>Welcome to La Trinidad! 🍓 While waiting for the next big event, feeling <span className="text-lt-blue font-bold italic">{currentVibe.label}</span>? {currentVibe.icon}</>
                            )}
                        </p>
                        
                        <div className="flex gap-2 pt-1">
                            <button 
                                onClick={eventStatus?.type === 'now' || (eventStatus?.type === 'upcoming' && !showOverlay) ? () => {
                                    if (eventStatus?.type === 'now') {
                                        navigate(`/events?id=${encodeURIComponent(upcomingEvent?.title.toLowerCase().replace(/\s+/g, '-') || '')}`);
                                    } else {
                                        handleVibeClick();
                                    }
                                } : handleVibeClick}
                                className="bg-lt-orange text-white text-[10px] font-bold px-4 py-1.5 rounded-full hover:scale-105 transition-transform shadow-md"
                            >
                                {eventStatus?.type === 'now' ? 'See Now!' : 'Yes, show me!'}
                            </button>
                            <button 
                                onClick={startSurvey}
                                className="bg-slate-100 text-slate-500 text-[10px] font-bold px-4 py-1.5 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                Something else?
                            </button>
                        </div>
                    </div>
                )}

                {/* Triangle */}
                <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-l-2 border-b-2 border-lt-orange -rotate-45"></div>
            </div>

            {/* Mascot Character (Cute Strawberry) */}
            <div 
                className="relative w-32 h-32 transform group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                onClick={() => {
                    if (!isBubbleVisible) {
                        setIsBubbleVisible(true);
                    } else {
                        navigate('/');
                    }
                }}
            >
                {/* Pop-out Arrow (Visible when tucked) */}
                {!isBubbleVisible && (
                    <div className="absolute -right-20 top-1/2 -translate-y-1/2 text-[#4ade80] hover:text-[#22c55e] transition-colors animate-pulse p-6 cursor-pointer">
                        <i className="fas fa-chevron-right text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"></i>
                    </div>
                )}
                <div className="w-full h-full drop-shadow-xl flex items-center justify-center">
                    <img src="/Mascot.png" alt="Mascot" className="w-full h-full object-contain" />
                </div>
                
                {/* Badge */}
                <div className="absolute -top-2 -left-2 bg-lt-yellow text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm border border-white uppercase whitespace-nowrap">
                    HEY THERE!
                </div>
            </div>
        </div>
    );
}
