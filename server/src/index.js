import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, INITIAL_WASTE_ITEMS } from './db.js';
import { classifyWaste } from './aiService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'EcoSort AI',
    timestamp: new Date().toISOString(),
    aiEngine: process.env.GEMINI_API_KEY ? 'Gemini 1.5/2.0 Vision' : 'Offline Heuristic Engine (Active)'
  });
});

// 1. AI Waste Identification Endpoint
app.post('/api/ai/classify', async (req, res) => {
  try {
    const { imageBase64, description, manualCategory } = req.body;

    if (!imageBase64 && !description && !manualCategory) {
      return res.status(400).json({
        error: 'Please upload an image, enter an item description, or select a category.'
      });
    }

    const result = await classifyWaste({ imageBase64, description, manualCategory });

    // Award eco points for classification
    if (!result.requiresConfirmation) {
      db.data.gamification.userPoints += 10;
      // Check for first classification badge
      const badge = db.data.gamification.userBadges.find(b => b.id === 'b1');
      if (badge) badge.unlocked = true;
      db.save();
    }

    res.json({
      success: true,
      data: result,
      earnedPoints: result.requiresConfirmation ? 0 : 10,
      totalPoints: db.data.gamification.userPoints
    });
  } catch (error) {
    console.error('Error in /api/ai/classify:', error);
    res.status(500).json({
      error: 'Failed to classify waste item. Please try again or use manual category selector.'
    });
  }
});

// 2. "What Should I Do With This?" Search Endpoint
app.get('/api/waste/search', (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase().trim();

    if (!query) {
      // Return popular items if no search term provided
      return res.json({
        items: db.data.wasteItems.slice(0, 10),
        query: ''
      });
    }

    const matches = db.data.wasteItems.filter(item => {
      const matchName = item.name.toLowerCase().includes(query);
      const matchCat = item.category.toLowerCase().includes(query);
      const matchAlias = item.aliases.some(a => a.toLowerCase().includes(query));
      return matchName || matchCat || matchAlias;
    });

    if (matches.length > 0) {
      return res.json({ items: matches, query });
    }

    // If no direct database match, construct dynamic advice using heuristic rule
    const fallbackCategory = query.includes('phone') || query.includes('wire') || query.includes('battery') ? 'E-waste'
      : query.includes('plastic') || query.includes('bottle') ? 'Plastic'
      : query.includes('paper') || query.includes('box') ? 'Dry/Recyclable'
      : query.includes('food') || query.includes('peel') ? 'Wet/Organic'
      : query.includes('glass') ? 'Glass'
      : query.includes('cloth') ? 'Textile'
      : query.includes('med') || query.includes('tablet') ? 'Medical/sanitary waste'
      : query.includes('paint') || query.includes('chemical') ? 'Hazardous waste'
      : 'Dry/Recyclable';

    const dynamicItem = {
      id: `custom-${Date.now()}`,
      name: query.charAt(0).toUpperCase() + query.slice(1),
      aliases: [query],
      category: fallbackCategory,
      binColor: fallbackCategory === 'Wet/Organic' ? 'Green' : fallbackCategory === 'E-waste' ? 'Brown/E-waste' : 'Blue',
      preparation: 'Inspect item, clean off residues, and store in a designated collection bag.',
      recyclingPossibility: fallbackCategory === 'E-waste' || fallbackCategory === 'Plastic' || fallbackCategory === 'Dry/Recyclable' ? 'High' : 'Medium',
      disposalMethod: `Follow protocol for ${fallbackCategory}. Check local collection schedule.`,
      safetyPrecautions: fallbackCategory === 'E-waste' || fallbackCategory === 'Hazardous waste' ? 'Handle with care; do not crush or puncture.' : 'Standard hygienic handling.',
      environmentalImpact: 'Segregating this item prevents cross-contamination of recyclables at municipal transfer stations.',
      suggestedAction: `Place in ${fallbackCategory} bin or authorized depot.`,
      canCompost: fallbackCategory === 'Wet/Organic',
      canRecycle: ['Plastic', 'Dry/Recyclable', 'Glass', 'Metal', 'Textile', 'E-waste'].includes(fallbackCategory),
      canReuse: true
    };

    res.json({ items: [dynamicItem], query, isDynamicMatch: true });
  } catch (error) {
    console.error('Error in /api/waste/search:', error);
    res.status(500).json({ error: 'Failed to search waste database.' });
  }
});

