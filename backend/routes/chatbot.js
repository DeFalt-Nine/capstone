import express from 'express';
import ChatLog from '../models/ChatLog.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { body } = req;
    const { message, model: requestedModel, intentContext } = body;
    const { env } = process;
    const apiKey = env.GROQ_API_KEY;
    const model = requestedModel || env.GROQ_MODEL || 'llama-3.1-8b-instant';

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    let systemInstruction = `You are a friendly and helpful tour guide for La Trinidad, Benguet. 

IMPORTANT RULES:
1. Keep responses SHORT (2-3 sentences max).
2. Use **bold** for key location names.
3. SCOPE: ONLY answer questions related to La Trinidad, tourism, local culture, travel, or directions within the area.
4. OFF-TOPIC: If a user asks something unrelated (e.g., general cooking, math, global news, coding), politely decline and state that you are only trained to assist with La Trinidad travel and tourism. DO NOT try to force a connection to La Trinidad for unrelated topics (e.g., don't talk about "La Trinidad rice" if asked how to cook rice).
5. TRANSPORTATION FACTS: 
   - TRICYCLES DO NOT EXIST in Baguio or La Trinidad.
   - MOTORCYCLE TAXIS (Angkas/Joyride) are NOT available here.
   - Use only: Jeepneys, Taxis (White/Grey), or Private Cars.
6. CRITICAL: When you mention ANY specific place, landmark, restaurant, or terminal, you MUST wrap them in double brackets exactly like this: [[Place Name]]. 
   - Examples: [[La Trinidad Strawberry Farm]], [[Baguio City Hall]], [[SM Baguio]], [[Bell Church]], [[Jack's Restaurant]].
   - This creates an interactive link for the user to see details on our site and a Google Maps link.
   - DO NOT use empty brackets [[ ]] or brackets with just whitespace.
`;

    if (intentContext) {
      systemInstruction += `\n\nUSE THIS FACTUAL INFORMATION TO GUIDE YOUR RESPONSE:\n${intentContext}`;
    }

    const messages = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: message },
    ];

    const payload = {
      model,
      messages,
      stream: true,
    };

    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    const fetchOptions = {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    };

    const apiResponse = await fetch(url, fetchOptions);

    const { ok, status, statusText, body: responseStream } = apiResponse;

    if (!ok) {
      const errorText = await apiResponse.text();
      console.error(`Error from AI API (${status}):`, errorText);
      res.write(`Sorry, I encountered an error: ${statusText}`);
      return res.end();
    }

    let fullBotResponse = '';
    let buffer = '';
    const decoder = new TextDecoder();

    try {
        for await (const chunk of responseStream) {
            buffer += decoder.decode(chunk, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
                
                const jsonStr = trimmedLine.slice(6);
                if (jsonStr === '[DONE]') continue;

                try {
                    const json = JSON.parse(jsonStr);
                    const content = json.choices?.[0]?.delta?.content;
                    
                    if (content) {
                        res.write(content);
                        fullBotResponse += content;
                    }
                } catch (e) {
                    console.error('Error parsing JSON from stream:', e.message, 'Line:', jsonStr);
                }
            }
        }

        res.end();
        if (fullBotResponse) {
            try {
                await ChatLog.create({
                    userMessage: message,
                    botResponse: fullBotResponse,
                    isIntent: false,
                });
            } catch (dbErr) {
                console.error('Error saving chat log to DB:', dbErr.message);
            }
        }
    } catch (err) {
        console.error('Stream error:', err);
        if (!res.headersSent) {
            res.status(500).end();
        } else {
            res.end();
        }
    }
  } catch (error) {
    const { message: errorMessage } = error;
    console.error('Error in chatbot route:', errorMessage);
    if (!res.headersSent) {
      res.status(500).json({ error: errorMessage || 'Failed to get response from AI model' });
    } else {
      res.end();
    }
  }
});

export default router;
