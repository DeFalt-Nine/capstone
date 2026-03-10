import express from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { supabase } from '../config/supabase.js';
import { deleteImage } from '../services/storageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads');

// Local storage configuration
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadDir)){
         fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + '-' + safeName);
  }
});

// Memory storage for Supabase
const memoryStorage = multer.memoryStorage();

// File filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image file (jpg, png, etc).'), false);
  }
};

// Determine which storage to use
const isSupabaseConfigured = process.env.SUPABASE_URL && process.env.SUPABASE_KEY && process.env.SUPABASE_BUCKET;

// Prioritize Supabase, then Local
let selectedStorage = localStorage;
if (isSupabaseConfigured) {
    selectedStorage = memoryStorage;
}

const upload = multer({ 
  storage: selectedStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit as requested
}).single('image');

// @route   POST /api/upload
// @desc    Upload an image to Supabase or Local Storage
router.post('/', (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: `Error: ${err.message}` });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    let fileUrl;
    let publicId;

    try {
        if (isSupabaseConfigured && supabase) {
            const file = req.file;
            const fileExt = file.originalname.split('.').pop();
            const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { data, error } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .getPublicUrl(filePath);

            fileUrl = publicUrl;
            publicId = filePath;
        } else {
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.get('host');
            fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
            publicId = req.file.filename;
        }
        
        res.status(200).json({ 
            message: `Image uploaded successfully to ${isSupabaseConfigured ? 'Supabase' : 'Local Storage'}`,
            url: fileUrl,
            public_id: publicId
        });
    } catch (error) {
        console.error('[Upload Error]', error);
        res.status(500).json({ message: 'Failed to upload image', error: error.message });
    }
  });
});

// @route   DELETE /api/upload/:publicId
// @desc    Delete an image from storage
router.delete('/:publicId(*)', async (req, res) => {
    const { publicId } = req.params;
    if (!publicId) return res.status(400).json({ message: 'Public ID is required' });

    try {
        const success = await deleteImage(publicId);
        if (success) {
            res.status(200).json({ message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ message: 'Image not found or could not be deleted' });
        }
    } catch (error) {
        console.error('[Delete Error]', error);
        res.status(500).json({ message: 'Failed to delete image', error: error.message });
    }
});

export default router;
