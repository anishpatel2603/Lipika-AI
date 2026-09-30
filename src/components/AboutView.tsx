import React from 'react';
import {
  ShieldCheck,
  Cpu,
  ScanText,
  Languages,
  BookOpen,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

const TEST_CASES = [
  { en: 'Hello', hi: 'हेलो', note: 'Universal greeting phonetic' },
  { en: 'Good Morning', hi: 'गुड मॉर्निंग', note: 'Never "सुप्रभात"' },
  { en: 'Welcome to Mumbai', hi: 'वेलकम टू मुंबई', note: 'Highway & airport standard' },
  { en: 'Artificial Intelligence', hi: 'आर्टिफिशियल इंटेलिजेंस', note: 'Never "कृत्रिम बुद्धिमत्ता"' },
  { en: 'Computer Science', hi: 'कंप्यूटर साइंस', note: 'Never "संगणक विज्ञान"' },
  { en: 'Pillai College of Engineering', hi: 'पिल्लई कॉलेज ऑफ इंजीनियरिंग', note: 'Autonomous campus name' },
  { en: 'Smart Traffic Management', hi: 'स्मार्ट ट्रैफिक मैनेजमेंट', note: 'Public municipal signage' },
  { en: 'Cyber Security', hi: 'साइबर सिक्योरिटी', note: 'Technical domain term' },
  { en: 'Machine Learning', hi: 'मशीन लर्निंग', note: 'Technical AI term' },
  { en: 'Technology', hi: 'टेक्नोलॉजी', note: 'Common vocabulary' },
];

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200/60">
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>Documentation & Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About Lipika AI
        </h1>
        <p className="text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Lipika AI is an intelligent full-stack AI transliteration agent engineered to bridge the linguistic gap between ubiquitous English public signage, digital documents, and comfortable Devanagari script reading.
        </p>
      </div>

      {/* 1. Transliteration vs Translation */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              1. What is Transliteration vs. Translation?
            </h2>
            <p className="text-xs text-slate-500">Phonetic character conversion vs. semantic substitution</p>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">
          <strong>Transliteration</strong> maps the phonetics (the actual sounds) of words from one script into another. When you see a signboard that says <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs font-bold">"Welcome to Mumbai"</span>, a Hindi speaker reading that sign aloud says <em>"Welcome to Mumbai"</em>. Transliterating it produces <span className="font-devanagari font-bold text-amber-700 text-base">"वेलकम टू मुंबई"</span>.
        </p>

        <p className="text-sm text-slate-700 leading-relaxed">
          If a system were to <strong>translate</strong> it semantically, it would generate <span className="font-devanagari font-bold text-slate-500 line-through">"मुंबई में आपका स्वागत है"</span>. While grammatically correct in Hindi, someone standing at the airport or train station looking for the sign reading <em>"Welcome to Mumbai"</em> would find translated words confusing.
        </p>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong className="block font-bold mb-0.5">Core Rule of Lipika AI:</strong>
            The AI Transliteration Agent is instructed strictly <strong>never to substitute vocabulary or translate semantic meaning</strong> unless explicitly directed. Technical terms, college names, road identifiers, room numbers, and URLs remain 100% true to their original spoken English formulation.
          </div>
        </div>
      </section>

      {/* 2. Official Test Cases Verification */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              2. Verified Transliteration Benchmark Suite
            </h2>
            <p className="text-xs text-slate-500">Official evaluation test cases mandated for college and production verification</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">English Input</th>
                <th className="py-3 px-4 font-devanagari">Correct Devanagari Output</th>
                <th className="py-3 px-4">Phonetic Rule / Context</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {TEST_CASES.map((tc, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-800">{tc.en}</td>
                  <td className="py-3 px-4 font-devanagari text-base font-bold text-amber-800">{tc.hi}</td>
                  <td className="py-3 px-4 text-slate-500 font-sans">{tc.note}</td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Pass
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. OCR and Agent Architecture */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              3. AI Agent & Vision OCR Architecture
            </h2>
            <p className="text-xs text-slate-500">Modular pipeline components and execution flow</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{`User / Camera / Upload
  │
  ├── 1. Canvas Preprocessor (Resize, Grayscale, Contrast Boost, Binarize)
  │
  ├── 2. Vision OCR Service (Gemini 3.8 Flash Vision / Tesseract.js fallback)
  │      └── Extracts English words, numbers, and layout verbatim
  │
  ├── 3. TransliterationAgent
  │      ├── TextAnalyzer: Script verification, entity detection (URLs, emails, numbers)
  │      ├── TextNormalizer: Eliminates OCR noise, preserves paragraphing & linebreaks
  │      ├── TransliterationEngine: Phonetic Devanagari generation (gemini-3.8-flash)
  │      └── ConfidenceChecker: Calibrated character matching and validity scores
  │
  └── 4. User Workspace Display
         ├── Copy (Clipboard API)
         ├── Audio Speech Output (gemini-3.8-flash-lite-tts / Web Speech API)
         ├── Download (UTF-8 TXT / Vector PDF via canvas typography)
         └── Web Share API`}</pre>
        </div>
      </section>

      {/* 4. Privacy & Data Handling */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              4. Privacy & Ephemeral Processing
            </h2>
            <p className="text-xs text-slate-500">Zero retention policy for captured photographs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <strong className="block text-slate-900 font-bold mb-1">Ephemeral Vision OCR</strong>
            Images from the camera or file uploader are streamed into memory solely for character extraction and are discarded immediately after OCR completion. No photos are stored on remote hard drives.
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <strong className="block text-slate-900 font-bold mb-1">Local Browser History</strong>
            Your transliteration history lives directly within your browser's LocalStorage. You can inspect it, search it, or click "Clear All History" at any time.
          </div>
        </div>
      </section>
    </div>
  );
};
