import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { COMPREHENSIVE_WASTE_TAXONOMY } from '../../shared/waste-taxonomy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const INITIAL_WASTE_ITEMS = COMPREHENSIVE_WASTE_TAXONOMY;

// Generate 60+ realistic community reports across Bengaluru localities
const LOCALITIES = [
  { name: 'Indiranagar 100ft Rd', lat: 12.9784, lng: 77.6408 },
  { name: 'Koramangala 5th Block', lat: 12.9352, lng: 77.6245 },
  { name: 'Whitefield ITPL Main Rd', lat: 12.9698, lng: 77.7499 },
  { name: 'HSR Layout Sector 2', lat: 12.9121, lng: 77.6446 },
  { name: 'Malleshwaram 8th Cross', lat: 13.0035, lng: 77.5711 },
  { name: 'Jayanagar 4th Block', lat: 12.9250, lng: 77.5938 },
  { name: 'Electronic City Phase 1', lat: 12.8452, lng: 77.6602 },
  { name: 'Hebbal Lake Environs', lat: 13.0358, lng: 77.5970 },
  { name: 'Rajajinagar 1st Block', lat: 12.9982, lng: 77.5530 },
  { name: 'BTM Layout 2nd Stage', lat: 12.9166, lng: 77.6101 },
  { name: 'Marathahalli Bridge', lat: 12.9591, lng: 77.7011 },
  { name: 'RV College Mysuru Rd', lat: 12.9238, lng: 77.4988 }
];

const REPORT_TEMPLATES = [
  { category: 'Overflowing bins', title: 'Community twin-bin overflowing on pedestrian walkway', desc: 'Wet food waste and plastic wrappers spilling onto footpath attracting stray dogs.', sev: 'High' },
  { category: 'Garbage dumping', title: 'Open plot illegal mixed garbage dump', desc: 'Construction debris and discarded commercial sacks dumped near boundary wall.', sev: 'High' },
  { category: 'Plastic accumulation', title: 'Single-use plastic cups choking stormwater drain', desc: 'Tea stall plastic glasses and packaging accumulation before upcoming rains.', sev: 'Medium' },
  { category: 'E-waste dumping', title: 'Discarded electronics and broken monitor tubes', desc: 'Cathode ray tubes and wire bundles abandoned behind electrical transformer.', sev: 'Critical' },
  { category: 'Blocked garbage collection points', title: 'Commercial vehicle blocking auto-tipper access', desc: 'Sanitation pickup van unable to access apartment waste segregation enclosure.', sev: 'Low' },
  { category: 'Garbage dumping', title: 'Dry waste and cardboard packaging burn risk', desc: 'Large pile of dry packing material left unattended next to dry vegetation.', sev: 'Critical' },
  { category: 'Overflowing bins', title: 'Market vegetable market bin overflowing', desc: 'Rotten vegetables creating odor and slip hazard near bus shelter.', sev: 'Medium' },
  { category: 'Plastic accumulation', title: 'LDPE milk packets accumulated near culvert', desc: 'Floating soft plastics accumulating in roadside culvert basin.', sev: 'Medium' }
];

const CITIZEN_NAMES = ['Kavya S.', 'Arjun V.', 'Pooja Hegde', 'Ramesh Gowda', 'Ananya Roy', 'Sunil Kumar', 'Deepa Nair', 'Vikas Sharma', 'Divya Patel', 'Karthik Raja', 'Meera Rao', 'Suresh Babu'];

