
// Define the structure of an Intent
interface Intent {
  id: string;
  keywords: string[];
  response: string;
}

// The Knowledge Base
// We can easily add more intents here without touching the UI code
const INTENTS: Intent[] = [
  {
    id: 'greeting',
    keywords: ['hello', 'hi', 'good morning', 'good afternoon', 'hey', 'greetings'],
    response: "Hello! Welcome to La Trinidad, the Strawberry Capital! 🍓 How can I help you navigate the valley today?"
  },
  {
    id: 'transport',
    keywords: ['how to get', 'commute', 'jeepney', 'fare', 'taxi', 'bus', 'transportation', 'directions'],
    response: "🚗 **How to get here:**\nFrom Baguio City, go to the jeepney terminal near **City Hall** or **Centermall**. Look for jeepneys marked **'La Trinidad'** or **'Buyagan'**. Fare is approx. ₱13-15. Travel time is 30-45 mins."
  },
  {
    id: 'food',
    keywords: ['eat', 'food', 'restaurant', 'hungry', 'breakfast', 'lunch', 'dinner', 'dine', 'coffee'],
    response: "🍽️ **Where to eat:**\n1. **Jack's Restaurant** (Local favorite, affordable)\n2. **Lily of the Valley** (Organic, farm-to-table)\n3. **Mt. Kalugong Kape-an** (Coffee with a view)\n4. **Strawberry Farm Vendors** (Try the Strawberry Taho!)"
  },
  {
    id: 'pasalubong',
    keywords: ['buy', 'souvenir', 'pasalubong', 'market', 'bring home', 'gift', 'shop'],
    response: "🛍️ **Best Pasalubong:**\n1. **Fresh Strawberries** (Swamp Area)\n2. **Strawberry Wine & Jam**\n3. **Fresh Veggies** (Trading Post is cheapest!)\n4. **Ube Jam** (The best ones are often here!)"
  },
  {
    id: 'emergency',
    keywords: ['police', 'hospital', 'emergency', 'help', 'doctor', 'accident', 'hotline'],
    response: "🚑 **EMERGENCY CONTACTS:**\n\n👮 **Police:** (074) 422-2075\n🏥 **Benguet General Hospital:** (074) 422-2331\n\nDial **911** for immediate assistance."
  },
  {
    id: 'weather',
    keywords: ['weather', 'rain', 'sunny', 'best time', 'season', 'wear', 'climate'],
    response: "⛅ **Best Time to Visit:**\nNovember to April is the dry season. \n\n🍓 **Strawberry Peak:** December to February (It gets cold, so bring a jacket!)."
  },
  {
    id: 'activities',
    keywords: ['do', 'activity', 'schedule', 'itinerary', 'see', 'spots', 'tourist'],
    response: "📸 **Top Things to Do:**\n1. Pick Strawberries at the Farm\n2. Hike Mt. Kalugong or Mt. Yangbew\n3. Visit the Colors of Stobosa Mural\n4. Visit the Bell Church"
  },
  {
    id: 'thanks',
    keywords: ['thank', 'salamat', 'thanks', 'bye'],
    response: "You're welcome! Enjoy your trip to the Valley of Colors! 🌈🍓"
  }
];

export const analyzeIntent = (message: string): string | null => {
  const normalizedMessage = message.toLowerCase();

  // Check each intent
  for (const intent of INTENTS) {
    // If ANY of the keywords are found in the message
    const match = intent.keywords.some(keyword => normalizedMessage.includes(keyword));
    
    if (match) {
      return intent.response;
    }
  }

  // No intent matched
  return null;
};
