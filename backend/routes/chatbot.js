import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();
import ChatLog from '../models/ChatLog.js';

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.API_KEY) {
        return res.status(500).json({ error: 'API_KEY is not configured on the server.' });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Call the OpenRouter API with streaming enabled
    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_KEY}`,
            'HTTP-Referer': 'https://visit-la-trinidad.example.com',
            'X-Title': 'Visit La Trinidad',
        },
        body: JSON.stringify({
            model: 'tngtech/deepseek-r1t2-chimera:free', 
            messages: [
                {
                    role: 'system',
                    content: `You are a friendly and helpful tour guide for La Trinidad, Benguet. 

IMPORTANT RULES:
1. Keep responses SHORT (2-3 sentences max).
2. Use **bold** for key location names.
3. CRITICAL: When you mention any of the following specific places, you MUST wrap them in double brackets exactly like this: [[Place Name]]. 
   - [[La Trinidad Strawberry Farm]]
   - [[Bell Church]]
   - [[Mount Kalugong Cultural Village]]
   - [[Colors of Stobosa]]
   - [[Mt. Yangbew]]
   - [[Benguet Museum]]
   - [[Lily of the Valley Organic Farms]]
   - [[La Trinidad Vegetable Trading Post]]
   - [[Mount Costa]]
   - [[Bahong Rose Gardens]]
   - [[Avong nen Romy]]
   - [[Jack's Restaurant]]
   - [[Calajo Restaurant]]
   - [[Mount Kalugong Kape-an]]
   - [[Sizzling Plate]]

This creates an interactive link for the user to see details on our site.`
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            stream: true 
        }),
    });

     if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error(`Error from AI API (${apiResponse.status}):`, errorText);
        res.write(`Sorry, I encountered an error: ${apiResponse.statusText}`);
        return res.end();
    }

    // Process the stream
    const stream = apiResponse.body;
    let buffer = '';
    let fullBotResponse = ''; 

    stream.on('data', (chunk) => {
        const textChunk = chunk.toString();
        buffer += textChunk;

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6);
                if (jsonStr === '[DONE]') continue;

                try {
                    const json = JSON.parse(jsonStr);
                    const content = json.choices[0]?.delta?.content || '';
                    if (content) {
                        res.write(content);
                        fullBotResponse += content; 
                    }
                } catch (e) {
                }
            }
        }
    });

    stream.on('end', async () => {
        res.end();
        
        try {
            if (fullBotResponse) {
                await ChatLog.create({
                    userMessage: message,
                    botResponse: fullBotResponse,
                    isIntent: false
                });
            }
        } catch (logError) {
            console.error('Error logging chat to MongoDB:', logError);
        }
    });

    stream.on('error', (err) => {
        console.error('Stream error:', err);
        res.end();
    });

  } catch (error) {
    console.error('Error in chatbot route:', error.message);
    if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Failed to get response from AI model' });
    } else {
        res.end();
    }
  }
});

export default router;
