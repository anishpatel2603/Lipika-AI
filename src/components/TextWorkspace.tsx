import React, { useState } from 'react';
import {
  Languages,
  Copy,
  Check,
  Download,
  Share2,
  Trash2,
  ClipboardPaste,
  Volume2,
  VolumeX,
  FileText,
  FileCheck2,
  Pencil,
  AlertCircle,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { transliterateText, generateTTS } from '../services/api.js';
import { copyToClipboard, downloadAsTxt, downloadAsPdf, shareResult } from '../utils/export.js';
import { saveHistoryItem } from '../utils/storage.js';

interface TextWorkspaceProps {
  initialText?: string;
  onNavigateToCamera?: () => void;
}

const SAMPLE_CHIPS = [
  'Welcome to Mumbai',
  'Pillai College of Engineering',
  'Artificial Intelligence',
  'Good Morning',
  'Computer Science Department',
  'Smart Traffic Management',
  'Room No. 204',
  'Cyber Security & Machine Learning',
  'Namaste aap kaise ho?',
];

export const TextWorkspace: React.FC<TextWorkspaceProps> = ({ initialText = '', onNavigateToCamera }) => {
  const [inputText, setInputText] = useState(initialText);
  const [outputText, setOutputText] = useState('');
  const [meaningText, setMeaningText] = useState('');
  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [meaningCopied, setMeaningCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingMeaningAudio, setIsPlayingMeaningAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<'both' | 'translit' | 'meaning'>('both');

  React.useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      handleTransliterate(initialText);
    }
  }, [initialText]);

  const handleTransliterate = async (customText?: string) => {
    const textToProcess = (customText !== undefined ? customText : inputText).trim();
    if (!textToProcess) {
      setErrorMsg('Please enter some text first.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await transliterateText(textToProcess, 'text');
      if (response.success) {
        setOutputText(response.transliteration);
        setMeaningText(response.meaning || '');
        setConfidence(response.confidence);

        // Save to History
        saveHistoryItem({
          source: 'text',
          originalText: textToProcess,
          transliteratedText: response.transliteration,
          meaning: response.meaning || '',
          confidence: response.confidence,
        });
      } else {
        setErrorMsg(response.error || 'Something went wrong while processing your request.');
      }
    } catch (err: any) {
      console.error('Transliteration error:', err);
      setErrorMsg(
        !navigator.onLine
          ? "You're offline. Text transliteration may require an internet connection."
          : 'Something went wrong while processing your request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setInputText(clipText);
        setErrorMsg(null);
      }
    } catch (err) {
      console.warn('Paste failed:', err);
      setErrorMsg('Could not read from clipboard. Please paste manually (Ctrl+V / Cmd+V).');
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setMeaningText('');
    setConfidence(null);
    setErrorMsg(null);
  };

  const handleCopy = async () => {
    if (!outputText) return;
    const ok = await copyToClipboard(outputText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleCopyMeaning = async () => {
    if (!meaningText) return;
    const ok = await copyToClipboard(meaningText);
    if (ok) {
      setMeaningCopied(true);
      setTimeout(() => setMeaningCopied(false), 1500);
    }
  };

  const handleDownloadTxt = () => {
    if (!outputText) return;
    downloadAsTxt(inputText, outputText, 'text', meaningText);
  };

  const handleDownloadPdf = async () => {
    if (!outputText) return;
    await downloadAsPdf(inputText, outputText, confidence || 0.95, 'text', meaningText);
  };

  const handleShare = async () => {
    if (!outputText) return;
    const shareBody = meaningText
      ? `${inputText}\n\n→ लिप्यंतरण (उच्चारण):\n${outputText}\n\n→ हिंदी अर्थ (Meaning):\n${meaningText}`
      : `${inputText}\n\n→\n\n${outputText}`;
    await shareResult('Hindi Transliteration & Meaning', shareBody);
  };

  const handleSpeak = async () => {
    if (!outputText) return;

    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    // Try Gemini TTS endpoint first
    try {
      const audioUrl = await generateTTS(outputText);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);
        audio.onended = () => {
          setIsPlayingAudio(false);
          setCurrentAudio(null);
        };
        audio.onerror = () => {
          fallbackWebSpeech(outputText, () => setIsPlayingAudio(false));
        };
        await audio.play();
        return;
      }
    } catch (e) {
      // fallback
    }

    fallbackWebSpeech(outputText, () => setIsPlayingAudio(false));
  };

  const handleSpeakMeaning = async () => {
    if (!meaningText) return;

    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlayingMeaningAudio(false);
      return;
    }

    setIsPlayingMeaningAudio(true);
    try {
      const audioUrl = await generateTTS(meaningText);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);
        audio.onended = () => {
          setIsPlayingMeaningAudio(false);
          setCurrentAudio(null);
        };
        audio.onerror = () => {
          fallbackWebSpeech(meaningText, () => setIsPlayingMeaningAudio(false));
        };
        await audio.play();
        return;
      }
    } catch (e) {
      // fallback
    }

    fallbackWebSpeech(meaningText, () => setIsPlayingMeaningAudio(false));
  };

  const fallbackWebSpeech = (textToSpeak: string, onEnd: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
      window.speechSynthesis.speak(utterance);
    } else {
      onEnd();
    }
  };

  const getConfidenceBadge = (val: number) => {
    const pct = Math.round(val * 100);
    if (val >= 0.9) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Confidence: High ({pct}%)
        </span>
      );
    }
    if (val >= 0.75) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          Confidence: Medium ({pct}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        Review Extracted Text ({pct}%)
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200/60">
            <Languages className="w-3.5 h-3.5 text-amber-600" />
            <span>Phonetic Devanagari Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            English to Hindi Transliteration
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Type or paste English/Hinglish text. Lipika AI converts speech sounds directly into Devanagari script.
          </p>
        </div>

        {onNavigateToCamera && (
          <button
            onClick={onNavigateToCamera}
            className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span>Have a physical signboard or paper notice?</span>
            <span className="text-amber-600 font-bold hover:underline">Use Camera OCR &rarr;</span>
          </button>
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMsg}</p>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs font-bold text-rose-600 hover:text-rose-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Preset Chips */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-slate-500">Quick Test Cases:</span>
          {SAMPLE_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(chip);
                handleTransliterate(chip);
              }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer text-xs font-medium"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Panel Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* PANEL 1: English Input */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col min-h-[460px]">
          {/* Header */}
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              English Input (Latin Script)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePaste}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
              {inputText && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Clear input"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Textarea */}
          <div className="flex-1 p-5 flex flex-col">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter English text here... (e.g. Welcome to Mumbai, Computer Science Department, Namaste aap kaise ho)"
              className="w-full flex-1 resize-none border-0 focus:ring-0 p-0 text-slate-900 text-lg placeholder:text-slate-400 focus:outline-none leading-relaxed"
              rows={10}
            />
          </div>

          {/* Footer Controls */}
          <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {inputText.length} characters • {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words
            </div>

            <button
              onClick={() => handleTransliterate()}
              disabled={loading || !inputText.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AI is transliterating...</span>
                </>
              ) : (
                <>
                  <span>Transliterate</span>
                  <span className="font-devanagari text-amber-200 font-bold">&rarr;</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* PANEL 2: Hindi Transliteration & Meaning Output */}
        <div className="bg-white rounded-2xl border border-amber-200/80 shadow-sm overflow-hidden flex flex-col min-h-[480px]">
          {/* Header with View Tabs */}
          <div className="px-5 py-3 bg-amber-50/60 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="flex items-center bg-white/80 p-0.5 rounded-lg border border-amber-200/60 text-xs font-semibold">
                <button
                  onClick={() => setActiveOutputTab('both')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeOutputTab === 'both'
                      ? 'bg-amber-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Both (दोनों)
                </button>
                <button
                  onClick={() => setActiveOutputTab('translit')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeOutputTab === 'translit'
                      ? 'bg-amber-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  उच्चारण (Translit)
                </button>
                <button
                  onClick={() => setActiveOutputTab('meaning')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeOutputTab === 'meaning'
                      ? 'bg-teal-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  अर्थ (Meaning)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {confidence !== null && getConfidenceBadge(confidence)}
              {outputText && (
                <button
                  onClick={() => setIsEditable(!isEditable)}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isEditable ? 'bg-amber-200 text-amber-900 font-bold' : 'text-slate-600 hover:bg-amber-100'
                  }`}
                  title={isEditable ? 'Lock output' : 'Edit transliteration manually'}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Result Content */}
          <div className="flex-1 p-5 flex flex-col justify-start">
            {outputText ? (
              <div className="flex-1 flex flex-col gap-4">
                {/* 1. Transliteration View (if tab is 'both' or 'translit') */}
                {(activeOutputTab === 'both' || activeOutputTab === 'translit') && (
                  <div className="rounded-xl p-4 bg-gradient-to-br from-amber-50/60 to-orange-50/30 border border-amber-200/90 flex flex-col transition-all">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200/50">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>लिप्यंतरण (Transliteration • उच्चारण)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleSpeak}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors cursor-pointer"
                          title="Listen to Hindi pronunciation"
                        >
                          {isPlayingAudio ? (
                            <>
                              <VolumeX className="w-3 h-3 text-amber-800 animate-pulse" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-amber-800" />
                              <span>Speak</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCopy}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                            copied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-700 hover:bg-amber-100/60 border border-amber-200/60 cursor-pointer'
                          }`}
                          title="Copy transliteration"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {isEditable ? (
                      <textarea
                        value={outputText}
                        onChange={(e) => setOutputText(e.target.value)}
                        className="font-devanagari w-full resize-none border border-amber-300 rounded-lg p-2.5 text-slate-900 text-xl sm:text-2xl leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        rows={3}
                      />
                    ) : (
                      <div className="font-devanagari text-slate-900 text-xl sm:text-2xl font-semibold leading-relaxed whitespace-pre-wrap select-text">
                        {outputText}
                      </div>
                    )}
                    <span className="text-[11px] text-amber-700/80 mt-2 font-medium">
                      Exact phonetic sound in Devanagari script for native reading & signage.
                    </span>
                  </div>
                )}

                {/* 2. Hindi Meaning View (if tab is 'both' or 'meaning') */}
                {(activeOutputTab === 'both' || activeOutputTab === 'meaning') && (
                  <div className="rounded-xl p-4 bg-gradient-to-br from-teal-50/70 to-emerald-50/40 border border-teal-200 flex flex-col transition-all">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-teal-200/50">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-800">
                        <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                        <span>हिंदी अर्थ (Hindi Meaning • अनुवाद)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleSpeakMeaning}
                          disabled={!meaningText}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-teal-800 bg-teal-100 hover:bg-teal-200 transition-colors disabled:opacity-40 cursor-pointer"
                          title="Listen to Hindi meaning"
                        >
                          {isPlayingMeaningAudio ? (
                            <>
                              <VolumeX className="w-3 h-3 text-teal-800 animate-pulse" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-teal-800" />
                              <span>Speak</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCopyMeaning}
                          disabled={!meaningText}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                            meaningCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-700 hover:bg-teal-100/60 border border-teal-200/60 disabled:opacity-40 cursor-pointer'
                          }`}
                          title="Copy Hindi meaning"
                        >
                          {meaningCopied ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="font-devanagari text-teal-950 text-xl sm:text-2xl font-medium leading-relaxed whitespace-pre-wrap select-text">
                      {meaningText || (
                        <span className="text-slate-400 text-base italic">
                          अर्थ तैयार हो रहा है... (Extracting meaning...)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-teal-700/80 mt-2 font-medium">
                      Accurate Hindi definition & contextual meaning of the text.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center mb-3">
                  <Languages className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Devanagari Result Window</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Click Transliterate or choose one of the quick test chips above to see natural Hindi pronunciation and its Hindi meaning.
                </p>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="px-5 py-3 bg-amber-50/30 border-t border-amber-200/70 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-500 font-medium">
              {outputText && (
                <span>
                  {meaningText ? 'उच्चारण एवं अर्थ दोनों तैयार हैं' : 'उच्चारण तैयार है'}
                </span>
              )}
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDownloadTxt}
                disabled={!outputText}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Download as TXT file with Transliteration and Meaning"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Export TXT</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={!outputText}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Download as PDF with authentic Devanagari typography and Meaning"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={handleShare}
                disabled={!outputText}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Share Transliteration & Meaning"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
