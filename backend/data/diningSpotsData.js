const diningSpots = [
  {
    image: 'https://thumbs.dreamstime.com/b/jollibee-restaurant-philippines-manila-november-people-visit-fast-food-operates-restaurants-167205155.jpg',
    alt: 'Jollibee Store Front',
    name: 'Jollibee - La Trinidad',
    description: 'The beloved Filipino fast-food chain known for its crispy Chickenjoy, sweet-style Jolly Spaghetti, and Yumburgers. A comforting stop for a quick and familiar meal.',
    location: 'Km. 5, Pico, La Trinidad, Benguet',
    history: 'A staple in the municipality, serving families and students from BSU for decades.',
    gallery: [
      'https://insideretail.asia/wp-content/uploads/2020/09/Jolibee.jpg',
      'https://i.pinimg.com/736x/30/a7/67/30a767e56bbfc379ed409eb85e400149.jpg'
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
    image: 'https://c0.wallpaperflare.com/preview/753/531/702/mcdonalds-store.jpg',
    alt: 'McDonalds Store',
    name: 'McDonald\'s - Km. 5',
    description: 'The world-famous golden arches offering Big Macs, fries, and coffee. A convenient meeting place located right in the heart of the commercial district.',
    location: 'Km. 5, Balili, La Trinidad',
    history: 'Brings global standards of fast food to the highlands.',
    gallery: [
      'https://i.pinimg.com/736x/2f/eb/ea/2febea27de9c8e8494c6fe8367b8e026.jpg'
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
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/5c/3b/01/best-selling-fried-chicken.jpg?w=900&h=-1&s=1',
    alt: 'Roasted Chicken Plate',
    name: 'Jack\'s Restaurant',
    description: 'The legendary local chain known for its "Jack\'s Rice" – a mountain of fried rice topped with chicken, pork, and veggies. Famous for huge servings at affordable prices.',
    location: 'Km. 4, La Trinidad',
    history: 'Started as a small eatery and grew into the most popular local chain in the Cordilleras, affectionately known as the "McDonalds of the Highlands" by locals.',
    gallery: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/9b/85/03/feast.jpg?w=600&h=400&s=1'
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
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/07/a0/d0/33/calajo-restaurant.jpg?w=900&h=500&s=1',
    alt: 'Filipino Feast',
    name: 'Calajo Restaurant',
    description: '"Calajo" means "Welcome" in Ibaloi. This restaurant serves authentic Cordilleran dishes like Pinikpikan, as well as Filipino favorites. Known for its cozy, rustic ambiance.',
    location: 'Km. 6, Betag, La Trinidad',
    history: 'Dedicated to preserving local culinary traditions.',
    gallery: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/07/a0/d0/02/calajo-restaurant.jpg?w=900&h=500&s=1'
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
    image: 'https://i.ytimg.com/vi/oSPRSJgCjBc/maxresdefault.jpg',
    alt: 'Coffee with mountain view',
    name: 'Mount Kalugong Kape-an',
    description: 'The reward after a hike. Sip on freshly brewed Benguet Arabica coffee and enjoy carrot cake while overlooking the entire La Trinidad valley from the top of a rock formation.',
    location: 'Mt. Kalugong Cultural Village',
    history: 'Built to provide refreshments to hikers and promote local coffee beans.',
    gallery: [
      'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEikJkTZLeRBZXCzzGe4vBx2fkoLV10NIDL6IB4UBRrxYncaZL48fOQLIsI3oW7FJuHSzc9yzltO6NWaLYIf39PsbqohbssbbupGEoEd1XKQiThXH7AmjDralC5L2Ov_KrvSQS1RZWKtj10L/w1200-h630-p-k-no-nu/21740358_1384508925003384_1594736941636937843_n.jpg'
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
    image: 'https://jontotheworld.com/wp-content/uploads/2022/02/Sizzling-Plate-1.jpg',
    alt: 'Burger and Fries',
    name: 'Sizzling Plate',
    description: 'Famous for their affordable steaks and sizzling sisig. A go-to spot for students and locals craving hearty meat dishes on a hot plate.',
    location: 'Km. 5, La Trinidad',
    history: 'A baguio-born brand that found a strong home in La Trinidad.',
    gallery: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/c1/78/02/img20191019161916-largejpg.jpg?w=800&h=800&s=1'
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

module.exports = diningSpots;