function generateInitialReports() {
  const reports = [];
  let idCounter = 101;

  for (let i = 0; i < 62; i++) {
    const loc = LOCALITIES[i % LOCALITIES.length];
    const tmpl = REPORT_TEMPLATES[i % REPORT_TEMPLATES.length];
    const citizen = CITIZEN_NAMES[i % CITIZEN_NAMES.length];

    // Jitter coordinates within ~400 meters for realistic clustering
    const latJitter = (Math.random() - 0.5) * 0.008;
    const lngJitter = (Math.random() - 0.5) * 0.008;
    const lat = +(loc.lat + latJitter).toFixed(4);
    const lng = +(loc.lng + lngJitter).toFixed(4);

    const daysAgo = Math.floor(Math.random() * 20);
    const date = new Date(Date.now() - daysAgo * 24 * 3600 * 1000).toISOString();

    const statuses = ['Reported', 'Under Review', 'In Progress', 'Resolved'];
    const status = i < 15 ? 'Reported' : i < 30 ? 'In Progress' : i < 45 ? 'Under Review' : 'Resolved';

    const upvotes = Math.floor(Math.random() * 35) + 1;
    const verified = upvotes >= 10;

    // Severity score for prioritization
    const sevScore = tmpl.sev === 'Critical' ? 4 : tmpl.sev === 'High' ? 3 : tmpl.sev === 'Medium' ? 2 : 1;
    const ageDays = daysAgo;
    const priorityScore = +(sevScore * 1.5 + upvotes * 0.4 + ageDays * 0.2).toFixed(1);

    reports.push({
      id: `rep-${idCounter++}`,
      category: tmpl.category,
      title: `${tmpl.title} (${loc.name})`,
      description: tmpl.desc,
      locality: loc.name,
      city: 'Bengaluru',
      lat,
      lng,
      approximateLat: +lat.toFixed(3),
      approximateLng: +lng.toFixed(3),
      severity: tmpl.sev,
      status,
      reportedBy: citizen,
      reportedAt: date,
      resolvedAt: status === 'Resolved' ? new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() : undefined,
      resolutionNote: status === 'Resolved' ? 'Cleaned by Ward Sanitation Taskforce. Waste transported to dry waste depot.' : undefined,
      upvotes,
      verified,
      priorityScore,
      priorityReason: tmpl.sev === 'Critical' ? 'Imminent ecological / fire safety risk' : upvotes > 15 ? 'High citizen community consensus' : 'Standard scheduled ward priority',
      imageUrl: i % 3 === 0 ? 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&auto=format&fit=crop&q=60' : undefined
    });
  }

  return reports;
}

export const INITIAL_REPORTS = generateInitialReports();

// Initial Realistic Collection Requests in all 4 statuses
export const INITIAL_COLLECTIONS = [
  {
    id: 'col-501',
    wasteType: 'E-waste (Computers, Batteries, Cables)',
    quantity: 'approx. 18 kg (2 cartons)',
    pickupArea: 'Indiranagar 4th Cross',
    preferredDate: '2026-10-12',
    contactName: 'Rohit Kulkarni',
    contactPhone: '+91 98450 12345',
    email: 'rohit.kulkarni@example.com',
    status: 'Assigned',
    provider: 'GreenClean Karnataka E-Recyclers (Reg. #KA-EW-291) [Demo provider, no real municipal integration]',
    notes: 'Please pick up after 10 AM. Contains two dead laptops and battery packs.',
    createdAt: '2026-10-06T15:20:00Z'
  },
  {
    id: 'col-502',
    wasteType: 'Dry/Recyclable (Cardboard & Paper)',
    quantity: 'approx. 45 kg',
    pickupArea: 'RV College Hostel Campus, Mysuru Rd',
    preferredDate: '2026-10-14',
    contactName: 'Vikas Sharma (Student Eco Club)',
    contactPhone: '+91 97412 88990',
    email: 'ecoclub@rvce.edu',
    status: 'Pending',
    provider: 'Pending Municipality/Recycler Assignment',
    notes: 'Post-hackathon cardboard boxes and project materials stacked near Gate 3.',
    createdAt: '2026-10-07T11:45:00Z'
  },
  {
    id: 'col-503',
    wasteType: 'Plastic & Beverage Cans',
    quantity: 'approx. 12 kg',
    pickupArea: 'Greenwood Apartments, Whitefield',
    preferredDate: '2026-10-08',
    contactName: 'Sneha Patel',
    contactPhone: '+91 99001 44321',
    email: 'sneha.p@example.com',
    status: 'Collected',
    provider: 'Hasiru Dala Community Recyclers [Demo provider, no real municipal integration]',
    notes: 'Sorted into segregated bags and weighed at pickup point.',
    createdAt: '2026-10-04T16:10:00Z'
  },
  {
    id: 'col-504',
    wasteType: 'Textile & Wearable Donation',
    quantity: 'approx. 25 kg (4 bags)',
    pickupArea: 'Koramangala 3rd Block',
    preferredDate: '2026-10-05',
    contactName: 'Deepa Nair',
    contactPhone: '+91 98860 77123',
    email: 'deepanair@example.com',
    status: 'Completed',
    provider: 'Goonj Urban Outreach Partner [Demo provider, no real municipal integration]',
    notes: 'Washed and folded clothing sorted by age category. Acknowledged by NGO.',
    createdAt: '2026-10-02T10:00:00Z'
  },
  {
    id: 'col-505',
    wasteType: 'Bulk Cardboard Shipping Cartons',
    quantity: 'approx. 60 kg',
    pickupArea: 'HSR Layout Sector 1',
    preferredDate: '2026-10-15',
    contactName: 'Anil Deshmukh',
    contactPhone: '+91 98451 99887',
    email: 'anil@hsr-tech.in',
    status: 'Pending',
    provider: 'Pending Municipality/Recycler Assignment',
    notes: 'Office relocation packing boxes flattened and bundled.',
    createdAt: '2026-10-08T09:15:00Z'
  },
  {
    id: 'col-506',
    wasteType: 'Glass Bottles & Jars',
    quantity: 'approx. 15 kg',
    pickupArea: 'Malleshwaram 15th Cross',
    preferredDate: '2026-10-13',
    contactName: 'Sita Ramaswamy',
    contactPhone: '+91 94480 33221',
    email: 'sita.r@gmail.com',
    status: 'Assigned',
    provider: 'GlassCycle Bangalore Urban Depot [Demo provider, no real municipal integration]',
    notes: 'Rinsed clean pickle and jam jars in cardboard box.',
    createdAt: '2026-10-07T16:30:00Z'
  }
];

