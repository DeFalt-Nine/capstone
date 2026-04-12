import express from 'express';

const router = express.Router();

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

export default router;
