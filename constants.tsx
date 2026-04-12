
import type { NavLinkItem, Stat, EmergencyContact, Hotline, Norm, BlogPost, HistoryEvent, LocalEvent, JeepneyRoute } from './types';

export const NAV_LINKS: NavLinkItem[] = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Tourist', path: '/tourist-spots' },
  { name: 'Visitor Info', path: '/visitor-info' }, // Consolidated link
  { name: 'Blog', path: '/blog' },
];

export const STATS: Stat[] = [
    { icon: 'fas fa-map-marker-alt', label: 'Location', value: 'Benguet Province' },
    { icon: 'fas fa-users', label: 'Population', value: '137,000+' },
    { icon: 'fas fa-calendar', label: 'Founded', value: '1846' },
    { icon: 'fas fa-award', label: 'Known For', value: 'Strawberries' },
];

export const NAVIGATION_LANDMARKS = [
    "Tiong San La Trinidad (Km. 4)",
    "Tiong San Harrison (Baguio City)",
    "Tiong San Magsaysay (Baguio City)",
    "SM City Baguio",
    "Baguio City Hall",
    "Burnham Park (Melvin Jones)",
    "Victory Liner Terminal (Paso)",
    "Genesis Bus Terminal (Gov. Pack)",
    "Baguio Center Mall",
    "Puregold La Trinidad",
    "Public Market (La Trinidad)",
    "Baguio Public Market",
    "Benguet State University (BSU)",
    "La Trinidad Municipal Hall",
    "Camp John Hay",
    "Mines View Park",
    "Botanical Garden",
    "Session Road",
    "Wright Park",
    "The Mansion",
    "Strawberry Farm (La Trinidad)",
    "Bell Church (La Trinidad)",
    "Porta Vaga Mall",
    "Cooyeesan Hotel Plaza",
    "BenCab Museum",
    "Tam-awan Village",
    "Good Taste Restaurant (Otek St.)"
];

// Domains often used for spam or disposable emails
export const BLOCKED_EMAIL_DOMAINS = [
    'test.com', 'example.com', 'mailinator.com', 'yopmail.com', '10minutemail.com',
    'guerrillamail.com', 'temp-mail.org', 'fake.com', 'spam.com', 'trashmail.com',
    'sharklasers.com', 'maildrop.cc', 'getairmail.com', 'dispostable.com'
];

export const HISTORY_MILESTONES: HistoryEvent[] = [
    {
        year: 'Pre-1800s',
        title: 'The Valley of Benguet',
        description: 'Before Spanish colonization, the valley was a thriving settlement of Ibaloi communities. The swampy terrain was abundant with wildlife and the people practiced wet rice agriculture.',
        icon: 'fas fa-leaf',
        image: 'https://images.unsplash.com/photo-1595123550441-d377e017de6a?q=80&w=500&auto=format&fit=crop' // Symbolic nature image
    },
    {
        year: '1846',
        title: 'La Trinidad is Born',
        description: 'Spanish explorer Guillermo Galvey named the valley "La Trinidad" in honor of his wife, Doña Trinidad de Leon. It became the capital of the District of Benguet.',
        icon: 'fas fa-landmark',
        image: 'https://images.unsplash.com/photo-1548625361-1b1c75424069?q=80&w=500&auto=format&fit=crop' // Old architecture feel
    },
    {
        year: '1900s',
        title: 'American Era & Strawberries',
        description: 'Under American rule, the La Trinidad Farm School (now BSU) was established. Strawberries were introduced, finding the cool climate perfect for cultivation.',
        icon: 'fas fa-seedling',
        image: 'https://images.unsplash.com/photo-1627346850259-33b6833eb882?q=80&w=500&auto=format&fit=crop' // Strawberry farm
    },
    {
        year: '1950s-Present',
        title: 'The Salad Bowl Rise',
        description: 'The municipality solidified its status as the "Salad Bowl of the Philippines," becoming the primary trading post for highland vegetables supplying the entire country.',
        icon: 'fas fa-shopping-basket',
        image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=500&auto=format&fit=crop' // Vegetables
    },
    {
        year: '2016',
        title: 'Revitalization & Art',
        description: 'Tourism boom with the launch of the Stobosa Hillside Homes Artwork, transforming the community into a vibrant mural and marking a new era of eco-tourism.',
        icon: 'fas fa-paint-brush',
        image: 'https://images.unsplash.com/photo-1610410196774-728b7e7a8e79?q=80&w=500&auto=format&fit=crop' // Stobosa
    }
];

