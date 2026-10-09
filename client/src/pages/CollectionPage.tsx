import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Info,
  ShieldAlert,
  Route,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { CollectionRequest, CollectionStatus } from '../types';

export const CollectionPage: React.FC = () => {
  const { t, addPoints, showToast, isDemoMode } = useApp();

  const [collections, setCollections] = useState<CollectionRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showRouteModal, setShowRouteModal] = useState<boolean>(false);
  const [suggestedRoute, setSuggestedRoute] = useState<any>(null);

  // Form states
  const [wasteType, setWasteType] = useState<string>('E-waste (Computers, Batteries, Cables, Appliances)');
  const [quantity, setQuantity] = useState<string>('');
  const [pickupArea, setPickupArea] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const WASTE_TYPE_OPTIONS = [
    'E-waste (Computers, Batteries, Cables, Appliances)',
    'Dry/Recyclable (Bulk Cardboard & Paper Bundles)',
    'Plastic Packaging & Crushed Bottles',
    'Textile & Clean Wearable Donation',
    'Metal Scrap & Beverage Cans',
    'Domestic Hazardous Waste (Paint, Thinners, Solvents)',
    'Biomedical / Expired Medicines'
  ];

  const LOCALITY_PRESETS = [
    'Indiranagar 100ft Rd',
    'Koramangala 5th Block',
    'Whitefield ITPL Main Rd',
    'HSR Layout Sector 2',
    'Malleshwaram 8th Cross',
    'RV College Campus Mysuru Rd'
  ];

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await api.getCollections(statusFilter, searchTerm);
      if (res.collections) setCollections(res.collections);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [statusFilter, searchTerm]);

  const handleOpenRoute = async () => {
    try {
      const res = await api.getSuggestedRoute();
      setSuggestedRoute(res);
      setShowRouteModal(true);
    } catch {
      showToast('Could not load collector route suggestion.', 'error');
    }
  };

  const isHazardousSelected = wasteType.includes('Hazardous') || wasteType.includes('Biomedical');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const todayStr = new Date().toISOString().split('T')[0];
    if (preferredDate < todayStr) {
      setFormError('Preferred pickup date cannot be in the past.');
      return;
    }

    if (!quantity.trim() || !pickupArea.trim() || !preferredDate || !contactName.trim() || !contactPhone.trim()) {
      setFormError('Please fill in all required fields (quantity, area, date, name, phone).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createCollection({
        wasteType,
        quantity: quantity.trim(),
        pickupArea: pickupArea.trim(),
        preferredDate,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        email: email.trim(),
        notes: notes.trim()
      });

      if (res.success && res.data) {
        setCollections(prev => [res.data, ...prev]);
        setShowModal(false);
        addPoints(res.earnedPoints, 'Collection request booked!');
        showToast(res.message, 'success');

        // Reset form
        setQuantity('');
        setPickupArea('');
        setPreferredDate('');
        setContactName('');
        setContactPhone('');
        setEmail('');
        setNotes('');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit collection request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: CollectionStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Assigned':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Collected':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>Circular Logistics & Municipal Partner Connect</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Smart Waste Collection Requests
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Schedule door-to-door bulk collections for E-waste, cardboard bundles, and recyclables.
          </p>
        </div>

        <div className="flex gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleOpenRoute}
            className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer border border-slate-200 transition"
            title="View suggested nearest-neighbor collection route"
          >
            <Route className="w-4 h-4 text-emerald-600" />
            <span>Suggested Route</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.bookPickup}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by area, waste type, or contact..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="Collected">Collected</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading collection schedules...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Truck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No collection requests found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Book your first waste pickup above to divert heavy e-waste, cardboard, or recyclable scrap from landfills!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {collections.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 hover:border-emerald-300 transition shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Request ID: {item.id}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{item.wasteType}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Quantity</span>
                  <span className="font-semibold text-slate-800">{item.quantity}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Area</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item.pickupArea}</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled Date</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{item.preferredDate}</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{item.contactName}</span>
                  </span>
                </div>
              </div>

              {/* Status progression bar / Visual Stepper */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                  <span className={item.status === 'Pending' || item.status === 'Assigned' || item.status === 'Collected' || item.status === 'Completed' ? 'text-emerald-700' : ''}>
                    1. Pending
                  </span>
                  <span className={item.status === 'Assigned' || item.status === 'Collected' || item.status === 'Completed' ? 'text-emerald-700' : ''}>
                    2. Assigned
                  </span>
                  <span className={item.status === 'Collected' || item.status === 'Completed' ? 'text-emerald-700' : ''}>
                    3. Collected
                  </span>
                  <span className={item.status === 'Completed' ? 'text-emerald-700' : ''}>
                    4. Completed
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-500"
                    style={{
                      width:
                        item.status === 'Pending' ? '25%' :
                        item.status === 'Assigned' ? '50%' :
                        item.status === 'Collected' ? '75%' : '100%'
                    }}
                  ></div>
                </div>
              </div>

              {/* Provider assignment */}
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-600 font-medium">Assigned Logistics Partner:</span>
                <span className="font-bold text-emerald-950">{item.provider}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggested Route Modal (Demo Feature) */}
      {showRouteModal && suggestedRoute && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Collector Route Suggestion</h3>
              </div>
              <button
                onClick={() => setShowRouteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {suggestedRoute.notice} Optimized nearest-neighbor path starting from {suggestedRoute.depot}.
            </p>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Stops</span>
                <span className="font-extrabold text-slate-800">{suggestedRoute.totalStops}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Distance</span>
                <span className="font-extrabold text-slate-800">{suggestedRoute.estimatedDistanceKm} km</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Time</span>
                <span className="font-extrabold text-slate-800">{suggestedRoute.estimatedDurationHours} hrs</span>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pt-2">
              {suggestedRoute.suggestedStops?.map((s: any) => (
                <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-emerald-800">Stop #{s.stopNumber}: {s.area}</span>
                    <p className="text-[11px] text-slate-500">{s.wasteType} • {s.quantity}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-700">
                    {s.estimatedArrival}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowRouteModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Route View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Request Bulk Collection</h3>
                <p className="text-xs text-slate-500">Pickups scheduled within 24-48 hours (Demo provider)</p>
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

              {/* Waste Type Dropdown */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Waste Type *
                </label>
                <select
                  value={wasteType}
                  onChange={e => setWasteType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {WASTE_TYPE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hazardous / Medical Routing Notice */}
              {isHazardousSelected && (
                <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 text-xs">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Authorized Hazmat / Biomedical Handling Protocol</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Hazardous materials cannot be mixed with regular community recycling vans. This pickup will be routed to a specialized authorized handling partner. Keep sealed in original containers away from direct sunlight.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Approximate Quantity *
                  </label>
                  <input
                    type="text"
                    required
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="e.g. 15 kg / 2 cartons"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Preferred Pickup Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={preferredDate}
                    onChange={e => setPreferredDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Pickup Area / Locality *
                </label>
                <input
                  type="text"
                  required
                  value={pickupArea}
                  onChange={e => setPickupArea(e.target.value)}
                  placeholder="e.g. Indiranagar 100ft Rd / RVCE Hostel Block A"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {LOCALITY_PRESETS.map((loc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPickupArea(loc)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600 cursor-pointer"
                    >
                      + {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Contact Phone (Private) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="+91 98450 XXXXX"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Special Pickup Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Call 10 mins before arrival; security gate access required."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? 'Booking Request...' : 'Confirm Request (+20 Pts)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
