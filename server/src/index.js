import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { classifierEngine } from './services/ai/ClassifierProvider.js';
import { validateAndSanitizeImage } from './services/ai/imageValidator.js';
import { calculateLCAImpact } from '../../shared/impact-factors.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Body Parsers
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  // Hide image base64 from logs
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Admin Authentication & Role Middleware
function requireAdminRole(req, res, next) {
  const role = req.headers['x-user-role'] || req.query.role;
  if (role !== 'admin') {
    return res.status(403).json({
      error: 'Access Forbidden: Admin privileges required to access this endpoint.'
    });
  }
  next();
}

function logAdminAction(adminUser, action, entityType, entityId, details) {
  const entry = {
    id: `aud-${Date.now()}`,
    adminUser: adminUser || 'admin@ecosort.city',
    action,
    entityType,
    entityId,
    timestamp: new Date().toISOString(),
    details
  };
  if (!db.data.auditLogs) db.data.auditLogs = [];
  db.data.auditLogs.unshift(entry);
  db.save();
}

// -------------------------------------------------------------
// 0. HEALTH CHECK
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'EcoSort AI',
    timestamp: new Date().toISOString(),
    aiEngine: classifierEngine.getEngineStatus(),
    wasteTaxonomyCount: db.data.wasteItems.length,
    activeReports: db.data.reports.filter(r => r.status !== 'Resolved').length
  });
});

// -------------------------------------------------------------
// 1. AI WASTE CLASSIFICATION (Modular Provider Chain)
// -------------------------------------------------------------
app.post('/api/ai/classify', async (req, res) => {
  try {
    const { imageBase64, description, manualCategory } = req.body;

    if (!imageBase64 && !description && !manualCategory) {
      return res.status(400).json({
        error: 'Please upload an image, describe the item, or select a category.'
      });
    }

    let sanitizedImg = imageBase64;
    if (imageBase64) {
      const validation = validateAndSanitizeImage(imageBase64);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
      sanitizedImg = validation.sanitizedBase64;
    }

    const result = await classifierEngine.classify({
      imageBase64: sanitizedImg,
      description,
      manualCategory
    });

    // Important: Points are ONLY awarded if classification does NOT require confirmation,
    // OR if user explicitly confirmed it.
    let earnedPoints = 0;
    if (!result.requiresConfirmation) {
      earnedPoints = 10;
      db.data.gamification.userPoints += 10;
      db.data.gamification.dailyPointsEarned = (db.data.gamification.dailyPointsEarned || 0) + 10;
      const badge = db.data.gamification.userBadges.find(b => b.id === 'b1');
      if (badge) badge.unlocked = true;
      db.save();
    }

    res.json({
      success: true,
      data: result,
      earnedPoints,
      totalPoints: db.data.gamification.userPoints,
      requiresConfirmation: result.requiresConfirmation
    });
  } catch (error) {
    console.error('Error in /api/ai/classify:', error);
    res.status(500).json({
      error: 'Failed to classify item. Please select a category manually.'
    });
  }
});

// User confirmation for gated / low-confidence classifications
app.post('/api/ai/confirm-feedback', (req, res) => {
  try {
    const { originalItem, confirmedCategory, feedbackNotes } = req.body;

    if (!confirmedCategory) {
      return res.status(400).json({ error: 'Please choose a confirmed category.' });
    }

    // Anti-abuse: daily point cap
    const dailyCap = db.data.gamification.dailyCap || 150;
    const currentEarned = db.data.gamification.dailyPointsEarned || 0;
    let earned = 10;
    if (currentEarned + 10 > dailyCap) {
      earned = Math.max(0, dailyCap - currentEarned);
    }

    db.data.gamification.userPoints += earned;
    db.data.gamification.dailyPointsEarned = currentEarned + earned;

    const feedbackEntry = {
      id: `fb-${Date.now()}`,
      originalItem: originalItem || 'Unidentified Item',
      confirmedCategory,
      feedbackNotes: feedbackNotes || 'Citizen verified classification',
      timestamp: new Date().toISOString()
    };

    if (!db.data.classificationFeedback) db.data.classificationFeedback = [];
    db.data.classificationFeedback.unshift(feedbackEntry);

    const badge = db.data.gamification.userBadges.find(b => b.id === 'b1');
    if (badge) badge.unlocked = true;

    db.save();

    res.json({
      success: true,
      message: 'Confirmation saved as training feedback! Points credited.',
      earnedPoints: earned,
      totalPoints: db.data.gamification.userPoints
    });
  } catch (err) {
    console.error('Error in confirm-feedback:', err);
    res.status(500).json({ error: 'Could not save feedback.' });
  }
});

