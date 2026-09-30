import React, { useState } from 'react';
import {
  GraduationCap,
  MapPin,
  Building2,
  ShoppingBag,
  Accessibility,
  Share2,
  Check,
  X,
  ChevronDown,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

export const FeaturesAndUseCases: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const useCases = [
    {
      title: 'Education',
      description: 'Students who understand spoken Hindi can read English textbooks, notices, lab boards, and exam instructions comfortably in Devanagari.',
      example: 'Physics Laboratory → फिजिक्स लेबोरेटरी',
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Travel & Commute',
      description: 'Easily decipher highway markers, metro line indicators, airport gates, and city directional boards on the go with your phone camera.',
      example: 'Terminal 2 Departures → टर्मिनल 2 डिपार्चर्स',
      icon: MapPin,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Public Places & Hospitals',
      description: 'Navigate municipal offices, clinic instructions, railway tickets, and bank forms without confusion or hesitation.',
      example: 'Cash Deposit Counter → कैश डिपॉजिट काउंटर',
      icon: Building2,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      title: 'Shopping & Packaging',
      description: 'Read ingredients, brand names, product directions, and retail labels printed in English without struggling with Latin phonetics.',
      example: 'Organic Green Tea → ऑर्गेनिक ग्रीन टी',
      icon: ShoppingBag,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Accessibility',
      description: 'Empowers elders, neo-literates, and Hindi-primary readers to engage independently with English-heavy environments.',
      example: 'Senior Citizen Pass → सीनियर सिटीजन पास',
      icon: Accessibility,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      title: 'Social Media & Chat',
      description: 'Transliterate captions, memes, Hinglish messages, and status updates directly into natural Hindi script for community sharing.',
      example: 'Good Vibes Only → गुड वाइब्स ओनली',
      icon: Share2,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  const faqs = [
    {
      q: 'What is the exact difference between transliteration and translation?',
      a: 'Transliteration changes the SCRIPT (alphabet) while preserving the exact SOUND/pronunciation. Translation changes the MEANING into words of another language. For example, "Good Morning" transliterates to "गुड मॉर्निंग" (sounding exactly like good morning). A translation would change it to "सुप्रभात" (suprabhat), which alters how it sounds entirely.',
    },
    {
      q: 'Does Lipika AI store my camera captures or uploaded photos?',
      a: 'No. Lipika AI processes images solely for in-memory Optical Character Recognition (OCR) and text transliteration. Images are never permanently retained or sold. Your history is stored safely inside your browser’s local storage and can be deleted anytime.',
    },
    {
      q: 'Can it handle mixed Hindi and English (Hinglish)?',
      a: 'Yes! Lipika AI’s agent understands code-mixed text like "Welcome to मुंबई College" or "Namaste aap kaise ho". It keeps already-valid Hindi characters intact and transliterates the romanized portions naturally into "नमस्ते आप कैसे हो".',
    },
    {
      q: 'What happens if the signboard image is blurry or has glare?',
      a: 'Lipika AI includes an interactive Image Preprocessing module that allows you to boost contrast, convert to high-clarity grayscale, and binarize the image before OCR. Furthermore, you can manually edit any extracted text before submitting it to the AI transliteration agent.',
    },
    {
      q: 'Can I export the transliterated result as a document or audio?',
      a: 'Yes! You can instantly copy to your clipboard, download formatted UTF-8 TXT files, generate crisp PDF documents formatted with Devanagari typography, or use the Speak button to hear the Hindi pronunciation.',
    },
  ];

  return (
    <div className="space-y-16 py-16 bg-[#FAFAFB]">
      {/* Transliteration vs Translation Deep-dive Comparison Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-md">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/70">
              Fundamental Principle
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Transliteration vs. Translation: Understanding the Distinction
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Lipika AI is built specifically for phonetic reading assistance. We convert the writing system so you can pronounce English words effortlessly in Hindi script.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Right: What Lipika AI Does (Transliteration) */}
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-emerald-950 text-lg">
                  Lipika AI: Transliteration (Pronunciation Preserved)
                </h3>
              </div>
              <p className="text-xs text-emerald-800 mb-4">
                Preserves original sound in Hindi script so you can read English signboards aloud.
              </p>

              <div className="space-y-2.5 font-mono text-sm">
                <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-slate-800">"Good Morning"</span>
                  <span className="text-emerald-700 font-devanagari font-bold text-base">&rarr; "गुड मॉर्निंग"</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-slate-800">"Computer Science"</span>
                  <span className="text-emerald-700 font-devanagari font-bold text-base">&rarr; "कंप्यूटर साइंस"</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-slate-800">"Pillai College"</span>
                  <span className="text-emerald-700 font-devanagari font-bold text-base">&rarr; "पिल्लई कॉलेज"</span>
                </div>
              </div>
            </div>

            {/* Left: What Standard Translators Do (Translation) */}
            <div className="p-6 rounded-2xl bg-slate-100/70 border border-slate-200 relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center">
                  <X className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg">
                  Standard Translation (Meaning Replaced)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Changes vocabulary into classical Hindi words, making physical signboards unrecognizable.
              </p>

              <div className="space-y-2.5 font-mono text-sm">
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between opacity-80">
                  <span className="text-slate-500">"Good Morning"</span>
                  <span className="text-rose-600 line-through font-devanagari text-base">&rarr; "सुप्रभात" (Wrong for signs)</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between opacity-80">
                  <span className="text-slate-500">"Computer Science"</span>
                  <span className="text-rose-600 line-through font-devanagari text-base">&rarr; "संगणक विज्ञान" (Obscure)</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between opacity-80">
                  <span className="text-slate-500">"Artificial Intelligence"</span>
                  <span className="text-rose-600 line-through font-devanagari text-base">&rarr; "कृत्रिम बुद्धिमत्ता" (Unnatural)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/70">
            Real-World Impact
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
            Built for Everyday India
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Where English is everywhere on boards, menus, and forms, but Hindi script provides instant comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${uc.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{uc.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{uc.description}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 bg-slate-50/80 -mx-6 -mb-6 p-4 rounded-b-2xl">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Practical Demo:</span>
                  <p className="text-xs font-mono font-medium text-slate-800">{uc.example}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/70">
            Common Questions
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <span className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-amber-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
