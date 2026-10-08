import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  AlertTriangle,
  Plus,
  ThumbsUp,
  Filter,
  CheckCircle2,
  Camera,
  Upload,
  Clock,
  Shield,
  Layers,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { CommunityReport, ReportCategory, ReportSeverity } from '../types';
import L from 'leaflet';

export const ReportsPage: React.FC = () => {
  const { t, addPoints, showToast } = useApp();

  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [activeReport, setActiveReport] = useState<CommunityReport | null>(null);

  // Form states
  const [reportCategory, setReportCategory] = useState<ReportCategory>('Overflowing bins');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [locality, setLocality] = useState<string>('');
  const [severity, setSeverity] = useState<ReportSeverity>('Medium');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Map reference
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const REPORT_CATEGORIES: ReportCategory[] = [
    'Garbage dumping',
    'Overflowing bins',
    'Plastic accumulation',
    'E-waste dumping',
    'Blocked garbage collection points'
  ];

  const SEVERITY_LEVELS: ReportSeverity[] = ['Low', 'Medium', 'High', 'Critical'];

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.getReports({
        category: categoryFilter,
        severity: severityFilter
      });
      if (res.reports) setReports(res.reports);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [categoryFilter, severityFilter]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946], // Bangalore center
        zoom: 11,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    reports.forEach(report => {
      const lat = report.approximateLat || report.lat;
      const lng = report.approximateLng || report.lng;

      // Color coding based on severity
      const markerColor =
        report.severity === 'Critical' ? '#e11d48' :
        report.severity === 'High' ? '#ea580c' :
        report.severity === 'Medium' ? '#d97706' : '#16a34a';

      // Custom SVG marker pin
      const icon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: ${markerColor}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">!</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker([lat, lng], { icon });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; max-width: 200px;">
          <strong style="display: block; color: #0f172a; margin-bottom: 2px;">${report.title}</strong>
          <span style="color: #64748b; font-size: 11px;">📍 ${report.locality}</span>
          <div style="margin-top: 4px; display: inline-block; padding: 2px 6px; border-radius: 4px; background: #f1f5f9; font-weight: bold; font-size: 10px;">
            Severity: ${report.severity}
          </div>
        </div>
      `);

      marker.on('click', () => {
        setActiveReport(report);
      });

      markersRef.current?.addLayer(marker);
    });
  }, [reports]);

  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.upvoteReport(id);
      if (res.success) {
        setReports(prev =>
          prev.map(r => (r.id === id ? { ...r, upvotes: res.upvotes } : r))
        );
        showToast('Thank you for confirming this community issue!', 'info');
      }
    } catch {
      showToast('Could not upvote report.', 'error');
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image (JPG, PNG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !description.trim() || !locality.trim()) {
      setFormError('Please provide a title, description, and approximate locality.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createReport({
        category: reportCategory,
        title: title.trim(),
        description: description.trim(),
        locality: locality.trim(),
        severity,
        imageUrl: imageUrl || undefined
      });

      if (res.success && res.data) {
        setReports(prev => [res.data, ...prev]);
        setShowModal(false);
        addPoints(res.earnedPoints, 'Hotspot report verified!');
        showToast(res.message, 'success');

        // Reset
        setTitle('');
        setDescription('');
        setLocality('');
        setImageUrl('');
        setImagePreview(null);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>Civic Transparency & Public Accountability</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Community Waste Hotspot Reporting
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Map overflowing bins, illegal garbage dumps, and blocked collection routes for collective civic resolution.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.reportHotspot} (+30 Pts)</span>
        </button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Privacy Safeguard:</strong> Exact household addresses are never published. Locations are presented at the approximate neighborhood or street-junction level to protect citizen privacy.
        </p>
      </div>

      {/* Interactive OpenStreetMap Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-2">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Interactive Locality Hotspot Map (OpenStreetMap)</span>
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            Click pins to preview issue summary
          </span>
        </div>

        {/* Map div */}
        <div
          id="reports-map"
          ref={mapContainerRef}
          className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200"
        />

        {/* Map Legend */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 px-2 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Critical
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span> High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Low
            </span>
          </div>
          <span className="text-[10px]">Leaflet 1.9.4 • OpenStreetMap Open Data</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-semibold">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Categories</option>
              {REPORT_CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Severity:</span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Severities</option>
              {SEVERITY_LEVELS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {reports.length} community report(s)
        </span>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map(report => (
          <div
            key={report.id}
            onClick={() => setActiveReport(report)}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4 hover:border-amber-400 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {report.category}
                </span>

                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    report.severity === 'Critical'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : report.severity === 'High'
                      ? 'bg-orange-100 text-orange-800 border border-orange-200'
                      : report.severity === 'Medium'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {report.severity}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {report.title}
              </h3>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {report.description}
              </p>

              {report.imageUrl && (
                <div className="rounded-xl overflow-hidden h-36 bg-slate-100">
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{report.locality}</span>
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={e => handleUpvote(report.id, e)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-xs font-bold transition"
                  title="Confirm/Upvote this issue"
                >
                  <ThumbsUp className="w-3 h-3 text-emerald-600" />
                  <span>{report.upvotes}</span>
                </button>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    report.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {report.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Report Waste Hotspot</h3>
                <p className="text-xs text-slate-500">Help sanitation teams locate problem spots</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Issue Category *
                </label>
                <select
                  value={reportCategory}
                  onChange={e => setReportCategory(e.target.value as ReportCategory)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {REPORT_CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Short Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Overflowing garbage bin near bus stop"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the type of waste, approximate size, and hazards (e.g. animals rummaging, odor, blocking footpath)..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Locality / Area Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={e => setLocality(e.target.value)}
                    placeholder="e.g. Indiranagar 12th Main"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Severity *
                  </label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as ReportSeverity)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {SEVERITY_LEVELS.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Upload Photo (Optional, max 5MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-2 h-24 w-24 rounded-lg overflow-hidden border border-slate-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-amber-300 text-white font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? 'Posting Report...' : 'Publish Report (+30 Pts)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

