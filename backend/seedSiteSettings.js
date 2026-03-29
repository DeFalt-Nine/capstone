import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import SiteSettings from './models/SiteSettings.js';

const journeyThroughTime = [
    {
        year: "Pre-1800s",
        title: "The Valley of Benguet",
        content: "Before Spanish colonization, the valley was a thriving settlement of Ibaloi communities. The swampy terrain was abundant with wildlife and the people practiced wet rice agriculture.",
        image: "https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?q=80&w=800&auto=format&fit=crop"
    },
    {
        year: "1846",
        title: "Spanish Founding",
        content: "La Trinidad was officially founded as a municipality by the Spanish colonial government. It was named after Doña Trinidad de Leon Govantes, wife of Governor-General Narciso Claveria.",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop"
    },
    {
        year: "1900s",
        title: "American Era",
        content: "Under American rule, La Trinidad became the capital of the Mountain Province sub-province of Benguet. Infrastructure and agricultural programs were developed, including the introduction of temperate vegetables.",
        image: "https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?q=80&w=800&auto=format&fit=crop"
    },
    {
        year: "1950",
        title: "Benguet Capital",
        content: "La Trinidad was officially designated as the capital of the newly created province of Benguet. This marked a new era of governance and development for the highland community.",
        image: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=800&auto=format&fit=crop"
    },
    {
        year: "1980s",
        title: "Strawberry Capital",
        content: "La Trinidad earned its iconic title as the 'Strawberry Capital of the Philippines' as strawberry farming became the dominant agricultural industry, drawing tourists and boosting the local economy.",
        image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=800&auto=format&fit=crop"
    },
    {
        year: "Today",
        title: "Modern Highland Hub",
        content: "Today, La Trinidad is a thriving urban center balancing rapid development with cultural preservation. It remains a top agri-tourism destination in the Cordillera, famous for its strawberry farms, flower gardens, and warm highland culture.",
        image: "https://images.unsplash.com/photo-1594270433722-5b18f50b4a48?q=80&w=800&auto=format&fit=crop"
    }
];

const localGovernment = {
    title: "Capital of Benguet",
    content: "As the capital municipality of Benguet province, La Trinidad serves as the political, educational, and commercial hub of the Cordillera Administrative Region.\n\nThe Municipal Government, led by the Mayor and the Sangguniang Bayan, works tirelessly to balance rapid urbanization with the preservation of its rich Ibaloi culture and fragile mountain ecosystem.",
    image: "https://ltdrrmo.ph/wp-content/uploads/2021/05/lt-lg-logo.png",
    officials: []
};

const seedSiteSettings = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB for Site Settings Seeding...');

        // Find the existing site settings document
        let settings = await SiteSettings.findOne({});

        if (!settings) {
            console.log('No site settings found — creating from scratch...');
            settings = await SiteSettings.create({
                home: {
                    heroWelcomeText: "Welcome to the Valley of Colors",
                    heroTitle: "Explore La Trinidad",
                    heroSubtitle: "Experience the Philippines' Strawberry Capital. A highland haven of culture, nature, and fresh flavors.",
                    heroImages: []
                },
                about: {
                    heroTitle: "About La Trinidad",
                    heroSubtitle: "The Strawberry Capital of the Philippines, where nature's bounty meets rich highland heritage.",
                    heroImage: "https://images.unsplash.com/photo-1594270433722-5b18f50b4a48?q=80&w=1920&auto=format&fit=crop",
                    storyTitle: "Our Story",
                    storyContent: "La Trinidad has a rich history dating back to the pre-colonial era. The municipality was named after Doña Trinidad de Leon, wife of the former Spanish Governor-General Narciso Claveria.\n\nToday, it serves as the vibrant capital of Benguet. It stands as a testament to the resilience and industriousness of its people, blending the traditions of the Ibaloi and Kankanaey with modern agricultural advancements.",
                    journeyThroughTime,
                    localGovernment
                }
            });
            console.log('✅ Site settings created with journey and government data.');
        } else {
            console.log('Existing site settings found — patching journey and government data...');

            // Only overwrite if empty — preserves any data admin already entered
            if (!settings.about.journeyThroughTime || settings.about.journeyThroughTime.length === 0) {
                settings.about.journeyThroughTime = journeyThroughTime;
                console.log('  → Journey Through Time seeded.');
            } else {
                console.log(`  → Journey already has ${settings.about.journeyThroughTime.length} entries, skipping.`);
            }

           if (!settings.about.localGovernment?.content || settings.about.localGovernment.content.trim() === '') {
    settings.about.localGovernment = localGovernment;
    console.log('  → Local Government seeded.');
} else {
    console.log('  → Local Government already has content, skipping.');
}


            // Mark nested objects as modified so Mongoose saves them
            settings.markModified('about.journeyThroughTime');
            settings.markModified('about.localGovernment');

            await settings.save();
            console.log('✅ Site settings updated successfully.');
        }

        console.log('\n📋 Summary:');
        console.log(`   Journey entries: ${settings.about.journeyThroughTime.length}`);
        console.log(`   Gov title: ${settings.about.localGovernment?.title}`);
        console.log(`   Officials: ${settings.about.localGovernment?.officials?.length || 0}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding site settings:', error.message);
        process.exit(1);
    }
};

seedSiteSettings();