// -------------------------------------------------------------
// 2. "WHAT SHOULD I DO WITH THIS?" SEARCH
// -------------------------------------------------------------
app.get('/api/waste/search', (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase().trim();

    if (!query) {
      return res.json({
        items: db.data.wasteItems.slice(0, 12),
        totalItems: db.data.wasteItems.length,
        query: ''
      });
    }

    // Fuzzy & multi-term matching over 120+ items
    const queryWords = query.split(/\s+/).filter(Boolean);

    const scored = db.data.wasteItems.map(item => {
      let score = 0;
      const lowerName = item.name.toLowerCase();
      const lowerCat = item.category.toLowerCase();
      const aliases = (item.aliases || []).map(a => a.toLowerCase());

      if (lowerName === query) score += 100;
      else if (lowerName.startsWith(query)) score += 50;
      else if (lowerName.includes(query)) score += 30;

      if (lowerCat.includes(query)) score += 20;

      for (const a of aliases) {
        if (a === query) score += 80;
        else if (a.includes(query)) score += 25;
      }

      for (const w of queryWords) {
        if (lowerName.includes(w)) score += 10;
        if (aliases.some(a => a.includes(w))) score += 10;
        if (lowerCat.includes(w)) score += 5;
      }

      return { item, score };
    });

    const matches = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).map(s => s.item);

    if (matches.length > 0) {
      return res.json({
        items: matches.slice(0, 15),
        query,
        isDynamicMatch: false
      });
    }

    // Dynamic heuristic fallback
    const fallbackCategory = query.includes('phone') || query.includes('wire') || query.includes('battery') || query.includes('bulb') ? 'E-waste'
      : query.includes('plastic') || query.includes('bottle') || query.includes('cup') ? 'Plastic'
      : query.includes('paper') || query.includes('box') || query.includes('book') ? 'Dry/Recyclable'
      : query.includes('food') || query.includes('peel') || query.includes('leaf') || query.includes('fruit') ? 'Wet/Organic'
      : query.includes('glass') || query.includes('mirror') ? 'Glass'
      : query.includes('cloth') || query.includes('shirt') ? 'Textile'
      : query.includes('paint') || query.includes('chemical') || query.includes('acid') ? 'Hazardous waste'
      : query.includes('medicine') || query.includes('pad') || query.includes('syringe') ? 'Medical/sanitary waste'
      : 'Dry/Recyclable';

    const dynamicItem = {
      id: `custom-${Date.now()}`,
      name: query.charAt(0).toUpperCase() + query.slice(1),
      aliases: [query],
      category: fallbackCategory,
      binColor: fallbackCategory === 'Wet/Organic' ? 'Green Bin' : fallbackCategory === 'E-waste' ? 'Brown / E-waste Bin' : 'Blue Bin',
      preparation: 'Inspect item, clean off food and chemical residues, and store in designated dry/wet bag.',
      recyclingPossibility: ['Plastic', 'Dry/Recyclable', 'Glass', 'Metal', 'Textile', 'E-waste'].includes(fallbackCategory) ? 'High' : 'Special Processing',
      disposalMethod: `Follow protocol for ${fallbackCategory}. Check municipal collection calendar.`,
      safetyPrecautions: fallbackCategory === 'E-waste' || fallbackCategory === 'Hazardous waste' || fallbackCategory === 'Medical/sanitary waste'
        ? '⚠️ Handle with care; do not puncture, flush down drains, or burn.'
        : 'Standard clean handling.',
      environmentalImpact: 'Segregating this item prevents cross-contamination of recyclables at municipal transfer stations.',
      suggestedAction: `Place in ${fallbackCategory} collection bin or schedule an authorized EcoSort pickup.`,
      canCompost: fallbackCategory === 'Wet/Organic',
      canRecycle: ['Plastic', 'Dry/Recyclable', 'Glass', 'Metal', 'Textile', 'E-waste'].includes(fallbackCategory),
      canReuse: true,
      disposalRank: ['Reuse', 'Recycle', 'Authorized Disposal']
    };

    res.json({
      items: [dynamicItem],
      query,
      isDynamicMatch: true
    });
  } catch (error) {
    console.error('Error in /api/waste/search:', error);
    res.status(500).json({ error: 'Failed to search waste database.' });
  }
});

