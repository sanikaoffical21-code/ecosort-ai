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
 * Robust fetch wrapper with timeout and json parsing
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
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
    return apiFetch<{ status: string; app: string; aiEngine: string }>('/health');
  },

  // 1. AI Classification
  classifyWaste: async (payload: {
    imageBase64?: string;
    description?: string;
    manualCategory?: string;
  }): Promise<{ success: boolean; data: ClassificationResult; earnedPoints: number; totalPoints: number }> => {
    return apiFetch('/ai/classify', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // 2. Search
  searchWaste: async (query: string): Promise<{ items: WasteItem[]; query: string; isDynamicMatch?: boolean }> => {
    return apiFetch(`/waste/search?q=${encodeURIComponent(query)}`);
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
  }): Promise<{ reports: CommunityReport[] }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.severity) params.append('severity', filters.severity);
    return apiFetch(`/reports?${params.toString()}`);
  },

  createReport: async (payload: Partial<CommunityReport>): Promise<{
    success: boolean;
    data: CommunityReport;
    earnedPoints: number;
    message: string;
  }> => {
    return apiFetch('/reports', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  upvoteReport: async (id: string): Promise<{ success: boolean; upvotes: number }> => {
    return apiFetch(`/reports/${id}/upvote`, {
      method: 'POST'
    });
  },

  updateReportStatus: async (id: string, status: string): Promise<{ success: boolean; report: CommunityReport }> => {
    return apiFetch(`/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // 7. Alerts
  getAlerts: async (): Promise<{ alerts: SmartAlert[] }> => {
    return apiFetch('/alerts');
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

  // 10. Admin Overview
  getAdminOverview: async () => {
    return apiFetch<any>('/admin/overview');
  },

  // Demo Reset
  resetDemoData: async () => {
    return apiFetch<{ success: boolean; message: string }>('/demo/reset', {
      method: 'POST'
    });
  }
};