// 4 Weeks of realistic Impact Logs
export const INITIAL_IMPACT_LOGS = [
  { id: 'imp-1', user: 'You (Citizen Eco-Guard)', plasticKg: 3.5, paperKg: 12.0, eWasteKg: 2.1, organicKg: 15.0, date: '2026-10-08' },
  { id: 'imp-2', user: 'You (Citizen Eco-Guard)', plasticKg: 2.2, paperKg: 8.5, eWasteKg: 0.0, organicKg: 18.0, date: '2026-10-05' },
  { id: 'imp-3', user: 'You (Citizen Eco-Guard)', plasticKg: 1.8, paperKg: 6.0, eWasteKg: 1.5, organicKg: 14.5, date: '2026-10-01' },
  { id: 'imp-4', user: 'You (Citizen Eco-Guard)', plasticKg: 4.0, paperKg: 14.2, eWasteKg: 0.0, organicKg: 22.0, date: '2026-09-24' },
  { id: 'imp-5', user: 'You (Citizen Eco-Guard)', plasticKg: 2.9, paperKg: 9.8, eWasteKg: 3.2, organicKg: 19.5, date: '2026-09-17' },
  { id: 'imp-6', user: 'You (Citizen Eco-Guard)', plasticKg: 3.1, paperKg: 11.0, eWasteKg: 0.0, organicKg: 16.0, date: '2026-09-10' }
];

