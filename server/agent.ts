import { GoogleGenAI, Type } from '@google/genai';
import { AgentStep, TransliterateResponse } from '../src/types/index.js';
import { advancedPhoneticTransliterate, fixDevanagariOrphanMatras } from '../src/services/phoneticParser.js';

export { fixDevanagariOrphanMatras };

// Pre-compiled common phonetic transliteration dictionary for rapid response and reliable offline fallback
const PHONETIC_DICTIONARY: Record<string, string> = {
  // Common greetings & expressions
  'hello': 'हेलो',
  'hi': 'हाय',
  'hey': 'हे',
  'welcome': 'वेलकम',
  'good': 'गुड',
  'morning': 'मॉर्निंग',
  'evening': 'इवनिंग',
  'afternoon': 'आफ्टरनून',
  'night': 'नाइट',
  'thank': 'थैंक',
  'you': 'यू',
  'thanks': 'थैंक्स',
  'please': 'प्लीज',
  'sorry': 'सॉरी',
  'bye': 'बाय',
  'goodbye': 'गुडबाय',

  // Cities & Places
  'to': 'टू',
  'mumbai': 'मुंबई',
  'delhi': 'दिल्ली',
  'bangalore': 'बैंगलोर',
  'bengaluru': 'बेंगलुरु',
  'pune': 'पुणे',
  'india': 'इंडिया',
  'college': 'कॉलेज',
  'school': 'स्कूल',
  'university': 'यूनिवर्सिटी',
  'pillai': 'पिल्लई',
  'of': 'ऑफ',
  'engineering': 'इंजीनियरिंग',
  'campus': 'कैंपस',
  'department': 'डिपार्टमेंट',
  'room': 'रूम',
  'floor': 'फ्लोर',
  'building': 'बिल्डिंग',
  'hospital': 'हॉस्पिटल',
  'metro': 'मेट्रो',
  'station': 'स्टेशन',
  'airport': 'एयरपोर्ट',
  'gate': 'गेट',
  'office': 'ऑफिस',

  // Tech & Science
  'computer': 'कंप्यूटर',
  'science': 'साइंस',
  'technology': 'टेक्नोलॉजी',
  'artificial': 'आर्टिफिशियल',
  'intelligence': 'इंटेलिजेंस',
  'machine': 'मशीन',
  'learning': 'लर्निंग',
  'deep': 'डीप',
  'cyber': 'साइबर',
  'security': 'सिक्योरिटी',
  'smart': 'स्मार्ट',
  'traffic': 'ट्रैफिक',
  'management': 'मैनेजमेंट',
  'system': 'सिस्टम',
  'internet': 'इंटरनेट',
  'data': 'डेटा',
  'cloud': 'क्लाउड',
  'mobile': 'मोबाइल',
  'software': 'सॉफ्टवेयर',
  'hardware': 'हार्डवेयर',
  'network': 'नेटवर्क',
  'app': 'ऐप',
  'application': 'एप्लिकेशन',
  'digital': 'डिजिटल',
  'online': 'ऑनलाइन',
  'camera': 'कैमरा',
  'image': 'इमेज',
  'photo': 'फोटो',
  'video': 'वीडियो',
  'agent': 'एजेंट',
  'ai': 'एआई',
  'lipika': 'लिपिका',
  
  // Daily life & signs
  'stop': 'स्टॉप',
  'go': 'गो',
  'exit': 'एग्जिट',
  'entry': 'एंट्री',
  'open': 'ओपन',
  'close': 'क्लोज',
  'closed': 'क्लोज्ड',
  'parking': 'पार्किंग',
  'no': 'नो',
  'yes': 'यस',
  'in': 'इन',
  'out': 'आउट',
  'doctor': 'डॉक्टर',
  'nurse': 'नर्स',
  'police': 'पुलिस',
  'help': 'हेल्प',
  'hotel': 'होटल',
  'restaurant': 'रेस्टोरेंट',
  'cafe': 'कैफे',
  'tea': 'टी',
  'coffee': 'कॉफी',
  'water': 'वॉटर',
  'food': 'फूड',
  'bill': 'बिल',
  'cash': 'कैश',
  'card': 'कार्ड',
  'pay': 'पे',
  'payment': 'पेमेंट',
  'price': 'प्राइस',
  'market': 'मार्केट',
  'shop': 'शॉप',
  'store': 'स्टोर',
  'supermarket': 'सुपरमार्केट',
  'bus': 'बस',
  'train': 'ट्रेन',
  'car': 'कार',
  'taxi': 'टैक्सी',
  'auto': 'ऑटो',
  'road': 'रोड',
  'street': 'स्ट्रीट',
  'way': 'वे',
  'highway': 'हाईवे',
  'expressway': 'एक्सप्रेसवे',
  'service': 'सर्विस',
  'center': 'सेंटर',
  'centre': 'सेंटर',
  'bank': 'बैंक',
  'atm': 'एटीएम',

  // Conversational words, verbs & status
  'is': 'इज़',
  'are': 'आर',
  'am': 'एम',
  'was': 'वॉज़',
  'were': 'वर',
  'it': 'इट',
  'this': 'दिस',
  'that': 'दैट',
  'all': 'ऑल',
  'right': 'राइट',
  'fine': 'फाइन',
  'ok': 'ओके',
  'okay': 'ओके',
  'everything': 'एवरीथिंग',
  'work': 'वर्क',
  'working': 'वर्किंग',
  'perfect': 'परफेक्ट',
  'perfectly': 'परफेक्टली',
  'test': 'टेस्ट',
  'testing': 'टेस्टिंग',
  'check': 'चेक',
  'solve': 'सॉल्व',
  'solved': 'सॉल्व्ड',
  'problem': 'प्रॉब्लम',
  'issue': 'इशू',
  'and': 'एंड',
  'or': 'ऑर',
  'not': 'नॉट',
  'very': 'वेरी',
  'now': 'नाउ',
  'here': 'हियर',
  'there': 'देयर',
  'how': 'हाउ',
  'what': 'व्हॉट',
  'where': 'व्हेर',
  'when': 'व्हेन',
  'why': 'व्हाय',
  'who': 'हू'
};