// Unknown item user suggestion endpoint
app.post('/api/waste/suggest', (req, res) => {
  try {
    const { name, suggestedCategory, userNotes } = req.body;
    if (!name || !suggestedCategory) {
      return res.status(400).json({ error: 'Item name and suggested category are required.' });
    }

    const suggestion = {
      id: `sug-${Date.now()}`,
      name: name.trim(),
      suggestedCategory,
      userNotes: userNotes || '',
      status: 'Pending Review',
      submittedAt: new Date().toISOString()
    };

    if (!db.data.suggestedItems) db.data.suggestedItems = [];
    db.data.suggestedItems.unshift(suggestion);

    // Award eco points for crowdsourcing knowledge base
    db.data.gamification.userPoints += 15;
    db.save();

    res.status(201).json({
      success: true,
      message: 'Item suggested for admin review! +15 Eco Points awarded for community contribution.',
      data: suggestion,
      totalPoints: db.data.gamification.userPoints
    });
  } catch (err) {
    console.error('Error suggesting item:', err);
    res.status(500).json({ error: 'Failed to submit item suggestion.' });
  }
});

// -------------------------------------------------------------
// 3. SMART SEGREGATION ASSISTANT
// -------------------------------------------------------------
app.post('/api/waste/segregate', (req, res) => {
  try {
    const { itemsText, itemsList } = req.body;
    let list = [];

    if (Array.isArray(itemsList) && itemsList.length > 0) {
      list = itemsList;
    } else if (typeof itemsText === 'string') {
      list = itemsText.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
    }

    if (list.length === 0) {
      return res.status(400).json({ error: 'Please enter at least one waste item to segregate.' });
    }

    const categories = {
      wet: { title: 'Wet / Organic Waste (Green Bin)', items: [], instructions: 'Compost at home or place in green bin without plastic liners.' },
      dry: { title: 'Dry Recyclables (Blue Bin)', items: [], instructions: 'Rinse and dry all paper, clean plastics, and metals. Keep dry.' },
      recyclable: { title: 'High-Value Recyclables', items: [], instructions: 'Cardboard boxes, PET bottles, clean glass jars. Handover to scrap dealers or dry waste centers.' },
      eWaste: { title: 'E-Waste (Brown / Designated Depot)', items: [], instructions: 'Keep dry. Do not open or puncture batteries. Deposit at e-waste drop kiosks.' },
      hazardous: { title: 'Domestic Hazardous (Red Bin)', items: [], instructions: 'Keep sealed in original containers. Never flush down drains.' },
      special: { title: 'Sanitary / Special Disposal', items: [], instructions: 'Wrap in newspaper with a red marker cross for sanitary incineration.' },
      unrecognized: { title: 'Unrecognized Items (Review Needed)', items: [], instructions: 'Inspect material or use search to find disposal protocol.' }
    };

    list.forEach(itemStr => {
      const lower = itemStr.toLowerCase();

      if (lower.includes('banana') || lower.includes('food') || lower.includes('peel') || lower.includes('tea') || lower.includes('coffee') || lower.includes('vegetable') || lower.includes('leaf') || lower.includes('bread') || lower.includes('organic') || lower.includes('apple') || lower.includes('rice') || lower.includes('egg') || lower.includes('curry')) {
        categories.wet.items.push(itemStr);
      } else if (lower.includes('battery') || lower.includes('phone') || lower.includes('charger') || lower.includes('cable') || lower.includes('laptop') || lower.includes('bulb') || lower.includes('led') || lower.includes('cfl') || lower.includes('electronic')) {
        categories.eWaste.items.push(itemStr);
      } else if (lower.includes('paint') || lower.includes('chemical') || lower.includes('acid') || lower.includes('pesticide') || lower.includes('insecticide') || lower.includes('solvent') || lower.includes('thinner') || lower.includes('bleach') || lower.includes('motor oil')) {
        categories.hazardous.items.push(itemStr);
      } else if (lower.includes('pad') || lower.includes('diaper') || lower.includes('bandage') || lower.includes('medicine') || lower.includes('tablet') || lower.includes('syringe') || lower.includes('mask') || lower.includes('sanitary')) {
        categories.special.items.push(itemStr);
      } else if (lower.includes('bottle') || lower.includes('cardboard') || lower.includes('can') || lower.includes('jar') || lower.includes('box') || lower.includes('newspaper')) {
        categories.recyclable.items.push(itemStr);
      } else if (lower.includes('plastic') || lower.includes('paper') || lower.includes('cloth') || lower.includes('glass') || lower.includes('metal')) {
        categories.dry.items.push(itemStr);
      } else {
        categories.unrecognized.items.push(itemStr);
      }
    });

    res.json({
      success: true,
      totalItems: list.length,
      categories
    });
  } catch (error) {
    console.error('Error in /api/waste/segregate:', error);
    res.status(500).json({ error: 'Failed to segregate items.' });
  }
});

