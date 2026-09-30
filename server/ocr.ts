import { GoogleGenAI, Type } from '@google/genai';
import { OCRResponse } from '../src/types/index.js';

export class OCRService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  /**
   * Extract text from image data URL using Gemini Vision
   */
  public async extractText(base64DataUrl: string): Promise<OCRResponse> {
    if (!base64DataUrl) {
      return {
        success: false,
        text: '',
        confidence: 0,
        wordCount: 0,
        error: 'No image provided.',
      };
    }

    // Extract mime type and raw base64 data
    const matches = base64DataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let base64Data = base64DataUrl;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    if (this.ai) {
      try {
        const imagePart = {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        };

        const promptPart = {
          text: `You are an expert Optical Character Recognition (OCR) engine.
Analyze this image and extract all readable text (English words, numbers, signboards, notices, menus, labels, or Hinglish text) VERBATIM.
Maintain original reading order and line breaks.
Do not summarize, do not translate, and do not add conversational notes.
Evaluate your confidence in the character clarity (from 0.0 to 1.0).`,
        };

        const response = await this.ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts: [imagePart, promptPart] },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                extracted_text: {
                  type: Type.STRING,
                  description: 'Exact text extracted from the image with preserved line breaks.',
                },
                confidence: {
                  type: Type.NUMBER,
                  description: 'Estimated OCR recognition confidence between 0.0 and 1.0.',
                },
                detected_entities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Short list of detected signs/headings in the image.',
                },
              },
              required: ['extracted_text', 'confidence'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        const extractedText = (parsed.extracted_text || '').trim();
        const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.92;
        const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

        if (!extractedText) {
          return {
            success: false,
            text: '',
            confidence: 0,
            wordCount: 0,
            error: "I couldn't detect readable text in this image. Try a clearer photo.",
          };
        }

        return {
          success: true,
          text: extractedText,
          confidence,
          wordCount,
        };
      } catch (err: any) {
        console.error('Vision OCR error:', err);
        return {
          success: false,
          text: '',
          confidence: 0,
          wordCount: 0,
          error: err?.message || 'Failed to extract text from image.',
        };
      }
    }

    return {
      success: false,
      text: '',
      confidence: 0,
      wordCount: 0,
      error: 'OCR service requires GEMINI_API_KEY on the server or client-side fallback.',
    };
  }
}

export const ocrService = new OCRService();
