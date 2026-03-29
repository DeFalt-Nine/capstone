
import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
    home: {
        heroWelcomeText: { type: String, default: "Welcome to the Valley of Colors" },
        heroTitle: { type: String, default: "Explore La Trinidad" },
        heroSubtitle: { type: String, default: "Experience the Philippines' Strawberry Capital. A highland haven of culture, nature, and fresh flavors." },
        heroImages: [
            {
                url: { type: String },
                alt: { type: String }
            }
        ]
    },
    about: {
        heroTitle: { type: String, default: "About La Trinidad" },
        heroSubtitle: { type: String, default: "The Strawberry Capital of the Philippines, where nature's bounty meets rich highland heritage." },
        heroImage: { type: String, default: "https://images.unsplash.com/photo-1594270433722-5b18f50b4a48?q=80&w=1920&auto=format&fit=crop" },
        storyTitle: { type: String, default: "Our Story" },
        storyContent: { type: String, default: "La Trinidad has a rich history dating back to the pre-colonial era. The municipality was named after Doña Trinidad de Leon, wife of the former Spanish Governor-General Narciso Claveria.\n\nToday, it serves as the vibrant capital of Benguet. It stands as a testament to the resilience and industriousness of its people, blending the traditions of the Ibaloi and Kankanaey with modern agricultural advancements." },
        journeyThroughTime: [
            {
                year: { type: String },
                title: { type: String },
                content: { type: String },
                image: { type: String }
            }
        ],
        localGovernment: {
            title: { type: String, default: "Local Government" },
            content: { type: String },
            image: { type: String },
            officials: [
                {
                    name: { type: String },
                    position: { type: String },
                    image: { type: String }
                }
            ]
        }
    }
}, { timestamps: true });

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;
