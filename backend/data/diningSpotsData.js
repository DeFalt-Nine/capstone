const diningSpots = [
  {
    image: 'https://images.unsplash.com/photo-1513639776629-9269d052130d?q=80&w=1080&auto=format&fit=crop',
    alt: 'Jollibee Store Front',
    name: 'Jollibee - La Trinidad',
    description: 'The beloved Filipino fast-food chain known for its crispy Chickenjoy, sweet-style Jolly Spaghetti, and Yumburgers. A comforting stop for a quick and familiar meal.',
    location: 'Km. 5, Pico, La Trinidad, Benguet',
    history: 'A staple in the municipality, serving families and students from BSU for decades.',
    gallery: [
      'https://images.unsplash.com/photo-1603083550439-2c044942d4b7?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '6:00 AM - 10:00 PM Daily',
    bestTimeToVisit: 'Lunch or Dinner',
    category: 'Fast Food',
    tags: ['Global Brand', 'Chickenjoy', 'Family Friendly', 'Drive-thru'],
    nearbyEmergency: [
      { type: 'Police', name: 'La Trinidad Police', distance: '2 mins' }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Jollibee%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1080&auto=format&fit=crop',
    alt: 'McDonalds Store',
    name: 'McDonald\'s - Km. 5',
    description: 'The world-famous golden arches offering Big Macs, fries, and coffee. A convenient meeting place located right in the heart of the commercial district.',
    location: 'Km. 5, Balili, La Trinidad',
    history: 'Brings global standards of fast food to the highlands.',
    gallery: [
      'https://images.unsplash.com/photo-1615939264093-9f22f792a479?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '24 Hours',
    bestTimeToVisit: 'Anytime',
    category: 'Fast Food',
    tags: ['Global Brand', 'Burgers', '24/7', 'Wifi'],
    nearbyEmergency: [
      { type: 'Police', name: 'La Trinidad Police', distance: '2 mins' }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=McDonalds%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1080&auto=format&fit=crop',
    alt: 'Roasted Chicken Plate',
    name: 'Jack\'s Restaurant',
    description: 'The legendary local chain known for its "Jack\'s Rice" – a mountain of fried rice topped with chicken, pork, and veggies. Famous for huge servings at affordable prices.',
    location: 'Km. 4, La Trinidad',
    history: 'Started as a small eatery and grew into the most popular local chain in the Cordilleras, affectionately known as the "McDonalds of the Highlands" by locals.',
    gallery: [
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '7:00 AM - 9:00 PM',
    bestTimeToVisit: 'Lunch (Come hungry!)',
    category: 'Local Favorite',
    tags: ['Budget Friendly', 'Huge Servings', 'Jack\'s Rice', 'Local Icon'],
    nearbyEmergency: [
      { type: 'Hospital', name: 'Benguet General Hospital', distance: '5 mins' }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Jacks%20Restaurant%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1080&auto=format&fit=crop',
    alt: 'Filipino Feast',
    name: 'Calajo Restaurant',
    description: '"Calajo" means "Welcome" in Ibaloi. This restaurant serves authentic Cordilleran dishes like Pinikpikan, as well as Filipino favorites. Known for its cozy, rustic ambiance.',
    location: 'Km. 6, Betag, La Trinidad',
    history: 'Dedicated to preserving local culinary traditions.',
    gallery: [
      'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '8:00 AM - 8:00 PM',
    bestTimeToVisit: 'Dinner',
    category: 'Local Favorite',
    tags: ['Authentic Food', 'Pinikpikan', 'Cozy', 'Family Style'],
    nearbyEmergency: [
      { type: 'Hospital', name: 'Cordillera Hospital', distance: '2 mins' }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Calajo%20Restaurant%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1080&auto=format&fit=crop',
    alt: 'Coffee with mountain view',
    name: 'Mount Kalugong Kape-an',
    description: 'The reward after a hike. Sip on freshly brewed Benguet Arabica coffee and enjoy carrot cake while overlooking the entire La Trinidad valley from the top of a rock formation.',
    location: 'Mt. Kalugong Cultural Village',
    history: 'Built to provide refreshments to hikers and promote local coffee beans.',
    gallery: [
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '6:00 AM - 6:00 PM',
    bestTimeToVisit: 'Sunset',
    category: 'Cafe',
    tags: ['Scenic View', 'Coffee', 'Cakes', 'Hike Required'],
    nearbyEmergency: [
      { type: 'Police', name: 'La Trinidad Police', distance: '20 mins (Hike)' }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Mt.%20Kalugong%20Cultural%20Village&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1080&auto=format&fit=crop',
    alt: 'Burger and Fries',
    name: 'Sizzling Plate',
    description: 'Famous for their affordable steaks and sizzling sisig. A go-to spot for students and locals craving hearty meat dishes on a hot plate.',
    location: 'Km. 5, La Trinidad',
    history: 'A baguio-born brand that found a strong home in La Trinidad.',
    gallery: [
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '9:00 AM - 8:00 PM',
    bestTimeToVisit: 'Lunch',
    category: 'Local Favorite',
    tags: ['Steak', 'Sizzling', 'Affordable', 'Casual'],
    nearbyEmergency: [
      { type: 'Police', name: 'La Trinidad Police', distance: '3 mins' }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Sizzling%20Plate%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
  }
];

export default diningSpots;
