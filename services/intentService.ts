// Define the structure of an Intent
interface Intent {
  id: string;
  priority: number; 
  keywords: string[];
  response: string | ((context: string | null, message: string) => string); 
  spotId?: string; 
}

/**
 * LIGHTWEIGHT CONVERSATION MEMORY
 */
let lastSpotId: string | null = null;

const TAXI_RULE = "\n\n🚖 **The 'Grey Taxi' Rule:**\n- **Grey Taxis** are local to La Trinidad. They can take you anywhere *inside* LT, but they are generally **prohibited from picking up passengers bound for Baguio City** due to boundary laws.\n- **White Taxis** (Baguio-based) can traverse both. If you are in LT and heading back to Baguio, you must wait for a White Taxi or take a Jeepney.";

/**
 * TAXI ESTIMATOR DATA STRUCTURES
 */
interface Landmark {
    id: string;
    name: string;
    keywords: string[];
}

interface TaxiRoute {
    landmarks: [string, string]; // IDs of the two landmarks
    distance: string;
    timeLight: string;
    timeHeavy: string;
    fareRange: string;
}

const LANDMARKS: Landmark[] = [
    { id: 'sm', name: 'SM Baguio / Session Rd', keywords: ['sm', 'session', 'post office', 'cathedral', 'city center'] },
    { id: 'strawberry', name: 'Strawberry Farm', keywords: ['strawberry', 'farm', 'picking', 'betag'] },
    { id: 'bellchurch', name: 'Bell Church', keywords: ['bell church', 'temple', 'chinese temple'] },
    { id: 'burnham', name: 'Burnham Park', keywords: ['burnham', 'lake', 'melvin jones'] },
    { id: 'kalugong', name: 'Mt. Kalugong', keywords: ['kalugong', 'limestone'] },
    { id: 'stobosa', name: 'Colors of Stobosa', keywords: ['stobosa', 'mural', 'painted houses', 'valley of colors'] },
    { id: 'minesview', name: 'Mines View Park', keywords: ['mines view', 'minesview'] },
    { id: 'cjh', name: 'Camp John Hay', keywords: ['john hay', 'cjh', 'technohub'] },
    { id: 'market', name: 'Baguio Market', keywords: ['market', 'public market', 'palengke'] },
    { id: 'bsu', name: 'BSU Campus', keywords: ['bsu', 'benguet state', 'university'] },
    { id: 'victory', name: 'Victory Liner', keywords: ['victory liner', 'victory terminal', 'bus station'] },
    { id: 'wright', name: 'Wright Park', keywords: ['wright park', 'horses', 'riding park'] },
    { id: 'yangbew', name: 'Mt. Yangbew', keywords: ['yangbew', 'jumbo'] },
    { id: 'town', name: 'LT Town Center', keywords: ['town center', 'municipality', 'km 5', 'km. 5'] }
];

const TAXI_ROUTES: TaxiRoute[] = [
    { landmarks: ['sm', 'strawberry'], distance: '6.2', timeLight: '15-20m', timeHeavy: '35-50m', fareRange: '₱140-₱180' },
    { landmarks: ['sm', 'bellchurch'], distance: '3.8', timeLight: '10-12m', timeHeavy: '20-30m', fareRange: '₱100-₱130' },
    { landmarks: ['burnham', 'town'], distance: '5.5', timeLight: '15-20m', timeHeavy: '30-45m', fareRange: '₱130-₱165' },
    { landmarks: ['burnham', 'kalugong'], distance: '7.8', timeLight: '25-30m', timeHeavy: '45-60m', fareRange: '₱170-₱220' },
    { landmarks: ['victory', 'strawberry'], distance: '7.5', timeLight: '20-25m', timeHeavy: '40-55m', fareRange: '₱160-₱210' },
    { landmarks: ['minesview', 'strawberry'], distance: '11.2', timeLight: '35-45m', timeHeavy: '60-90m', fareRange: '₱230-₱300' },
    { landmarks: ['cjh', 'strawberry'], distance: '9.5', timeLight: '30-40m', timeHeavy: '50-75m', fareRange: '₱200-₱260' },
    { landmarks: ['market', 'bsu'], distance: '5.0', timeLight: '12-18m', timeHeavy: '25-40m', fareRange: '₱120-₱155' },
    { landmarks: ['wright', 'bellchurch'], distance: '6.5', timeLight: '15-22m', timeHeavy: '30-45m', fareRange: '₱145-₱190' },
    { landmarks: ['sm', 'yangbew'], distance: '8.8', timeLight: '25-35m', timeHeavy: '45-65m', fareRange: '₱190-₱250' },
    { landmarks: ['sm', 'stobosa'], distance: '3.0', timeLight: '8-10m', timeHeavy: '15-25m', fareRange: '₱85-₱110' },
    { landmarks: ['town', 'sm'], distance: '6.0', timeLight: '15-20m', timeHeavy: '30-50m', fareRange: '₱140-₱190' }
];

const TERMINAL_INFO = "📍 **Jeepney Terminals in Baguio:**\n1. **Baguio City Hall** (Beside Fire Station) - Routes: 'Buyagan', 'Km. 5', 'Km. 6'.\n2. **Baguio Center Mall** (Lower Ground) - Very frequent LT bound jeeps.\n3. **Magsaysay Ave** (Near Slaughterhouse) - For 'Tawang' or 'Ambiong' jeeps.";

