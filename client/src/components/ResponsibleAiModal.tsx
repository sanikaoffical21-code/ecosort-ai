import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, X, AlertTriangle, Eye, CheckCircle2, Lock, Scale, HeartHandshake } from 'lucide-react';

export const ResponsibleAiModal: React.FC = () => {
  const { showResponsibleAi, setShowResponsibleAi } = useApp();

  if (!showResponsibleAi) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-6 sm:p-8 text-white relative">
          <button
            onClick={() => setShowResponsibleAi(false)}
            aria-label="Close modal"
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ethical AI, Safety & Privacy Charter</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Responsible AI & Transparency Principles
          </h2>
          <p className="text-sm text-emerald-100/80 mt-1">
            How EcoSort AI handles uncertainty, protects citizen privacy, and ensures municipal safety.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Confidence Gating & Human in the loop */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                1. Confidence Gating (Zero False Certainty)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We strictly reject claims of "100% accurate AI". When the vision or heuristic classifier detects an item with under 70% confidence, the system never presents a guess as definitive. Instead, it activates <strong>Confidence Gating</strong>, requiring human citizen confirmation before awarding points or finalizing disposal advice.
              </p>
            </div>
          </div>

          {/* 2. Privacy by Design & GPS Obfuscation */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                2. Privacy By Design (~500m Locality Centroids)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When citizens report waste hotspots, raw GPS coordinates and EXIF camera location tags are stripped on the server. Public map pins are rounded to approximate ~500m locality centroids. Exact street addresses and personal phone numbers are never exposed to public feeds.
              </p>
            </div>
          </div>

          {/* 3. Hazardous Waste Safety Routing */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                3. Strict Chemical & Biohazard Safety Protocol
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hazardous items (acids, pesticides, motor oil) and biomedical waste (sharps, needles) <strong>never receive DIY disposal advice</strong>. The system automatically routes these to certified municipal hazardous handlers and displays prominent safety notices preventing drain dumping or incineration.
              </p>
            </div>
          </div>

          {/* 4. Transparent LCA Impact Modeling */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                4. Transparent LCA Impact Modeling (Always Labeled "ESTIMATE")
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All carbon emissions and landfill diversion figures are transparently calculated using standardized peer-reviewed factors from the EPA Waste Reduction Model (WARM) and IPCC Guidelines. Every figure is clearly labeled as an estimate with an expandable methodology breakdown.
              </p>
            </div>
          </div>

          {/* 5. Continuous Improvement from Citizen Feedback */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                5. Continuous Model Improvement from Citizen Feedback
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When users confirm a gated classification or suggest a new item, the feedback is stored for admin review and heuristic refinement. The model grows smarter with every community interaction.
              </p>
            </div>
          </div>

          {/* Close CTA */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setShowResponsibleAi(false)}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
            >
              I Understand & Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

