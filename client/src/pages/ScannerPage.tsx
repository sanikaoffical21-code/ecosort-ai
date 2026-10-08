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
  Volume2
} from 'lucide-react';
import { api } from '../services/api';
import { ClassificationResult, WasteCategory } from '../types';

export const ScannerPage: React.FC = () => {
  const { t, addPoints, aiEngineStatus } = useApp();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [selectedManualCat, setSelectedManualCat] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample items for instant demo testing
  const SAMPLE_ITEMS = [
    { label: 'PET Water Bottle', desc: 'Crushed plastic mineral water bottle', icon: '🧴' },
    { label: 'Banana Peel', desc: 'Ripe organic banana skin', icon: '🍌' },
    { label: 'Old Smartphone', desc: 'Cracked Android mobile phone with battery', icon: '📱' },
    { label: 'Broken Glass Tumbler', desc: 'Shattered glass drinking tumbler pieces', icon: '🥛' },
    { label: 'Used AA Battery', desc: 'Depleted cylindrical alkaline battery', icon: '🔋' },
    { label: 'Cardboard Box', desc: 'Corrugated Amazon shipping carton', icon: '📦' },
    { label: 'Chemical Thinner Can', desc: 'Metal solvent and paint thinner container', icon: '🧪' }
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
      setErrorMsg('Camera access was not permitted. Please upload a photo or enter item description below.');
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

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 8MB. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMsg('Error reading uploaded image.');
    };
    reader.readAsDataURL(file);
  };

  // Run classification
  const handleScan = async (manualCatOverride?: string) => {
    if (!imagePreview && !description.trim() && !manualCatOverride && !selectedManualCat) {
      setErrorMsg('Please upload a photo, take a picture, or enter an item description.');
      return;
    }

    setErrorMsg(null);
    setIsScanning(true);

    try {
      const res = await api.classifyWaste({
        imageBase64: imagePreview || undefined,
        description: description.trim() || undefined,
        manualCategory: manualCatOverride || selectedManualCat || undefined
      });

      if (res.success && res.data) {
        setResult(res.data);
        if (res.earnedPoints > 0) {
          addPoints(res.earnedPoints, 'AI waste classification verified');
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

  // Confirm low confidence category
  const handleConfirmCategory = (cat: WasteCategory) => {
    handleScan(cat);
  };

  // Reset scanner
  const handleReset = () => {
    stopCamera();
    setImagePreview(null);
    setDescription('');
    setSelectedManualCat('');
    setResult(null);
    setErrorMsg(null);
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
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Engine Status: <strong>{aiEngineStatus}</strong></span>
        </div>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          No external API keys required in hackathon mode
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
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Photo</span>
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : imagePreview ? (
                /* Image Preview */
                <div className="space-y-3">
                  <div className="relative max-w-xs mx-auto rounded-xl overflow-hidden shadow-md">
                    <img src={imagePreview} alt="Captured waste preview" className="w-full h-48 object-cover" />
                    <button
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                      aria-label="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-emerald-700 font-semibold">Image loaded successfully</p>
                </div>
              ) : (
                /* Default empty state */
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Snap a photo or upload an image of your waste
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports JPG, PNG, WebP up to 8MB
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{t.takePhoto}</span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition"
                    >
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>{t.uploadPhoto}</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              )}
              {/* Hidden canvas for video captures */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Manual Description Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Item Description or Name (Optional if photo provided)
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Expired lithium button cell, plastic courier packaging, rotten papaya..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-slate-400"
              />
            </div>

            {/* Quick Sample Photos / Test Buttons for presentations */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                ⚡ Quick Demo Samples (Click to test instantly):
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_ITEMS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDescription(item.desc);
                      setErrorMsg(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 border border-slate-200 text-xs font-medium transition cursor-pointer text-slate-700"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Identified Item
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
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

            {/* Low Confidence Warning & Confirmation */}
            {result.requiresConfirmation && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-3">
                <div className="flex items-start gap-2.5 text-amber-800">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold">{t.confirmCategory}</h4>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Visual confidence is below threshold. Please confirm which category matches your item best to ensure safe disposal:
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(result.suggestedCategories || ALL_CATEGORIES.slice(0, 5)).map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleConfirmCategory(cat)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 border border-amber-300 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                    >
                      {cat}
                    </button>
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

            {/* Suggested Immediate Action */}
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 space-y-1">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                {t.suggestedAction}
              </span>
              <p className="text-xs leading-relaxed font-medium">
                {result.suggestedAction}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Another Item</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

