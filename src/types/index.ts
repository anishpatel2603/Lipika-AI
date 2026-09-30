export type SourceType = 'text' | 'camera' | 'image' | 'demo';

export interface TransliterateRequest {
  text: string;
  source?: SourceType;
  options?: {
    correctOcr?: boolean;
    preserveFormatting?: boolean;
    style?: 'natural' | 'formal';
  };
}

export interface AgentStep {
  name: string;
  description: string;
  timestamp: number;
  status: 'pending' | 'success' | 'warning' | 'skipped';
  detail?: string;
}

export interface TransliterateResponse {
  success: boolean;
  original: string;
  transliteration: string;
  confidence: number;
  language: string;
  task: 'transliteration';
  steps?: AgentStep[];
  detectedTokens?: number;
  error?: string;
}

export interface OCRRequest {
  image: string; // base64 data URL
  mimeType?: string;
}

export interface OCRResponse {
  success: boolean;
  text: string;
  confidence: number;
  wordCount: number;
  error?: string;
}

export interface ImageTransliterateResponse {
  success: boolean;
  detected_text: string;
  transliterated_text: string;
  ocr_confidence: number;
  transliteration_confidence: number;
  steps: AgentStep[];
  error?: string;
}

export interface HistoryItem {
  id: string;
  source: SourceType;
  originalText: string;
  transliteratedText: string;
  confidence: number;
  createdAt: string;
  thumbnailUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  transliterationResult?: string;
  timestamp: number;
}