// 10+ Gamification Badges
export const INITIAL_GAMIFICATION = {
  userPoints: 580,
  userLevel: 'Eco Guardian (Level 3)',
  userStreakDays: 6,
  dailyPointsEarned: 30,
  dailyCap: 150,
  userBadges: [
    { id: 'b1', name: 'Segregation Specialist', icon: '🌱', description: 'Classified over 10 items accurately with circular bin rules', unlocked: true, unlockedAt: '2026-10-03' },
    { id: 'b2', name: 'Compost Hero', icon: '🍂', description: 'Logged 25+ kg of organic kitchen composting', unlocked: true, unlockedAt: '2026-10-05' },
    { id: 'b3', name: 'Watchful Citizen', icon: '📍', description: 'Reported an active community waste hotspot on the live map', unlocked: true, unlockedAt: '2026-10-06' },
    { id: 'b4', name: 'Zero-E-Waste Champion', icon: '⚡', description: 'Safely diverted obsolete electronic devices via certified recycler', unlocked: true, unlockedAt: '2026-10-07' },
    { id: 'b5', name: 'Community Pillar', icon: '🏆', description: 'Helped resolve 5 community waste issues through active civic reporting', unlocked: false },
    { id: 'b6', name: 'Plastic Reducer', icon: '🥤', description: 'Diverted 10+ kg of single-use and flexible polymers from landfills', unlocked: true, unlockedAt: '2026-10-02' },
    { id: 'b7', name: 'Circular Pioneer', icon: '♻️', description: 'Completed a 7-day zero-waste segregation streak', unlocked: false },
    { id: 'b8', name: 'Master Recycler', icon: '📦', description: 'Logged paper, plastic, glass, and metal recycling in one week', unlocked: true, unlockedAt: '2026-10-04' },
    { id: 'b9', name: 'Hazard Guardian', icon: '🛡️', description: 'Handled and routed hazardous items safely without drain pouring', unlocked: true, unlockedAt: '2026-10-06' },
    { id: 'b10', name: 'Campus Champion', icon: '🎓', description: 'Contributed 50+ points to student institutional team standing', unlocked: false }
  ],
  weeklyChallenges: [
    {
      id: 'wc-1',
      title: 'Zero Single-Use Plastic Week',
      description: 'Carry a reusable bottle and canvas tote bag for 7 consecutive days.',
      rewardPoints: 100,
      currentProgress: 6,
      targetProgress: 7,
      unit: 'days',
      completed: false,
      deadline: '2026-10-15'
    },
    {
      id: 'wc-2',
      title: 'Kitchen Green Gold',
      description: 'Compost 10 kg of kitchen food and vegetable scraps instead of binning with mixed waste.',
      rewardPoints: 150,
      currentProgress: 10,
      targetProgress: 10,
      unit: 'kg',
      completed: true,
      deadline: '2026-10-14'
    },
    {
      id: 'wc-3',
      title: 'Campus E-Waste Roundup',
      description: 'Hand in 3 obsolete electronic cables, old battery cells, or broken gadgets.',
      rewardPoints: 80,
      currentProgress: 2,
      targetProgress: 3,
      unit: 'items',
      completed: false,
      deadline: '2026-10-18'
    }
  ],
  individualLeaderboard: [
    { rank: 1, name: 'Sunita Raman', avatar: '🌿', locality: 'Koramangala', points: 1420, divertedKg: 185 },
    { rank: 2, name: 'Karthik Raja', avatar: '🚴', locality: 'Indiranagar', points: 1280, divertedKg: 162 },
    { rank: 3, name: 'Ananya Roy', avatar: '🍃', locality: 'HSR Layout', points: 950, divertedKg: 110 },
    { rank: 4, name: 'You (Citizen Eco-Guard)', avatar: '🌱', locality: 'Indiranagar', points: 580, divertedKg: 92.5 },
    { rank: 5, name: 'Vikram Joshi', avatar: '♻️', locality: 'Whitefield', points: 410, divertedKg: 54 }
  ],
  communityLeaderboard: [
    { rank: 1, name: 'RV College of Engineering Eco Club', category: 'College Campus', members: 340, points: 12850, divertedKg: 2450 },
    { rank: 2, name: 'Greenwood Meadows Residents Association', category: 'Apartment Society', members: 180, points: 9400, divertedKg: 1890 },
    { rank: 3, name: 'BMS College Green Brigade', category: 'College Campus', members: 210, points: 8750, divertedKg: 1620 },
    { rank: 4, name: 'Palm Grove Community Welfare', category: 'Residential Layout', members: 115, points: 6300, divertedKg: 1140 },
    { rank: 5, name: 'Infosys Green Volunteers Bangalore', category: 'Corporate Group', members: 95, points: 5900, divertedKg: 980 }
  ]
};