// -------------------------------------------------------------
// 4. ECO IMPACT CALCULATOR & LOGS
// -------------------------------------------------------------
app.post('/api/impact/calculate', (req, res) => {
  try {
    const plasticKg = parseFloat(req.body.plasticKg) || 0;
    const paperKg = parseFloat(req.body.paperKg) || 0;
    const eWasteKg = parseFloat(req.body.eWasteKg) || 0;
    const organicKg = parseFloat(req.body.organicKg) || 0;

    const result = calculateLCAImpact({ plasticKg, paperKg, eWasteKg, organicKg });
    res.json(result);
  } catch (error) {
    console.error('Error in /api/impact/calculate:', error);
    res.status(500).json({ error: 'Failed to calculate impact.' });
  }
});

app.post('/api/impact/log', (req, res) => {
  try {
    const { plasticKg, paperKg, eWasteKg, organicKg } = req.body;
    const newLog = {
      id: `imp-${Date.now()}`,
      user: 'You (Citizen Eco-Guard)',
      plasticKg: Math.max(0, parseFloat(plasticKg) || 0),
      paperKg: Math.max(0, parseFloat(paperKg) || 0),
      eWasteKg: Math.max(0, parseFloat(eWasteKg) || 0),
      organicKg: Math.max(0, parseFloat(organicKg) || 0),
      date: new Date().toISOString().split('T')[0]
    };

    db.data.impactLogs.unshift(newLog);

    const totalDiverted = newLog.plasticKg + newLog.paperKg + newLog.eWasteKg + newLog.organicKg;
    const earnedPoints = Math.max(15, Math.min(100, Math.round(totalDiverted * 5)));
    db.data.gamification.userPoints += earnedPoints;

    if (newLog.organicKg >= 10) {
      const b2 = db.data.gamification.userBadges.find(b => b.id === 'b2');
      if (b2) b2.unlocked = true;
    }
    if (newLog.plasticKg >= 5) {
      const b6 = db.data.gamification.userBadges.find(b => b.id === 'b6');
      if (b6) b6.unlocked = true;
    }

    db.save();

    res.json({
      success: true,
      log: newLog,
      earnedPoints,
      totalPoints: db.data.gamification.userPoints
    });
  } catch (error) {
    console.error('Error in /api/impact/log:', error);
    res.status(500).json({ error: 'Failed to log impact.' });
  }
});

app.get('/api/impact/logs', (req, res) => {
  res.json({ logs: db.data.impactLogs });
});

// -------------------------------------------------------------
// 5. SMART COLLECTION REQUESTS
// -------------------------------------------------------------
app.get('/api/collections', (req, res) => {
  try {
    const { status, search } = req.query;
    let list = [...db.data.collections];

    if (status && status !== 'All') {
      list = list.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c =>
        c.wasteType.toLowerCase().includes(s) ||
        c.pickupArea.toLowerCase().includes(s) ||
        c.contactName.toLowerCase().includes(s)
      );
    }
    res.json({ collections: list });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collection requests.' });
  }
});

