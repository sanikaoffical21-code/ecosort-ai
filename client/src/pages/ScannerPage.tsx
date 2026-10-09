import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Sparkles,
  Info,
  ShieldAlert,
  Leaf,
  Recycle,
  X,
  Volume2,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { ClassificationResult, WasteCategory } from '../types';

export const ScannerPage: React.FC = () => {
  const { t, addPoints, aiEngineStatus, setActiveTab } = useApp();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [selectedManualCat, setSelectedManualCat] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [confirmedByUser, setConfirmedByUser] = useState<boolean>(false);
  const [showExplainability, setShowExplainability] = useState<boolean>(false);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample items for instant deterministic 1-second hackathon demo
  const SAMPLE_ITEMS = [
    { label: 'Banana Peel', desc: 'sample:banana-peel', icon: '🍌', note: 'Organic' },
    { label: 'PET Bottle', desc: 'sample:plastic-bottle', icon: '🧴', note: 'Plastic' },
    { label: 'AA Battery', desc: 'sample:battery', icon: '🔋', note: 'E-Waste Hazard' },
    { label: 'Ambiguous Foil Wrapper', desc: 'sample:ambiguous-wrapper', icon: '✨', note: 'Low Confidence (<70%) Demo' },
    { label: 'Broken Glass', desc: 'Broken glass tumbler shards', icon: '🥛', note: 'Glass' },
    { label: 'Paint Thinner', desc: 'Metal solvent and paint thinner container', icon: '🧪', note: 'Hazardous' }
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

  // Start webcam
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Webcam access error:', err.message);
      setIsCameraActive(false);
      setErrorMsg('Camera access was not permitted. Please upload an image or choose a demo item below.');
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture frame from webcam
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(dataUrl);
        stopCamera();
      }
    }
  };

  // File Upload handler with Client-Side Type & Size Validation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Allowed types: JPG, PNG, WebP
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload JPG, PNG, or WebP only.');
      return;
    }

    // Max 5 MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Classification
  const handleScan = async (manualCatOverride?: WasteCategory) => {
    setErrorMsg(null);
    setConfirmedByUser(false);

    if (!imagePreview && !description && !selectedManualCat && !manualCatOverride) {
      setErrorMsg('Please capture a photo, upload an image, enter an item description, or pick a sample.');
      return;
    }

    setIsScanning(true);
    try {
      const res = await api.classifyWaste({
        imageBase64: imagePreview || undefined,
        description: description || undefined,
        manualCategory: manualCatOverride || selectedManualCat || undefined
      });

      if (res.success && res.data) {
        setResult(res.data);
        if (res.earnedPoints > 0) {
          addPoints(res.earnedPoints, 'AI classification verified');
        }
      } else {
        throw new Error('Classification returned incomplete response.');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMsg(err.message || 'Could not classify item. You can select the category manually below.');
    } finally {
      setIsScanning(false);
    }
  };

  // Confirm low confidence category & claim points
  const handleConfirmCategory = async (cat: WasteCategory) => {
    if (!result) return;
    try {
      const res = await api.confirmFeedback({
        originalItem: result.itemName,
        confirmedCategory: cat,
        feedbackNotes: 'Citizen verified classification'
      });

      if (res.success) {
        setConfirmedByUser(true);
        setResult({
          ...result,
          category: cat,
          confidence: 100,
          requiresConfirmation: false,
          suggestedAction: `Confirmed as ${cat}. Eco Points credited.`
        });
        addPoints(res.earnedPoints, 'Citizen verification confirmed (+10 pts)');
      }
    } catch {
      handleScan(cat);
    }
  };

  // Voice Readout (Web Speech Synthesis)
  const handleSpeakGuidance = () => {
    if (!result || !('speechSynthesis' in window)) return;
    const text = `${result.itemName}. Category: ${result.category}. Put in ${result.binColor}. ${result.disposalMethod}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Reset scanner
  const handleReset = () => {
    stopCamera();
    setImagePreview(null);
    setDescription('');
    setSelectedManualCat('');
    setResult(null);
    setErrorMsg(null);
    setConfirmedByUser(false);
    setShowExplainability(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getBinBadgeClass = (category: WasteCategory) => {
    switch (category) {
      case 'Wet/Organic':
        return 'bg-emerald-600 text-white border-emerald-700';
      case 'Dry/Recyclable':
        return 'bg-blue-600 text-white border-blue-700';
      case 'Plastic':
        return 'bg-amber-500 text-white border-amber-600';
      case 'E-waste':
        return 'bg-amber-900 text-white border-amber-950';
      case 'Hazardous waste':
        return 'bg-rose-700 text-white border-rose-800';
      case 'Medical/sanitary waste':
        return 'bg-red-800 text-white border-red-950';
      case 'Glass':
        return 'bg-cyan-600 text-white border-cyan-700';
      case 'Metal':
        return 'bg-slate-700 text-white border-slate-800';
      case 'Textile':
        return 'bg-purple-600 text-white border-purple-700';
      default:
        return 'bg-slate-800 text-white border-slate-900';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Camera className="w-3.5 h-3.5" />
          <span>Multimodal AI Vision & Segregation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.scannerTitle}
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          {t.scannerSubtitle}
        </p>
      </div>

      {/* AI Engine Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Engine Status: <strong>{aiEngineStatus}</strong> (Vision → Keyword → Manual Fallback)</span>
        </div>
        <span className="text-[11px] text-slate-500">
          Deterministic Demo Mode Active • Fast Responses
        </span>
      </div>

      {/* Main Scanner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Input Area (Camera / File / Description) */}
        {!result && (
          <div className="space-y-6">
            {/* Visual Upload/Capture Box */}
            <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-400 transition bg-slate-50/50">
              {/* Webcam active */}
              {isCameraActive ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-black max-w-md mx-auto aspect-video flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-2 border-emerald-400/70 border-dashed rounded-lg m-6 pointer-events-none animate-pulse"></div>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={capturePhoto}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Photo</span>
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : imagePreview ? (
                /* Preview uploaded/captured photo */
                <div className="space-y-4">
                  <div className="relative max-w-xs mx-auto rounded-xl overflow-hidden shadow-md border border-slate-200 aspect-square flex items-center justify-center bg-black/5">
                    <img src={imagePreview} alt="Waste item to classify" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Photo attached & validated (JPG/PNG/WebP, &lt;5MB, EXIF stripped)</span>
                  </p>
                </div>
              ) : (
                /* Default empty state with Camera & File options */
                <div className="space-y-4 py-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mx-auto">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      Capture Waste Item with Camera or Upload Photo
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Supports camera capture, gallery upload (JPG, PNG, WebP up to 5 MB), or tap a scripted hackathon demo sample below.
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer transition"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{t.takePhoto}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-2xs cursor-pointer transition"
                    >
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>{t.uploadPhoto}</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Item text description input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>Or Enter Item Name / Material Description:</span>
                <span className="text-[11px] font-normal text-slate-400">(e.g. "used battery", "banana peel", "paint can")</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                placeholder="Type item description or select a sample below..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Quick Demo Scripted Samples */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                ⚡ 1-Click Hackathon Demo Samples (Deterministic Results):
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_ITEMS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDescription(item.desc);
                      setImagePreview(null);
                      handleScan();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 border border-slate-200 text-xs font-medium transition cursor-pointer text-slate-700"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({item.note})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fallback Manual Category Picker */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600">
                  Manual Waste Category Selector (Fallback Mode):
                </label>
                <span className="text-[11px] text-slate-400">Optional override</span>
              </div>
              <select
                value={selectedManualCat}
                onChange={e => setSelectedManualCat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Let AI Detect Automatically --</option>
                {ALL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Scan Action Button */}
            <div className="pt-2">
              <button
                onClick={() => handleScan()}
                disabled={isScanning}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Material & Safety Protocols...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Classification & Get Disposal Guidance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Classification Results Presentation */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top result banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Identified Item
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold">
                    AI-assisted estimate, not guaranteed
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {result.itemName}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getBinBadgeClass(result.category)}`}>
                    {result.category}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {t.binColor}: <strong>{result.binColor}</strong>
                  </span>
                </div>
              </div>

              <div className="text-right sm:border-l sm:pl-6 border-emerald-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t.confidence}
                </span>
                <div className="text-3xl font-black text-emerald-700">
                  {result.confidence}%
                </div>
                <span className="text-[10px] text-slate-500">
                  {result.source || 'EcoSort AI Engine'}
                </span>
              </div>
            </div>

            {/* CONFIDENCE GATING: below 70% show "Not sure, please confirm" with top-3 candidate chips */}
            {result.requiresConfirmation && !confirmedByUser && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 space-y-3">
                <div className="flex items-start gap-2.5 text-amber-900">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-extrabold">Not sure, please confirm your item category:</h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Visual confidence is below 70%. In accordance with Responsible AI principles, we never present uncertain results as fact. Please tap the correct candidate chip below to verify and earn <strong>+10 Eco Points</strong>:
                    </p>
                  </div>
                </div>

                {/* Candidate Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(result.suggestedCategories || ['Plastic', 'Dry/Recyclable', 'Other']).slice(0, 3).map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleConfirmCategory(cat)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 border-2 border-amber-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-amber-700 block italic">
                  * Confirmation is saved as training feedback to refine the model.
                </span>
              </div>
            )}

            {/* Confirmed Notice */}
            {confirmedByUser && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>Category confirmed by user! +10 Eco Points credited to your profile.</span>
                </div>
                <span className="font-bold">Verified</span>
              </div>
            )}

            {/* Top 3 Alternatives with probabilities */}
            {result.alternatives && result.alternatives.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Candidate Classification Probabilities:
                </span>
                <div className="space-y-1.5">
                  {result.alternatives.slice(0, 3).map((alt, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <span className="w-32 truncate font-medium text-slate-700">{alt.category}</span>
                      <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${alt.probability}%` }}
                        ></div>
                      </div>
                      <span className="w-10 text-right font-bold text-slate-700">{alt.probability}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Warning (If present) */}
            {result.safetyWarning && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-700">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>{t.safetyWarning}</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed font-medium">
                  {result.safetyWarning}
                </p>
              </div>
            )}

            {/* Disposal & Handling Directives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t.disposalMethod}</span>
                </span>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {result.disposalMethod}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>{t.environmentalImpact}</span>
                </span>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {result.environmentalImpact}
                </p>
              </div>
            </div>

            {/* Circular Economy Badges (Reuse, Recycle, Compost) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Circular Lifecycle Potential
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    result.canRecycle
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Recycle className="w-3.5 h-3.5" />
                  <span>{result.canRecycle ? 'Can Be Recycled' : 'Non-Recyclable'}</span>
                </span>

                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    result.canReuse
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{result.canReuse ? 'Reusable / Refillable' : 'Single Use'}</span>
                </span>

                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    result.canCompost
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5" />
                  <span>{result.canCompost ? 'Compostable Organic' : 'Non-Compostable'}</span>
                </span>
              </div>
            </div>

            {/* Suggested Immediate Action with Direct Button */}
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                  {t.suggestedAction}
                </span>
                <p className="text-xs leading-relaxed font-medium">
                  {result.suggestedAction}
                </p>
              </div>

              {result.category === 'E-waste' && (
                <button
                  onClick={() => setActiveTab('collection')}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>Book Pickup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Explainability Panel ("Why this category?") */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowExplainability(!showExplainability)}
                className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <span>Explainability: Why was this item categorized as {result.category}?</span>
                </div>
                {showExplainability ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showExplainability && (
                <div className="p-4 bg-white border-t border-slate-200 text-xs text-slate-700 space-y-3">
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Reasoning Analysis:</span>
                    <p className="leading-relaxed">
                      {result.explainability?.reasoning || 'Item matches key physical or linguistic traits defined in municipal circular guidelines.'}
                    </p>
                  </div>

                  {result.explainability?.matchedVisualCues && (
                    <div>
                      <span className="font-bold text-slate-900 block mb-1">Identified Material Features:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.explainability.matchedVisualCues.map((cue, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                            {cue}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Safety & Processing Rationale:</span>
                    <p className="leading-relaxed">
                      {result.explainability?.safetyRationale || 'Material separated at source avoids cross-contamination of recyclable dry paper and wet organic streams.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar (Audio Readout + Scan Another) */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Another Item</span>
              </button>

              <button
                onClick={handleSpeakGuidance}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition border border-slate-200"
                title="Listen to disposal instructions via speech audio"
              >
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Audio Read-out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
