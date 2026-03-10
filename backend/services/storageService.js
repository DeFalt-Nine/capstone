import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Extracts the publicId (path) from a Supabase or Local URL
 * @param {string} url - The full URL of the image
 * @returns {string|null} - The publicId or null if not found
 */
export const extractPublicId = (url) => {
    if (!url) return null;

    try {
        // Supabase
        if (url.includes('supabase.co')) {
            // Example: https://xyz.supabase.co/storage/v1/object/public/images/uploads/123.png
            const parts = url.split('/public/');
            if (parts.length > 1) {
                const bucketAndPath = parts[1]; // images/uploads/123.png
                const bucketName = process.env.SUPABASE_BUCKET || 'images';
                if (bucketAndPath.startsWith(bucketName + '/')) {
                    return bucketAndPath.replace(bucketName + '/', ''); // uploads/123.png
                }
            }
        }

        // Local
        if (url.includes('/uploads/')) {
            const parts = url.split('/uploads/');
            return parts[parts.length - 1];
        }
    } catch (e) {
        console.error('[Storage Error] Failed to extract publicId:', e.message);
    }

    return null;
};

/**
 * Deletes an image from the configured storage (Supabase or Local)
 * @param {string} identifier - The path/public_id OR the full URL
 * @returns {Promise<boolean>} - True if successful
 */
export const deleteImage = async (identifier) => {
    if (!identifier) return false;

    // If it's a URL, extract the publicId first
    let publicId = identifier;
    if (identifier.startsWith('http')) {
        publicId = extractPublicId(identifier);
    }

    if (!publicId) return false;

    const isSupabaseConfigured = process.env.SUPABASE_URL && process.env.SUPABASE_KEY && process.env.SUPABASE_BUCKET;

    try {
        if (isSupabaseConfigured && supabase) {
            console.log(`[Storage] Deleting from Supabase: ${publicId}`);
            const { error } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .remove([publicId]);
            
            if (error) throw error;
            return true;
        } 

        // Fallback to local storage
        const filePath = path.resolve(__dirname, '../uploads', publicId);
        if (fs.existsSync(filePath)) {
            console.log(`[Storage] Deleting from Local: ${publicId}`);
            fs.unlinkSync(filePath);
            return true;
        }

        return false;
    } catch (error) {
        console.error('[Storage Error] Failed to delete image:', error.message);
        return false;
    }
};
