import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { fetchLocalEvents, fetchTouristSpots, fetchDiningSpots } from '../services/apiService';
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

const Mascot: React.FC = () => {
    const navigate = useNavigate();
    const [upcomingEvent, setUpcomingEvent] = useState<LocalEvent | null>(null);
    const [eventStatus, setEventStatus] = useState<{ type: 'now' | 'upcoming', days?: number } | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isBubbleVisible, setIsBubbleVisible] = useState(true);
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
        
        // Show mascot faster if returning
        if (hasSeenIntro) {
            setIsVisible(true);
        } else {
            // Wait for intro on first visit
            setTimeout(() => setIsVisible(true), 3000);
        }

        const initMascot = async () => {
            try {
                const randomVibe = VIBES[Math.floor(Math.random() * VIBES.length)];
                setCurrentVibe(randomVibe);

                let events = await fetchLocalEvents();
                if (!events || events.length === 0) {
                    // Fallback to static events if API is empty
                    const { LOCAL_EVENTS } = await import('../constants');
                    events = LOCAL_EVENTS;
                }

                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth();

                // Helper to parse event date into a comparable Date object
                const getEventDate = (event: LocalEvent, year: number) => {
                    const dateStr = event.date.toLowerCase();
                    const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
                    
                    let monthIndex = -1;
                    for (let i = 0; i < months.length; i++) {
                        if (dateStr.includes(months[i])) {
                            monthIndex = i;
                            break;
                        }
                    }

                    if (monthIndex === -1) return null;

                    const dayMatch = dateStr.match(/\d+/);
                    const day = dayMatch ? parseInt(dayMatch[0]) : 1;

                    return new Date(year, monthIndex, day);
                };

                // Find all future events (including those later this month)
                const futureEvents = events.map(event => {
                    let eventDate = getEventDate(event, currentYear);
                    if (!eventDate) return null;

                    // If event has passed this year, check next year
                    // But if it's a month-long event and it's the current month, it's "now"
                    const isMonthLong = event.date.toLowerCase().includes('month-long');
                    const isCurrentMonth = eventDate.getMonth() === currentMonth;

                    if (eventDate < now && !isMonthLong && !isCurrentMonth) {
                        eventDate = getEventDate(event, currentYear + 1);
                    }

                    return { event, date: eventDate };
                }).filter(e => e !== null) as { event: LocalEvent, date: Date }[];

                // Sort by date
                futureEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

                const nearest = futureEvents[0];

                if (nearest) {
                    setUpcomingEvent(nearest.event);
                    
                    const isMonthLong = nearest.event.date.toLowerCase().includes('month-long');
                    const isCurrentMonth = nearest.date.getMonth() === currentMonth;
                    
                    if (isMonthLong && isCurrentMonth) {
                        setEventStatus({ type: 'now' });
                    } else {
                        const diffTime = nearest.date.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays <= 0) {
                            setEventStatus({ type: 'now' });
                        } else {
                            setEventStatus({ type: 'upcoming', days: diffDays });
                        }
                    }
                }
            } catch (err) {
                console.error("Mascot init failed:", err);
            }
        };

        initMascot();
    }, []);

    useEffect(() => {
        if (isVisible && mascotRef.current) {
            gsap.fromTo(mascotRef.current, 
                { x: -100, opacity: 0 },
                { x: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)' }
            );
            
            if (bubbleRef.current && isBubbleVisible) {
                gsap.fromTo(bubbleRef.current,
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, delay: 0.8, duration: 0.5, ease: 'back.out(2)' }
                );
            }
        }
    }, [isVisible]);

    useEffect(() => {
        if (!mascotRef.current) return;

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
                                <>The <span className="text-lt-red font-black underline cursor-pointer" onClick={() => navigate(`/visitor-info?tab=events&event=${encodeURIComponent(upcomingEvent?.title || '')}`)}>
                                    {upcomingEvent?.title}
                                </span> is happening <span className="text-lt-red animate-pulse">RN!</span> See now or something else? 🍓</>
                            ) : upcomingEvent ? (
                                <>The <span className="text-lt-orange underline cursor-pointer" onClick={() => navigate(`/visitor-info?tab=events&event=${encodeURIComponent(upcomingEvent.title)}`)}>
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
                                        navigate(`/visitor-info?tab=events&event=${encodeURIComponent(upcomingEvent?.title || '')}`);
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
                    <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-lt-orange/30 hover:text-lt-orange/60 transition-colors animate-pulse p-4">
                        <i className="fas fa-chevron-right text-2xl"></i>
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
};

export default Mascot;
