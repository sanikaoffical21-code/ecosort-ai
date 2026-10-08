import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  Sparkles,
  CheckCircle,
  Copy,
  Printer,
  Trash2,
  AlertTriangle,
  Info,
  Check,
  Plus
} from 'lucide-react';
import { api } from '../services/api';

export const SegregationPage: React.FC = () => {
  const { t, showToast } = useApp();
  const [inputText, setInputText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [categories, setCategories] = useState<Record<string, { title: string; items: string[]; instructions: string }> | null>(null);

  // Quick preset waste collections
  const PRESETS = [
    {
      name: 'College Dorm / Roommate Scraps',
      items: 'instant noodle cup, milk packet, spent battery, broken earphone, banana peel, study notes paper, delivery box'
    },
    {
      name: 'Family Kitchen & Grocery Waste',
      items: 'tomato skins, tea leaves, onion peels, cooking oil pouch, egg carton, aluminum soda can, expired paracetamol strip'
    },
    {
      name: 'Apartment Spring Cleaning',
      items: 'broken glass bottle, cardboard boxes, old t-shirt, dried paint can, pesticide bottle, laptop charger cable'
    }
  ];

  const handleSegregate = async (textToProcess?: string) => {
    const text = (textToProcess !== undefined ? textToProcess : inputText).trim();
    if (!text) return;

    setIsProcessing(true);
    try {
      const res = await api.segregateItems({ itemsText: text });
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    } catch (err: any) {
      console.error('Segregation error:', err);
      showToast('Failed to segregate items. Please check input.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!categories) return;
    let report = '🌱 EcoSort Household Segregation Plan:\n\n';
    Object.values(categories).forEach(cat => {
      if (cat.items.length > 0) {
        report += `📌 ${cat.title}:\n`;
        report += `Items: ${cat.items.join(', ')}\n`;
        report += `Instructions: ${cat.instructions}\n\n`;
      }
    });

    navigator.clipboard.writeText(report);
    setCopied(true);
    showToast('Segregation guide copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStreamColor = (key: string) => {
    switch (key) {
      case 'wet':
        return 'border-emerald-500 bg-emerald-50/50 text-emerald-950 header-bg-emerald-600';
      case 'dry':
        return 'border-blue-500 bg-blue-50/50 text-blue-950 header-bg-blue-600';
      case 'recyclable':
        return 'border-cyan-500 bg-cyan-50/50 text-cyan-950 header-bg-cyan-600';
      case 'eWaste':
        return 'border-amber-700 bg-amber-50/50 text-amber-950 header-bg-amber-800';
      case 'hazardous':
        return 'border-rose-500 bg-rose-50/50 text-rose-950 header-bg-rose-600';
      case 'special':
        return 'border-purple-500 bg-purple-50/50 text-purple-950 header-bg-purple-600';
      default:
        return 'border-slate-300 bg-slate-50 text-slate-900 header-bg-slate-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
          <Layers className="w-3.5 h-3.5" />
          <span>Multi-Stream Waste Sorting Planner</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.segregationTitle}
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          {t.segregationSubtitle}
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Enter Mixed Waste Items (Separate by comma, newline, or semicolon)
          </label>
          <textarea
            rows={4}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="e.g. Banana peel, milk pouch, spent AA battery, old cardboard box, pesticide bottle, sanitary pad, broken mug..."
            className="w-full p-4 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-slate-400"
          />
        </div>

        {/* Preset quick fills */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Quick Load Household & College Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(p.items);
                  handleSegregate(p.items);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-100 hover:text-teal-900 text-slate-700 text-xs font-medium border border-slate-200 transition cursor-pointer"
              >
                + {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => handleSegregate()}
            disabled={isProcessing || !inputText.trim()}
            className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-600 disabled:bg-teal-300 text-white font-bold text-sm shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Sorting Into Color-Coded Bins...' : 'Generate Segregation Bins & Guide'}</span>
          </button>
        </div>
      </div>

      {/* Generated Multi-Stream Bins */}
      {categories && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Generated Segregation Guide
              </h2>
              <p className="text-xs text-slate-500">
                Sorted according to municipal Solid Waste Management Rules & circular standards.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Guide'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Notice</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.entries(categories).map(([key, cat]) => {
              const hasItems = cat.items.length > 0;
              const streamStyle = getStreamColor(key);

              return (
                <div
                  key={key}
                  className={`rounded-2xl border-2 p-5 space-y-3 transition ${streamStyle} ${
                    !hasItems ? 'opacity-60' : 'shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm tracking-tight">{cat.title}</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                      {cat.items.length} item{cat.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Items List */}
                  {hasItems ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cat.items.map((item, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold shadow-2xs"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-slate-400">
                      No items classified into this stream.
                    </p>
                  )}

                  {/* Instructions */}
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] leading-relaxed">
                    <strong className="block text-slate-700 mb-0.5">Instructions:</strong>
                    <span>{cat.instructions}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

