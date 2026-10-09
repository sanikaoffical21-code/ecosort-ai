export type WasteCategory =
  | 'Wet/Organic'
  | 'Dry/Recyclable'
  | 'Plastic'
  | 'E-waste'
  | 'Hazardous waste'
  | 'Medical/sanitary waste'
  | 'Glass'
  | 'Metal'
  | 'Textile'
  | 'Other';

export interface WasteItem {
  id: string;
  name: string;
  aliases: string[];
  category: WasteCategory;
  binColor: string;
  preparation: string;
  recyclingPossibility: string;
  disposalMethod: string;
  safetyPrecautions: string;
  environmentalImpact: string;
  suggestedAction: string;
  canCompost: boolean;
  canRecycle: boolean;
  canReuse: boolean;
  keywords?: string[];
  disposalRank?: ('Reuse' | 'Repair' | 'Donate' | 'Recycle' | 'Compost' | 'Authorized Disposal')[];
}

export interface ClassificationAlternative {
  category: WasteCategory;
  probability: number;
}

export interface ClassificationResult {
  itemName: string;
  category: WasteCategory;
  confidence: number;
  binColor: string;
  disposalMethod: string;
  canRecycle: boolean;
  canReuse: boolean;
  canCompost: boolean;
  safetyWarning?: string | null;
  environmentalImpact: string;
  suggestedAction: string;
  requiresConfirmation: boolean;
  alternatives?: ClassificationAlternative[];
  suggestedCategories?: WasteCategory[];
  source?: string;
  explainability?: {
    matchedVisualCues: string[];
    matchedKeywords: string[];
    reasoning: string;
    safetyRationale: string;
  };
}

export type ReportCategory =
  | 'Garbage dumping'
  | 'Overflowing bins'
  | 'Plastic accumulation'
  | 'E-waste dumping'
  | 'Blocked garbage collection points';

export type ReportSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ReportStatus = 'Reported' | 'Under Review' | 'In Progress' | 'Resolved';

export interface CommunityReport {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  locality: string;
  city: string;
  lat: number;
  lng: number;
  approximateLat?: number;
  approximateLng?: number;
  severity: ReportSeverity;
  status: ReportStatus;
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
  upvotes: number;
  verified?: boolean;
  imageUrl?: string;
  priorityScore?: number;
  priorityReason?: string;
}

export type CollectionStatus = 'Pending' | 'Assigned' | 'Collected' | 'Completed';

export interface CollectionRequest {
  id: string;
  wasteType: string;
  quantity: string;
  pickupArea: string;
  preferredDate: string;
  contactName: string;
  contactPhone: string;
  email?: string;
  notes?: string;
  status: CollectionStatus;
  provider: string;
  createdAt: string;
}

export interface ImpactLog {
  id: string;
  user: string;
  plasticKg: number;
  paperKg: number;
  eWasteKg: number;
  organicKg: number;
  date: string;
}

export interface ImpactCalculation {
  divertedLandfillKg: number;
  co2SavingsKg: number;
  treesEquivalent: number;
  waterSavedLiters: number;
  kwhEnergySaved: number;
  breakdown: {
    plasticKg: number;
    paperKg: number;
    eWasteKg: number;
    organicKg: number;
  };
  disclaimer: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  currentProgress: number;
  targetProgress: number;
  unit: string;
  completed: boolean;
  deadline: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  locality?: string;
  category?: string;
  members?: number;
  points: number;
  divertedKg: number;
}

export interface GamificationState {
  userPoints: number;
  userLevel: string;
  userStreakDays: number;
  dailyPointsEarned: number;
  dailyCap: number;
  userBadges: Badge[];
  weeklyChallenges: Challenge[];
  individualLeaderboard: LeaderboardEntry[];
  communityLeaderboard: LeaderboardEntry[];
}

export interface SmartAlert {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  locality: string;
  date: string;
  active: boolean;
  read?: boolean;
}

export interface SuggestedItem {
  id: string;
  name: string;
  suggestedCategory: WasteCategory;
  userNotes?: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  submittedAt: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  entityType: 'Collection' | 'Report' | 'Suggestion' | 'Database';
  entityId?: string;
  adminUser: string;
  timestamp: string;
  details: string;
}

export type LanguageCode = 'en' | 'kn' | 'hi';

