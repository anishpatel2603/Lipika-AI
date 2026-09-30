import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { agentInstance } from '../server/agent.js';
import { ocrService } from '../server/ocr.js';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Lipika AI Agent (Vercel Serverless)',
    version: '1.0.0',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

app.post('/api/transliterate', async (req: Request, res: Response) => {
  try {
    const { text, source, options } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Please enter some text first.' });
    }
    const correctOcr = options?.correctOcr ?? true;
    const result = await agentInstance.transliterate(text, source || 'text', correctOcr);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Transliteration failed' });
  }
});

app.post('/api/ocr', async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'Image is required' });
    }
    const result = await ocrService.extractText(image);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'OCR failed' });
  }
});

app.post('/api/agent-chat', async (req: Request, res: Response) => {
  try {
    const { message, originalText, currentTransliteration } = req.body;
    const response = await agentInstance.chatWithAgent(
      message,
      originalText || '',
      currentTransliteration || ''
    );
    return res.json(response);
  } catch (error: any) {
    return res.status(500).json({ reply: 'Could not process chat.', updatedTransliteration: req.body?.currentTransliteration || '' });
  }
});

export default app;
