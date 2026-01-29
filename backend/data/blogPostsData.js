
const blogPosts = [
    {
        image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/fa/89/bf/strawberry-farm.jpg?w=1200&h=-1&s=1',
        alt: 'Strawberry Picking Guide',
        badge: 'Guide',
        readTime: '5 min read',
        title: 'The Ultimate Guide to Strawberry Picking in La Trinidad',
        description: 'Everything you need to know about visiting the famous strawberry farms, from the best time to visit to what to bring.',
        author: 'Maria Santos',
        date: 'October 15, 2025',
        status: 'approved',
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
        `
    },
    {
        image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/46/4b/5f/mt-kalugong-eco-park.jpg?w=900&h=500&s=1',
        alt: 'Mount Kalugong Hiking',
        badge: 'Adventure',
        readTime: '7 min read',
        title: 'Hiking Mount Kalugong: A Beginner\'s Adventure',
        description: 'My first experience climbing Mount Kalugong and why it\'s perfect for beginner hikers looking for stunning views.',
        author: 'Juan Reyes',
        date: 'October 10, 2025',
        status: 'approved',
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
        `
    },
    {
        image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/79/37/10/bahong-rose-gardens.jpg?w=1200&h=-1&s=1',
        alt: 'Flower Gardens',
        badge: 'Photography',
        readTime: '6 min read',
        title: 'Exploring the Flower Gardens: A Photographer\'s Paradise',
        description: 'Discover the best spots for photography in La Trinidad\'s colorful flower gardens and when to visit for the best blooms.',
        author: 'Ana Cruz',
        date: 'October 5, 2025',
        status: 'approved',
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
        `
    },
    {
        image: 'https://images.deliveryhero.io/image/fd-ph/LH/e1le-listing.jpg',
        alt: 'Local Foods',
        badge: 'Food',
        readTime: '4 min read',
        title: 'Local Flavors: Must-Try Foods in La Trinidad',
        description: 'From fresh vegetables to unique Cordilleran dishes, here\'s what to eat when visiting La Trinidad.',
        author: 'Pedro Garcia',
        date: 'September 28, 2025',
        status: 'approved',
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
        `
    },
    {
        image: 'https://as1.ftcdn.net/v2/jpg/06/66/23/36/1000_F_666233657_65xbrTbgWawqPZ7rS04Lay0zq1GwKMYs.jpg',
        alt: 'Weekend Itinerary',
        badge: 'Travel Tips',
        readTime: '8 min read',
        title: 'Weekend Itinerary: 2 Days in La Trinidad',
        description: 'Make the most of your weekend with this carefully planned itinerary covering the best attractions and experiences.',
        author: 'Lisa Mendoza',
        date: 'September 20, 2025',
        status: 'approved',
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
        `
    },
    {
        image: 'https://images.puertoparrot.com/articles/original/3_1600390106_d2b5c.png',
        alt: 'Ibaloi Culture',
        badge: 'Culture',
        readTime: '10 min read',
        title: 'Understanding Ibaloi Culture and Traditions',
        description: 'Learn about the indigenous Ibaloi people, their customs, and how their culture shapes La Trinidad today.',
        author: 'Dr. Carmen Flores',
        date: 'September 15, 2025',
        status: 'approved',
        content: `
            <p class="lead">The Ibaloi are the original inhabitants of La Trinidad and southern Benguet. Their rich culture is deeply woven into the fabric of the municipality.</p>

            <h3>The Cañao (Kanyaw)</h3>
            <p>The most famous tradition is the <em>Cañao</em> or <em>Kanyaw</em>. It is a socio-religious feast that involves offering sacrifices (usually pigs or chickens) to the spirits or <em>Kabunyan</em> (God). It is performed for various reasons: to celebrate a bountiful harvest, to heal the sick, or to ask for blessings. Gong playing and traditional dancing are central to the ceremony.</p>

            <h3>Mummification</h3>
            <p>Historically, the Ibaloi practiced mummification. The Fire Mummies of Kabayan are the most famous examples, but this practice reflects the deep respect the Ibaloi have for their ancestors and the afterlife.</p>

            <h3>Language</h3>
            <p>The native language is Ibaloi. However, Ilokano is widely used as a lingua franca in the region, along with Tagalog and English. Learning a few basic words like <em>"Kamusta"</em> (How are you?) goes a long way in connecting with locals.</p>
        `
    },
    {
        image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjAlMjBzaG9ww5fGVufDB8fHx8MTc2MTgyNjY5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
        alt: 'Coffee Shop with View',
        badge: 'Lifestyle',
        readTime: '5 min read',
        title: 'Top 5 Cafes with a View in La Trinidad',
        description: 'Unwind with a cup of locally sourced Benguet Arabica coffee while enjoying panoramic views of the valley.',
        author: 'Miguel Santos',
        date: 'September 08, 2025',
        status: 'approved',
        content: `
            <p class="lead">Coffee tastes better with a view. In La Trinidad, you don't just get great coffee; you get front-row seats to rolling hills, cloud-kissed mountains, and vibrant vegetable terraces.</p>

            <h3>1. Mount Kalugong Kape-an</h3>
            <p>Perched atop the limestone formations of Mount Kalugong, this cafe requires a short hike but rewards you with the best sunset view in town. Their carrot cake and brewed coffee are crowd favorites.</p>

            <h3>2. Kape-an sa Beating</h3>
            <p>Located in Barangay Wangal, this spot offers a quieter ambiance. It's perfect for digital nomads looking for inspiration or friends catching up over a warm cup of chocolate.</p>

            <h3>Why Benguet Coffee?</h3>
            <p>Benguet Arabica is world-renowned. The high elevation and cool climate of La Trinidad create the perfect conditions for growing coffee beans with distinct fruity and floral notes.</p>
        `
    },
    {
        image: 'https://media.istockphoto.com/id/458296105/photo/clay-pot-head-balancing.jpg?s=612x612&w=0&k=20&c=HhPD5URueODVR665p4SDcgyIG4AIX7R9OiEZMEvBrps=',
        alt: 'Pasalubong Shopping',
        badge: 'Shopping',
        readTime: '4 min read',
        title: 'The Best Pasalubong to Bring Home',
        description: 'A guide to the best souvenirs and treats to buy for your loved ones from the Strawberry Capital.',
        author: 'Elena Gomez',
        date: 'September 01, 2025',
        status: 'approved',
        content: `
            <p class="lead">"Pasalubong" is the Filipino tradition of bringing back gifts for family and friends. In La Trinidad, your bags will be heavy with delicious treats!</p>

            <h3>Top Picks</h3>
            <ul>
                <li><strong>Strawberry Jam:</strong> Look for the ones with whole berries. The local association of strawberry farmers ensures high quality.</li>
                <li><strong>Ube Jam:</strong> While Baguio is famous for it, many producers are actually based in La Trinidad.</li>
                <li><strong>Fresh Vegetables:</strong> Broccoli, cauliflower, and lettuce are significantly cheaper at the Trading Post than in Metro Manila.</li>
                <li><strong>Strawberry Wine:</strong> A sweet, fruity wine that captures the essence of the highlands.</li>
            </ul>

            <h3>Where to Buy</h3>
            <p>The <strong>Pasalubong Center</strong> near the Strawberry Farm is your one-stop shop. However, for fresh veggies, head to the <strong>La Trinidad Vegetable Trading Post</strong> for wholesale prices.</p>
        `
    }
];

module.exports = blogPosts;