app.post('/api/collections', (req, res) => {
  try {
    const { wasteType, quantity, pickupArea, preferredDate, contactName, contactPhone, email, notes } = req.body;

    if (!wasteType || !quantity || !pickupArea || !preferredDate || !contactName || !contactPhone) {
      return res.status(400).json({ error: 'Please fill out all required pickup fields.' });
    }

    // Date validation: not in the past
    const todayStr = new Date().toISOString().split('T')[0];
    if (preferredDate < todayStr) {
      return res.status(400).json({ error: 'Preferred pickup date cannot be in the past.' });
    }

    // Hazardous or Medical waste must be routed through special protocol
    const isHazardous = wasteType.toLowerCase().includes('hazard') || wasteType.toLowerCase().includes('chemical') || wasteType.toLowerCase().includes('medical');

    const newRequest = {
      id: `col-${Date.now()}`,
      wasteType,
      quantity,
      pickupArea: pickupArea.trim(),
      preferredDate,
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      email: (email || '').trim(),
      notes: notes ? notes.trim() : '',
      status: 'Pending',
      provider: isHazardous ? 'Authorized Hazmat/Biomedical Disposal Handler' : 'Pending Municipality/Recycler Assignment [Demo provider]',
      createdAt: new Date().toISOString()
    };

    db.data.collections.unshift(newRequest);
    db.data.gamification.userPoints += 20;
    db.save();

    res.status(201).json({
      success: true,
      data: newRequest,
      earnedPoints: 20,
      isHazardousNotice: isHazardous,
      message: isHazardous
        ? 'Collection request scheduled with Authorized Hazardous Handler. Keep items safely sealed in original containers.'
        : 'Collection request created successfully! Assigned provider will contact you.'
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Failed to submit collection request.' });
  }
});

app.patch('/api/collections/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, provider } = req.body;

    const item = db.data.collections.find(c => c.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Collection request not found.' });
    }

    const oldStatus = item.status;
    if (status) item.status = status;
    if (provider) item.provider = provider;

    logAdminAction(
      req.headers['x-admin-user'] || 'admin@ecosort.city',
      'Update Status',
      'Collection',
      id,
      `Status changed from ${oldStatus} to ${status || oldStatus}`
    );

    db.save();
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ error: 'Failed to update request.' });
  }
});

