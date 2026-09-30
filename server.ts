import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { agentInstance } from './server/agent.js';
import { ocrService } from './server/ocr.js';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser with 20MB limit for high-res camera captures
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Lipika AI Agent Server',
    version: '1.0.0',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    ocrProvider: process.env.OCR_PROVIDER || 'gemini',
    aiProvider: process.env.AI_PROVIDER || 'gemini',
  });
});

// Endpoint: POST /api/transliterate
app.post('/api/transliterate', async (req: Request, res: Response) => {
  try {
    const { text, source, options } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please enter some text first.',
      });
    }

    const correctOcr = options?.correctOcr ?? true;
    const result = await agentInstance.transliterate(text, source || 'text', correctOcr);
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/transliterate:', error);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong while processing your request. Please try again.',
    });
  }
});

// Endpoint: POST /api/ocr
app.post('/api/ocr', async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid image base64 data.',
      });
    }

    const ocrResult = await ocrService.extractText(image);
    return res.json(ocrResult);
  } catch (error: any) {
    console.error('Error in /api/ocr:', error);
    return res.status(500).json({
      success: false,
      error: "I couldn't detect readable text in this image. Try a clearer photo.",
    });
  }
});

// Endpoint: POST /api/image-transliterate (End-to-End Pipeline)
app.post('/api/image-transliterate', async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid image.',
      });
    }

    // Step 1: Vision OCR Text Detection
    const ocrResult = await ocrService.extractText(image);
    if (!ocrResult.success || !ocrResult.text) {
      return res.status(400).json({
        success: false,
        error: ocrResult.error || "I couldn't detect readable text in this image. Try a clearer photo.",
        ocr_confidence: 0,
        transliteration_confidence: 0,
      });
    }

    // Step 2: Transliteration Agent with OCR error correction enabled
    const agentResult = await agentInstance.transliterate(ocrResult.text, 'camera', true);

    return res.json({
      success: true,
      detected_text: ocrResult.text,
      transliterated_text: agentResult.transliteration,
      ocr_confidence: ocrResult.confidence,
      transliteration_confidence: agentResult.confidence,
      steps: [
        {
          name: 'Vision OCR Processor',
          description: `Extracted ${ocrResult.wordCount} words with ${Math.round(ocrResult.confidence * 100)}% detection accuracy.`,
          timestamp: Date.now(),
          status: 'success',
        },
        ...(agentResult.steps || []),
      ],
    });
  } catch (error: any) {
    console.error('Error in /api/image-transliterate:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process image and transliterate. Please try again.',
    });
  }
});

// Endpoint: POST /api/agent-chat
app.post('/api/agent-chat', async (req: Request, res: Response) => {
  try {
    const { message, originalText, currentTransliteration } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await agentInstance.chatWithAgent(
      message,
      originalText || '',
      currentTransliteration || ''
    );
    return res.json(response);
  } catch (error: any) {
    console.error('Error in /api/agent-chat:', error);
    return res.status(500).json({
      reply: 'An error occurred while consulting the AI agent.',
      updatedTransliteration: req.body.currentTransliteration || '',
    });
  }
});

// Endpoint: POST /api/tts (Devanagari Speech synthesis)
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'TTS requires GEMINI_API_KEY' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 300), // safe limit for quick audio
              speechMetadata: {
                style: 'Natural, clear Indian accent pronunciation of Hindi Devanagari text',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned' });
    }

    return res.json({
      success: true,
      audioUrl: `data:audio/wav;base64,${base64Audio}`,
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    return res.status(500).json({ error: error?.message || 'TTS generation failed' });
  }
});

// Serve frontend: Vite middleware in development, static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Lipika AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
