import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../config/supabase.js';

const router = express.Router();

let aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

router.post('/', async (req, res) => {
  try {
    const { body } = req;
    const { message, model: requestedModel, intentContext } = body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    let systemInstruction = `You are a friendly and helpful tour guide for La Trinidad, Benguet. 

IMPORTANT RULES:
1. Keep responses SHORT (2-3 sentences max).
2. Use **bold** for key location names.
3. SCOPE: ONLY answer questions related to La Trinidad, Benguet. You MUST NOT provide information, reviews, guides, or answers about Baguio City or its attractions (such as SM Baguio, Burnham Park, Session Road, Camp John Hay, etc.). If asked about Baguio City or attractions/establishments in Baguio City, politely decline and clarify that you are exclusive to La Trinidad, Benguet.
   - EXCEPTION: The ONLY exception to discussing Baguio City is mentioning the jeepney/public transport terminals located in Baguio City (e.g., Magsaysay Ave or Centermall terminals) that provide transportation directly going to or returning from La Trinidad.
4. OFF-TOPIC: If a user asks something unrelated (e.g., general cooking, math, global news, coding), politely decline and state that you are only trained to assist with La Trinidad travel and tourism. DO NOT try to force a connection to La Trinidad for unrelated topics.
5. TRANSPORTATION FACTS: 
   - TRICYCLES DO NOT EXIST in Baguio or La Trinidad.
   - MOTORCYCLE TAXIS (Angkas/Joyride) are NOT available here.
   - Use only: Jeepneys, Taxis (White/Grey), or Private Cars.
6. CRITICAL: When you mention ANY specific place, landmark, restaurant, or terminal, you MUST wrap them in double brackets exactly like this: [[Place Name]]. 
   - Examples: [[La Trinidad Strawberry Farm]], [[Bell Church]], [[Mount Kalugong]], [[Mount Yangbew]], [[Colors of Stobosa]].
   - This creates an interactive link for the user to see details on our site and a Google Maps link.
   - DO NOT use empty brackets [[ ]] or brackets with just whitespace.
`;

    if (intentContext) {
      systemInstruction += `\n\nUSE THIS FACTUAL INFORMATION TO GUIDE YOUR RESPONSE:\n${intentContext}`;
    }

    // Default to gemini-2.5-flash or use requested gemini model
    let targetModel = 'gemini-2.5-flash';
    if (requestedModel && typeof requestedModel === 'string' && requestedModel.startsWith('gemini-')) {
      targetModel = requestedModel;
    }

    const ai = getGeminiClient();
    const streamResponse = await ai.models.generateContentStream({
      model: targetModel,
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    let fullBotResponse = '';

    try {
      for await (const chunk of streamResponse) {
        const text = chunk.text;
        if (text) {
          res.write(text);
          fullBotResponse += text;
        }
      }

      res.end();

      if (fullBotResponse) {
        try {
          if (supabase) {
            await supabase.from('chat_logs').insert([{
              user_message: message,
              bot_response: fullBotResponse,
              is_intent: false,
            }]);
          }
        } catch (dbErr) {
          console.error('Error saving chat log to DB:', dbErr.message);
        }
      }
    } catch (err) {
      console.error('Stream processing error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || 'Stream processing failed' });
      } else {
        res.write('\n\n(Stream interrupted: ' + (err.message || 'Error') + ')');
        res.end();
      }
    }
  } catch (error) {
    const { message: errorMessage } = error;
    console.error('Error in chatbot route:', errorMessage);
    if (!res.headersSent) {
      res.status(500).json({ error: errorMessage || 'Failed to get response from Gemini AI' });
    } else {
      res.write('\n\n(Encountered an error: ' + errorMessage + ')');
      res.end();
    }
  }
});

export default router;
