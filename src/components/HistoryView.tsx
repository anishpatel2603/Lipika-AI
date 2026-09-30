import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Trash2,
  Copy,
  Check,
  Languages,
  Camera,
  Image as ImageIcon,
  Sparkles,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { HistoryItem } from '../types/index.js';
import { getHistory, deleteHistoryItem, clearAllHistory } from '../utils/storage.js';
import { copyToClipboard } from '../utils/export.js';

interface HistoryViewProps {
  onSelectHistoryItem: (item: HistoryItem) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectHistoryItem }) => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filterSource, setFilterSource] = useState<'all' | 'text' | 'camera' | 'image'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const list = getHistory();
    setItems(list);
  };

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    loadHistory();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all transliteration history?')) {
      clearAllHistory();
      setItems([]);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSource = filterSource === 'all' || item.source === filterSource;
    const matchesSearch =
      !searchQuery ||
      item.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.transliteratedText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesSearch;
  });

  const getSourceIcon = (src: string) => {
    switch (src) {
      case 'camera':
        return <Camera className="w-3.5 h-3.5 text-blue-600" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Languages className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200/60">
            <History className="w-3.5 h-3.5 text-amber-600" />
            <span>Local Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transliteration History
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Access previous text and camera captures saved securely on your device.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by English or Hindi text..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {/* Source Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto text-xs font-medium">
          {(['all', 'text', 'camera', 'image'] as const).map((source) => (
            <button
              key={source}
              onClick={() => setFilterSource(source)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                filterSource === source
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      {/* History Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No transliterations found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery
              ? 'Try changing your search terms or filters.'
              : 'Your transliterations from text and camera will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                {/* Meta header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {getSourceIcon(item.source)}
                    <span>{item.source}</span>
                  </span>

                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Original English */}
                <div className="mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Original
                  </span>
                  <p className="text-sm font-semibold text-slate-800 line-clamp-2">
                    {item.originalText}
                  </p>
                </div>

                {/* Hindi Transliteration */}
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">
                    Hindi (Devanagari)
                  </span>
                  <p className="font-devanagari text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                    {item.transliteratedText}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectHistoryItem(item)}
                  className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                >
                  <span>Open in Workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(item.id, item.transliteratedText)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                    title="Copy Hindi transliteration"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