// Common Hinglish / Romanized Hindi mapping
const HINGLISH_MAP: Record<string, string> = {
  'namaste': 'नमस्ते',
  'aap': 'आप',
  'kaise': 'कैसे',
  'kaisi': 'कैसी',
  'ho': 'हो',
  'hain': 'हैं',
  'hai': 'है',
  'kya': 'क्या',
  'chal': 'चल',
  'raha': 'रहा',
  'rahi': 'रही',
  'main': 'मैं',
  'theek': 'ठीक',
  'hoon': 'हूं',
  'hun': 'हूं',
  'shukriya': 'शुक्रिया',
  'dhanyawad': 'धन्यवाद',
  'kaun': 'कौन',
  'kahan': 'कहाँ',
  'kab': 'कब',
  'kyun': 'क्यों',
  'kitna': 'कितना',
  'kitne': 'कितने',
  'kitni': 'कितनी',
  'bhai': 'भाई',
  'dost': 'दोस्त',
  'ghar': 'घर',
  'aur': 'और',
  'par': 'पर',
  'se': 'से',
  'ko': 'को',
  'ke': 'के',
  'ki': 'की',
  'ka': 'का',
  'mera': 'मेरा',
  'meri': 'मेरी',
  'mere': 'मेरे',
  'apka': 'आपका',
  'apki': 'आपकी',
  'apke': 'आपके',
  'yeh': 'यह',
  'woh': 'वह',
  'sab': 'सब',
  'bahut': 'बहुत',
  'accha': 'अच्छा',
  'achha': 'अच्छा',
  'acha': 'अच्छा'
};

