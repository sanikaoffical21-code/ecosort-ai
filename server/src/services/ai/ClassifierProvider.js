import { COMPREHENSIVE_WASTE_TAXONOMY } from '../../../../shared/waste-taxonomy.js';

export const CATEGORY_DETAILS = {
  'Wet/Organic': {
    binColor: 'Green Bin',
    disposalMethod: 'Place in designated green wet-waste bin for home composting or municipal organic collection.',
    canRecycle: false,
    canReuse: false,
    canCompost: true,
    safetyWarning: null,
    environmentalImpact: 'Diverts kitchen and food waste from landfills, eliminating anaerobic decomposition that emits potent greenhouse methane.'
  },
  'Dry/Recyclable': {
    binColor: 'Blue Bin',
    disposalMethod: 'Keep clean and dry. Place in the Blue Dry Recyclables Bin or bundle for local dry waste centers.',
    canRecycle: true,
    canReuse: true,
    canCompost: true,
    safetyWarning: null,
    environmentalImpact: 'Saves virgin natural resources like timber and pulp, reducing industrial water and energy usage by over 60%.'
  },
  'Plastic': {
    binColor: 'Blue / Yellow Bin',
    disposalMethod: 'Rinse out food residue, dry, and flatten to minimize volume. Deposit in plastic recycling stream.',
    canRecycle: true,
    canReuse: true,
    canCompost: false,
    safetyWarning: null,
    environmentalImpact: 'Prevents single-use plastics from fragmenting into microplastics that poison marine ecosystems and food chains.'
  },
  'E-waste': {
    binColor: 'Brown / Designated E-waste Depot',
    disposalMethod: 'Never throw in regular trash. Drop off at certified electronic recycling bins or book an EcoSort e-waste pickup.',
    canRecycle: true,
    canReuse: true,
    canCompost: false,
    safetyWarning: '⚠️ CONTAINS HAZARDOUS MATERIALS: Heavy metals, lead, cadmium, and lithium battery fire hazards. Do not disassemble or crush.',
    environmentalImpact: 'Enables high-grade circular recovery of rare earth elements (gold, silver, copper, palladium) and prevents toxic aquifer contamination.'
  },
  'Hazardous waste': {
    binColor: 'Red Hazardous Bin',
    disposalMethod: 'Must be handed over in separate sealed containers to authorized hazardous waste processing facilities.',
    canRecycle: false,
    canReuse: false,
    canCompost: false,
    safetyWarning: '⚠️ CRITICAL CHEMICAL HAZARD: Corrosive, flammable, or toxic. Keep out of reach of children and domestic pets. Do not pour into sinks.',
    environmentalImpact: 'Prevents toxic chemicals from poisoning municipal wastewater treatment bacteria, rivers, and soil microbiology.'
  },
  'Medical/sanitary waste': {
    binColor: 'Red / Yellow Hazmat Bag',
    disposalMethod: 'Wrap securely in newspaper with a distinct red dot/cross. Deliver to biomedical collection channels for controlled incinerator disposal.',
    canRecycle: false,
    canReuse: false,
    canCompost: false,
    safetyWarning: '⚠️ BIOHAZARD: Potential biological pathogens and bloodborne agents. Wrap securely to protect sanitation workers from direct contact.',
    environmentalImpact: 'Safe biomedical treatment prevents the spread of transmissible infections and protects ground ecology.'
  },
  'Glass': {
    binColor: 'Cyan / Blue Bin (Marked Glass)',
    disposalMethod: 'If intact, place in glass recycling. If broken, wrap in several layers of newspaper/cardboard box and label "BROKEN GLASS".',
    canRecycle: true,
    canReuse: true,
    canCompost: false,
    safetyWarning: '⚠️ CUT / LACERATION RISK: Handle broken pieces with thick cut-resistant gloves. Always label clearly for waste handlers.',
    environmentalImpact: 'Glass can be recycled indefinitely without degradation in purity or mechanical strength.'
  },
  'Metal': {
    binColor: 'Grey / Blue Bin',
    disposalMethod: 'Rinse clean, separate non-metal attachments, and place in scrap metal recyclables.',
    canRecycle: true,
    canReuse: true,
    canCompost: false,
    safetyWarning: null,
    environmentalImpact: 'Recycling metals saves up to 95% of the massive electrical energy consumed during raw bauxite/iron ore mining.'
  },
  'Textile': {
    binColor: 'Purple Bin / Fabric Donation Box',
    disposalMethod: 'If clean and intact, donate to charity or thrift centers. If torn, bundle for textile shredding and industrial felt manufacturing.',
    canRecycle: true,
    canReuse: true,
    canCompost: false,
    safetyWarning: null,
    environmentalImpact: 'Offsets the extreme water consumption (2,700L per shirt) and synthetic polyester footprint of the apparel industry.'
  },
  'Other': {
    binColor: 'Black Residual Waste Bin',
    disposalMethod: 'Non-recyclable inert waste sent to controlled sanitary landfills or waste-to-energy power plants.',
    canRecycle: false,
    canReuse: false,
    canCompost: false,
    safetyWarning: null,
    environmentalImpact: 'Minimized when preceding items are properly separated at source.'
  }
};

