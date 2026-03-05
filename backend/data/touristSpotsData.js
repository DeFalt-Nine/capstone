
const touristSpots = [
  {
    image: 'https://images.unsplash.com/photo-1627346850259-33b6833eb882?q=80&w=1080&auto=format&fit=crop',
    alt: 'Lush strawberry fields in La Trinidad with mountains in the background.',
    name: 'La Trinidad Strawberry Farm',
    description: "Famous for its vast strawberry fields where visitors can pick their own strawberries. It's the primary reason La Trinidad is known as the 'Strawberry Capital of the Philippines.' The farm also features vendors selling strawberry-based products like jam, ice cream, and wine.",
    location: 'Km. 5, La Trinidad, Benguet',
    history: "Established in the 1950s, the farm became a major agricultural and tourism hub, showcasing the valley's ideal conditions for growing strawberries and other produce. It is managed by the Benguet State University.",
    gallery: [
      'https://images.unsplash.com/photo-1594270433722-5b18f50b4a48?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587411737105-2207b1a32943?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549477089-3b652a6a5b9b?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '7:00 AM - 7:00 PM Daily',
    bestTimeToVisit: 'December to February (Peak Season)',
    category: 'Agri-tourism',
    tags: ['Family Friendly', 'Parking Available', 'Entrance Fee', 'Food Stalls'],
    jeepneyFare: '₱13.00',
    taxiFare: '₱150.00',
    terminalLocation: 'Baguio City Hall / Center Mall Terminal',
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 5-10 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 5-10 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=La%20Trinidad%20Strawberry%20Farm&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1644304677708-54b673678082?q=80&w=1080&auto=format&fit=crop',
    alt: 'Ornate Bell Church temple in La Trinidad with a pagoda.',
    name: 'Bell Church',
    description: 'A beautiful and serene Taoist temple complex with intricate architecture, pagodas, and ponds. It serves as a spiritual center for the local Chinese-Filipino community and is open to visitors seeking tranquility and a glimpse of different cultural practices.',
    location: 'Barangay Balili, La Trinidad, Benguet',
    history: 'Founded in the 1960s by Chinese immigrants, the Bell Church is a testament to the cultural fusion in the Cordilleras, blending Taoist, Buddhist, and Confucian principles. It was established to serve the spiritual needs of the growing Chinese community in the region.',
    gallery: [
      'https://images.unsplash.com/photo-1589332512160-57f64664a787?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618218712684-a8235e2361a4?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1557088737-56c556a00a18?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '8:00 AM - 5:00 PM Daily',
    bestTimeToVisit: 'Year-round, preferably on a sunny day.',
    category: 'Culture',
    tags: ['Religious Site', 'Photography', 'Free Entry', 'Gardens'],
    jeepneyFare: '₱13.00',
    taxiFare: '₱100.00',
    terminalLocation: 'Baguio City Hall / Magsaysay Terminal',
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 10-15 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 10-15 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Bell%20Church%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1599388136367-293427b50849?q=80&w=1080&auto=format&fit=crop',
    alt: 'Limestone rock formations atop Mount Kalugong with a view of the valley.',
    name: 'Mount Kalugong Cultural Village',
    description: "A beginner-friendly eco-park offering a short hike to limestone rock formations with panoramic views of the La Trinidad valley. It also features cultural huts, a coffee shop, and spots for picnics, making it a perfect spot for relaxation and light adventure.",
    location: 'Barangay Tawang, La Trinidad, Benguet',
    history: "The name 'Kalugong' means 'hat' in the local dialect, named after a prominent rock formation that resembles a hat. It is considered a sacred place by the Ibaloi people, with the park developed to preserve its natural beauty and cultural significance.",
    gallery: [
      'https://images.unsplash.com/photo-1519923884842-9971932c5e5f?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1569427971784-18c6d1f5e851?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605338270525-8623c21b9b13?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '6:00 AM - 6:00 PM Daily',
    bestTimeToVisit: 'Early morning for sunrise or late afternoon for sunset.',
    category: 'Nature',
    tags: ['Hiking', 'Coffee Shop', 'Panoramic View', 'Picnic Spot'],
    jeepneyFare: '₱13.00',
    taxiFare: '₱180.00',
    terminalLocation: 'Baguio City Hall / Center Mall Terminal',
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 15-20 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 15-20 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Mt.%20Kalugong%20Cultural%20Village&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1610410196774-728b7e7a8e79?q=80&w=1080&auto=format&fit=crop',
    alt: 'Vibrant houses of the Stobosa Hillside Homes Artwork forming a mural.',
    name: 'Colors of Stobosa',
    description: "A massive community art project where hundreds of houses on a hillside are painted to form a giant, colorful mural of sunflowers. It's a stunning sight from the main road and a symbol of community collaboration, resilience, and beautification.",
    location: 'Barangay Balili, La Trinidad, Benguet',
    history: 'Inspired by the favelas of Brazil, this project was initiated by the Tam-awan Village artists and the Department of Tourism. The name "Stobosa" is an acronym for the three sitios (Stonehill, Botiwtiw, and Sadjap) that compose the community.',
    gallery: [
      'https://images.unsplash.com/photo-1547906911-332a5345511b?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508210338346-cf97495594d6?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558220557-54814a806aa8?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '24/7 (viewable from the road)',
    bestTimeToVisit: 'Daylight hours for best visibility.',
    category: 'Art',
    tags: ['Photography', 'Roadside', 'Free Entry', 'Mural'],
    jeepneyFare: '₱13.00',
    taxiFare: '₱110.00',
    terminalLocation: 'Baguio City Hall Terminal',
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 10 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 10 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Colors%20of%20Stobosa&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1080&auto=format&fit=crop',
    alt: 'Grassy summit of Mt. Yangbew with wide scenic views.',
    name: 'Mt. Yangbew',
    description: "Often referred to as the 'Little Pulag' of La Trinidad, Mt. Yangbew offers a relatively easy hike that rewards trekkers with a wide, grassy summit perfect for picnics, kite flying, and horseback riding. The view of the sunrise and the sea of clouds is breathtaking.",
    location: 'Barangay Tawang, La Trinidad, Benguet',
    history: 'Historically known as "Mt. Jumbo", it was used by American forces during World War II. Today, it has been reclaimed by the locals as a premier eco-tourism destination, managed by the Tawang community.',
    gallery: [
      'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533240332313-0dbdd312e65b?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '4:00 AM - 6:00 PM Daily',
    bestTimeToVisit: 'Sunrise (5:00 AM) or late afternoon.',
    category: 'Nature',
    tags: ['Hiking', 'Sea of Clouds', 'Horseback Riding', 'Camping'],
    jeepneyFare: '₱13.00',
    taxiFare: '₱220.00',
    terminalLocation: 'Magsaysay Ave / Center Mall Terminal',
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 20-25 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 20-25 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Mt.%20Yangbew%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1550948537-130a1ce83314?q=80&w=1080&auto=format&fit=crop',
    alt: 'Cultural artifacts displayed inside a museum.',
    name: 'Benguet Museum',
    description: 'A treasure trove of Cordilleran heritage, the Benguet Museum houses a collection of artifacts, traditional clothing, tools, and even mummies that tell the story of the Ibaloi, Kankanaey, and Kalanguya peoples.',
    location: 'Capitol Compound, La Trinidad, Benguet',
    history: 'Established to preserve the rich cultural heritage of the province, the museum serves as an educational center for both locals and tourists to understand the history and traditions of Benguet before modernization.',
    gallery: [
      'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518998053901-5348d3969105?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590052687608-4c82d9ec920b?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '8:00 AM - 5:00 PM (Mon-Fri)',
    bestTimeToVisit: 'Weekdays',
    category: 'Culture',
    tags: ['History', 'Museum', 'Educational', 'Indoor'],
    jeepneyFare: '₱13.00',
    taxiFare: '₱180.00',
    terminalLocation: 'Baguio City Hall / Center Mall Terminal',
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 5 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 5 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Benguet%20Museum%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1589533610925-1cffc309eb31?q=80&w=1080&auto=format&fit=crop',
    alt: 'Organic salad greens and vegetables.',
    name: 'Lily of the Valley Organic Farms',
    description: 'A pioneer in agri-tourism, this farm offers a serene escape where you can learn about organic farming, stay in cozy homestays, and enjoy farm-to-table meals. It promotes health and wellness through sustainable agriculture.',
    location: 'Sitio Ampasit, Puguis, La Trinidad',
    history: 'Started by the late Jefferson Laruan, a passionate advocate for organic farming, the farm has grown into a model for sustainable agriculture in the region, offering training and workshops to aspiring farmers.',
    gallery: [
      'https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '8:00 AM - 5:00 PM (By Appointment)',
    bestTimeToVisit: 'Morning for farm tours.',
    category: 'Agri-tourism',
    tags: ['Organic', 'Homestay', 'Glamping', 'Farm-to-Table'],
    jeepneyFare: '₱13.00',
    taxiFare: '₱200.00',
    terminalLocation: 'Baguio City Hall Terminal',
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 15 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 15 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Lily%20of%20the%20Valley%20Organic%20Farms&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=1080&auto=format&fit=crop',
    alt: 'Bustling vegetable market with fresh produce.',
    name: 'La Trinidad Vegetable Trading Post',
    description: 'The beating heart of the "Salad Bowl of the Philippines". This is where tons of fresh vegetables from all over Benguet are traded daily. It is a sight to behold for those interested in commerce, local life, and buying wholesale produce.',
    location: 'Km. 5, La Trinidad, Benguet',
    history: 'Established to centralize the distribution of highland vegetables to Manila and other provinces, it is one of the busiest economic zones in the municipality, highlighting the agricultural prowess of the region.',
    gallery: [
      'https://images.unsplash.com/photo-1573809616382-0e9c8fbb07e6?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606850926385-7dc42620334f?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '24 Hours Daily',
    bestTimeToVisit: 'Early morning or late afternoon for peak activity.',
    category: 'Shopping',
    tags: ['Market', 'Wholesale', 'Local Life', 'Vegetables'],
    jeepneyFare: '₱13.00',
    taxiFare: '₱150.00',
    terminalLocation: 'Baguio City Hall / Center Mall Terminal',
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 5 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 5 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=La%20Trinidad%20Vegetable%20Trading%20Post&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1080&auto=format&fit=crop', 
    alt: 'Beautiful landscaped gardens at Mount Costa.',
    name: 'Mount Costa',
    description: 'Known as the "Green Living Room of the Cordilleras," this 6-hectare property features 24 beautifully landscaped gardens, including a Mirror Garden, Zen Garden, and Inca Garden. It is a perfect spot for nature lovers and Instagram enthusiasts.',
    location: 'Puguis, La Trinidad, Benguet',
    history: 'Formerly a strawberry farm, it was converted into an eco-tourism destination to showcase different garden styles and sustainable landscaping.',
    gallery: [
      'https://images.unsplash.com/photo-1598902136373-181cf296386e?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558686596-21825f23df0d?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596241913227-2355d88336c0?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '7:00 AM - 5:00 PM Daily',
    bestTimeToVisit: 'Morning for cooler weather and good lighting.',
    category: 'Nature',
    tags: ['Gardens', 'Photography', 'Family Friendly', 'Relaxation'],
    jeepneyFare: '₱13.00',
    taxiFare: '₱200.00',
    terminalLocation: 'Baguio City Hall Terminal',
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 15-20 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 15-20 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Mount%20Costa%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1496857239036-1fb137683000?q=80&w=1080&auto=format&fit=crop', 
    alt: 'Vast fields of roses and colorful flowers.',
    name: 'Bahong Rose Gardens',
    description: 'Dubbed the "Rose Capital of the Philippines," Barangay Bahong supplies a majority of the country\'s roses. Visitors can walk through terraces filled with blooming roses, chrysanthemums, and anthuriums.',
    location: 'Bahong, La Trinidad, Benguet',
    history: 'Bahong was one of the first areas in the municipality to adopt large-scale cut-flower production, transforming the economic landscape of the community.',
    gallery: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556565681-67f2c623c4d2?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560717845-968823efbee1?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '6:00 AM - 6:00 PM Daily',
    bestTimeToVisit: 'November to February (Peak Bloom) or Valentine\'s season.',
    category: 'Agri-tourism',
    tags: ['Flowers', 'Roses', 'Scenic View', 'Plant Shopping'],
    jeepneyFare: '₱15.00',
    taxiFare: '₱250.00',
    terminalLocation: 'Baguio City Hall Terminal',
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 20 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 20 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Bahong%20Rose%20Garden&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1080&auto=format&fit=crop', 
    alt: 'Traditional hut amidst pine trees.',
    name: 'Avong nen Romy',
    description: 'A hidden eco-park nestled in Barangay Wangal. It offers a rustic experience with traditional huts, a mini-forest, and a viewpoint. It is a quiet retreat for those wanting to escape the busy trading post area.',
    location: 'Wangal, La Trinidad, Benguet',
    history: 'Developed by a local family to preserve the natural state of the land while sharing the simple Cordilleran lifestyle with visitors.',
    gallery: [
      'https://images.unsplash.com/photo-1544979590-37e9b47cb705?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586375300773-8384e3e4916f?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1080&auto=format&fit=crop'
    ],
    openingHours: '8:00 AM - 5:00 PM Daily',
    bestTimeToVisit: 'Afternoon for a relaxing coffee break.',
    category: 'Culture',
    tags: ['Eco-park', 'Picnic', 'Traditional Huts', 'Nature'],
    jeepneyFare: '₱13.00',
    taxiFare: '₱180.00',
    terminalLocation: 'Baguio City Hall Terminal',
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 10 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 10 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Avong%20nen%20Romy&t=&z=15&ie=UTF8&iwloc=&output=embed'
  }
];

export default touristSpots;
