import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

let aiClient = null;
function getGeminiClient() {
    if (!aiClient) {
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }
        aiClient = new GoogleGenAI({ apiKey: key });
    }
    return aiClient;
}

router.post('/generate-cover', async (req, res) => {
    const { prompt } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    const apiKey = (process.env.POLLINATIONS_API_KEY || '').trim();
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Log key prefix for debugging (safe)
    if (apiKey) {
        console.log(`[Backend] Using Pollinations Key starting with: ${apiKey.substring(0, 4)}... (Length: ${apiKey.length})`);
    } else {
        console.log('[Backend] WARNING: POLLINATIONS_API_KEY is not defined in environment variables');
    }

    // Pollinations.ai Image API URL (using Flux Schnell as the default model)
    const baseUrl = 'https://gen.pollinations.ai/image';
    const queryParams = `width=1280&height=720&seed=${seed}&model=flux&nologo=true`;
    
    // Add key to query params as well for extra reliability
    const url = apiKey 
        ? `${baseUrl}/${encodedPrompt}?${queryParams}&key=${encodeURIComponent(apiKey)}`
        : `${baseUrl}/${encodedPrompt}?${queryParams}`;

    try {
        const headers = {};
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await fetch(url, { 
            headers,
            redirect: 'follow'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Backend] Pollinations API Error Details: Status ${response.status}, Text: ${errorText.substring(0, 200)}`);
            throw new Error(`Pollinations API error (${response.status}): ${response.statusText || errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            throw new Error('Pollinations returned HTML instead of an image. The prompt might be blocked.');
        }

        if (contentType && contentType.includes('text/plain')) {
            const text = await response.text();
            console.error('[Backend] Received plain text instead of image:', text.substring(0, 500));
            throw new Error(`Pollinations returned text: ${text.substring(0, 100)}`);
        }

        // node-fetch v2 uses .buffer()
        // native fetch/node-fetch v3 uses .arrayBuffer()
        let buffer;
        if (typeof response.buffer === 'function') {
            buffer = await response.buffer();
        } else {
            const arrayBuffer = await response.arrayBuffer();
            if (typeof Buffer !== 'undefined') {
                buffer = Buffer.from(arrayBuffer);
            } else {
                // Fallback for environments without Buffer
                const uint8Array = new Uint8Array(arrayBuffer);
                let binary = '';
                for (let i = 0; i < uint8Array.byteLength; i++) {
                    binary += String.fromCharCode(uint8Array[i]);
                }
                buffer = { toString: () => btoa(binary) };
            }
        }
        
        if (!buffer || buffer.length === 0) {
            throw new Error('Pollinations returned an empty response.');
        }
        
        const base64Image = buffer.toString('base64');
        const dataUrl = `data:image/png;base64,${base64Image}`;
        
        res.json({ imageUrl: dataUrl });
    } catch (error) {
        console.error('[Backend] Pollinations Generation Error:', error);
        res.status(500).json({ message: 'Failed to generate image with Pollinations.ai' });
    }
});

router.post('/generate-itinerary', async (req, res) => {
    const { spots, dining, budget, days, startDate, endDate, budgetAmount } = req.body;

    if (!spots || !Array.isArray(spots) || spots.length === 0) {
        return res.status(400).json({ message: 'At least one tourist spot must be selected.' });
    }

    try {
        const ai = getGeminiClient();

        let budgetText = budget;
        if (budgetAmount) {
            budgetText = `₱${Number(budgetAmount).toLocaleString()} PHP total`;
        }

        let dateRangeText = `${days} day(s)`;
        if (startDate && endDate) {
            dateRangeText = `${days} day(s) (from ${startDate} to ${endDate})`;
        }

        const promptText = `
        You are an expert travel assistant for La Trinidad, Benguet, Philippines ("Strawberry Capital of the Philippines").
        Generate a cohesive, highly realistic, and satisfying hour-by-hour travel itinerary based on the following preferences:
        
        - Selected Tourist Spots to visit: ${spots.map(s => `"${s.name}" (${s.category || ''} - ${s.description || ''})`).join(', ')}
        - Selected Eateries / Dining Spots to try: ${dining && dining.length > 0 ? dining.map(d => `"${d.name}" (${d.description || ''})`).join(', ') : 'None specified (suggest standard local ones like Calajo, BSU Food Center, local strawberry taho/ice cream)'}
        - Trip Duration / Dates: ${dateRangeText}
        - Budget Preference: ${budgetText} (Please craft the itinerary so that the total estimated cost per person stays strictly within or very close to this total budget: ${budgetText}. Adjust the choice of local transportation (jeepney vs. taxi), entrance fee activities, and menu recommendations at restaurants to match this specific budget amount.)

        La Trinidad attractions context for accurate timing and placement:
        - Bell Church is on the boundary of Baguio and La Trinidad ( Km 3).
        - Stobosa (Km 3) is very close to Bell Church.
        - Strawberry Farm (Km 5) is in the valley floor.
        - Mount Kalugong and Mount Yangbew are mountain peaks requiring short hikes. Suggest early morning or late afternoon for these to enjoy the sunrise/sunset and cool weather.
        - Mount Costa is further out on Lamtang Road (requires a taxi/jeepney ride).
        
        Requirements:
        1. Produce a detailed hour-by-hour plan for each day (from morning around 7:30 AM/8:00 AM to evening around 7:00 PM/8:00 PM).
        2. Incorporate realistic travel times between locations. Suggest local transportation (jeepney, taxi, or walking).
        3. Make sure to weave in the selected eateries or suggest appropriate local alternatives when none are selected.
        4. Give concrete, realistic estimates of costs in Philippine Peso (PHP) for entries, activities, food, and local transit.
        5. Return the response as a JSON object matching the requested schema. Do not include markdown codeblocks or backticks.
        6. CRITICAL SCOPE RESTRICTION: Only schedule activities, sights, or routes physically located in La Trinidad, Benguet. Do NOT include, recommend, or route through Baguio City attractions (such as Burnham Park, Session Road, Camp John Hay, Mines View, SM Baguio, etc.). The ONLY exception is mentioning the jeepney/public transport terminals located in Baguio City (like Magsaysay Ave or Centermall) used solely as a starting point or return point for traveling to or from La Trinidad.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        title: { type: 'STRING', description: 'Attractive, catchy title for the itinerary' },
                        description: { type: 'STRING', description: 'A short 2-3 sentence overview of what they will experience' },
                        estimatedTotalCost: { type: 'INTEGER', description: 'Sum of all activities, transit, and food per person in PHP' },
                        days: {
                            type: 'ARRAY',
                            items: {
                                type: 'OBJECT',
                                properties: {
                                    dayNumber: { type: 'INTEGER' },
                                    theme: { type: 'STRING', description: 'The focus or theme of this day' },
                                    activities: {
                                        type: 'ARRAY',
                                        items: {
                                            type: 'OBJECT',
                                            properties: {
                                                time: { type: 'STRING', description: 'e.g., 08:00 AM' },
                                                activity: { type: 'STRING', description: 'Action-oriented name of the activity' },
                                                location: { type: 'STRING', description: 'Name of the spot or area' },
                                                cost: { type: 'INTEGER', description: 'Estimated cost in PHP (0 if free)' },
                                                notes: { type: 'STRING', description: 'Practical tip (e.g. "Try strawberry taho for ₱40 here" or "Jeepney ride Km 4 to Km 5: ₱15")' }
                                            },
                                            required: ['time', 'activity', 'location', 'cost', 'notes']
                                        }
                                    }
                                },
                                required: ['dayNumber', 'theme', 'activities']
                            }
                        },
                        localTips: {
                            type: 'ARRAY',
                            items: { type: 'STRING' },
                            description: '3-4 custom local tips tailored to their itinerary or budget'
                        }
                    },
                    required: ['title', 'description', 'estimatedTotalCost', 'days', 'localTips']
                }
            }
        });

        const textResponse = response.text;
        res.setHeader('Content-Type', 'application/json');
        res.send(textResponse);
    } catch (error) {
        console.error('[Backend] Gemini Itinerary Generation Error:', error);
        res.status(500).json({ message: error.message || 'Failed to generate itinerary. Please try again later.' });
    }
});

// --- Server-Side "File Env Table" / File Database for Itineraries ---
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'backend', 'data');
const DATA_FILE = path.join(DATA_DIR, 'itineraries.json');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

async function readItinerariesFromFile() {
    ensureDataDir();
    if (!fs.existsSync(DATA_FILE)) {
        return {};
    }
    try {
        const data = await fs.promises.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data || '{}');
    } catch (err) {
        console.error('Error reading itineraries file:', err);
        return {};
    }
}

async function writeItinerariesToFile(data) {
    ensureDataDir();
    try {
        await fs.promises.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing itineraries file:', err);
        return false;
    }
}

router.post('/save-itinerary', async (req, res) => {
    const { email, itinerary, action, id } = req.body;
    const userEmail = email || 'anonymous';

    try {
        const allItineraries = await readItinerariesFromFile();
        
        let userRecord = allItineraries[userEmail];
        let itinerariesList = [];
        
        // Handle migration from old format where it was just { itinerary, updatedAt }
        if (userRecord) {
            if (Array.isArray(userRecord.itineraries)) {
                itinerariesList = userRecord.itineraries;
            } else if (userRecord.itinerary) {
                itinerariesList = [{
                    id: 'legacy-1',
                    title: userRecord.itinerary.title || 'My Saved Itinerary',
                    itinerary: userRecord.itinerary,
                    createdAt: userRecord.updatedAt || new Date().toISOString(),
                    updatedAt: userRecord.updatedAt || new Date().toISOString()
                }];
            }
        }

        const now = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

        // Clean up itineraries older than 30 days
        itinerariesList = itinerariesList.filter(item => {
            const createdAtMs = new Date(item.createdAt).getTime();
            return (now - createdAtMs) < thirtyDaysMs;
        });

        if (action === 'delete') {
            if (!id) {
                return res.status(400).json({ message: 'Itinerary ID is required for delete' });
            }
            itinerariesList = itinerariesList.filter(item => item.id !== id);
            allItineraries[userEmail] = {
                itineraries: itinerariesList,
                updatedAt: new Date().toISOString()
            };
            await writeItinerariesToFile(allItineraries);
            return res.json({ success: true, message: 'Itinerary deleted successfully', itineraries: itinerariesList });
        }

        // Save or update
        if (itinerary) {
            const targetId = id || itinerary.id || `itinerary-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const title = itinerary.title || 'My Saved Itinerary';
            
            // Check if it already exists
            const existingIndex = itinerariesList.findIndex(item => item.id === targetId);
            const itineraryItem = {
                id: targetId,
                title,
                itinerary: { ...itinerary, id: targetId }, // embed id into the itinerary
                createdAt: existingIndex >= 0 ? itinerariesList[existingIndex].createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (existingIndex >= 0) {
                itinerariesList[existingIndex] = itineraryItem;
            } else {
                itinerariesList.push(itineraryItem);
            }

            allItineraries[userEmail] = {
                itineraries: itinerariesList,
                updatedAt: new Date().toISOString()
            };

            const success = await writeItinerariesToFile(allItineraries);
            if (success) {
                return res.json({ 
                    success: true, 
                    message: 'Itinerary saved successfully on server database', 
                    itineraries: itinerariesList,
                    itinerary: itineraryItem.itinerary
                });
            } else {
                return res.status(500).json({ message: 'Failed to write to file database' });
            }
        } else {
            // Keep existing itineraries if they pass null (e.g., reset)
            return res.json({ success: true, itineraries: itinerariesList });
        }
    } catch (error) {
        console.error('Error saving itinerary to file db:', error);
        res.status(500).json({ message: error.message || 'Server error saving itinerary' });
    }
});

router.post('/get-itinerary', async (req, res) => {
    const { email } = req.body;
    const userEmail = email || 'anonymous';

    try {
        const allItineraries = await readItinerariesFromFile();
        const userRecord = allItineraries[userEmail];
        
        let itinerariesList = [];
        if (userRecord) {
            if (Array.isArray(userRecord.itineraries)) {
                itinerariesList = userRecord.itineraries;
            } else if (userRecord.itinerary) {
                itinerariesList = [{
                    id: 'legacy-1',
                    title: userRecord.itinerary.title || 'My Saved Itinerary',
                    itinerary: userRecord.itinerary,
                    createdAt: userRecord.updatedAt || new Date().toISOString(),
                    updatedAt: userRecord.updatedAt || new Date().toISOString()
                }];
            }
        }

        const now = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

        // Clean up itineraries older than 30 days
        const originalCount = itinerariesList.length;
        itinerariesList = itinerariesList.filter(item => {
            const createdAtMs = new Date(item.createdAt).getTime();
            return (now - createdAtMs) < thirtyDaysMs;
        });

        // Save back if any cleaned up
        if (itinerariesList.length !== originalCount) {
            allItineraries[userEmail] = {
                itineraries: itinerariesList,
                updatedAt: new Date().toISOString()
            };
            await writeItinerariesToFile(allItineraries);
        }

        if (itinerariesList.length > 0) {
            const latest = itinerariesList[itinerariesList.length - 1];
            return res.json({ 
                success: true, 
                itineraries: itinerariesList,
                itinerary: latest.itinerary 
            });
        } else {
            return res.json({ success: false, message: 'No itineraries found for this user', itineraries: [] });
        }
    } catch (error) {
        console.error('Error getting itinerary from file db:', error);
        res.status(500).json({ message: error.message || 'Server error loading itinerary' });
    }
});

export default router;
