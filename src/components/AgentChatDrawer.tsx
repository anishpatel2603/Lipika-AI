import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, Languages, Check, ArrowRight } from 'lucide-react';
import { chatWithAgent } from '../services/api.js';
import { ChatMessage } from '../types/index.js';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentOriginalText?: string;
  currentTransliterationText?: string;
  onApplyTransliteration?: (newText: string) => void;
}

const SUGGESTED_PROMPTS = [
  'Fix obvious OCR typos in this sign',
  'Make the Hindi pronunciation easier to read',
  'Keep technical terms in English phonetics',
  'Transliterate this sentence without translating',
];

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  currentOriginalText = '',
  currentTransliterationText = '',
  onApplyTransliteration,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'agent',
      content:
        'Namaste! I am the Lipika Transliteration Agent. I can help refine phonetic spellings, clean up OCR misreads, or explain how specific English sounds translate into Devanagari script.',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await chatWithAgent(
        text,
        currentOriginalText,
        currentTransliterationText
      );

      const agentMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'agent',
        content: response.reply,
        transliterationResult: response.updatedTransliteration,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'agent',
          content: 'Sorry, I encountered an issue processing your request. Please try again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-devanagari font-bold">
              लि
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <span>Lipika Agent Assistant</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-[11px] text-slate-500">Phonetic alignment & OCR refiner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Context Card */}
        {currentOriginalText && (
          <div className="px-4 py-2 bg-amber-50/70 border-b border-amber-200/60 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Active Context:
            </span>
            <p className="font-medium text-slate-800 truncate mt-0.5">"{currentOriginalText}"</p>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isAgent = m.role === 'agent';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isAgent ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    isAgent ? 'bg-amber-100 text-amber-800' : 'bg-slate-900 text-white'
                  }`}
                >
                  {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isAgent
                      ? 'bg-slate-100 text-slate-900 rounded-tl-xs'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-tr-xs shadow-xs'
                  }`}
                >
                  <p>{m.content}</p>

                  {/* If agent returned an updated transliteration snippet */}
                  {m.transliterationResult &&
                    m.transliterationResult !== currentTransliterationText && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 bg-white/80 p-2 rounded-xl text-slate-900">
                        <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                          Suggested Transliteration:
                        </span>
                        <p className="font-devanagari text-base font-bold text-slate-900">
                          {m.transliterationResult}
                        </p>
                        {onApplyTransliteration && (
                          <button
                            onClick={() => {
                              onApplyTransliteration(m.transliterationResult!);
                              onClose();
                            }}
                            className="mt-2 w-full py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition-colors"
                          >
                            Apply to Workspace &rarr;
                          </button>
                        )}
                      </div>
                    )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Bot className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Agent is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div className="px-4 py-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] font-medium whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask agent to refine or explain..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