export const LOCAL_EVENTS: LocalEvent[] = [
    {
        image: 'https://images.unsplash.com/photo-1627346850259-33b6833eb882?q=80&w=800&auto=format&fit=crop',
        title: 'Strawberry Festival',
        date: 'March (Month-long)',
        description: 'The biggest celebration in La Trinidad featuring the giant strawberry shortcake, float parades, street dancing, and trade fairs.',
        location: 'Municipal Hall Grounds',
        badge: 'Main Event'
    },
    {
        image: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=800&auto=format&fit=crop',
        title: 'La Trinidad Foundation Day',
        date: 'June 16',
        description: 'A commemoration of the founding anniversary of the municipality with cultural shows and community gatherings.',
        location: 'Town Proper',
        badge: 'Historical'
    },
    {
        image: 'https://images.unsplash.com/photo-1510022079742-426c626bd8f9?q=80&w=800&auto=format&fit=crop',
        title: 'Adivay Festival',
        date: 'November',
        description: 'Although a provincial festival for Benguet, La Trinidad as the capital hosts the grand Canao and gathering of all 13 municipalities.',
        location: 'Benguet Sports Complex',
        badge: 'Cultural'
    },
    {
        image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop',
        title: 'Coffee Festival',
        date: 'February',
        description: 'Celebrating the thriving local coffee industry with cupping sessions, brewing competitions, and farm tours.',
        location: 'Municipal Park',
        badge: 'Lifestyle'
    }
];

export const EMERGENCY_CONTACTS: (EmergencyContact & { mapUrl: string })[] = [
    {
        icon: 'fas fa-hospital',
        type: 'Hospital',
        name: 'Benguet General Hospital',
        address: 'Km. 5, La Trinidad, Benguet',
        phone: '(074) 422-2331',
        hours: '24/7',
        mapUrl: 'https://maps.google.com/maps?q=Benguet%20General%20Hospital%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    {
        icon: 'fas fa-hospital',
        type: 'Hospital',
        name: 'La Trinidad Medicare Community Hospital',
        address: 'Poblacion, La Trinidad, Benguet',
        phone: '(074) 619-0045',
        hours: '24/7',
        mapUrl: 'https://maps.google.com/maps?q=La%20Trinidad%20Medicare%20Community%20Hospital&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    {
        icon: 'fas fa-hospital',
        type: 'Hospital',
        name: 'Cordillera Hospital of the Divine Grace',
        address: 'Km. 6, Betag, La Trinidad',
        phone: '(074) 422-2269',
        hours: '24/7',
        mapUrl: 'https://maps.google.com/maps?q=Cordillera%20Hospital%20of%20the%20Divine%20Grace&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    {
        icon: 'fas fa-shield-alt',
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        address: 'Km. 5, La Trinidad, Benguet',
        phone: '(074) 422-2075 / 911',
        hours: '24/7',
        mapUrl: 'https://maps.google.com/maps?q=La%20Trinidad%20Municipal%20Police%20Station&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    {
        icon: 'fas fa-shield-alt',
        type: 'Police',
        name: 'Police Regional Office - Cordillera',
        address: 'Camp Bado Dangwa, La Trinidad',
        phone: '(074) 422-5515',
        hours: '24/7',
        mapUrl: 'https://maps.google.com/maps?q=Police%20Regional%20Office%20Cordillera%20Camp%20Dangwa&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    {
        icon: 'fas fa-life-ring',
        type: 'Rescue',
        name: 'La Trinidad MDRRMO',
        address: 'Municipal Hall, Km. 5, La Trinidad',
        phone: '(074) 422-0100',
        hours: '24/7 Emergency Response',
        mapUrl: 'https://maps.google.com/maps?q=La%20Trinidad%20Municipal%20Hall&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    {
        icon: 'fas fa-fire-extinguisher',
        type: 'Fire Station',
        name: 'Bureau of Fire Protection - La Trinidad',
        address: 'Wangal, La Trinidad, Benguet',
        phone: '(074) 422-2474 / 911',
        hours: '24/7',
        mapUrl: 'https://maps.google.com/maps?q=Bureau%20of%20Fire%20Protection%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    {
        icon: 'fas fa-paw',
        type: 'Vet',
        name: 'BSU Veterinary Teaching Hospital',
        address: 'BSU Compound, Km. 5, La Trinidad',
        phone: '(074) 422-2127',
        hours: '8:00 AM - 5:00 PM',
        mapUrl: 'https://maps.google.com/maps?q=Benguet%20State%20University%20Veterinary%20Hospital&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    {
        icon: 'fas fa-pills',
        type: 'Pharmacy',
        name: 'Mercury Drug - La Trinidad',
        address: 'Km. 5, Pico, La Trinidad',
        phone: '(074) 422-1234',
        hours: '24/7',
        mapUrl: 'https://maps.google.com/maps?q=Mercury%20Drug%20La%20Trinidad%20Benguet&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    {
        icon: 'fas fa-pills',
        type: 'Pharmacy',
        name: 'Watsons Pharmacy',
        address: 'Km. 5, Balili, La Trinidad',
        phone: '(074) 422-8888',
        hours: '8:00 AM - 8:00 PM',
        mapUrl: 'https://maps.google.com/maps?q=Watsons%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
    }
];

