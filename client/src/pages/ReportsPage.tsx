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
  X,
  List,
  Map as MapIcon,
  Flame,
  Award
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
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [activeReport, setActiveReport] = useState<CommunityReport | null>(null);

  // Form states
  const [reportCategory, setReportCategory] = useState<ReportCategory>('Overflowing bins');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [locality, setLocality] = useState<string>('');
  const [severity, setSeverity] = useState<ReportSeverity>('Medium');
  const [approximateLocation, setApproximateLocation] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

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

  const LOCALITY_PRESETS = [
    'Indiranagar 100ft Rd',
    'Koramangala 5th Block',
    'Whitefield ITPL Main Rd',
    'HSR Layout Sector 2',
    'Malleshwaram 8th Cross',
    'Jayanagar 4th Block',
    'Electronic City Phase 1',
    'Hebbal Lake Environs',
    'RV College Mysuru Rd'
  ];

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
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946], // Bengaluru center
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
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [viewMode]);

  // Update Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    reports.forEach(report => {
      const lat = report.approximateLat || report.lat;
      const lng = report.approximateLng || report.lng;

      const markerColor =
        report.severity === 'Critical' ? '#e11d48' :
        report.severity === 'High' ? '#ea580c' :
        report.severity === 'Medium' ? '#d97706' : '#16a34a';

      const icon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold; cursor: pointer;">${report.verified ? '★' : '!'}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; max-width: 220px; padding: 2px;">
          <strong style="display: block; color: #0f172a; margin-bottom: 2px;">${report.title}</strong>
          <span style="color: #64748b; font-size: 11px;">📍 ${report.locality}</span>
          <div style="margin-top: 6px; display: flex; gap: 4px; align-items: center;">
            <span style="padding: 2px 6px; border-radius: 4px; background: #fee2e2; color: #991b1b; font-weight: bold; font-size: 10px;">
              ${report.severity}
            </span>
            <span style="padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #475569; font-size: 10px;">
              👍 ${report.upvotes}
            </span>
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
          prev.map(r => (r.id === id ? { ...r, upvotes: res.upvotes, verified: res.verified } : r))
        );
        showToast('I see this too! Report verified (+1 upvote)', 'info');
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
    setDuplicateWarning(null);

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
        if (res.warningDuplicate) {
          showToast(res.warningDuplicate, 'info');
        } else {
          showToast(res.message, 'success');
        }

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
            Crowdsource overflowing bins, plastic dumps, and blocked collection routes for priority municipal resolution.
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
          <strong>Privacy By Design:</strong> Exact household addresses are never recorded or published. Locations are strictly rounded to ~500m locality centroids to protect citizen privacy. EXIF GPS tags are stripped on upload.
        </p>
      </div>

      {/* View Mode Toggle & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Map / List */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'map' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

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
                <option key={c} value={c}>{c}</option>
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
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{reports.length} hotspot(s) mapped across Bengaluru</span>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Interactive Locality Hotspot Map (OpenStreetMap Clustered Pins)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Click pins to inspect details
            </span>
          </div>

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
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <span>★</span> Community Verified (≥10 Upvotes)
              </span>
            </div>
            <span className="text-[10px]">Leaflet 1.9.4 • OpenStreetMap</span>
          </div>
        </div>
      )}

      {/* Reports Grid (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map(report => (
          <div
            key={report.id}
            onClick={() => setActiveReport(report)}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4 hover:border-amber-400 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {report.category}
                </span>

                <div className="flex items-center gap-1.5">
                  {report.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      <Award className="w-3 h-3 text-emerald-700" />
                      <span>Verified</span>
                    </span>
                  )}
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

            {/* Bottom meta row */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[150px]">{report.locality}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  report.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {report.status}
                </span>

                <button
                  type="button"
                  onClick={e => handleUpvote(report.id, e)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200 transition cursor-pointer text-xs"
                  title="I see this too! Confirm this issue to raise municipal priority"
                >
                  <ThumbsUp className="w-3 h-3 text-amber-700" />
                  <span>{report.upvotes}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Submitting New Report */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Report Waste Hotspot</h3>
                <p className="text-xs text-slate-500">Earn +30 Eco Points for valid civic reporting</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
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
                  Hotspot Category *
                </label>
                <select
                  value={reportCategory}
                  onChange={e => setReportCategory(e.target.value as ReportCategory)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {REPORT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Overflowing garbage bin near bus depot"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Locality / Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={locality}
                  onChange={e => setLocality(e.target.value)}
                  placeholder="e.g. Indiranagar 12th Main Road"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {LOCALITY_PRESETS.slice(0, 5).map((loc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLocality(loc)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600 cursor-pointer"
                    >
                      + {loc}
                    </button>
                  ))}
                </div>
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
                  placeholder="Describe waste type, hazard level, and exact landmark..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Severity Level *
                </label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value as ReportSeverity)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {SEVERITY_LEVELS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Upload Photo (Optional, &lt; 5MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageFile}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              {/* Privacy Centroid Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="approx-loc"
                  checked={approximateLocation}
                  onChange={e => setApproximateLocation(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="approx-loc" className="text-xs text-slate-600 cursor-pointer">
                  Use approximate location (~500m grid centroid for privacy)
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-amber-300 text-white font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? 'Submitting Report...' : 'Publish Public Hotspot (+30 Pts)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
