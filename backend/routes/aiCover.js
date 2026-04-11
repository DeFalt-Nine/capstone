import express from 'express';
import fetch from 'node-fetch'; // If not available, we can use global fetch in Node 18+

const router = express.Router();

// Mapping for prompt building
const THEME_MAP = {
  "Mountains": "majestic mountain ridges, rolling hills, highland peaks",
  "Fields": "vibrant green agricultural fields, terraced rows, lush vegetation",
  "Roads": "winding asphalt highland roads, pine tree lined streets, scenic paths",
  "Valley": "vast valley vistas, stobosa-style hillside houses, community landscapes",
  "Water": "mountain streams, misty waterfalls, dew-covered leaves"
};

const TIME_MAP = {
  "Morning": "soft blue morning light, rising sun, morning dew, hazy atmosphere",
  "Afternoon": "bright direct sunlight, clear blue skies, sharp shadows, vibrant colors",
  "Sunset": "golden hour glow, deep orange and purple sky, long shadows, dramatic lighting",
  "Night": "cool dark blue tones, starry night sky, distant glowing lights, moonlight"
};

const STYLE_MAP = {
  "Cinematic": "cinematic wide-angle shot, dramatic lighting, movie still quality",
  "Photography": "professional travel photography, natural realistic look, high resolution",
  "Minimalist": "minimalist composition, clean lines, plenty of negative space, simple beauty"
};

async function generateWithVertex(prompt) {
  const PROJECT_ID = process.env.GCP_PROJECT_ID;
  const SERVICE_ACCOUNT_KEY = process.env.GCP_SERVICE_ACCOUNT_KEY;

  if (!PROJECT_ID || !SERVICE_ACCOUNT_KEY) {
    throw new Error("GCP Configuration missing (Project ID or Service Account Key)");
  }

  let credentials;
  try {
    credentials = JSON.parse(SERVICE_ACCOUNT_KEY);
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    }
  } catch (err) {
    throw new Error("Invalid GCP_SERVICE_ACCOUNT_KEY format (must be JSON)");
  }

  const auth = new GoogleAuth({
    credentials,
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });

  const token = await auth.getAccessToken();

  // Imagen 3.0 endpoint
  const URL = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict`;

  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "16:9",
        outputMimeType: "image/png",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Vertex AI request failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error("No image data in response");

  return `data:image/png;base64,${b64}`;
}

// @route   POST /api/ai-cover/generate
router.post('/generate', async (req, res) => {
  try {
    const { subject, time, style } = req.body;

    if (!subject || !time || !style) {
      return res.status(400).json({ message: "Subject, time, and style are required." });
    }

    const subjectDesc = THEME_MAP[subject] || subject;
    const timeDesc = TIME_MAP[time] || time;
    const styleDesc = STYLE_MAP[style] || style;

    const prompt = `${styleDesc} of ${subjectDesc} during ${timeDesc}. High quality, sharp render, no text, no people, no faces, clean composition, 16:9 aspect ratio.`;

    console.log(`[AI Cover] Generating with prompt: ${prompt}`);
    
    const dataUrl = await generateWithVertex(prompt);

    res.json({ image: dataUrl, prompt });
  } catch (error) {
    console.error("[AI Cover] Error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
