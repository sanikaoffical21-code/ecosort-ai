import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Database,
  UserCheck,
  Building,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { CollectionRequest, CommunityReport } from '../types';

export const AdminPage: React.FC = () => {
  const { userRole, setUserRole, showToast } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'collections' | 'reports'>('collections');
  const [collections, setCollections] = useState<CollectionRequest[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [colRes, repRes, overRes] = await Promise.all([
        api.getCollections(),
        api.getReports(),
        api.getAdminOverview()
      ]);
      if (colRes?.collections) setCollections(colRes.collections);
      if (repRes?.reports) setReports(repRes.reports);
      if (overRes) setOverview(overRes);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateCollectionStatus = async (id: string, newStatus: string) => {
    try {
      const res = await api.updateCollectionStatus(id, newStatus);
      if (res.success) {
        setCollections(prev =>
          prev.map(c => (c.id === id ? { ...c, status: newStatus as any } : c))
        );
        showToast(`Request ${id} status updated to ${newStatus}`, 'success');
      }
    } catch {
      showToast('Could not update collection status.', 'error');
    }
  };

  const handleUpdateReportStatus = async (id: string, newStatus: string) => {
    try {
      const res = await api.updateReportStatus(id, newStatus);
      if (res.success) {
        setReports(prev =>
          prev.map(r => (r.id === id ? { ...r, status: newStatus as any } : r))
        );
        showToast(`Hotspot ${id} status updated to ${newStatus}`, 'success');
      }
    } catch {
      showToast('Could not update hotspot status.', 'error');
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all sample reports and collections back to fresh Hackathon baseline?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await api.resetDemoData();
      if (res.success) {
        showToast('Database reset to fresh baseline demo data!', 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Error resetting demo data.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>Civic Administration & Municipal Operations</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Municipal & Admin Operations Center
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review community collection dispatches, verify citizen hotspot reports, and manage logistics partners.
          </p>
        </div>

        {/* Demo reset button */}
        <button
          onClick={handleResetDemoData}
          disabled={isResetting}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition border border-slate-700 shadow-sm self-start sm:self-auto"
          title="Restore fresh sample records for live presentations"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Hackathon Demo Data</span>
        </button>
      </div>

      {/* Role Switcher Reminder */}
      {userRole !== 'admin' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">Previewing Admin Dashboard in Citizen Mode</h4>
              <p className="text-xs text-amber-800">
                Switch to Admin Mode to experience official operational permissions.
              </p>
            </div>
          </div>
          <button
            onClick={() => setUserRole('admin')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 cursor-pointer"
          >
            Switch to Admin Role
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pending Pickups</span>
          <div className="text-2xl font-black text-slate-900">
            {overview ? overview.pendingCollections : 1}
          </div>
          <p className="text-[10px] text-slate-400">Awaiting provider dispatch</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Active Hotspots</span>
          <div className="text-2xl font-black text-slate-900">
            {overview ? overview.activeReports : 3}
          </div>
          <p className="text-[10px] text-slate-400">Requiring ward sanitation action</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Total Requests Logged</span>
          <div className="text-2xl font-black text-slate-900">
            {collections.length}
          </div>
          <p className="text-[10px] text-slate-400">All registered pickups</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Items Cataloged</span>
          <div className="text-2xl font-black text-slate-900">
            {overview ? overview.wasteItemsCount : 15}+
          </div>
          <p className="text-[10px] text-slate-400">Standard circular waste items</p>
        </div>
      </div>

      {/* Management Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveAdminTab('collections')}
            className={`pb-3 font-bold text-xs uppercase tracking-wider transition border-b-2 ${
              activeAdminTab === 'collections'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Collection Requests ({collections.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('reports')}
            className={`pb-3 font-bold text-xs uppercase tracking-wider transition border-b-2 ${
              activeAdminTab === 'reports'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Community Waste Reports ({reports.length})
          </button>
        </div>

        {/* Collections Table */}
        {activeAdminTab === 'collections' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">ID / Date</th>
                  <th className="py-3 px-3">Waste Stream</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Area / Citizen</th>
                  <th className="py-3 px-3">Assigned Provider</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {collections.map(col => (
                  <tr key={col.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-900 block">{col.id}</span>
                      <span className="text-[10px] text-slate-400">{col.preferredDate}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{col.wasteType}</td>
                    <td className="py-3 px-3">{col.quantity}</td>
                    <td className="py-3 px-3">
                      <span className="block font-semibold">{col.pickupArea}</span>
                      <span className="text-[10px] text-slate-400">{col.contactName} ({col.contactPhone})</span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-600">{col.provider}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          col.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : col.status === 'Collected'
                            ? 'bg-purple-100 text-purple-800'
                            : col.status === 'Assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {col.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <select
                        value={col.status}
                        onChange={e => handleUpdateCollectionStatus(col.id, e.target.value)}
                        className="text-xs bg-slate-100 border border-slate-300 rounded px-2 py-1 font-bold text-slate-700"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Collected">Collected</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Hotspot Reports Table */}
        {activeAdminTab === 'reports' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">ID / Category</th>
                  <th className="py-3 px-3">Title & Locality</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Upvotes</th>
                  <th className="py-3 px-3">Current Status</th>
                  <th className="py-3 px-3 text-right">Action Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {reports.map(rep => (
                  <tr key={rep.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-900 block">{rep.id}</span>
                      <span className="text-[10px] text-slate-400">{rep.category}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="block font-semibold text-slate-900">{rep.title}</span>
                      <span className="text-[10px] text-slate-500">📍 {rep.locality}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          rep.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : rep.severity === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rep.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700">{rep.upvotes}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          rep.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <select
                        value={rep.status}
                        onChange={e => handleUpdateReportStatus(rep.id, e.target.value)}
                        className="text-xs bg-slate-100 border border-slate-300 rounded px-2 py-1 font-bold text-slate-700"
                      >
                        <option value="Reported">Reported</option>
                        <option value="Under Review">Under Review</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

