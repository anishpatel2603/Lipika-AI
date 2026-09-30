import { HistoryItem } from '../types/index.js';

const STORAGE_KEY = 'lipika_ai_history_v1';

const INITIAL_DEMO_ITEMS: HistoryItem[] = [
  {
    id: 'demo-1',
    source: 'camera',
    originalText: 'WELCOME TO MUMBAI',
    transliteratedText: 'वेलकम टू मुंबई',
    confidence: 0.98,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'demo-2',
    source: 'text',
    originalText: 'Pillai College of Engineering\nRoom No. 204',
    transliteratedText: 'पिल्लई कॉलेज ऑफ इंजीनियरिंग\nरूम नं. 204',
    confidence: 0.96,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'demo-3',
    source: 'image',
    originalText: 'Smart Traffic Management & Cyber Security',
    transliteratedText: 'स्मार्ट ट्रैफिक मैनेजमेंट एंड साइबर सिक्योरिटी',
    confidence: 0.94,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ITEMS));
      return INITIAL_DEMO_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load history from localStorage:', err);
    return INITIAL_DEMO_ITEMS;
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem {
  try {
    const history = getHistory();
    const newItem: HistoryItem = {
      ...item,
      id: 'lipika-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };

    // Keep up to 100 items
    const updated = [newItem, ...history].slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newItem;
  } catch (err) {
    console.warn('Failed to save history item:', err);
    return {
      ...item,
      id: 'temp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
  }
}

export function deleteHistoryItem(id: string): void {
  try {
    const history = getHistory();
    const filtered = history.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Failed to delete history item:', err);
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear history:', err);
  }
}