export const EMERGENCY_HOTLINES: Hotline[] = [
    { label: 'National Emergency Hotline', number: '911', href: 'tel:911' },
    { label: 'Philippine National Police', number: '117', href: 'tel:117' },
    { label: 'Red Cross Benguet', number: '(074) 442-4422', href: 'tel:(074)442-4422' },
    { label: 'NDRRMC Hotline', number: '911-1406', href: 'tel:911-1406' },
];

export const LOCAL_NORMS: Norm[] = [
    {
        icon: 'fas fa-heart',
        title: 'Respect Local Culture',
        description: 'The people of La Trinidad are proud of their Ibaloi and Kankanaey heritage.',
        points: ['Ask permission before taking photos of elders', 'Dress modestly when visiting sacred grounds', 'Learn basic greetings like "Kamusta"'],
        facts: [
            'The Ibaloi people are known for their "Tayaw" dance, a sacred dance of celebration.',
            'Saying "Agbiag!" is a common way to express well-wishes or "Long live!"',
            'Ibaloi culture values "Inayan" - a moral compass that prevents doing bad to others.'
        ]
    },
    {
        icon: 'fas fa-leaf',
        title: 'Environmental Stewardship',
        description: 'Nature is sacred. Help us preserve the beauty of the mountains.',
        points: ['Clean as you go (CLAYGO) policy', 'Stay on marked trails when hiking', 'Do not pick flowers or plants'],
        facts: [
            'La Trinidad has strict plastic bans in many areas to protect the valley.',
            'The valley was once a vast swamp before it was developed for agriculture.',
            'Many local farms are transitioning to organic methods to preserve soil health.'
        ]
    },
    {
        icon: 'fas fa-users',
        title: 'Community Etiquette',
        description: 'La Trinidad is a close-knit community built on mutual respect.',
        points: ['Greet locals with a smile', 'Support local farmers by buying directly', 'Avoid loud noises in residential areas'],
        facts: [
            'The "Bayanihan" spirit is very much alive here, especially during harvest season.',
            'Locals often share their harvest with neighbors as a sign of goodwill.',
            'A simple nod or smile is a standard way to acknowledge people you pass by.'
        ]
    },
    {
        icon: 'fas fa-camera',
        title: 'Responsible Photography',
        description: 'Capture memories without intruding on privacy.',
        points: ['Ask before photographing private homes', 'No drones near government buildings', 'Tag location responsibly to avoid overcrowding'],
        facts: [
            'The Stobosa mural was designed to be viewed from a distance for the best effect.',
            'Some elders believe that taking their photo without permission can "capture their spirit".',
            'Early morning light in the valley provides the most magical "golden hour" for photos.'
        ]
    },
    {
        icon: 'fas fa-shield-alt',
        title: 'Safety & Preparedness',
        description: 'The mountain weather and terrain require preparation.',
        points: ['Bring warm clothing for sudden temp drops', 'Hydrate often due to altitude', 'Register at barangay halls before hiking'],
        facts: [
            'Every Jeep/Taxi follows a form of payment. If they overcharge, please contact local authorities.',
            'Temperatures can drop by 5-10 degrees Celsius as soon as the sun goes down.',
            'The local police station is centrally located at Km. 5 for quick assistance.'
        ]
    },
    {
        icon: 'fas fa-hands-helping',
        title: 'Support Local',
        description: 'Your tourism dollars help the community thrive.',
        points: ['Hire accredited local guides', 'Buy pasalubong from the Trading Post', 'Respect suggested retail prices'],
        facts: [
            'The Trading Post is the largest vegetable distribution hub in the Philippines.',
            'Buying directly from farmers ensures they get the full value of their hard work.',
            'Local strawberry wine is made using traditional fermentation methods.'
        ]
    },
];

