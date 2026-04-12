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
3. TRANSPORTATION FACTS: 
   - TRICYCLES DO NOT EXIST in Baguio or La Trinidad.
   - MOTORCYCLE TAXIS (Angkas/Joyride) are NOT available here.
   - Use only: Jeepneys, Taxis (White/Grey), or Private Cars.
4. CRITICAL: When you mention any of the following specific places, you MUST wrap them in double brackets exactly like this: [[Place Name]]. 
   - DO NOT use empty brackets [[ ]] or brackets with just whitespace.
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

This creates an interactive link for the user to see details on our site.`;

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

    responseStream.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith('data: ')) continue;
        
        const jsonStr = trimmedLine.slice(6);
        if (jsonStr === '[DONE]') continue;

        try {
          const json = JSON.parse(jsonStr);
          const { choices } = json;
          const [choice] = choices || [];
          const { delta } = choice || {};
          const { content } = delta || {};
          
          if (content) {
            res.write(content);
            fullBotResponse += content;
          }
        } catch (e) {
          // Ignore
        }
      }
    });

    responseStream.on('end', async () => {
      res.end();
      if (fullBotResponse) {
        await ChatLog.create({
          userMessage: message,
          botResponse: fullBotResponse,
          isIntent: false,
        });
      }
    });

    responseStream.on('error', (err) => {
      console.error('Stream error:', err);
      res.end();
    });
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