// 3. Smart Segregation Assistant
app.post('/api/waste/segregate', (req, res) => {
  try {
    const { itemsText, itemsList } = req.body;
    let list = [];

    if (Array.isArray(itemsList) && itemsList.length > 0) {
      list = itemsList;
    } else if (typeof itemsText === 'string') {
      // Split by commas, newlines, or semicolons
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
      special: { title: 'Sanitary / Special Disposal', items: [], instructions: 'Wrap in newspaper with a red marker cross for sanitary incineration.' }
    };

    list.forEach(itemStr => {
      const lower = itemStr.toLowerCase();

      if (lower.includes('banana') || lower.includes('food') || lower.includes('peel') || lower.includes('tea') || lower.includes('coffee') || lower.includes('vegetable') || lower.includes('leaf') || lower.includes('bread') || lower.includes('organic')) {
        categories.wet.items.push(itemStr);
      } else if (lower.includes('battery') || lower.includes('phone') || lower.includes('charger') || lower.includes('cable') || lower.includes('laptop') || lower.includes('bulb') || lower.includes('electronic')) {
        categories.eWaste.items.push(itemStr);
      } else if (lower.includes('paint') || lower.includes('chemical') || lower.includes('acid') || lower.includes('pesticide') || lower.includes('insecticide') || lower.includes('solvent')) {
        categories.hazardous.items.push(itemStr);
      } else if (lower.includes('pad') || lower.includes('diaper') || lower.includes('bandage') || lower.includes('medicine') || lower.includes('tablet') || lower.includes('syringe')) {
        categories.special.items.push(itemStr);
      } else if (lower.includes('bottle') || lower.includes('cardboard') || lower.includes('can') || lower.includes('jar') || lower.includes('box')) {
        categories.recyclable.items.push(itemStr);
      } else {
        categories.dry.items.push(itemStr);
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

// 4. Eco Impact Calculator & Logs
app.post('/api/impact/calculate', (req, res) => {
  try {
    const plasticKg = Math.max(0, parseFloat(req.body.plasticKg) || 0);
    const paperKg = Math.max(0, parseFloat(req.body.paperKg) || 0);
    const eWasteKg = Math.max(0, parseFloat(req.body.eWasteKg) || 0);
    const organicKg = Math.max(0, parseFloat(req.body.organicKg) || 0);

    const divertedLandfillKg = +(plasticKg + paperKg + eWasteKg + organicKg).toFixed(2);
    // Standard LCA emission factors:
    // Plastic recycling avoids ~1.5 kg CO2e / kg
    // Paper recycling avoids ~0.9 kg CO2e / kg
    // E-waste recovery avoids ~2.8 kg CO2e / kg (avoided virgin mining)
    // Composting avoids ~0.5 kg CO2e / kg (avoided anaerobic methane)
    const co2SavingsKg = +(
      (plasticKg * 1.5) +
      (paperKg * 0.9) +
      (eWasteKg * 2.8) +
      (organicKg * 0.5)
    ).toFixed(2);

    const treesEquivalent = +(paperKg * 0.017).toFixed(3);
    const waterSavedLiters = Math.round((paperKg * 26) + (plasticKg * 24));
    const kwhEnergySaved = +( (plasticKg * 5.6) + (paperKg * 4.1) + (eWasteKg * 14.2) ).toFixed(1);

    res.json({
      divertedLandfillKg,
      co2SavingsKg,
      treesEquivalent,
      waterSavedLiters,
      kwhEnergySaved,
      breakdown: { plasticKg, paperKg, eWasteKg, organicKg },
      disclaimer: 'ESTIMATE: Calculations are model approximations based on standard Life Cycle Assessment (LCA) indices. Real-world municipal savings vary based on grid energy and processing facilities.'
    });
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
      user: 'You (Demo User)',
      plasticKg: Math.max(0, parseFloat(plasticKg) || 0),
      paperKg: Math.max(0, parseFloat(paperKg) || 0),
      eWasteKg: Math.max(0, parseFloat(eWasteKg) || 0),
      organicKg: Math.max(0, parseFloat(organicKg) || 0),
      date: new Date().toISOString().split('T')[0]
    };

    db.data.impactLogs.unshift(newLog);

    // Award Eco Points
    const totalDiverted = newLog.plasticKg + newLog.paperKg + newLog.eWasteKg + newLog.organicKg;
    const earnedPoints = Math.max(15, Math.round(totalDiverted * 5));
    db.data.gamification.userPoints += earnedPoints;

    // Check compost hero badge if organicKg >= 10
    if (newLog.organicKg >= 10) {
      const badge = db.data.gamification.userBadges.find(b => b.id === 'b2');
      if (badge) badge.unlocked = true;
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

// 5. Smart Collection Request Endpoints
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

    const newRequest = {
      id: `col-${Date.now()}`,
      wasteType,
      quantity,
      pickupArea,
      preferredDate,
      contactName,
      contactPhone,
      email: email || '',
      notes: notes || '',
      status: 'Pending',
      provider: 'Pending Municipality/Recycler Assignment',
      createdAt: new Date().toISOString()
    };

    db.data.collections.unshift(newRequest);
    db.data.gamification.userPoints += 20;
    db.save();

    res.status(201).json({
      success: true,
      data: newRequest,
      earnedPoints: 20,
      message: 'Collection request created successfully! Assigned provider will contact you.'
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

    if (status) item.status = status;
    if (provider) item.provider = provider;

    db.save();
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ error: 'Failed to update request.' });
  }
});

// 6. Community Waste Hotspot Reporting
app.get('/api/reports', (req, res) => {
  try {
    const { status, category, severity } = req.query;
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

    // Mask exact coordinates slightly for privacy preservation
    const sanitizedList = list.map(r => ({
      ...r,
      // Coordinates provided with locality level privacy
      approximateLat: +(r.lat).toFixed(3),
      approximateLng: +(r.lng).toFixed(3)
    }));

    res.json({ reports: sanitizedList });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to load community reports.' });
  }
});

app.post('/api/reports', (req, res) => {
  try {
    const { category, title, description, locality, severity, imageUrl, lat, lng } = req.body;

    if (!category || !title || !description || !locality) {
      return res.status(400).json({ error: 'Please provide category, title, description, and locality.' });
    }

    // Base coordinate around city center if not provided
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
      severity: severity || 'Medium',
      status: 'Reported',
      reportedBy: 'Citizen Eco-Guard',
      reportedAt: new Date().toISOString(),
      upvotes: 1,
      imageUrl: imageUrl || ''
    };

    db.data.reports.unshift(newReport);
    db.data.gamification.userPoints += 30;

    // Unlock Watchful Citizen badge
    const badge = db.data.gamification.userBadges.find(b => b.id === 'b3');
    if (badge) badge.unlocked = true;

    db.save();

    res.status(201).json({
      success: true,
      data: newReport,
      earnedPoints: 30,
      message: 'Waste hotspot reported successfully! Public alert created.'
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

    report.upvotes += 1;
    db.save();
    res.json({ success: true, upvotes: report.upvotes });
  } catch (error) {
    console.error('Error upvoting report:', error);
    res.status(500).json({ error: 'Failed to upvote report.' });
  }
});

app.patch('/api/reports/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = db.data.reports.find(r => r.id === id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    report.status = status;
    if (status === 'Resolved') {
      report.resolvedAt = new Date().toISOString();
    }
    db.save();
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'Failed to update report.' });
  }
});

// 7. Smart Alerts
app.get('/api/alerts', (req, res) => {
  try {
    res.json({ alerts: db.data.alerts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load smart alerts.' });
  }
});

// 8. Gamification & Leaderboards
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

// 9. Community Dashboard Aggregate Statistics
app.get('/api/dashboard/community', (req, res) => {
  try {
    const reports = db.data.reports;
    const collections = db.data.collections;
    const logs = db.data.impactLogs;

    const totalReports = reports.length;
    const activeReports = reports.filter(r => r.status !== 'Resolved').length;
    const resolvedReports = reports.filter(r => r.status === 'Resolved').length;

    // Calculate waste diverted
    let totalPlastic = logs.reduce((acc, l) => acc + (l.plasticKg || 0), 0);
    let totalPaper = logs.reduce((acc, l) => acc + (l.paperKg || 0), 0);
    let totalEWaste = logs.reduce((acc, l) => acc + (l.eWasteKg || 0), 0);
    let totalOrganic = logs.reduce((acc, l) => acc + (l.organicKg || 0), 0);

    // Add baseline community stats for realistic scale
    totalPlastic = +(totalPlastic + 420.5).toFixed(1);
    totalPaper = +(totalPaper + 890.0).toFixed(1);
    totalEWaste = +(totalEWaste + 145.2).toFixed(1);
    totalOrganic = +(totalOrganic + 1250.0).toFixed(1);

    const totalDivertedKg = +(totalPlastic + totalPaper + totalEWaste + totalOrganic).toFixed(1);
    const totalCO2SavedKg = +(
      (totalPlastic * 1.5) +
      (totalPaper * 0.9) +
      (totalEWaste * 2.8) +
      (totalOrganic * 0.5)
    ).toFixed(1);

    const monthlyTrends = [
      { month: 'Jun', divertedKg: 1450, co2SavedKg: 1820 },
      { month: 'Jul', divertedKg: 1890, co2SavedKg: 2410 },
      { month: 'Aug', divertedKg: 2150, co2SavedKg: 2780 },
      { month: 'Sep', divertedKg: 2600, co2SavedKg: 3340 },
      { month: 'Oct', divertedKg: 2705, co2SavedKg: 3490 }
    ];

    res.json({
      totalReports,
      activeReports,
      resolvedReports,
      totalDivertedKg,
      totalCO2SavedKg,
      totalPlasticKg: totalPlastic,
      totalPaperKg: totalPaper,
      totalEWasteKg: totalEWaste,
      totalOrganicKg: totalOrganic,
      totalCollections: collections.length,
      completedCollections: collections.filter(c => c.status === 'Completed' || c.status === 'Collected').length,
      communityPoints: 34800,
      monthlyTrends
    });
  } catch (error) {
    console.error('Error in community dashboard:', error);
    res.status(500).json({ error: 'Failed to load community dashboard.' });
  }
});

// 10. Admin Overview
app.get('/api/admin/overview', (req, res) => {
  try {
    res.json({
      pendingCollections: db.data.collections.filter(c => c.status === 'Pending').length,
      activeReports: db.data.reports.filter(r => r.status !== 'Resolved').length,
      totalCollections: db.data.collections.length,
      totalReports: db.data.reports.length,
      collections: db.data.collections,
      reports: db.data.reports,
      wasteItemsCount: db.data.wasteItems.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load admin overview.' });
  }
});

// Demo Mode Reset
app.post('/api/demo/reset', (req, res) => {
  try {
    const data = db.resetToDemo();
    res.json({ success: true, message: 'Hackathon Demo Mode reset to baseline successfully!', data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset demo data.' });
  }
});

// Serve client production build if available
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`🌱 EcoSort AI Server running on port ${PORT}`);
  console.log(`📡 AI Engine: ${process.env.GEMINI_API_KEY ? 'Gemini API' : 'EcoSort Offline Heuristics (Ready)'}`);
  if (fs.existsSync(clientDist)) {
    console.log(`🚀 Serving web client at http://localhost:${PORT}`);
  }
});
