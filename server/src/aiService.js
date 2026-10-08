import { INITIAL_WASTE_ITEMS } from './db.js';

// Category details reference
const CATEGORY_DETAILS = {
  'Wet/Organic': {
    binColor: 'Green Bin',
    disposalMethod: 'Dispose in the Green Wet Waste Bin for local composting, vermicomposting, or bio-methanation.',
    canRecycle: false,
    canReuse: false,
    canCompost: true,
    safetyWarning: null,
    environmentalImpact: 'Diverts kitchen and food waste from landfills, eliminating anaerobic decomposition that emits potent greenhouse methane.'
  },
  'Dry/Recyclable': {
    binColor: 'Blue Bin',
    disposalMethod: 'Keep clean and dry. Place in the Blue Dry Recyclables Bin or hand over to dry waste collection centers.',
    canRecycle: true,
    canReuse: true,
    canCompost: false,
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
    binColor: 'E-Waste Depot / Special Brown Bin',
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
 * Heuristic/rule-based offline classifier when Gemini API is not configured or offline.
 */
function classifyOffline(queryText, base64Hint) {
  const query = (queryText || '').toLowerCase().trim();

  // Search in database first
  for (const item of INITIAL_WASTE_ITEMS) {
    if (query.includes(item.id) || query.includes(item.name.toLowerCase())) {
      return {
        itemName: item.name,
        category: item.category,
        confidence: 94,
        binColor: item.binColor,
        disposalMethod: item.disposalMethod,
        canRecycle: item.canRecycle,
        canReuse: item.canReuse,
        canCompost: item.canCompost,
        safetyWarning: item.safetyPrecautions !== 'None. Safe organic matter.' ? item.safetyPrecautions : null,
        environmentalImpact: item.environmentalImpact,
        suggestedAction: item.suggestedAction,
        requiresConfirmation: false,
        source: 'EcoSort Knowledge Engine (Offline Mode)'
      };
    }

    for (const alias of item.aliases) {
      if (query.includes(alias.toLowerCase())) {
        return {
          itemName: item.name,
          category: item.category,
          confidence: 89,
          binColor: item.binColor,
          disposalMethod: item.disposalMethod,
          canRecycle: item.canRecycle,
          canReuse: item.canReuse,
          canCompost: item.canCompost,
          safetyWarning: item.safetyPrecautions !== 'None. Safe organic matter.' ? item.safetyPrecautions : null,
          environmentalImpact: item.environmentalImpact,
          suggestedAction: item.suggestedAction,
          requiresConfirmation: false,
          source: 'EcoSort Knowledge Engine (Offline Mode)'
        };
      }
    }
  }

  // Keyword pattern matching for waste types
  const rules = [
    {
      keywords: ['phone', 'mobile', 'charger', 'battery', 'laptop', 'cable', 'wire', 'electronic', 'tablet', 'screen', 'cpu', 'printed circuit', 'earphone', 'headphone', 'bulb', 'led'],
      category: 'E-waste',
      defaultItem: 'Electronic Equipment / Cable / Battery',
      confidence: 86
    },
    {
      keywords: ['bottle', 'plastic', 'poly', 'wrapper', 'packet', 'pouch', 'shampoo', 'straw', 'styrofoam', 'thermo', 'container', 'tub'],
      category: 'Plastic',
      defaultItem: 'Plastic Container / Packaging',
      confidence: 88
    },
    {
      keywords: ['banana', 'apple', 'vegetable', 'fruit', 'food', 'rice', 'curry', 'peel', 'egg shell', 'bread', 'tea', 'coffee', 'leaf', 'flower', 'rotten', 'organic'],
      category: 'Wet/Organic',
      defaultItem: 'Organic Food / Kitchen Scrap',
      confidence: 91
    },
    {
      keywords: ['paper', 'cardboard', 'carton', 'box', 'newspaper', 'book', 'magazine', 'office paper', 'envelope', 'card'],
      category: 'Dry/Recyclable',
      defaultItem: 'Paper / Corrugated Cardboard',
      confidence: 90
    },
    {
      keywords: ['glass', 'mirror', 'bottle glass', 'tumbler', 'shards', 'jar'],
      category: 'Glass',
      defaultItem: 'Glassware / Container Glass',
      confidence: 87
    },
    {
      keywords: ['can', 'tin', 'aluminum', 'metal', 'steel', 'iron', 'foil', 'screw', 'nail', 'utensil'],
      category: 'Metal',
      defaultItem: 'Metal Scrap / Can',
      confidence: 85
    },
    {
      keywords: ['cloth', 'clothes', 'fabric', 'shirt', 'pants', 'textile', 'cotton', 'denim', 'jeans', 'towel', 'curtain'],
      category: 'Textile',
      defaultItem: 'Textile / Garment Scrap',
      confidence: 84
    },
    {
      keywords: ['medicine', 'tablet', 'pill', 'pad', 'diaper', 'syringe', 'bandage', 'mask', 'sanitary', 'gauze'],
      category: 'Medical/sanitary waste',
      defaultItem: 'Sanitary / Pharmaceutical Waste',
      confidence: 92
    },
    {
      keywords: ['paint', 'chemical', 'acid', 'poison', 'insecticide', 'pesticide', 'solvent', 'varnish', 'brake fluid', 'motor oil'],
      category: 'Hazardous waste',
      defaultItem: 'Domestic Chemical / Hazardous Substance',
      confidence: 91
    }
  ];

  for (const rule of rules) {
    if (rule.keywords.some(k => query.includes(k))) {
      const details = CATEGORY_DETAILS[rule.category];
      return {
        itemName: rule.defaultItem,
        category: rule.category,
        confidence: rule.confidence,
        binColor: details.binColor,
        disposalMethod: details.disposalMethod,
        canRecycle: details.canRecycle,
        canReuse: details.canReuse,
        canCompost: details.canCompost,
        safetyWarning: details.safetyWarning,
        environmentalImpact: details.environmentalImpact,
        suggestedAction: `Classified as ${rule.category}. Follow binning instructions carefully.`,
        requiresConfirmation: false,
        source: 'EcoSort Knowledge Engine (Offline Mode)'
      };
    }
  }

  // If image was provided with generic or ambiguous description, return realistic prediction with low-confidence prompt
  // Users will be prompted to confirm or select the correct category
  const fallbackCategories = ['Plastic', 'Dry/Recyclable', 'Wet/Organic', 'E-waste'];
  const guessedCategory = fallbackCategories[Math.floor(Math.random() * fallbackCategories.length)];
  const details = CATEGORY_DETAILS[guessedCategory];

  return {
    itemName: query ? `Detected Item: ${query}` : 'Unidentified Waste Item',
    category: guessedCategory,
    confidence: 62, // low confidence!
    binColor: details.binColor,
    disposalMethod: details.disposalMethod,
    canRecycle: details.canRecycle,
    canReuse: details.canReuse,
    canCompost: details.canCompost,
    safetyWarning: 'Confidence is below 75%. Please verify with the category selector below before disposal.',
    environmentalImpact: details.environmentalImpact,
    suggestedAction: 'Please confirm the exact waste category using the options below.',
    requiresConfirmation: true,
    suggestedCategories: ['Plastic', 'Dry/Recyclable', 'Wet/Organic', 'E-waste', 'Glass', 'Metal', 'Hazardous waste'],
    source: 'EcoSort Heuristic Engine (Verification Required)'
  };
}

/**
 * Primary AI Classifier
 * Calls Gemini Vision API if key available, else falls back to offline heuristic classifier.
 */
export async function classifyWaste({ imageBase64, description, manualCategory }) {
  // If user explicitly chose manual category
  if (manualCategory && CATEGORY_DETAILS[manualCategory]) {
    const details = CATEGORY_DETAILS[manualCategory];
    return {
      itemName: description || manualCategory,
      category: manualCategory,
      confidence: 100,
      binColor: details.binColor,
      disposalMethod: details.disposalMethod,
      canRecycle: details.canRecycle,
      canReuse: details.canReuse,
      canCompost: details.canCompost,
      safetyWarning: details.safetyWarning,
      environmentalImpact: details.environmentalImpact,
      suggestedAction: `Verified by user as ${manualCategory}.`,
      requiresConfirmation: false,
      source: 'User Confirmed Category'
    };
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      // Call Gemini 1.5/2.0 API with vision or text
      const prompt = `You are EcoSort AI, an expert environmental waste management and material segregation system.
Analyze the user's waste item (image and/or description: "${description || ''}").
Classify it strictly into ONE of these 10 categories:
1. Wet/Organic
2. Dry/Recyclable
3. Plastic
4. E-waste
5. Hazardous waste
6. Medical/sanitary waste
7. Glass
8. Metal
9. Textile
10. Other

Respond ONLY with valid JSON in this schema:
{
  "itemName": "Specific item name (e.g. Broken PET Water Bottle)",
  "category": "One of the 10 categories exactly",
  "confidence": 88,
  "binColor": "Appropriate bin color name",
  "disposalMethod": "Clear, practical disposal instructions",
  "canRecycle": true,
  "canReuse": false,
  "canCompost": false,
  "safetyWarning": "Warning text if sharp, toxic, biohazard, or null if safe",
  "environmentalImpact": "Explanation of carbon/landfill/ecological impact",
  "suggestedAction": "Immediate recommendation (e.g. rinse, crush, drop at center)",
  "requiresConfirmation": false
}
If confidence is less than 75%, set requiresConfirmation to true.`;

      let contents = [];
      if (imageBase64) {
        // Strip data:image/...;base64, prefix if present
        const match = imageBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        const mimeType = match ? match[1] : 'image/jpeg';
        const data = match ? match[2] : imageBase64;

        contents = [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: data
                }
              }
            ]
          }
        ];
      } else {
        contents = [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ];
      }

      // Try gemini-1.5-flash endpoint
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.2
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          parsed.source = 'Gemini 1.5 Vision AI';
          return parsed;
        }
      } else {
        console.warn('Gemini API call failed with status:', response.status);
      }
    } catch (err) {
      console.warn('Gemini API execution error, falling back to offline classifier:', err.message);
    }
  }

  // Graceful offline fallback
  return classifyOffline(description, imageBase64);
}

