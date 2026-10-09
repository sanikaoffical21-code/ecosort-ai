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
  Info,
  Mic,
  MicOff,
  Send,
  Truck,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';
import { WasteItem, WasteCategory } from '../types';

export const SearchPage: React.FC = () => {
  const { t, setActiveTab, addPoints, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [items, setItems] = useState<WasteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Suggest Item State
  const [suggestCategory, setSuggestCategory] = useState<WasteCategory>('Plastic');
  const [suggestNotes, setSuggestNotes] = useState<string>('');
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState<boolean>(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState<boolean>(false);

  // Quick query chips requested by user prompt
  const QUICK_QUERIES = [
    'old mobile phone',
    'banana peel',
    'broken glass',
    'used battery',
    'plastic bottle',
    'tetra pak',
    'thermocol',
    'sanitary pad',
    'syringe',
    'paint can',
    'cfl bulb',
    'expired medicines'
  ];

  const ALL_CATEGORIES: WasteCategory[] = [
    'Wet/Organic',
    'Dry/Recyclable',
    'Plastic',
    'E-waste',
    'Hazardous waste',
    'Medical/sanitary waste',
    'Glass',
    'Metal',
    'Textile',
    'Other'
  ];

  const handleSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;

    setLoading(true);
    setHasSearched(true);
    setSuggestionSuccess(false);
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

  // Voice Input via Web Speech API
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice search is not supported in this browser.', 'info');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        handleSearch(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Unknown item crowdsourced suggestion
  const handleSuggestItem = async () => {
    if (!searchTerm.trim()) return;
    setIsSubmittingSuggestion(true);
    try {
      const res = await api.suggestItem({
        name: searchTerm.trim(),
        suggestedCategory: suggestCategory,
        userNotes: suggestNotes
      });
      if (res.success) {
        setSuggestionSuccess(true);
        addPoints(15, 'Item suggestion submitted for admin review (+15 pts)');
        showToast('Thank you! Your item suggestion has been submitted for municipal review.', 'success');
      }
    } catch {
      showToast('Could not submit suggestion.', 'error');
    } finally {
      setIsSubmittingSuggestion(false);
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
          <span>Universal Circular Waste Directory (120+ Items)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          “What Should I Do With This?”
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Instant search over 120+ household, electronic, and industrial items. Find color-coded bin categories, preparation steps, and safety warnings.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSearch(searchTerm);
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-slate-400 bg-white"
            />
            {/* Voice Input Mic Button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`absolute right-3 p-2 rounded-xl transition cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
              }`}
              title="Voice Search (Speak item name)"
            >
              {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-xs shrink-0"
          >
            Search
          </button>
        </form>

        {isListening && (
          <p className="text-xs text-rose-600 font-semibold animate-pulse flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Listening... Speak the item name now (e.g. "used battery", "tetra pak")</span>
          </p>
        )}

        {/* Quick query chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Popular Items (Click to query 120+ database):
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
          <p className="text-xs text-slate-500 font-medium">Querying 120+ item circular knowledge base...</p>
        </div>
      ) : items.length === 0 && hasSearched ? (
        /* Unknown item fallback - crowdsource suggestion */
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Info className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              No exact match found for "{searchTerm}"
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Help us expand the community knowledge base! Suggest this item and choose its waste category for municipal review.
            </p>
          </div>

          {!suggestionSuccess ? (
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select Suggested Category for "{searchTerm}":
                </label>
                <select
                  value={suggestCategory}
                  onChange={e => setSuggestCategory(e.target.value as WasteCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                >
                  {ALL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Additional Notes (Optional):
                </label>
                <input
                  type="text"
                  value={suggestNotes}
                  onChange={e => setSuggestNotes(e.target.value)}
                  placeholder="e.g. material texture, packaging type"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>

              <button
                onClick={handleSuggestItem}
                disabled={isSubmittingSuggestion}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Suggest Item & Earn +15 Eco Points</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold max-w-md mx-auto">
              ✓ Item suggestion logged! Thank you for strengthening community waste governance.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>{hasSearched ? `Matching Results for "${searchTerm}"` : 'Common Everyday Items (Taxonomy Directory)'}</span>
            <span>{items.length} item(s) found</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5 hover:border-emerald-300 transition"
              >
                {/* Title & Category Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{item.name}</h2>
                    {item.aliases?.length > 0 && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Aliases: {item.aliases.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.binColor}
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
                {item.safetyPrecautions && item.safetyPrecautions !== 'None. Safe organic matter.' && !item.safetyPrecautions.startsWith('None') && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800 text-[11px] uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Safety Precautions</span>
                    </div>
                    <p className="leading-relaxed font-medium">
                      {item.safetyPrecautions}
                    </p>
                  </div>
                )}

                {/* Action Bar (Suggested Action + Next Action Buttons) */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                      Recommended Action:
                    </span>
                    <span className="font-semibold">{item.suggestedAction}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.category === 'E-waste' && (
                      <button
                        onClick={() => setActiveTab('collection')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Schedule Pickup</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveTab('reports')}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>Report Issue</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
