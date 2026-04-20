import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

const DEFAULT_SETTINGS = {
    home: {
        heroWelcomeText: "Welcome to the Valley of Colors",
        heroTitle: "Explore La Trinidad",
        heroSubtitle: "Experience the Philippines' Strawberry Capital. A highland haven of culture, nature, and fresh flavors.",
        heroImages: [
            {
                url: 'https://images.unsplash.com/photo-1536481046830-9b11bb07e8b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQaGlsaXBwaW5lcyUyMG1vdW50YWluJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2MTgyNjY5N3ww&ixlib=rb-4.1.0&q=80&w=1920',
                alt: 'Sea of Clouds'
            },
            {
                url: 'https://images.unsplash.com/photo-1627346850259-33b6833eb882?q=80&w=1920&auto=format&fit=crop',
                alt: 'Strawberry Farm'
            },
            {
                url: 'https://images.unsplash.com/photo-1610410196774-728b7e7a8e79?q=80&w=1920&auto=format&fit=crop',
                alt: 'Stobosa Mural'
            }
        ]
    },
    about: {
        heroTitle: "About La Trinidad",
        heroSubtitle: "The Strawberry Capital of the Philippines, where nature's bounty meets rich highland heritage.",
        heroImage: "https://images.unsplash.com/photo-1594270433722-5b18f50b4a48?q=80&w=1920&auto=format&fit=crop",
        storyTitle: "Our Story",
        storyContent: "La Trinidad has a rich history dating back to the pre-colonial era. The municipality was named after Doña Trinidad de Leon, wife of the former Spanish Governor-General Narciso Claveria.\n\nToday, it serves as the vibrant capital of Benguet. It stands as a testament to the resilience and industriousness of its people, blending the traditions of the Ibaloi and Kankanaey with modern agricultural advancements."
    }
};

// @desc    Get site settings
// @route   GET /api/site-settings
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('data')
            .eq('id', 1)
            .single();

        if (error || !data) {
            // Create default settings if not exists
            const { data: newData, error: iError } = await supabase
                .from('site_settings')
                .upsert([{ id: 1, data: DEFAULT_SETTINGS }])
                .select()
                .single();
            
            if (iError) throw iError;
            return res.json(newData.data);
        }

        res.json(data.data);
    } catch (error) {
        console.error('[SiteSettings Error]', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update site settings
// @route   PUT /api/site-settings
// @access  Private/Admin
router.put('/', verifyAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .upsert([{ id: 1, data: req.body }])
            .select()
            .single();

        if (error) throw error;
        res.json(data.data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
