
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Define upload directory path relative to this file
// __dirname is backend/routes, so ../uploads puts it in backend/uploads
const uploadDir = path.resolve(__dirname, '../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`[Upload] Created directory: ${uploadDir}`);
    } catch (err) {
        console.error("[Upload] Failed to create directory:", err);
    }
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Re-check existence just in case
    if (!fs.existsSync(uploadDir)){
         fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    // Sanitize filename
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + '-' + safeName);
  }
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image file (jpg, png, etc).'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('image');

// @route   POST /api/upload
// @desc    Upload an image
router.post('/', (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ message: `Error: ${err.message}` });
    }

    // Everything went fine.
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct full URL
    // Use x-forwarded-proto to handle proxies (like Render/Heroku) correctly using https
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    
    res.status(200).json({ 
        message: 'Image uploaded successfully',
        url: fileUrl 
    });
  });
});

module.exports = router;