// -------------------------------------------------------------
// 6. COMMUNITY WASTE HOTSPOT REPORTING (with Privacy Rounding & Map)
// -------------------------------------------------------------
app.get('/api/reports', (req, res) => {
  try {
    const { status, category, severity, locality } = req.query;
    let list = [...db.data.reports];

    if (status && status !== 'All') {
      list = list.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }
    if (category && category !== 'All') {
      list = list.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }
    if (severity && severity !== 'All') {
      list = list.filter(r => r.severity.toLowerCase() === severity.toLowerCase());
    }
    if (locality && locality !== 'All') {
      list = list.filter(r => r.locality.toLowerCase().includes(locality.toLowerCase()));
    }

    // Mask exact coordinates to ~500m locality grid for citizen privacy
    const privacySanitized = list.map(r => ({
      ...r,
      approximateLat: +(r.lat).toFixed(3),
      approximateLng: +(r.lng).toFixed(3)
    }));

    res.json({
      reports: privacySanitized,
      total: privacySanitized.length
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to load community reports.' });
  }
});

// Duplicate Report Detection & Creation
app.post('/api/reports', (req, res) => {
  try {
    const { category, title, description, locality, severity, imageUrl, lat, lng } = req.body;

    if (!category || !title || !description || !locality) {
      return res.status(400).json({ error: 'Please provide category, title, description, and locality.' });
    }

    // Duplicate detection: check if same category in same locality within 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const existingDuplicate = db.data.reports.find(r =>
      r.locality.toLowerCase() === locality.toLowerCase() &&
      r.category.toLowerCase() === category.toLowerCase() &&
      r.reportedAt >= sevenDaysAgo &&
      r.status !== 'Resolved'
    );

    const baseLat = lat ? parseFloat(lat) : 12.9716 + (Math.random() - 0.5) * 0.08;
    const baseLng = lng ? parseFloat(lng) : 77.5946 + (Math.random() - 0.5) * 0.08;

    const newReport = {
      id: `rep-${Date.now()}`,
      category,
      title: title.trim(),
      description: description.trim(),
      locality: locality.trim(),
      city: 'Bengaluru',
      lat: +baseLat.toFixed(4),
      lng: +baseLng.toFixed(4),
      approximateLat: +baseLat.toFixed(3),
      approximateLng: +baseLng.toFixed(3),
      severity: severity || 'Medium',
      status: 'Reported',
      reportedBy: 'Citizen Eco-Guard',
      reportedAt: new Date().toISOString(),
      upvotes: 1,
      verified: false,
      imageUrl: imageUrl || '',
      priorityScore: severity === 'Critical' ? 6.0 : severity === 'High' ? 4.5 : 3.0,
      priorityReason: 'Newly submitted civic report'
    };

    db.data.reports.unshift(newReport);

    // Points with anti-abuse: no points if duplicate was flagged
    let earnedPoints = existingDuplicate ? 0 : 30;
    if (earnedPoints > 0) {
      db.data.gamification.userPoints += earnedPoints;
      const b3 = db.data.gamification.userBadges.find(b => b.id === 'b3');
      if (b3) b3.unlocked = true;
    }

    db.save();

    res.status(201).json({
      success: true,
      data: newReport,
      earnedPoints,
      warningDuplicate: existingDuplicate
        ? `Note: A similar active report (${existingDuplicate.id}) already exists in ${locality}. Your report was merged and logged.`
        : null,
      message: 'Waste hotspot reported successfully! Public alert created on community map.'
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to submit report.' });
  }
});

app.post('/api/reports/:id/upvote', (req, res) => {
  try {
    const { id } = req.params;
    const report = db.data.reports.find(r => r.id === id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    report.upvotes = (report.upvotes || 0) + 1;
    if (report.upvotes >= 10) {
      report.verified = true;
    }
    // Update priority score with upvotes
    const sevScore = report.severity === 'Critical' ? 4 : report.severity === 'High' ? 3 : 2;
    report.priorityScore = +(sevScore * 1.5 + report.upvotes * 0.4).toFixed(1);

    db.save();
    res.json({ success: true, upvotes: report.upvotes, verified: report.verified });
  } catch (error) {
    console.error('Error upvoting report:', error);
    res.status(500).json({ error: 'Failed to upvote report.' });
  }
});

app.patch('/api/reports/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote } = req.body;

    const report = db.data.reports.find(r => r.id === id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const oldStatus = report.status;
    report.status = status;
    if (resolutionNote) report.resolutionNote = resolutionNote;
    if (status === 'Resolved') {
      report.resolvedAt = new Date().toISOString();
    }

    logAdminAction(
      req.headers['x-admin-user'] || 'admin@ecosort.city',
      'Resolve Hotspot',
      'Report',
      id,
      `Report status changed from ${oldStatus} to ${status}. Note: ${resolutionNote || 'None'}`
    );

    db.save();
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'Failed to update report.' });
  }
});

// -------------------------------------------------------------
// 7. SMART ALERTS
// -------------------------------------------------------------
app.get('/api/alerts', (req, res) => {
  try {
    res.json({ alerts: db.data.alerts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load smart alerts.' });
  }
});

// Mark alert as read
app.post('/api/alerts/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    const alert = db.data.alerts.find(a => a.id === id);
    if (alert) alert.read = true;
    db.save();
    res.json({ success: true });
  } catch {
    res.json({ success: false });
  }
});

// -------------------------------------------------------------
// 8. GAMIFICATION & LEADERBOARD
// -------------------------------------------------------------
app.get('/api/gamification', (req, res) => {
  try {
    res.json(db.data.gamification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load gamification data.' });
  }
});

app.post('/api/gamification/claim-challenge', (req, res) => {
  try {
    const { challengeId } = req.body;
    const challenge = db.data.gamification.weeklyChallenges.find(c => c.id === challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found.' });
    }

    if (challenge.completed) {
      return res.status(400).json({ error: 'Challenge reward already claimed!' });
    }

    challenge.completed = true;
    challenge.currentProgress = challenge.targetProgress;
    db.data.gamification.userPoints += challenge.rewardPoints;
    db.save();

    res.json({
      success: true,
      rewardPoints: challenge.rewardPoints,
      totalPoints: db.data.gamification.userPoints,
      challenge
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim challenge.' });
  }
});

// -------------------------------------------------------------
// 9. COMMUNITY DASHBOARD AGGREGATES
// -------------------------------------------------------------
app.get('/api/dashboard/community', (req, res) => {
  try {
    const reports = db.data.reports;
    const collections = db.data.collections;
    const logs = db.data.impactLogs;

    const totalReports = reports.length;
    const activeReports = reports.filter(r => r.status !== 'Resolved').length;
    const resolvedReports = reports.filter(r => r.status === 'Resolved').length;

    let totalPlastic = logs.reduce((acc, l) => acc + (l.plasticKg || 0), 0) + 420.5;
    let totalPaper = logs.reduce((acc, l) => acc + (l.paperKg || 0), 0) + 890.0;
    let totalEWaste = logs.reduce((acc, l) => acc + (l.eWasteKg || 0), 0) + 145.2;
    let totalOrganic = logs.reduce((acc, l) => acc + (l.organicKg || 0), 0) + 1250.0;

    const totalDivertedKg = +(totalPlastic + totalPaper + totalEWaste + totalOrganic).toFixed(1);
    const totalCO2SavedKg = +(
      totalPlastic * 1.5 +
      totalPaper * 0.9 +
      totalEWaste * 2.8 +
      totalOrganic * 0.5
    ).toFixed(1);

    const monthlyTrends = [
      { month: 'Jun', divertedKg: 1450, co2SavedKg: 1820 },
      { month: 'Jul', divertedKg: 1890, co2SavedKg: 2410 },
      { month: 'Aug', divertedKg: 2150, co2SavedKg: 2780 },
      { month: 'Sep', divertedKg: 2600, co2SavedKg: 3340 },
      { month: 'Oct', divertedKg: 2705, co2SavedKg: 3490 }
    ];

    const categoryBreakdown = [
      { name: 'Organic / Wet', value: +totalOrganic.toFixed(1), color: '#16a34a' },
      { name: 'Paper & Cardboard', value: +totalPaper.toFixed(1), color: '#3b82f6' },
      { name: 'Plastic', value: +totalPlastic.toFixed(1), color: '#f59e0b' },
      { name: 'E-Waste', value: +totalEWaste.toFixed(1), color: '#8b5cf6' }
    ];

    const localityStats = [
      { locality: 'Indiranagar', reports: 12, resolved: 8 },
      { locality: 'Koramangala', reports: 10, resolved: 6 },
      { locality: 'Whitefield', reports: 15, resolved: 9 },
      { locality: 'HSR Layout', reports: 8, resolved: 6 },
      { locality: 'Malleshwaram', reports: 7, resolved: 5 },
      { locality: 'RVCE Campus', reports: 10, resolved: 7 }
    ];

    res.json({
      totalReports,
      activeReports,
      resolvedReports,
      totalDivertedKg,
      totalCO2SavedKg,
      totalPlasticKg: +totalPlastic.toFixed(1),
      totalPaperKg: +totalPaper.toFixed(1),
      totalEWasteKg: +totalEWaste.toFixed(1),
      totalOrganicKg: +totalOrganic.toFixed(1),
      totalCollections: collections.length,
      completedCollections: collections.filter(c => c.status === 'Completed' || c.status === 'Collected').length,
      communityPoints: 34800,
      monthlyTrends,
      categoryBreakdown,
      localityStats
    });
  } catch (error) {
    console.error('Error in community dashboard:', error);
    res.status(500).json({ error: 'Failed to load community dashboard.' });
  }
});

// -------------------------------------------------------------
// 10. ADVANCED DIFFERENTIATORS & ADMIN DASHBOARD (Protected)
// -------------------------------------------------------------

// Smart Hotspot Prioritization queue: score = severity * verification * age * risk
app.get('/api/admin/prioritized-hotspots', (req, res) => {
  try {
    const reports = db.data.reports.filter(r => r.status !== 'Resolved');

    const prioritized = reports.map(r => {
      const sevMultiplier = r.severity === 'Critical' ? 4 : r.severity === 'High' ? 3 : r.severity === 'Medium' ? 2 : 1;
      const verifiedBonus = r.verified ? 1.5 : 1.0;
      const upvoteFactor = Math.min(3.0, 1.0 + (r.upvotes || 0) * 0.05);

      const daysOpen = Math.max(1, Math.round((Date.now() - new Date(r.reportedAt).getTime()) / (24 * 3600 * 1000)));
      const ageFactor = Math.min(2.0, 1.0 + daysOpen * 0.1);

      const categoryRisk = r.category === 'E-waste dumping' || r.category === 'Garbage dumping' ? 1.4 : 1.0;

      const score = +(sevMultiplier * verifiedBonus * upvoteFactor * ageFactor * categoryRisk).toFixed(1);

      let reason = 'High report age requires dispatch';
      if (r.severity === 'Critical') reason = 'Critical hazard: imminent public health or fire safety risk';
      else if (r.verified) reason = 'Community verified hotspot (≥10 resident confirmations)';
      else if (r.category === 'E-waste dumping') reason = 'Heavy metal aquifer leaching hazard';

      return {
        ...r,
        priorityScore: score,
        priorityReason: reason
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);

    res.json({ prioritizedHotspots: prioritized });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute hotspot prioritization.' });
  }
});

// Mock Nearest-Neighbor Collector Route Suggestion
app.get('/api/admin/suggested-route', (req, res) => {
  try {
    const openPickups = db.data.collections.filter(c => c.status === 'Pending' || c.status === 'Assigned');

    // Simple geographical grouping of open pickups
    const stops = openPickups.map((p, idx) => ({
      stopNumber: idx + 1,
      id: p.id,
      wasteType: p.wasteType,
      area: p.pickupArea,
      quantity: p.quantity,
      contact: p.contactName,
      status: p.status,
      estimatedArrival: `T+${(idx + 1) * 35} mins`
    }));

    res.json({
      success: true,
      depot: 'Central BBMP Dry Waste Transfer Station, Domlur',
      totalStops: stops.length,
      estimatedDistanceKm: (stops.length * 4.2).toFixed(1),
      estimatedDurationHours: (stops.length * 0.6).toFixed(1),
      suggestedStops: stops,
      notice: 'Suggested logistics order (nearest-neighbor demo logic, no live GPS integration).'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate suggested collector route.' });
  }
});

// Admin Overview
app.get('/api/admin/overview', (req, res) => {
  try {
    res.json({
      pendingCollections: db.data.collections.filter(c => c.status === 'Pending').length,
      activeReports: db.data.reports.filter(r => r.status !== 'Resolved').length,
      totalCollections: db.data.collections.length,
      totalReports: db.data.reports.length,
      collections: db.data.collections,
      reports: db.data.reports,
      wasteItemsCount: db.data.wasteItems.length,
      suggestedItems: db.data.suggestedItems || [],
      auditLogs: (db.data.auditLogs || []).slice(0, 20)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load admin overview.' });
  }
});

// Admin Suggested Items Approval / Rejection
app.patch('/api/admin/suggested-items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const item = (db.data.suggestedItems || []).find(s => s.id === id);
    if (!item) return res.status(404).json({ error: 'Suggestion not found.' });

    item.status = status;
    logAdminAction(
      req.headers['x-admin-user'] || 'admin@ecosort.city',
      'Review Suggestion',
      'Suggestion',
      id,
      `User item suggestion "${item.name}" was ${status}.`
    );

    db.save();
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update suggestion.' });
  }
});

// Admin Audit Log
app.get('/api/admin/audit-log', (req, res) => {
  res.json({ auditLogs: db.data.auditLogs || [] });
});

// CSV Export for Reports and Collections
app.get('/api/admin/export/csv', (req, res) => {
  try {
    const type = req.query.type || 'reports';
    if (type === 'collections') {
      const header = 'ID,WasteType,Quantity,PickupArea,PreferredDate,ContactName,Status,Provider,CreatedAt\n';
      const rows = db.data.collections.map(c =>
        `"${c.id}","${c.wasteType}","${c.quantity}","${c.pickupArea}","${c.preferredDate}","${c.contactName}","${c.status}","${c.provider}","${c.createdAt}"`
      ).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="ecosort-collections.csv"');
      return res.send(header + rows);
    }

    const header = 'ID,Category,Title,Locality,City,Severity,Status,Upvotes,ReportedBy,ReportedAt\n';
    const rows = db.data.reports.map(r =>
      `"${r.id}","${r.category}","${r.title.replace(/"/g, '""')}","${r.locality}","${r.city}","${r.severity}","${r.status}",${r.upvotes},"${r.reportedBy}","${r.reportedAt}"`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ecosort-hotspots.csv"');
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export CSV.' });
  }
});

// Reset Database to Fresh Demo Baseline
app.post('/api/demo/reset', (req, res) => {
  try {
    const data = db.resetToDemo();
    logAdminAction('admin@ecosort.city', 'Reset Database', 'Database', 'all', 'Reset database to hackathon demo baseline.');
    res.json({ success: true, message: 'Hackathon Demo Mode reset successfully!', data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset demo data.' });
  }
});

// Client production build static handler
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handling middleware (never leak stack trace to client)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({
    error: 'An internal server error occurred. Please try again or switch to offline mode.'
  });
});

app.listen(PORT, () => {
  console.log(`🌱 EcoSort AI Server running on port ${PORT}`);
  console.log(`📡 AI Engine: ${classifierEngine.getEngineStatus()}`);
  console.log(`📚 Knowledge Base: ${db.data.wasteItems.length} items loaded`);
  console.log(`📍 Seeded Hotspots: ${db.data.reports.length} community reports across Bengaluru`);
});
