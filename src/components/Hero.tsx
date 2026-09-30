import React, { useState } from 'react';
import {
  ArrowRight,
  Camera,
  Languages,
  CheckCircle2,
  ScanText,
  Cpu,
  Sparkles,
  Volume2,
  Copy,
  Check,
} from 'lucide-react';
import { copyToClipboard } from '../utils/export.js';

interface HeroProps {
  onStartTransliteration: () => void;
  onStartCamera: () => void;
  onSelectSampleText?: (sample: string) => void;
}

const PRESET_EXAMPLES = [
  { en: 'Welcome to Mumbai', hi: 'वेलकम टू मुंबई', category: 'City Sign' },
  { en: 'Pillai College of Engineering', hi: 'पिल्लई कॉलेज ऑफ इंजीनियरिंग', category: 'Education' },
  { en: 'Artificial Intelligence', hi: 'आर्टिफिशियल इंटेलिजेंस', category: 'Technology' },
  { en: 'Room No. 204 • Computer Science', hi: 'रूम नं. 204 • कंप्यूटर साइंस', category: 'Notice' },
  { en: 'Smart Traffic Management', hi: 'स्मार्ट ट्रैफिक मैनेजमेंट', category: 'Public Board' },
];

export const Hero: React.FC<HeroProps> = ({
  onStartTransliteration,
  onStartCamera,
  onSelectSampleText,
}) => {
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeExample = PRESET_EXAMPLES[activeSampleIndex];

  const handleCopy = async () => {
    const success = await copyToClipboard(activeExample.hi);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeExample.hi);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/60 bg-gradient-to-b from-white via-slate-50/60 to-white">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Transliteration Agent • OCR + Vision Pipeline</span>
          </div>

          {/* Master Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Turn English into Hindi,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">
              instantly.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 font-normal leading-relaxed">
            Type it, photograph it, or point your camera at it. Lipika AI detects English text and converts it into natural Hindi-script transliteration.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartTransliteration}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-700 hover:to-orange-700 shadow-md shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Start Transliteration</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onStartCamera}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-base text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs hover:border-slate-400 transition-all duration-200 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-amber-600" />
              <span>Use Camera OCR</span>
            </button>
          </div>

          {/* Core premise reminder */}
          <p className="mt-3.5 text-xs font-medium text-slate-500">
            <strong className="text-slate-700">Transliteration, NOT Translation:</strong> Preserves exact English pronunciation in Devanagari script.
          </p>
        </div>

        {/* Hero Interactive Split Preview Showcase */}
        <div className="max-w-4xl mx-auto">
          {/* Preset Selector Chips */}
          <div className="flex items-center justify-center flex-wrap gap-2 mb-4">
            <span className="text-xs font-semibold text-slate-500 mr-1">Quick Demo Presets:</span>
            {PRESET_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSampleIndex(idx)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeSampleIndex === idx
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {ex.category}: <span className="font-semibold">{ex.en}</span>
              </button>
            ))}
          </div>

          {/* Split Screen Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
            {/* Header bar */}
            <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-medium text-slate-500 font-mono">
                  lipika-agent://pipeline/active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Agent Ready
                </span>
              </div>
            </div>

            {/* Split Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* LEFT: English Input */}
              <div className="p-6 sm:p-8 flex flex-col justify-between bg-slate-50/40">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ScanText className="w-4 h-4 text-slate-400" />
                      Original English Text
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">Latin Script</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <p className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                      "{activeExample.en}"
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Captured via text input, camera, or signboard OCR
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Detected: English (Phonetic)</span>
                  <button
                    onClick={() => {
                      if (onSelectSampleText) onSelectSampleText(activeExample.en);
                      onStartTransliteration();
                    }}
                    className="text-amber-700 hover:text-amber-800 font-semibold hover:underline"
                  >
                    Open in Workspace &rarr;
                  </button>
                </div>
              </div>

              {/* RIGHT: Hindi Transliteration */}
              <div className="p-6 sm:p-8 flex flex-col justify-between bg-amber-50/20">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <Languages className="w-4 h-4 text-amber-600" />
                      Hindi Transliteration
                    </span>
                    <span className="text-[11px] font-semibold text-amber-800/80 bg-amber-100/70 px-2 py-0.5 rounded-full">
                      Devanagari Script
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-amber-200/80 shadow-xs relative group">
                    <p className="font-devanagari text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
                      "{activeExample.hi}"
                    </p>
                    <p className="mt-2 text-xs text-amber-800/80">
                      Natural Hindi pronunciation • Zero translation of meaning
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pronunciation: Exact match</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSpeak}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-100/70 transition-colors"
                      title="Speak Devanagari pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                      title="Copy Hindi transliteration"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Below Split: Pipeline indicators */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-around gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>1. Camera & Image Capture</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">&rarr;</span>
              <div className="flex items-center gap-2">
                <ScanText className="w-4 h-4 text-amber-600" />
                <span>2. Vision OCR Extraction</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">&rarr;</span>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-600" />
                <span>3. AI Agent Normalizer</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">&rarr;</span>
              <div className="flex items-center gap-2">
                <span className="font-devanagari font-bold text-amber-700 text-sm">हि</span>
                <span>4. Devanagari Transliteration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
