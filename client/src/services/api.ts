import {
  ClassificationResult,
  WasteItem,
  CommunityReport,
  CollectionRequest,
  ImpactCalculation,
  ImpactLog,
  GamificationState,
  SmartAlert
} from '../types';

const API_BASE = '/api';

/**
 * Robust fetch wrapper with timeout, json parsing, and role header injection
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  const activeRole = localStorage.getItem('ecosort_role') || 'citizen';

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': activeRole,
        ...options.headers
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Network request timed out. Please check your connection.');
    }
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: async () => {
    return apiFetch<{ status: string; app: string; aiEngine: string; wasteTaxonomyCount: number }>('/health');
  },

  // 1. AI Classification & Confidence Confirmation
  classifyWaste: async (payload: {
    imageBase64?: string;
    description?: string;
    manualCategory?: string;
  }): Promise<{
    success: boolean;
    data: ClassificationResult;
    earnedPoints: number;
    totalPoints: number;
    requiresConfirmation: boolean;
  }> => {
    return apiFetch('/ai/classify', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  confirmFeedback: async (payload: {
    originalItem: string;
    confirmedCategory: string;
    feedbackNotes?: string;
  }): Promise<{
    success: boolean;
    message: string;
    earnedPoints: number;
    totalPoints: number;
  }> => {
    return apiFetch('/ai/confirm-feedback', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // 2. Search & Crowdsourced Suggestion
  searchWaste: async (query: string): Promise<{ items: WasteItem[]; query: string; isDynamicMatch?: boolean }> => {
    return apiFetch(`/waste/search?q=${encodeURIComponent(query)}`);
  },

  suggestItem: async (payload: {
    name: string;
    suggestedCategory: string;
    userNotes?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: any;
    totalPoints: number;
  }> => {
    return apiFetch('/waste/suggest', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // 3. Segregation
  segregateItems: async (payload: {
    itemsText?: string;
    itemsList?: string[];
  }): Promise<{
    success: boolean;
    totalItems: number;
    categories: Record<string, { title: string; items: string[]; instructions: string }>;
  }> => {
    return apiFetch('/waste/segregate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // 4. Eco Impact
  calculateImpact: async (payload: {
    plasticKg: number;
    paperKg: number;
    eWasteKg: number;
    organicKg: number;
  }): Promise<ImpactCalculation> => {
    return apiFetch('/impact/calculate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  logImpact: async (payload: {
    plasticKg: number;
    paperKg: number;
    eWasteKg: number;
    organicKg: number;
  }): Promise<{ success: boolean; log: ImpactLog; earnedPoints: number; totalPoints: number }> => {
    return apiFetch('/impact/log', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getImpactLogs: async (): Promise<{ logs: ImpactLog[] }> => {
    return apiFetch('/impact/logs');
  },

  // 5. Collection Requests
  getCollections: async (status?: string, search?: string): Promise<{ collections: CollectionRequest[] }> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    return apiFetch(`/collections?${params.toString()}`);
  },

  createCollection: async (payload: Partial<CollectionRequest>): Promise<{
    success: boolean;
    data: CollectionRequest;
    earnedPoints: number;
    isHazardousNotice?: boolean;
    message: string;
  }> => {
    return apiFetch('/collections', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateCollectionStatus: async (
    id: string,
    status: string,
    provider?: string
  ): Promise<{ success: boolean; data: CollectionRequest }> => {
    return apiFetch(`/collections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, provider })
    });
  },

  // 6. Community Reports
  getReports: async (filters?: {
    status?: string;
    category?: string;
    severity?: string;
    locality?: string;
  }): Promise<{ reports: CommunityReport[]; total: number }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.locality) params.append('locality', filters.locality);
    return apiFetch(`/reports?${params.toString()}`);
  },

  createReport: async (payload: Partial<CommunityReport>): Promise<{
    success: boolean;
    data: CommunityReport;
    earnedPoints: number;
    warningDuplicate?: string | null;
    message: string;
  }> => {
    return apiFetch('/reports', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  upvoteReport: async (id: string): Promise<{ success: boolean; upvotes: number; verified?: boolean }> => {
    return apiFetch(`/reports/${id}/upvote`, {
      method: 'POST'
    });
  },

  updateReportStatus: async (
    id: string,
    status: string,
    resolutionNote?: string
  ): Promise<{ success: boolean; report: CommunityReport }> => {
    return apiFetch(`/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNote })
    });
  },

  // 7. Alerts
  getAlerts: async (): Promise<{ alerts: SmartAlert[] }> => {
    return apiFetch('/alerts');
  },

  markAlertRead: async (id: string): Promise<{ success: boolean }> => {
    return apiFetch(`/alerts/${id}/read`, {
      method: 'POST'
    });
  },

  // 8. Gamification
  getGamification: async (): Promise<GamificationState> => {
    return apiFetch('/gamification');
  },

  claimChallenge: async (challengeId: string): Promise<{
    success: boolean;
    rewardPoints: number;
    totalPoints: number;
  }> => {
    return apiFetch('/gamification/claim-challenge', {
      method: 'POST',
      body: JSON.stringify({ challengeId })
    });
  },

  // 9. Community Dashboard
  getCommunityDashboard: async () => {
    return apiFetch<any>('/dashboard/community');
  },

  // 10. Admin Overview & Differentiators
  getAdminOverview: async () => {
    return apiFetch<any>('/admin/overview');
  },

  getPrioritizedHotspots: async () => {
    return apiFetch<{ prioritizedHotspots: CommunityReport[] }>('/admin/prioritized-hotspots');
  },

  getSuggestedRoute: async () => {
    return apiFetch<{
      success: boolean;
      depot: string;
      totalStops: number;
      estimatedDistanceKm: string;
      estimatedDurationHours: string;
      suggestedStops: any[];
      notice: string;
    }>('/admin/suggested-route');
  },

  updateSuggestedItem: async (id: string, status: 'Approved' | 'Rejected') => {
    return apiFetch<{ success: boolean; item: any }>(`/admin/suggested-items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  getAuditLogs: async () => {
    return apiFetch<{ auditLogs: any[] }>('/admin/audit-log');
  },

  // Demo Reset
  resetDemoData: async () => {
    return apiFetch<{ success: boolean; message: string }>('/demo/reset', {
      method: 'POST'
    });
  }
};