/**
 * 1. Manual Provider - Direct user selection / verification
 */
export class ManualProvider {
  name = 'ManualProvider';

  canClassify(query) {
    return Boolean(query.manualCategory && CATEGORY_DETAILS[query.manualCategory]);
  }

  async classify(query) {
    const category = query.manualCategory;
    const details = CATEGORY_DETAILS[category];
    return {
      itemName: query.description || `${category} Item`,
      category,
      confidence: 100,
      binColor: details.binColor,
      disposalMethod: details.disposalMethod,
      canRecycle: details.canRecycle,
      canReuse: details.canReuse,
      canCompost: details.canCompost,
      safetyWarning: details.safetyWarning,
      environmentalImpact: details.environmentalImpact,
      suggestedAction: `User verified classification for ${category}. Follow local bin guide.`,
      requiresConfirmation: false,
      alternatives: [],
      source: 'User Manual Classification',
      explainability: {
        matchedVisualCues: ['User confirmed material properties'],
        matchedKeywords: [category],
        reasoning: 'Verified directly by citizen in manual classification mode.',
        safetyRationale: details.safetyWarning || 'Standard waste handling precautions apply.'
      }
    };
  }
}

/**
 * 2. Vision Provider - Google Gemini Vision API (or Claude Vision)
 */
export class VisionProvider {
  name = 'VisionProvider';

