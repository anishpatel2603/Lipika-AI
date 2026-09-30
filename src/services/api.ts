import {
  TransliterateRequest,
  TransliterateResponse,
  OCRResponse,
  ImageTransliterateResponse,
} from '../types/index.js';

export async function transliterateText(
  text: string,
  source: 'text' | 'camera' | 'image' | 'demo' = 'text',
  options?: TransliterateRequest['options']
): Promise<TransliterateResponse> {
  const response = await fetch('/api/transliterate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, source, options }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to transliterate text');
  }

  return response.json();
}

export async function ocrExtract(base64Image: string): Promise<OCRResponse> {
  const response = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'OCR text detection failed');
  }

  return response.json();
}

export async function transliterateImage(base64Image: string): Promise<ImageTransliterateResponse> {
  const response = await fetch('/api/image-transliterate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to process image transliteration');
  }

  return response.json();
}

export async function chatWithAgent(
  message: string,
  originalText: string,
  currentTransliteration: string
): Promise<{ reply: string; updatedTransliteration: string }> {
  const response = await fetch('/api/agent-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, originalText, currentTransliteration }),
  });

  if (!response.ok) {
    throw new Error('Failed to consult AI agent');
  }

  return response.json();
}

export async function generateTTS(text: string): Promise<string | null> {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.audioUrl || null;
  } catch (err) {
    console.warn('TTS fetch failed:', err);
    return null;
  }
}
