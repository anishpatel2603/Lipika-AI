import React from 'react';
import { Camera, ScanText, BrainCircuit, Languages, Check } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Capture',
      subtitle: 'Input Text or Camera',
      description: 'Type English text directly, drag & drop a photograph, or use your device camera to capture any sign or notice.',
      icon: Camera,
      tag: 'Multi-modal Input',
    },
    {
      step: '02',
      title: 'Detect',
      subtitle: 'High-Precision OCR',
      description: 'Advanced Optical Character Recognition locates text regions, sharpens letter edges, and extracts words verbatim.',
      icon: ScanText,
      tag: 'Vision & OCR',
    },
    {
      step: '03',
      title: 'Understand',
      subtitle: 'AI Agent Normalization',
      description: 'The agent cleans OCR debris, fixes broken words, separates code/URLs/numbers, and resolves phonetic nuances.',
      icon: BrainCircuit,
      tag: 'Phonetic Alignment',
    },
    {
      step: '04',
      title: 'Transliterate',
      subtitle: 'Natural Hindi Script',
      description: 'English sounds are mapped into pristine Devanagari script. Pronunciation is preserved without altering meaning.',
      icon: Languages,
      tag: 'Devanagari Output',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/70">
            Intelligent Pipeline
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Lipika AI Works
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            From physical signboard to natural Devanagari reading in four transparent steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 hover:border-amber-300 hover:bg-white hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-black text-amber-600/40 group-hover:text-amber-600 transition-colors">
                      {s.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-amber-600 group-hover:border-amber-200 shadow-xs transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-md">
                    {s.tag}
                  </span>

                  <h3 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mb-2">{s.subtitle}</p>

                  <p className="text-sm text-slate-600 leading-relaxed">{s.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                  <Check className="w-3.5 h-3.5" />
                  <span>Verified step in pipeline</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