export const BLOG_POSTS: BlogPost[] = [
    {
        image: 'https://images.unsplash.com/photo-1734313237467-1f93eb3abbe0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJhd2JlcnJ5JTIwZmFybXxlbnwxfHx8fDE3NjE3NDQ5ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Strawberry Picking Guide',
        badge: 'Guide',
        readTime: '5 min read',
        title: 'The Ultimate Guide to Strawberry Picking in La Trinidad',
        description: 'Everything you need to know about visiting the famous strawberry farms, from the best time to visit to what to bring.',
        author: 'Maria Santos',
        date: 'October 15, 2025',
        content: `
            <p class="lead">La Trinidad is synonymous with strawberries. Known as the Strawberry Capital of the Philippines, a visit here isn't complete without experiencing the joy of picking your own fresh berries.</p>
            
            <h3>Best Time to Visit</h3>
            <p>While the farms are open year-round, the strawberry season peaks from <strong>December to February</strong>. During these months, the berries are at their reddest, juiciest, and sweetest. If you visit in March or April, you can still find plenty of harvest, but it might be a bit warmer.</p>

            <h3>How to Get There</h3>
            <p>The Strawberry Farm is located in Barangay Betag, Km. 5. It's easily accessible by jeepney from Baguio City. Look for jeepneys marked "La Trinidad" or "Buyagan" from the terminal near Baguio City Hall. The fare is affordable, and the ride takes about 30 minutes depending on traffic.</p>

            <h3>Tips for Picking</h3>
            <ul>
                <li><strong>Wear comfortable shoes:</strong> The soil can be muddy, especially if it rained recently.</li>
                <li><strong>Early bird catches the worm:</strong> Arrive early in the morning (around 7:00 AM to 9:00 AM) to get the freshest picks before the crowds arrive.</li>
                <li><strong>Handle with care:</strong> Strawberries are delicate. Hold the stem just above the berry and twist gently.</li>
            </ul>

            <h3>Souvenirs to Buy</h3>
            <p>Aside from fresh berries, don't forget to try the famous <strong>Strawberry Taho</strong> and buy some strawberry jam, strawberry wine, and even strawberry-flavored peanut brittle from the vendors outside the farm gates.</p>
        `,
    },
    {
        image: 'https://images.unsplash.com/photo-1531932594968-e5e5e9dee95a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHZhbGxleXxlbnwxfHx8fDE3NjE3ODk0NzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Mount Kalugong Hiking',
        badge: 'Adventure',
        readTime: '7 min read',
        title: 'Hiking Mount Kalugong: A Beginner\'s Adventure',
        description: 'My first experience climbing Mount Kalugong and why it\'s perfect for beginner hikers looking for stunning views.',
        author: 'Juan Reyes',
        date: 'October 10, 2025',
        content: `
            <p class="lead">If you're looking for a hiking destination that rewards you with breathtaking views without demanding expert-level endurance, Mount Kalugong is the place to be.</p>

            <h3>The Trail</h3>
            <p>The hike starts at Barangay Tawang. The trail is paved for the first part, winding through a residential area before turning into a pine forest path. It takes about 30 to 45 minutes to reach the summit depending on your pace. The incline is manageable, making it suitable for kids and elderly hikers who are reasonably fit.</p>

            <h3>The Summit</h3>
            <p>At the top, you are greeted by unique limestone rock formations. The name "Kalugong" means "hat" in Ilocano, referring to the shape of the main rock formation. From the edge, you get a panoramic view of the La Trinidad valley—a sea of houses and green fields surrounded by mountains.</p>

            <h3>Mount Kalugong Cultural Village</h3>
            <p>One of the highlights is the cultural village at the summit. There are traditional huts where you can rest, and a coffee shop that serves local Benguet coffee. Sipping warm coffee while the cool mountain breeze brushes against your face is an experience unmatched by any city cafe.</p>

            <h3>What to Bring</h3>
            <ul>
                <li>Water (at least 500ml)</li>
                <li>Sunblock or a hat</li>
                <li>Camera for the stunning rock formations</li>
                <li>Light jacket (it gets windy at the top)</li>
            </ul>
        `,
    },
    {
        image: 'https://images.unsplash.com/photo-1605895370326-e96b9d52e3f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG93ZXIlMjBnYXJkZW58ZW58MXx8fHwxNzYxNzY0MjQ5fDA&ixlib.rb-4.1.0&q=80&w=1080',
        alt: 'Flower Gardens',
        badge: 'Photography',
        readTime: '6 min read',
        title: 'Exploring the Flower Gardens: A Photographer\'s Paradise',
        description: 'Discover the best spots for photography in La Trinidad\'s colorful flower gardens and when to visit for the best blooms.',
        author: 'Ana Cruz',
        date: 'October 5, 2025',
        content: `
            <p class="lead">Beyond strawberries, La Trinidad is also known as the "Rose Capital of the Philippines". The flower gardens here are a visual feast, offering a kaleidoscope of colors perfect for photography enthusiasts.</p>

            <h3>Bahong Rose Gardens</h3>
            <p>Barangay Bahong is the center of the cut-flower industry. Here, you can see vast terraces of roses, chrysanthemums, and anthuriums. The best time to take photos is early morning when the dew is still fresh on the petals and the light is soft.</p>

            <h3>Mount Costa</h3>
            <p>While technically a bit further out, Mount Costa offers landscaped gardens that are curated for aesthetic pleasure. It features 24 different gardens, each with a unique theme, such as the Mirror Garden, the Zen Garden, and the Inca Garden.</p>

            <h3>Photography Tips</h3>
            <ul>
                <li><strong>Golden Hour:</strong> Shoot during sunrise or sunset for the most dramatic lighting.</li>
                <li><strong>Macro Lens:</strong> Bring a macro lens to capture the intricate details of the flower petals and insects.</li>
                <li><strong>Respect the Flowers:</strong> Do not step on the garden beds or pick flowers just for a photo.</li>
            </ul>
        `,
    },
    {
        image: 'https://images.unsplash.com/photo-1572402123736-c79526db405a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMG1hcmtldHxlbnwxfHx8fDE3NjE4MjEyODV8MA&ixlib.rb-4.1.0&q=80&w=1080',
        alt: 'Local Foods',
        badge: 'Food',
        readTime: '4 min read',
        title: 'Local Flavors: Must-Try Foods in La Trinidad',
        description: 'From fresh vegetables to unique Cordilleran dishes, here\'s what to eat when visiting La Trinidad.',
        author: 'Pedro Garcia',
        date: 'September 28, 2025',
        content: `
            <p class="lead">La Trinidad offers a culinary journey that highlights the freshness of its highland produce and the richness of Cordilleran heritage.</p>

            <h3>Pinikpikan</h3>
            <p>A must-try traditional dish. It is a chicken soup similar to tinola but with a distinct preparation method that gives the meat a smoky flavor. It is often cooked with <em>etag</em> (smoked salted pork) and plenty of sayote and pechay.</p>

            <h3>Strawberry Specialties</h3>
            <p>You cannot leave without trying these strawberry-infused treats:</p>
            <ul>
                <li><strong>Strawberry Taho:</strong> Silken tofu with sweet strawberry syrup and sago pearls.</li>
                <li><strong>Strawberry Ice Cream:</strong> Creamy and made with real fruit chunks.</li>
                <li><strong>Strawberry Shortcake:</strong> La Trinidad once held the Guinness World Record for the largest fruit shortcake!</li>
            </ul>

            <h3>Fresh Salads</h3>
            <p>Since La Trinidad is the "Salad Bowl of the Philippines", ordering a fresh garden salad is essential. The lettuce, cucumber, and carrots are crisp, sweet, and served straight from the farm to your plate.</p>
        `,
    },
    {
        image: 'https://images.unsplash.com/photo-1536481046830-9b11bb07e8b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQaGlsaXBwaW5lcyUyMG1vdW50YWluJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2MTgyNjY5N3ww&ixlib.rb-4.1.0&q=80&w=1080',
        alt: 'Weekend Itinerary',
        badge: 'Travel Tips',
        readTime: '8 min read',
        title: 'Weekend Itinerary: 2 Days in La Trinidad',
        description: 'Make the most of your weekend with this carefully planned itinerary covering the best attractions and experiences.',
        author: 'Lisa Mendoza',
        date: 'September 20, 2025',
        content: `
            <p class="lead">Planning a quick getaway? Here is the perfect 2-day itinerary to experience the best of La Trinidad.</p>

            <h3>Day 1: The Classics</h3>
            <ul>
                <li><strong>8:00 AM:</strong> Breakfast at a local cafe in Km. 5.</li>
                <li><strong>9:30 AM:</strong> Strawberry Picking at the Strawberry Farm. Buy <em>pasalubong</em> from vendors.</li>
                <li><strong>12:00 PM:</strong> Lunch featuring Pinikpikan and fresh vegetable salad.</li>
                <li><strong>2:00 PM:</strong> Visit the Colors of Stobosa (The giant mural) for photos.</li>
                <li><strong>3:30 PM:</strong> Explore the Bell Church and enjoy the serene atmosphere.</li>
                <li><strong>6:00 PM:</strong> Dinner and rest.</li>
            </ul>

            <h3>Day 2: Nature and Views</h3>
            <ul>
                <li><strong>5:30 AM:</strong> Early morning hike to Mount Kalugong for sunrise.</li>
                <li><strong>7:00 AM:</strong> Coffee and breakfast at the cafe atop Mount Kalugong.</li>
                <li><strong>10:00 AM:</strong> Visit the Bahong Rose Gardens to see the flower terraces.</li>
                <li><strong>12:00 PM:</strong> Lunch.</li>
                <li><strong>1:30 PM:</strong> Visit the Benguet State University (BSU) Marketing Center to buy fresh produce at lower prices.</li>
                <li><strong>3:00 PM:</strong> Departure.</li>
            </ul>
        `,
    },
    {
        image: 'https://images.unsplash.com/photo-1536481046830-9b11bb07e8b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQaGlsaXBwaW5lcyUyMG1vdW50YWluJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2MTgyNjY5N3ww&ixlib.rb-4.1.0&q=80&w=1080',
        alt: 'Ibaloi Culture',
        badge: 'Culture',
        readTime: '10 min read',
        title: 'Understanding Ibaloi Culture and Traditions',
        description: 'Learn about the indigenous Ibaloi people, their customs, and how their culture shapes La Trinidad today.',
        author: 'Dr. Carmen Flores',
        date: 'September 15, 2025',
        content: `
            <p class="lead">The Ibaloi are the original inhabitants of La Trinidad and southern Benguet. Their rich culture is deeply woven into the fabric of the municipality.</p>

            <h3>The Cañao (Kanyaw)</h3>
            <p>The most famous tradition is the <em>Cañao</em> or <em>Kanyaw</em>. It is a socio-religious feast that involves offering sacrifices (usually pigs or chickens) to the spirits or <em>Kabunyan</em> (God). It is performed for various reasons: to celebrate a bountiful harvest, to heal the sick, or to ask for blessings. Gong playing and traditional dancing are central to the ceremony.</p>

            <h3>Mummification</h3>
            <p>Historically, the Ibaloi practiced mummification. The Fire Mummies of Kabayan are the most famous examples, but this practice reflects the deep respect the Ibaloi have for their ancestors and the afterlife.</p>

            <h3>Language</h3>
            <p>The native language is Ibaloi. However, Ilokano is widely used as a lingua franca in the region, along with Tagalog and English. Learning a few basic words like <em>"Kamusta"</em> (How are you?) goes a long way in connecting with locals.</p>
        `,
    },
];