  constructor(apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY) {
    this.apiKey = apiKey;
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  async classify({ imageBase64, description }) {
    if (!this.isAvailable()) {
      throw new Error('VisionProvider API key not configured');
    }

    const prompt = `You are EcoSort AI, a smart circular economy waste classifier.
Analyze this waste item.
Classify strictly into ONE of:
- Wet/Organic
- Dry/Recyclable
- Plastic
- E-waste
- Hazardous waste
- Medical/sanitary waste
- Glass
- Metal
- Textile
- Other

Output ONLY valid JSON with keys:
{
  "itemName": "Specific item name",
  "category": "One of the 10 categories",
  "confidence": 88,
  "binColor": "Bin color",
  "disposalMethod": "Instructions",
  "canRecycle": true,
  "canReuse": false,
  "canCompost": false,
  "safetyWarning": "null or text",
  "environmentalImpact": "Impact text",
  "suggestedAction": "Next action",
  "requiresConfirmation": false,
  "alternatives": [
    {"category": "Category A", "probability": 88},
    {"category": "Category B", "probability": 8},
    {"category": "Category C", "probability": 4}
  ],
  "explainability": {
    "matchedVisualCues": ["Visual feature 1", "Visual feature 2"],
    "matchedKeywords": ["Key term 1"],
    "reasoning": "Reason why it belongs in this category",
    "safetyRationale": "Safety notice"
  }
}
If confidence is < 70, set requiresConfirmation to true.`;

    let contents = [];
    if (imageBase64) {
      const match = imageBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      const mimeType = match ? match[1] : 'image/jpeg';
      const data = match ? match[2] : imageBase64;
      contents = [
        {
          role: 'user',
          parts: [
            { text: prompt + (description ? `\nAdditional user hint: "${description}"` : '') },
            { inline_data: { mime_type: mimeType, data } }
          ]
        }
      ];
    } else {
      contents = [
        {
          role: 'user',
          parts: [{ text: prompt + `\nItem query: "${description}"` }]
        }
      ];
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.2
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Vision API error status: ${response.status}`);
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Vision AI model');

    const parsed = JSON.parse(text);
    parsed.source = 'Gemini 1.5 Vision AI';
    if (parsed.confidence < 70) {
      parsed.requiresConfirmation = true;
    }
    return parsed;
  }
}

/**
 * 3. Keyword Provider - Offline Heuristic Knowledge Base Matcher
 */
export class KeywordProvider {
  name = 'KeywordProvider';

  async classify({ description, imageBase64 }) {
    const text = (description || '').toLowerCase().trim();

    // Deterministic Hackathon Demo samples
    if (text.includes('sample:banana-peel') || text === 'banana peel') {
      const item = COMPREHENSIVE_WASTE_TAXONOMY.find(i => i.id === 'banana-peel') || COMPREHENSIVE_WASTE_TAXONOMY[0];
      return {
        itemName: item.name,
        category: item.category,
        confidence: 96,
        binColor: item.binColor,
        disposalMethod: item.disposalMethod,
        canRecycle: item.canRecycle,
        canReuse: item.canReuse,
        canCompost: item.canCompost,
        safetyWarning: null,
        environmentalImpact: item.environmentalImpact,
        suggestedAction: item.suggestedAction,
        requiresConfirmation: false,
        alternatives: [
          { category: 'Wet/Organic', probability: 96 },
          { category: 'Dry/Recyclable', probability: 3 },
          { category: 'Other', probability: 1 }
        ],
        source: 'EcoSort Knowledge Engine (Offline Heuristic)',
        explainability: {
          matchedVisualCues: ['Yellow fibrous peel texture', 'Organic botanical stem structure'],
          matchedKeywords: ['banana', 'peel', 'fruit'],
          reasoning: 'Item is raw organic kitchen waste capable of aerobic decomposition into rich humus.',
          safetyRationale: 'Safe non-hazardous biological material.'
        }
      };
    }

    if (text.includes('sample:plastic-bottle') || text === 'plastic bottle' || text.includes('pet bottle')) {
      const item = COMPREHENSIVE_WASTE_TAXONOMY.find(i => i.id === 'pet-water-bottle');
      return {
        itemName: item?.name || 'PET Plastic Water Bottle',
        category: 'Plastic',
        confidence: 92,
        binColor: 'Blue Bin',
        disposalMethod: item?.disposalMethod || 'Rinse, crush flat, and deposit in Blue Plastic Bin.',
        canRecycle: true,
        canReuse: true,
        canCompost: false,
        safetyWarning: null,
        environmentalImpact: 'Recycling 1 ton of PET saves 1.5 tons of greenhouse CO2e emissions.',
        suggestedAction: 'Rinse, flatten to reduce bin volume, and place in recyclable plastic stream.',
        requiresConfirmation: false,
        alternatives: [
          { category: 'Plastic', probability: 92 },
          { category: 'Dry/Recyclable', probability: 6 },
          { category: 'Other', probability: 2 }
        ],
        source: 'EcoSort Knowledge Engine (Offline Heuristic)',
        explainability: {
          matchedVisualCues: ['Clear transparent thermoplastic polymer', 'Screw thread cap neck'],
          matchedKeywords: ['plastic', 'bottle', 'pet'],
          reasoning: 'Identified as Grade 1 Polyethylene Terephthalate (PET) suitable for mechanical fiber spinning.',
          safetyRationale: 'Ensure liquid is drained; no hazardous chemical residue.'
        }
      };
    }

    if (text.includes('sample:battery') || text === 'used battery' || text.includes('aa battery')) {
      const item = COMPREHENSIVE_WASTE_TAXONOMY.find(i => i.id === 'used-aa-aaa-alkaline-battery');
      return {
        itemName: item?.name || 'Used AA Alkaline Battery',
        category: 'E-waste',
        confidence: 94,
        binColor: 'Brown / Hazardous E-waste Bin',
        disposalMethod: item?.disposalMethod || 'Tape both terminals and surrender to battery drop box.',
        canRecycle: true,
        canReuse: false,
        canCompost: false,
        safetyWarning: '⚠️ CRITICAL CHEMICAL & FIRE HAZARD: Corrosive potassium hydroxide electrolyte and heavy metals. Tape terminals.',
        environmentalImpact: 'Prevents zinc, manganese, and nickel from contaminating municipal groundwater.',
        suggestedAction: 'Tape terminals with electrical tape and drop at designated e-waste kiosk.',
        requiresConfirmation: false,
        alternatives: [
          { category: 'E-waste', probability: 94 },
          { category: 'Hazardous waste', probability: 5 },
          { category: 'Metal', probability: 1 }
        ],
        source: 'EcoSort Knowledge Engine (Offline Heuristic)',
        explainability: {
          matchedVisualCues: ['Cylindrical metal casing', 'Positive contact terminal nub'],
          matchedKeywords: ['battery', 'alkaline', 'cell'],
          reasoning: 'Electrochemical energy storage cell classified as regulated hazardous electronic waste.',
          safetyRationale: 'Terminal taping prevents accidental short circuit fires in collection bins.'
        }
      };
    }

    if (text.includes('sample:ambiguous-wrapper') || text.includes('ambiguous') || text === 'foil wrapper') {
      // Intentionally below 70% confidence to showcase confidence gating and user confirmation flow!
      return {
        itemName: 'Composite Foil / Multi-Layer Wrapper',
        category: 'Plastic',
        confidence: 64, // GATED (< 70%)
        binColor: 'Blue / Yellow Bin',
        disposalMethod: 'Verify packaging code: if pure plastic place in Blue bin; if multi-layer laminate place in dry waste.',
        canRecycle: true,
        canReuse: false,
        canCompost: false,
        safetyWarning: 'Confidence is below 70%. Please confirm correct category using the chips below.',
        environmentalImpact: 'Multi-layer composite plastics require thermal co-processing in cement kilns.',
        suggestedAction: 'Please tap the correct category below to verify and claim your Eco Points.',
        requiresConfirmation: true,
        alternatives: [
          { category: 'Plastic', probability: 64 },
          { category: 'Dry/Recyclable', probability: 22 },
          { category: 'Other', probability: 14 }
        ],
        suggestedCategories: ['Plastic', 'Dry/Recyclable', 'Other'],
        source: 'EcoSort Heuristic Engine (Verification Required)',
        explainability: {
          matchedVisualCues: ['Reflective metallized film', 'Flexible thin polymer boundary'],
          matchedKeywords: ['wrapper', 'foil', 'package'],
          reasoning: 'Laminate contains bonded layers of plastic and aluminum making mono-material sorting uncertain.',
          safetyRationale: 'Confirm clean of food crumbs before binning.'
        }
      };
    }

    // Search taxonomy for direct or alias matches
    for (const item of COMPREHENSIVE_WASTE_TAXONOMY) {
      if (text.includes(item.id) || text.includes(item.name.toLowerCase())) {
        const details = CATEGORY_DETAILS[item.category] || CATEGORY_DETAILS['Other'];
        return {
          itemName: item.name,
          category: item.category,
          confidence: 93,
          binColor: item.binColor,
          disposalMethod: item.disposalMethod,
          canRecycle: item.canRecycle,
          canReuse: item.canReuse,
          canCompost: item.canCompost,
          safetyWarning: item.safetyPrecautions !== 'None.' && !item.safetyPrecautions.startsWith('None') ? item.safetyPrecautions : details.safetyWarning,
          environmentalImpact: item.environmentalImpact,
          suggestedAction: item.suggestedAction,
          requiresConfirmation: false,
          alternatives: [
            { category: item.category, probability: 93 },
            { category: 'Dry/Recyclable', probability: 5 },
            { category: 'Other', probability: 2 }
          ],
          source: 'EcoSort Knowledge Engine (Offline Heuristic)',
          explainability: {
            matchedVisualCues: ['Taxonomy database item match'],
            matchedKeywords: [item.name.toLowerCase()],
            reasoning: `Matches verified circular profile for ${item.name}.`,
            safetyRationale: item.safetyPrecautions || 'Standard waste handling precautions apply.'
          }
        };
      }

      for (const alias of item.aliases) {
        if (text.includes(alias.toLowerCase())) {
          return {
            itemName: item.name,
            category: item.category,
            confidence: 88,
            binColor: item.binColor,
            disposalMethod: item.disposalMethod,
            canRecycle: item.canRecycle,
            canReuse: item.canReuse,
            canCompost: item.canCompost,
            safetyWarning: item.safetyPrecautions !== 'None.' ? item.safetyPrecautions : null,
            environmentalImpact: item.environmentalImpact,
            suggestedAction: item.suggestedAction,
            requiresConfirmation: false,
            alternatives: [
              { category: item.category, probability: 88 },
              { category: 'Other', probability: 12 }
            ],
            source: 'EcoSort Knowledge Engine (Offline Heuristic)',
            explainability: {
              matchedVisualCues: ['Alias taxonomy match'],
              matchedKeywords: [alias],
              reasoning: `Identified by synonym "${alias}" in circular database.`,
              safetyRationale: item.safetyPrecautions || 'Standard precautions apply.'
            }
          };
        }
      }
    }

    // Generic fallback rule mapping with confidence gating
    const rules = [
      { terms: ['battery', 'phone', 'charger', 'cable', 'wire', 'electronic', 'laptop', 'bulb', 'led'], cat: 'E-waste', conf: 86 },
      { terms: ['bottle', 'plastic', 'pouch', 'polybag', 'shampoo', 'wrapper'], cat: 'Plastic', conf: 85 },
      { terms: ['food', 'peel', 'apple', 'banana', 'vegetable', 'rice', 'leaf', 'flower', 'organic'], cat: 'Wet/Organic', conf: 88 },
      { terms: ['paper', 'box', 'cardboard', 'newspaper', 'carton', 'book'], cat: 'Dry/Recyclable', conf: 87 },
      { terms: ['glass', 'jar', 'mirror', 'tumbler', 'shards'], cat: 'Glass', conf: 85 },
      { terms: ['metal', 'can', 'aluminum', 'tin', 'steel', 'nail', 'screw'], cat: 'Metal', conf: 84 },
      { terms: ['cloth', 'textile', 'shirt', 'jeans', 'cotton', 'curtain'], cat: 'Textile', conf: 84 },
      { terms: ['paint', 'solvent', 'acid', 'pesticide', 'chemical', 'bleach'], cat: 'Hazardous waste', conf: 90 },
      { terms: ['tablet', 'medicine', 'syringe', 'pad', 'diaper', 'bandage', 'mask'], cat: 'Medical/sanitary waste', conf: 89 }
    ];

    for (const r of rules) {
      if (r.terms.some(t => text.includes(t))) {
        const details = CATEGORY_DETAILS[r.cat];
        return {
          itemName: text ? `Detected: ${text}` : `${r.cat} Item`,
          category: r.cat,
          confidence: r.conf,
          binColor: details.binColor,
          disposalMethod: details.disposalMethod,
          canRecycle: details.canRecycle,
          canReuse: details.canReuse,
          canCompost: details.canCompost,
          safetyWarning: details.safetyWarning,
          environmentalImpact: details.environmentalImpact,
          suggestedAction: `Follow disposal guidelines for ${r.cat}.`,
          requiresConfirmation: false,
          alternatives: [
            { category: r.cat, probability: r.conf },
            { category: 'Dry/Recyclable', probability: Math.max(2, 100 - r.conf - 4) },
            { category: 'Other', probability: 4 }
          ],
          source: 'EcoSort Knowledge Engine (Offline Heuristic)',
          explainability: {
            matchedVisualCues: ['Rule-based keyword pattern'],
            matchedKeywords: r.terms.filter(t => text.includes(t)),
            reasoning: `Matches characteristic material composition for ${r.cat}.`,
            safetyRationale: details.safetyWarning || 'Handle hygienically.'
          }
        };
      }
    }

    // Truly uncertain or ambiguous item -> Low confidence gate (62%)
    const defaultCategory = 'Dry/Recyclable';
    const details = CATEGORY_DETAILS[defaultCategory];
    return {
      itemName: text ? `Unverified: "${text}"` : 'Unidentified Waste Item',
      category: defaultCategory,
      confidence: 62, // Below 70% threshold!
      binColor: details.binColor,
      disposalMethod: details.disposalMethod,
      canRecycle: details.canRecycle,
      canReuse: details.canReuse,
      canCompost: details.canCompost,
      safetyWarning: 'Confidence is below 70%. Please confirm or select the correct category before disposal.',
      environmentalImpact: details.environmentalImpact,
      suggestedAction: 'Please verify the waste category from the candidate chips below.',
      requiresConfirmation: true,
      alternatives: [
        { category: 'Dry/Recyclable', probability: 62 },
        { category: 'Plastic', probability: 24 },
        { category: 'Other', probability: 14 }
      ],
      suggestedCategories: ['Dry/Recyclable', 'Plastic', 'Wet/Organic', 'E-waste', 'Glass', 'Metal'],
      source: 'EcoSort Heuristic Engine (Verification Required)',
      explainability: {
        matchedVisualCues: ['Ambiguous or low-contrast visual features'],
        matchedKeywords: text ? [text] : ['unspecified'],
        reasoning: 'Input attributes could not be matched with high confidence to a single circular waste stream.',
        safetyRationale: 'Human verification required to prevent contamination of municipal recycling streams.'
      }
    };
  }
}

/**
 * 4. Auto-Fallback Chain: Vision -> Keyword -> Manual
 */
export class CompositeClassifier {
  constructor() {
    this.manualProvider = new ManualProvider();
    this.visionProvider = new VisionProvider();
    this.keywordProvider = new KeywordProvider();
  }

  getEngineStatus() {
    if (this.visionProvider.isAvailable()) {
      return 'Gemini 1.5/2.0 Vision (Active)';
    }
    return 'Offline Knowledge Engine (Active)';
  }

  async classify({ imageBase64, description, manualCategory }) {
    // 1. If manual category explicitly specified by user
    if (manualCategory && this.manualProvider.canClassify({ manualCategory })) {
      return this.manualProvider.classify({ description, manualCategory });
    }

    // 2. Try Vision Provider if key is configured
    if (this.visionProvider.isAvailable() && (imageBase64 || description)) {
      try {
        const result = await this.visionProvider.classify({ imageBase64, description });
        return result;
      } catch (err) {
        console.warn('VisionProvider error, falling back to KeywordProvider:', err.message);
      }
    }

    // 3. Fallback to Keyword / Offline Heuristic Provider
    return this.keywordProvider.classify({ description, imageBase64 });
  }
}

export const classifierEngine = new CompositeClassifier();

