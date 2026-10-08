import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Recycle,
  RefreshCw,
  Leaf,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { WasteItem } from '../types';

export const SearchPage: React.FC = () => {
  const { t } = useApp();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [items, setItems] = useState<WasteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Quick query chips requested by user prompt
  const QUICK_QUERIES = [
    'old mobile phone',
    'banana peel',
    'broken glass',
    'used battery',
    'plastic bottle',
    'milk pouch',
    'cardboard box',
    'paint can',
    'expired medicines'
  ];

  const handleSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.searchWaste(q);
      setItems(res.items || []);
    } catch (err) {
      console.error('Search error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Run initial popular search
  useEffect(() => {
    api.searchWaste('')
      .then(res => {
        if (res.items) setItems(res.items);
      })
      .catch(() => {});
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Wet/Organic':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Dry/Recyclable':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Plastic':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'E-waste':
        return 'bg-stone-200 text-stone-900 border-stone-400';
      case 'Hazardous waste':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Medical/sanitary waste':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'Glass':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'Metal':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      case 'Textile':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
          <Search className="w-3.5 h-3.5" />
          <span>Universal Waste Query Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          “What Should I Do With This?”
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Search any household, electronic, or everyday item to find instant disposal instructions, correct bin colors, and safety warnings.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSearch(searchTerm);
          }}
          className="relative flex items-center"
        >
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="absolute right-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Quick query chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Popular Items (Click to query):
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUERIES.map(q => (
              <button
                key={q}
                onClick={() => {
                  setSearchTerm(q);
                  handleSearch(q);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-xs font-medium border border-slate-200 transition cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results Area */}
      {loading ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Querying circular disposal directory...</p>
        </div>
      ) : items.length === 0 && hasSearched ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No exact match found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try a different term like "battery", "box", "plastic bottle", or take a photo in the AI Scanner module.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>{hasSearched ? `Matching Results for "${searchTerm}"` : 'Common Everyday Items'}</span>
            <span>{items.length} item(s) found</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5 hover:border-emerald-300 transition"
              >
                {/* Title & Category Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{item.name}</h2>
                    {item.aliases?.length > 0 && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Also known as: {item.aliases.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      Bin: {item.binColor}
                    </span>
                  </div>
                </div>

                {/* 4 Core Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Preparation Before Disposal */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Preparation Before Disposal</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {item.preparation}
                    </p>
                  </div>

                  {/* Disposal Method */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Recycle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Correct Disposal Method</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {item.disposalMethod}
                    </p>
                  </div>

                  {/* Reuse & Recycling Possibility */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                      <span>Reuse & Recycling Potential</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {item.recyclingPossibility}
                    </p>
                  </div>

                  {/* Environmental Impact */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Environmental Impact</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {item.environmentalImpact}
                    </p>
                  </div>
                </div>

                {/* Safety Precautions Warning */}
                {item.safetyPrecautions && item.safetyPrecautions !== 'None. Safe organic matter.' && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800 text-[11px] uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>Safety Precautions</span>
                    </div>
                    <p className="leading-relaxed font-medium">
                      {item.safetyPrecautions}
                    </p>
                  </div>
                )}

                {/* Suggested Action Bar */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                  <span className="font-semibold">
                    Suggested Next Action: <strong>{item.suggestedAction}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