export const JEEPNEY_ROUTES: JeepneyRoute[] = [
    {
        name: 'Pico - La Trinidad',
        signboard: {
            text: 'PICO - LA TRINIDAD',
            color: 'text-red-600',
            backgroundColor: 'bg-white'
        },
        terminal: {
            name: 'Magsaysay Terminal',
            location: 'Near Baguio Center Mall / Magsaysay Ave',
            mapUrl: 'https://maps.google.com/maps?q=Magsaysay%20Jeepney%20Terminal%20Baguio&t=&z=15&ie=UTF8&iwloc=&output=embed'
        },
        routeMapUrl: 'https://maps.google.com/maps?saddr=Magsaysay+Terminal+Baguio&daddr=Pico+La+Trinidad+Benguet&t=&z=14&ie=UTF8&iwloc=&output=embed',
        fare: {
            minimum: 13,
            studentSenior: 11,
            fullRoute: 15
        },
        path: [
            { stop: 'Magsaysay Terminal', isLandmark: true, landmarkIcon: 'fas fa-bus' },
            { stop: 'Bokawkan Road', isLandmark: false },
            { stop: 'Bell Church (Km. 3)', isLandmark: true, landmarkIcon: 'fas fa-place-of-worship' },
            { stop: 'Km. 4 (Tiong San)', isLandmark: true, landmarkIcon: 'fas fa-store' },
            { stop: 'Pico Proper', isLandmark: false },
            { stop: 'Km. 5 (Public Market)', isLandmark: true, landmarkIcon: 'fas fa-store' }
        ],
        operatingHours: '5:00 AM - 9:00 PM',
        frequency: 'Every 5-10 minutes'
    },
    {
        name: 'Tomay - La Trinidad',
        signboard: {
            text: 'TOMAY - LA TRINIDAD',
            color: 'text-blue-600',
            backgroundColor: 'bg-white'
        },
        terminal: {
            name: 'Magsaysay Terminal',
            location: 'Magsaysay Avenue, Baguio City',
            mapUrl: 'https://maps.google.com/maps?q=Magsaysay%20Jeepney%20Terminal%20Baguio&t=&z=15&ie=UTF8&iwloc=&output=embed'
        },
        routeMapUrl: 'https://maps.google.com/maps?saddr=Magsaysay+Terminal+Baguio&daddr=Bokawkan+Road+Baguio+to:Km+3+La+Trinidad+to:Km+4+La+Trinidad+to:Tomay+La+Trinidad+Benguet&t=&z=14&ie=UTF8&iwloc=&output=embed',
        fare: {
            minimum: 13,
            studentSenior: 11,
            fullRoute: 20
        },
        path: [
            { stop: 'Magsaysay Terminal', isLandmark: true, landmarkIcon: 'fas fa-bus' },
            { stop: 'Bokawkan Road', isLandmark: false },
            { stop: 'Km. 3 (Bell Church)', isLandmark: true, landmarkIcon: 'fas fa-place-of-worship' },
            { stop: 'Km. 4 (Tiong San)', isLandmark: true, landmarkIcon: 'fas fa-store' },
            { stop: 'Km. 5 (Municipal Hall)', isLandmark: true, landmarkIcon: 'fas fa-landmark' },
            { stop: 'Km. 6 (BSU)', isLandmark: true, landmarkIcon: 'fas fa-university' },
            { stop: 'Strawberry Farm', isLandmark: true, landmarkIcon: 'fas fa-leaf' },
            { stop: 'Tomay', isLandmark: false }
        ],
        operatingHours: '5:00 AM - 10:00 PM',
        frequency: 'Every 10-15 minutes'
    },
    {
        name: 'Beckel - La Trinidad',
        signboard: {
            text: 'BECKEL - LA TRINIDAD',
            color: 'text-pink-600',
            backgroundColor: 'bg-white'
        },
        terminal: {
            name: 'Magsaysay Terminal',
            location: 'Magsaysay Avenue, Baguio City',
            mapUrl: 'https://maps.google.com/maps?q=Magsaysay%20Jeepney%20Terminal%20Baguio&t=&z=15&ie=UTF8&iwloc=&output=embed'
        },
        routeMapUrl: 'https://maps.google.com/maps?saddr=Magsaysay+Terminal+Baguio&daddr=Beckel+La+Trinidad+Benguet&t=&z=14&ie=UTF8&iwloc=&output=embed',
        fare: {
            minimum: 13,
            studentSenior: 11,
            fullRoute: 25
        },
        path: [
            { stop: 'Magsaysay Terminal', isLandmark: true, landmarkIcon: 'fas fa-bus' },
            { stop: 'Bokawkan Road', isLandmark: false },
            { stop: 'Km. 4', isLandmark: false },
            { stop: 'Beckel Road', isLandmark: false },
            { stop: 'Beckel Proper', isLandmark: true, landmarkIcon: 'fas fa-mountain' }
        ],
        operatingHours: '6:00 AM - 7:00 PM',
        frequency: 'Every 30 minutes'
    },
    {
        name: 'Ambiong - La Trinidad',
        signboard: {
            text: 'AMBIONG - LA TRINIDAD',
            color: 'text-teal-600',
            backgroundColor: 'bg-white'
        },
        terminal: {
            name: 'Magsaysay Terminal',
            location: 'Magsaysay Avenue, Baguio City',
            mapUrl: 'https://maps.google.com/maps?q=Magsaysay%20Jeepney%20Terminal%20Baguio&t=&z=15&ie=UTF8&iwloc=&output=embed'
        },
        routeMapUrl: 'https://maps.google.com/maps?saddr=Magsaysay+Terminal+Baguio&daddr=Ambiong+La+Trinidad+Benguet&t=&z=14&ie=UTF8&iwloc=&output=embed',
        fare: {
            minimum: 13,
            studentSenior: 11,
            fullRoute: 18
        },
        path: [
            { stop: 'Magsaysay Terminal', isLandmark: true, landmarkIcon: 'fas fa-bus' },
            { stop: 'Bokawkan Road', isLandmark: false },
            { stop: 'Km. 3', isLandmark: false },
            { stop: 'Ambiong Road', isLandmark: false },
            { stop: 'Ambiong Proper', isLandmark: true, landmarkIcon: 'fas fa-home' }
        ],
        operatingHours: '6:00 AM - 8:00 PM',
        frequency: 'Every 20 minutes'
    },
    {
        name: 'Buyagan - La Trinidad',
        signboard: {
            text: 'BUYAGAN - LA TRINIDAD',
            color: 'text-green-600',
            backgroundColor: 'bg-white'
        },
        terminal: {
            name: 'Magsaysay Terminal',
            location: 'Magsaysay Avenue, Baguio City',
            mapUrl: 'https://maps.google.com/maps?q=Magsaysay%20Jeepney%20Terminal%20Baguio&t=&z=15&ie=UTF8&iwloc=&output=embed'
        },
        routeMapUrl: 'https://maps.google.com/maps?saddr=Magsaysay+Terminal+Baguio&daddr=Buyagan+La+Trinidad+Benguet&t=&z=14&ie=UTF8&iwloc=&output=embed',
        fare: {
            minimum: 13,
            studentSenior: 11,
            fullRoute: 18
        },
        path: [
            { stop: 'Magsaysay Terminal', isLandmark: true, landmarkIcon: 'fas fa-bus' },
            { stop: 'Bokawkan Road', isLandmark: false },
            { stop: 'Km. 3', isLandmark: false },
            { stop: 'Km. 4', isLandmark: false },
            { stop: 'Km. 5 (Public Market)', isLandmark: true, landmarkIcon: 'fas fa-store' },
            { stop: 'Buyagan Proper', isLandmark: false }
        ],
        operatingHours: '5:00 AM - 9:00 PM',
        frequency: 'Every 10 minutes'
    },
    {
        name: 'Puguis - La Trinidad',
        signboard: {
            text: 'PUGUIS - LA TRINIDAD',
            color: 'text-orange-600',
            backgroundColor: 'bg-white'
        },
        terminal: {
            name: 'Magsaysay Terminal',
            location: 'Magsaysay Avenue, Baguio City',
            mapUrl: 'https://maps.google.com/maps?q=Magsaysay%20Jeepney%20Terminal%20Baguio&t=&z=15&ie=UTF8&iwloc=&output=embed'
        },
        routeMapUrl: 'https://maps.google.com/maps?saddr=Magsaysay+Terminal+Baguio&daddr=Puguis+La+Trinidad+Benguet&t=&z=14&ie=UTF8&iwloc=&output=embed',
        fare: {
            minimum: 13,
            studentSenior: 11,
            fullRoute: 15
        },
        path: [
            { stop: 'Magsaysay Terminal', isLandmark: true, landmarkIcon: 'fas fa-bus' },
            { stop: 'Bokawkan Road', isLandmark: false },
            { stop: 'Km. 3', isLandmark: false },
            { stop: 'Km. 4 (Tiong San)', isLandmark: true, landmarkIcon: 'fas fa-store' },
            { stop: 'Puguis Road', isLandmark: false },
            { stop: 'Strawberry Farm (Puguis)', isLandmark: true, landmarkIcon: 'fas fa-leaf' }
        ],
        operatingHours: '5:00 AM - 8:00 PM',
        frequency: 'Every 15 minutes'
    },
    {
        name: 'Wangal - La Trinidad',
        signboard: {
            text: 'WANGAL - LA TRINIDAD',
            color: 'text-purple-600',
            backgroundColor: 'bg-white'
        },
        terminal: {
            name: 'Magsaysay Terminal',
            location: 'Magsaysay Avenue, Baguio City',
            mapUrl: 'https://maps.google.com/maps?q=Magsaysay%20Jeepney%20Terminal%20Baguio&t=&z=15&ie=UTF8&iwloc=&output=embed'
        },
        routeMapUrl: 'https://maps.google.com/maps?saddr=Magsaysay+Terminal+Baguio&daddr=Wangal+La+Trinidad+Benguet&t=&z=14&ie=UTF8&iwloc=&output=embed',
        fare: {
            minimum: 13,
            studentSenior: 11,
            fullRoute: 22
        },
        path: [
            { stop: 'Magsaysay Terminal', isLandmark: true, landmarkIcon: 'fas fa-bus' },
            { stop: 'Bokawkan Road', isLandmark: false },
            { stop: 'Km. 4', isLandmark: false },
            { stop: 'Km. 5 (Municipal Hall)', isLandmark: true, landmarkIcon: 'fas fa-landmark' },
            { stop: 'Wangal Road', isLandmark: false },
            { stop: 'Benguet Sports Complex', isLandmark: true, landmarkIcon: 'fas fa-running' }
        ],
        operatingHours: '6:00 AM - 8:00 PM',
        frequency: 'Every 20 minutes'
    },
    {
        name: 'Shilan - La Trinidad',
        signboard: {
            text: 'SHILAN - LA TRINIDAD',
            color: 'text-blue-800',
            backgroundColor: 'bg-white'
        },
        terminal: {
            name: 'Magsaysay Terminal',
            location: 'Magsaysay Avenue, Baguio City',
            mapUrl: 'https://maps.google.com/maps?q=Magsaysay%20Jeepney%20Terminal%20Baguio&t=&z=15&ie=UTF8&iwloc=&output=embed'
        },
        routeMapUrl: 'https://maps.google.com/maps?saddr=Magsaysay+Terminal+Baguio&daddr=Shilan+La+Trinidad+Benguet&t=&z=14&ie=UTF8&iwloc=&output=embed',
        fare: {
            minimum: 13,
            studentSenior: 11,
            fullRoute: 25
        },
        path: [
            { stop: 'Magsaysay Terminal', isLandmark: true, landmarkIcon: 'fas fa-bus' },
            { stop: 'Bokawkan Road', isLandmark: false },
            { stop: 'Km. 4', isLandmark: false },
            { stop: 'Km. 5', isLandmark: false },
            { stop: 'Km. 6 (BSU)', isLandmark: true, landmarkIcon: 'fas fa-university' },
            { stop: 'Shilan Proper', isLandmark: true, landmarkIcon: 'fas fa-mountain' }
        ],
        operatingHours: '6:00 AM - 7:00 PM',
        frequency: 'Every 30 minutes'
    }
];
