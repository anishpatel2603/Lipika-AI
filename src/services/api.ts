import {
  TransliterateRequest,
  TransliterateResponse,
  OCRResponse,
  ImageTransliterateResponse,
} from '../types/index.js';
import { localTransliterate } from './transliterateEngine.js';
import { runClientOcr } from './clientOcr.js';

export async function transliterateText(
  text: string,
  source: 'text' | 'camera' | 'image' | 'demo' = 'text',
  options?: TransliterateRequest['options']
): Promise<TransliterateResponse> {
  try {
    const response = await fetch('/api/transliterate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source, options }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend /api/transliterate not available (e.g. static hosting on Vercel), using local phonetic engine:', err);
  }

  // Graceful standalone browser fallback (always works on Vercel, Netlify, or offline)
  return localTransliterate(text);
}

export async function ocrExtract(base64Image: string): Promise<OCRResponse> {
  try {
    const response = await fetch('/api/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend /api/ocr not available, falling back to client-side OCR:', err);
  }

  // Client-side fallback via Tesseract.js
  return runClientOcr(base64Image);
}

export async function transliterateImage(base64Image: string): Promise<ImageTransliterateResponse> {
  try {
    const response = await fetch('/api/image-transliterate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend /api/image-transliterate not available, using client pipeline:', err);
  }

  // Client pipeline fallback
  const ocrResult = await runClientOcr(base64Image);
  if (!ocrResult.success || !ocrResult.text) {
    throw new Error(ocrResult.error || "I couldn't detect readable text in this image. Try a clearer photo.");
  }

  const transliterationResult = localTransliterate(ocrResult.text);
  return {
    success: true,
    detected_text: ocrResult.text,
    transliterated_text: transliterationResult.transliteration,
    ocr_confidence: ocrResult.confidence,
    transliteration_confidence: transliterationResult.confidence,
    steps: [
      {
        name: 'Client OCR Engine',
        description: `Recognized ${ocrResult.wordCount} words.`,
        timestamp: 50,
        status: 'success',
      },
      ...(transliterationResult.steps || []),
    ],
  };
}

export async function chatWithAgent(
  message: string,
  originalText: string,
  currentTransliteration: string
): Promise<{ reply: string; updatedTransliteration: string }> {
  try {
    const response = await fetch('/api/agent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, originalText, currentTransliteration }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend /api/agent-chat unavailable:', err);
  }

  const updated = localTransliterate(originalText);
  return {
    reply: "I've re-aligned the transliteration phonetics for you.",
    updatedTransliteration: updated.transliteration,
  };
}

export async function generateTTS(text: string): Promise<string | null> {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.audioUrl || null;
    }
  } catch (err) {
    console.warn('TTS fetch failed:', err);
  }
  return null;
}