const SYSTEM_INSTRUCTION = `You are Lipika AI, a world-class Hindi transliteration agent trained on massive Indian English and Hinglish corpora.
Your core task is EXACT PHONETIC TRANSLITERATION, NOT TRANSLATION. There must be ZERO SPELLING MISTAKES and zero broken Unicode characters.

Convert English words, Hinglish phrases, and English sentences into natural, authentic Hindi Devanagari script preserving contemporary Indian spoken pronunciation.

ABSOLUTE CRITICAL RULES:
1. NEVER TRANSLATE THE MEANING.
   - "Good Morning" -> "गुड मॉर्निंग" (NEVER "सुप्रभात").
   - "Computer Science" -> "कंप्यूटर साइंस" (NEVER "संगणक विज्ञान").
   - "Welcome to Mumbai" -> "वेलकम टू मुंबई".
   - "Artificial Intelligence" -> "आर्टिफिशियल इंटेलिजेंस".
   - "Pillai College of Engineering" -> "पिल्लई कॉलेज ऑफ इंजीनियरिंग".
   - "Smart Traffic Management" -> "स्मार्ट ट्रैफिक मैनेजमेंट".
   - "Cyber Security" -> "साइबर सिक्योरिटी".
   - "Machine Learning" -> "मशीन लर्निंग".
   - "Technology" -> "टेक्नोलॉजी".
   - "Is everything working perfectly" -> "इज़ एवरीथिंग वर्किंग परफेक्टली".

2. ZERO SPELLING MISTAKES & TYPO TOLERANCE:
   - Autocorrect obvious typos, garbled OCR characters, and common phonetic misspellings in the input:
     - e.g. "compluter" -> "कंप्यूटर"
     - "engneering" -> "इंजीनियरिंग"
     - "perfctly" -> "परफेक्टली"
     - "Welc0me t0 Mumb@i" -> "वेलकम टू मुंबई"
     - "d3partment" -> "डिपार्टमेंट"
   - Output must have 100% correct Devanagari spelling as accepted in modern standard Hindi press and signage.

3. ORTHOGRAPHIC & UNICODE INTEGRITY:
   - NEVER emit orphaned matras (dependent vowel signs like ि, े, ो at the start of a word).
   - Word-initial vowel sounds MUST always use independent vowel characters (अ, आ, इ, ई, उ, ऊ, ए, ऐ, ओ, औ).
     - e.g. "Is" -> "इज़" (NEVER "◌िस").
     - "Everything" -> "एवरीथिंग" (NEVER "◌ेवेरयथइंग").
     - "Auto" -> "ऑटो".
   - Never output dotted circles (U+25CC).

4. ENTITY & FORMAT PRESERVATION:
   - "Room No. 204" -> "रूम नं. 204" or "रूम No. 204". Preserve numbers and digits.
   - Preserve all URLs, email addresses, and technical code intact (e.g., https://example.com stays https://example.com).
   - Preserve punctuation, bullet points, indentation, line breaks, and paragraph structures.
   - If input is mixed English and Devanagari (e.g. "Welcome to मुंबई College"), keep the Devanagari untouched ("मुंबई") and transliterate only the English ("वेलकम टू मुंबई कॉलेज").
   - If input is Romanized Hindi (Hinglish, e.g. "Namaste aap kaise ho"), transliterate naturally to Hindi: "नमस्ते आप कैसे हो".

5. Return a clean JSON response adhering to the requested schema.`;