// Initial Smart Alerts
export const INITIAL_ALERTS = [
  {
    id: 'alt-1',
    title: '⚠️ Overflowing Point in Your Locality',
    message: 'Indiranagar 100ft Rd pedestrian bin has accumulated excess wet waste. Sanitation ward vehicle deployed.',
    type: 'warning',
    locality: 'Indiranagar',
    date: '1 hour ago',
    active: true,
    read: false
  },
  {
    id: 'alt-2',
    title: '⚡ Community E-Waste Drive This Weekend',
    message: 'Authorized free electronics collection depot open from 9 AM to 4 PM at Koramangala BDA Complex. Bring dead batteries, laptops, and wires.',
    type: 'info',
    locality: 'Koramangala & HSR',
    date: 'Yesterday',
    active: true,
    read: false
  },
  {
    id: 'alt-3',
    title: '📈 Rising Plastic Trend (≥20% Week-on-Week)',
    message: 'Plastic takeaway packaging reports in Whitefield increased 22% this week. Volunteer clean-up drive scheduled for Saturday.',
    type: 'warning',
    locality: 'Whitefield',
    date: '2 days ago',
    active: true,
    read: false
  },
  {
    id: 'alt-4',
    title: '🎯 Community Target 90% Completed',
    message: 'HSR Layout ward has diverted 4.8 tons of dry cardboard and PET bottles toward registered circular recyclers this quarter!',
    type: 'success',
    locality: 'HSR Layout',
    date: '3 days ago',
    active: true,
    read: false
  }
];

export const INITIAL_SUGGESTED_ITEMS = [
  {
    id: 'sug-1',
    name: 'Air Fryer Parchment Paper Liners',
    suggestedCategory: 'Dry/Recyclable',
    userNotes: 'Used for cooking; silicone coated paper liner.',
    status: 'Pending Review',
    submittedAt: '2026-10-08T10:14:00Z'
  },
  {
    id: 'sug-2',
    name: 'Electronic Vape / E-Cigarette Device',
    suggestedCategory: 'E-waste',
    userNotes: 'Contains rechargeable lithium battery and heating coil.',
    status: 'Pending Review',
    submittedAt: '2026-10-07T14:22:00Z'
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'aud-1',
    action: 'Status Advanced',
    entityType: 'Collection',
    entityId: 'col-501',
    adminUser: 'admin@ecosort.city',
    timestamp: '2026-10-07T11:00:00Z',
    details: 'Collection request col-501 status updated from Pending to Assigned (GreenClean Recyclers).'
  },
  {
    id: 'aud-2',
    action: 'Hotspot Resolved',
    entityType: 'Report',
    entityId: 'rep-104',
    adminUser: 'admin@ecosort.city',
    timestamp: '2026-10-07T18:00:00Z',
    details: 'Plastic accumulation rep-104 resolved by Ward 82 clearing crew.'
  }
];

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all required fields exist
        if (parsed.wasteItems && parsed.reports && parsed.reports.length >= 20) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Error reading db.json, generating fresh data:', err.message);
    }
    const defaultData = {
      wasteItems: INITIAL_WASTE_ITEMS,
      reports: INITIAL_REPORTS,
      collections: INITIAL_COLLECTIONS,
      impactLogs: INITIAL_IMPACT_LOGS,
      gamification: INITIAL_GAMIFICATION,
      alerts: INITIAL_ALERTS,
      suggestedItems: INITIAL_SUGGESTED_ITEMS,
      auditLogs: INITIAL_AUDIT_LOGS,
      classificationFeedback: []
    };
    this.save(defaultData);
    return defaultData;
  }

  save(data = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to db.json:', err.message);
    }
  }

  resetToDemo() {
    this.data = {
      wasteItems: INITIAL_WASTE_ITEMS,
      reports: generateInitialReports(),
      collections: INITIAL_COLLECTIONS,
      impactLogs: INITIAL_IMPACT_LOGS,
      gamification: INITIAL_GAMIFICATION,
      alerts: INITIAL_ALERTS,
      suggestedItems: INITIAL_SUGGESTED_ITEMS,
      auditLogs: INITIAL_AUDIT_LOGS,
      classificationFeedback: []
    };
    this.save();
    return this.data;
  }
}

export const db = new Database();