const handleTaxiEstimation = (message: string): string => {
    const lowerMsg = message.toLowerCase();
    const detectedLandmarks = LANDMARKS.filter(landmark => 
        landmark.keywords.some(keyword => lowerMsg.includes(keyword))
    );

    // Case 1: Two landmarks detected (Specific Route)
    if (detectedLandmarks.length >= 2) {
        const id1 = detectedLandmarks[0].id;
        const id2 = detectedLandmarks[1].id;
        
        const route = TAXI_ROUTES.find(r => 
            (r.landmarks[0] === id1 && r.landmarks[1] === id2) || 
            (r.landmarks[0] === id2 && r.landmarks[1] === id1)
        );

        if (route) {
            return `🚕 **Taxi Estimate Found!**\n\n**Route:** ${detectedLandmarks[0].name} ↔ ${detectedLandmarks[1].name}\n**Distance:** ~${route.distance} km\n**Fare Range:** ${route.fareRange}\n\n**Est. Time:**\n- 🟢 Light Traffic: **${route.timeLight}**\n- 🔴 Heavy Traffic: **${route.timeHeavy}**\n\n*Note: Metered rates include a ₱45 flag-down fee plus distance/time charges per LTFRB regulations.*${TAXI_RULE}`;
        }
    }

    // Case 2: One landmark detected (Default from City Center)
    if (detectedLandmarks.length === 1) {
        const target = detectedLandmarks[0];
        // If they asked for City Center specifically, give a general tip
        if (target.id === 'sm') {
            return "🚕 **Taxi from City Center:**\nTrips to La Trinidad spots like the Strawberry Farm usually cost **₱140-₱180**. Trips to Bell Church are around **₱100-₱120**." + TAXI_RULE;
        }

        const commonRoute = TAXI_ROUTES.find(r => r.landmarks.includes(target.id) && r.landmarks.includes('sm'));
        
        if (commonRoute) {
            return `🚕 **Taxi info for ${target.name}:**\n\nFrom Baguio City Center (SM/Session Area), the estimate is:\n**Fare:** ${commonRoute.fareRange}\n**Time:** ${commonRoute.timeLight} (up to ${commonRoute.timeHeavy} in traffic).\n\nDistance is roughly ${commonRoute.distance} km.${TAXI_RULE}`;
        }
    }

    // Case 3: Fallback (General info)
    return "🚕 **Taxi Estimator:**\nI can estimate fares and times for common routes! Try asking: *'How much from SM to Strawberry Farm?'* or *'Taxi price to Mt. Kalugong'*\n\nGenerally, trips between Baguio and La Trinidad cost between **₱100 to ₱250** depending on the specific spot." + TAXI_RULE;
};

const INTENTS: Intent[] = [
  {
    id: 'emergency',
    priority: 50,
    keywords: ['police', 'hospital', 'emergency', 'help', '911', 'accident'],
    response: "🚑 **EMERGENCY:**\n- Police: (074) 422-2075\n- Hospital (BeGH): (074) 422-2331\n- Rescue: (074) 422-0100"
  },
  {
    id: 'meta-taxi-estimator',
    priority: 49,
    keywords: ['how much', 'taxi fare', 'taxi price', 'taxi cost', 'taxi estimation', 'travel time', 'how long', 'duration', 'fare'],
    response: (_ctx, msg) => handleTaxiEstimation(msg)
  },
  {
    id: 'meta-hiking',
    priority: 48,
    keywords: ['mountain', 'hike', 'climb', 'trail', 'summit', 'peaks'],
    response: "⛰️ **Hiking in LT:**\nCheck out [[Mount Kalugong Cultural Village]] for views & coffee, or [[Mt. Yangbew]] for sunrises and horses!"
  },
  {
    id: 'spot-lt',
    priority: 45,
    keywords: ['la trinidad', 'the town', 'the valley'],
    response: "🏘️ [[La Trinidad]] is the bustling capital of Benguet! Famous as the 'Strawberry Capital' and the 'Salad Bowl of the Philippines.'\n\n" + TERMINAL_INFO
  },
  {
    id: 'meta-commute',
    priority: 35,
    keywords: ['how to get', 'commute', 'jeep', 'terminal', 'station', 'directions'],
    response: `🚌 **General Commute:**\n${TERMINAL_INFO}\n\nStandard jeep fare: **₱13.00**. ${TAXI_RULE}`
  },
  {
    id: 'greeting',
    priority: 10,
    keywords: ['hello', 'hi', 'hey', 'kumusta'],
    response: "Hello! 🍓 I'm your local guide. Ask me about **taxi fares from SM**, **jeepney terminals**, or **hiking spots**!"
  }
];

export const analyzeIntent = (message: string): string | null => {
  const normalizedMessage = message.toLowerCase().trim();
  if (normalizedMessage.length < 2) return null;

  const sortedIntents = [...INTENTS].sort((a, b) => b.priority - a.priority);

  for (const intent of sortedIntents) {
    const match = intent.keywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword}`, 'i');
      return regex.test(normalizedMessage);
    });
    
    if (match) {
      if (intent.spotId) lastSpotId = intent.spotId;
      if (typeof intent.response === 'function') return intent.response(lastSpotId, message);
      return intent.response;
    }
  }

  return null;
};