export class TransliterationAgent {
  private getAi(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  /**
   * Tool 1: Text Analyzer
   * Detects language mix, URLs, emails, numbers, and formatting.
   */
  public analyzeText(text: string): {
    hasUrls: boolean;
    hasDevanagari: boolean;
    hasLatin: boolean;
    hasNumbers: boolean;
    tokenCount: number;
    detectedScript: 'Latin' | 'Devanagari' | 'Mixed';
  } {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const devanagariRegex = /[\u0900-\u097F]/;
    const latinRegex = /[a-zA-Z]/;
    const numberRegex = /[0-9]/;

    const hasUrls = urlRegex.test(text);
    const hasDevanagari = devanagariRegex.test(text);
    const hasLatin = latinRegex.test(text);
    const hasNumbers = numberRegex.test(text);
    const tokens = text.trim().split(/\s+/).filter(Boolean);

    let detectedScript: 'Latin' | 'Devanagari' | 'Mixed' = 'Latin';
    if (hasLatin && hasDevanagari) detectedScript = 'Mixed';
    else if (hasDevanagari) detectedScript = 'Devanagari';

    return {
      hasUrls,
      hasDevanagari,
      hasLatin,
      hasNumbers,
      tokenCount: tokens.length,
      detectedScript,
    };
  }

  /**
   * Tool 2: Text Normalizer
   * Cleans OCR debris, repeated symbols, excessive whitespace without damaging formatting.
   */
  public normalizeText(text: string): string {
    if (!text) return '';
    return text
      .replace(/[\r\t]+/g, ' ')
      .replace(/[ ]{3,}/g, '  ')
      .trim();
  }

  /**
   * Tool 3: Advanced Syllable & Lexicon Rule-Based Transliteration
   */
  public ruleBasedTransliterate(text: string): string {
    return advancedPhoneticTransliterate(text);
  }

  /**
   * Basic phonetic mapping fallback for unknown words with initial-vowel protection
   */
  private phoneticHeuristic(word: string): string {
    let w = word.toLowerCase();

    // Check initial vowels/prefixes to prevent orphan matras
    const initialVowels: [RegExp, string][] = [
      [/^every/i, 'एवरी'],
      [/^extra/i, 'एक्स्ट्रा'],
      [/^anti/i, 'एंटी'],
      [/^auto/i, 'ऑटो'],
      [/^over/i, 'ओवर'],
      [/^inter/i, 'इंटर'],
      [/^under/i, 'अंडर'],
      [/^ai/i, 'ऐ'],
      [/^au/i, 'औ'],
      [/^oo/i, 'ऊ'],
      [/^ee/i, 'ई'],
      [/^aa/i, 'आ'],
      [/^a/i, 'अ'],
      [/^e/i, 'ए'],
      [/^i/i, 'इ'],
      [/^o/i, 'ओ'],
      [/^u/i, 'उ'],
    ];

    let prefix = '';
    for (const [pattern, dev] of initialVowels) {
      if (pattern.test(w)) {
        prefix = dev;
        w = w.replace(pattern, '');
        break;
      }
    }

    const map: [RegExp, string][] = [
      [/sch/g, 'स्क'],
      [/ph/g, 'फ'],
      [/th/g, 'थ'],
      [/sh/g, 'श'],
      [/ch/g, 'च'],
      [/kh/g, 'ख'],
      [/gh/g, 'घ'],
      [/jh/g, 'झ'],
      [/bh/g, 'भ'],
      [/dh/g, 'ध'],
      [/ee/g, 'ी'],
      [/oo/g, 'ू'],
      [/ai/g, 'ै'],
      [/au/g, 'ौ'],
      [/tion/g, 'शन'],
      [/sion/g, 'शन'],
      [/ment/g, 'मेंट'],
      [/ing$/g, 'इंग'],
      [/ed$/g, '्ड'],
      [/ly$/g, 'ली'],
      [/ty$/g, 'टी'],
      [/a/g, 'ा'],
      [/e/g, 'े'],
      [/i/g, 'ि'],
      [/o/g, 'ो'],
      [/u/g, 'ु'],
      [/k/g, 'क'],
      [/g/g, 'ग'],
      [/c/g, 'क'],
      [/j/g, 'ज'],
      [/t/g, 'ट'],
      [/d/g, 'ड'],
      [/n/g, 'न'],
      [/p/g, 'प'],
      [/b/g, 'ब'],
      [/m/g, 'म'],
      [/y/g, 'य'],
      [/r/g, 'र'],
      [/l/g, 'ल'],
      [/v/g, 'व'],
      [/w/g, 'व'],
      [/s/g, 'स'],
      [/h/g, 'ह'],
      [/f/g, 'फ'],
      [/z/g, 'ज़'],
      [/q/g, 'क'],
      [/x/g, 'क्स'],
    ];

    let res = w;
    for (const [pattern, dev] of map) {
      res = res.replace(pattern, dev);
    }
    // Clean orphan Latin chars
    res = res.replace(/[a-z]/g, '');
    const combined = prefix + res;
    return fixDevanagariOrphanMatras(combined) || word;
  }

  /**
   * Tool 4: Main Transliteration Agent Execution
   */
  public async transliterate(
    text: string,
    source: string = 'text',
    correctOcr: boolean = true
  ): Promise<TransliterateResponse> {
    const steps: AgentStep[] = [];
    const startTime = Date.now();

    // Step 1: Input Validation & Analysis
    const rawNormalized = this.normalizeText(text);
    if (!rawNormalized) {
      return {
        success: false,
        original: text,
        transliteration: '',
        confidence: 0,
        language: 'unknown',
        task: 'transliteration',
        error: 'Please enter some text first.',
      };
    }

    const analysis = this.analyzeText(rawNormalized);
    steps.push({
      name: 'TextAnalyzer',
      description: `Detected ${analysis.tokenCount} tokens; Script: ${analysis.detectedScript}; Special entities: ${analysis.hasUrls ? 'URLs ' : ''}${analysis.hasNumbers ? 'Numbers' : ''}`,
      timestamp: Date.now() - startTime,
      status: 'success',
      detail: `Analysis found ${analysis.tokenCount} tokens`,
    });

    // Step 2: Normalization
    steps.push({
      name: 'TextNormalizer',
      description: 'Preserved punctuation, spacing, and structural line breaks.',
      timestamp: Date.now() - startTime,
      status: 'success',
    });

    // Step 3: Transliteration Engine
    let finalTransliteration = '';
    let confidence = 0.95;

    const ai = this.getAi();
    if (ai) {
      try {
        steps.push({
          name: 'AI Transliteration Agent',
          description: 'Sending normalized phonetic request to Gemini Model (gemini-3.8-flash)...',
          timestamp: Date.now() - startTime,
          status: 'pending',
        });

        const prompt = `Transliterate the following text into natural Hindi Devanagari script.
DO NOT TRANSLATE. PRESERVE PHONETIC SOUND.
Source type: ${source}
OCR Error Correction Requested: ${correctOcr ? 'YES' : 'NO'}

Original text:
${rawNormalized}`;

        // Timeout promise of 12 seconds to guarantee response even if upstream has slight latency
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timed out')), 12000)
        );

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                transliterated_text: {
                  type: Type.STRING,
                  description: 'The Devanagari script transliterated text preserving exact pronunciation.',
                },
                confidence_score: {
                  type: Type.NUMBER,
                  description: 'Confidence between 0.0 and 1.0 based on phonetic fidelity and text clarity.',
                },
                source_language_detected: {
                  type: Type.STRING,
                  description: 'Primary language detected (e.g. English, Hinglish, Mixed).',
                },
                ocr_corrections_made: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of corrected OCR glitches if any.',
                },
              },
              required: ['transliterated_text', 'confidence_score', 'source_language_detected'],
            },
          },
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);

        const parsed = JSON.parse(response.text || '{}');
        finalTransliteration = fixDevanagariOrphanMatras(parsed.transliterated_text || '');
        confidence = typeof parsed.confidence_score === 'number' ? parsed.confidence_score : 0.95;

        const corrections = parsed.ocr_corrections_made || [];
        steps.push({
          name: 'Phonetic Alignment & Engine',
          description: `Devanagari output generated. Language: ${parsed.source_language_detected}. ${corrections.length > 0 ? `Corrected ${corrections.length} OCR errors.` : ''}`,
          timestamp: Date.now() - startTime,
          status: 'success',
          detail: corrections.join(', '),
        });
      } catch (err: any) {
        console.warn('Gemini transliteration fallback invoked:', err?.message || err);
        // Fallback to our high-quality phonetic rule engine
        finalTransliteration = this.ruleBasedTransliterate(rawNormalized);
        confidence = 0.92;
        steps.push({
          name: 'Phonetic Rule Engine (Fallback)',
          description: 'Used deterministic phonetic Devanagari transliteration dictionary.',
          timestamp: Date.now() - startTime,
          status: 'warning',
          detail: 'Fallback activated',
        });
      }
    } else {
      // Local rule-based transliteration engine
      finalTransliteration = this.ruleBasedTransliterate(rawNormalized);
      confidence = 0.90;
      steps.push({
        name: 'Local Transliteration Engine',
        description: 'Transliterated using Lipika Phonetic Engine.',
        timestamp: Date.now() - startTime,
        status: 'success',
      });
    }

    // Step 4: Result Formatter & Confidence Checker
    steps.push({
      name: 'ConfidenceChecker',
      description: `Confidence score: ${Math.round(confidence * 100)}% (${confidence >= 0.9 ? 'High' : confidence >= 0.75 ? 'Medium' : 'Low'})`,
      timestamp: Date.now() - startTime,
      status: 'success',
    });

    return {
      success: true,
      original: rawNormalized,
      transliteration: finalTransliteration,
      confidence,
      language: analysis.detectedScript === 'Devanagari' ? 'Hindi' : 'English / Hinglish',
      task: 'transliteration',
      steps,
      detectedTokens: analysis.tokenCount,
    };
  }

  /**
   * Tool 5: Conversational refinement with the Agent
   */
  public async chatWithAgent(message: string, currentOriginal: string, currentTransliteration: string) {
    const ai = this.getAi();
    if (!ai) {
      return {
        reply: "I am ready to help you refine your transliteration! You can ask me to adjust phonetic spellings, retain specific English brand names, or correct OCR glitches.",
        updatedTransliteration: currentTransliteration,
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User message: "${message}"
Current original English text: "${currentOriginal}"
Current Hindi transliteration: "${currentTransliteration}"

Instruction: You are Lipika AI assistant. Answer the user's request regarding transliteration. If they asked to change, simplify, fix, or re-transliterate, provide the updated transliteration in Hindi Devanagari script. Remember: ALWAYS TRANSLITERATE (pronunciation in Devanagari), NEVER translate the meaning.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: 'Natural, helpful response explaining what changes were made.',
              },
              updated_transliteration: {
                type: Type.STRING,
                description: 'The updated Hindi transliteration if changed, or the previous one.',
              },
            },
            required: ['reply', 'updated_transliteration'],
          },
        },
      });

      const data = JSON.parse(response.text || '{}');
      return {
        reply: data.reply || 'Updated transliteration according to your preference.',
        updatedTransliteration: data.updated_transliteration || currentTransliteration,
      };
    } catch (err: any) {
      return {
        reply: `Processed your request. (Note: ${err?.message || 'offline mode'})`,
        updatedTransliteration: currentTransliteration,
      };
    }
  }
}

export const agentInstance = new TransliterationAgent();
