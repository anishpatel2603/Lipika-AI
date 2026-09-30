import { createWorker } from 'tesseract.js';
import { OCRResponse } from '../types/index.js';

let workerPromise: Promise<any> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker('eng');
      return worker;
    })();
  }
  return workerPromise;
}

/**
 * Runs client-side OCR using Tesseract.js
 */
export async function runClientOcr(
  imageDataUrl: string,
  onProgress?: (progress: number, status: string) => void
): Promise<OCRResponse> {
  try {
    onProgress?.(0.1, 'Initializing client OCR engine...');
    const worker = await getWorker();

    onProgress?.(0.4, 'Analyzing text patterns in image...');
    const ret = await worker.recognize(imageDataUrl);

    onProgress?.(0.9, 'Refining characters...');
    const rawText = (ret.data.text || '').trim();
    const confidence = ret.data.confidence ? ret.data.confidence / 100 : 0.85;

    const words = rawText.split(/\s+/).filter(Boolean);

    return {
      success: true,
      text: rawText,
      confidence: Math.min(0.98, Math.max(0.4, confidence)),
      wordCount: words.length,
    };
  } catch (err: any) {
    console.error('Client OCR failed:', err);
    return {
      success: false,
      text: '',
      confidence: 0,
      wordCount: 0,
      error: err?.message || 'Client OCR failed to recognize text.',
    };
  }
}
