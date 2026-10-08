import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Comprehensive database of waste items with guidance
export const INITIAL_WASTE_ITEMS = [
  // Wet / Organic
  {
    id: 'banana-peel',
    name: 'Banana Peel',
    aliases: ['banana skin', 'fruit peel', 'fruit waste'],
    category: 'Wet/Organic',
    binColor: 'Green',
    preparation: 'Remove any fruit stickers or plastic tags before binning.',
    recyclingPossibility: 'High (Composting / Vermicomposting / Biogas)',
    disposalMethod: 'Place in designated green wet-waste bin for home composting or municipal organic collection.',
    safetyPrecautions: 'None. Safe organic matter.',
    environmentalImpact: 'Decomposes in 2-4 weeks. Composting diverts organic waste from landfills where it would otherwise release potent methane gas.',
    suggestedAction: 'Add to compost bin or garden soil for rich nutrient humus.',
    canCompost: true,
    canRecycle: false,
    canReuse: false
  },
  {
    id: 'vegetable-scraps',
    name: 'Vegetable Scraps & Peels',
    aliases: ['vegetables', 'kitchen waste', 'potato skin', 'carrot peels', 'onion peels'],
    category: 'Wet/Organic',
    binColor: 'Green',
    preparation: 'Drain excess gravy or liquids. Keep in a ventilated container to avoid foul odors.',
    recyclingPossibility: 'High (Composting)',
    disposalMethod: 'Put directly into the wet waste green bin or compost tumbler.',
    safetyPrecautions: 'Wash hands after handling if rotting.',
    environmentalImpact: 'Produces nutrient-rich soil enhancer; prevents anaerobic methane formation.',
    suggestedAction: 'Compost at home or send to community aerated composting units.',
    canCompost: true,
    canRecycle: false,
    canReuse: false
  },
  {
    id: 'leftover-food',
    name: 'Leftover Food & Cooked Rice/Curry',
    aliases: ['cooked food', 'spoiled food', 'rotten food', 'leftovers'],
    category: 'Wet/Organic',
    binColor: 'Green',
    preparation: 'Strain oily gravies. Do not mix with plastic wrappers or aluminum foil.',
    recyclingPossibility: 'Medium (Biogas generation or high-temperature composting)',
    disposalMethod: 'Wet waste green bin or community bio-methanation plant.',
    safetyPrecautions: 'Cover promptly to deter pests, flies, and rodents.',
    environmentalImpact: 'Diverts food waste from open dumps.',
    suggestedAction: 'Feed stray animals if safe and fresh, or divert to bio-methanation.',
    canCompost: true,
    canRecycle: false,
    canReuse: false
  },
  {
    id: 'tea-bags-coffee-grounds',
    name: 'Tea Leaves & Coffee Grounds',
    aliases: ['tea bag', 'tea leaves', 'coffee powder', 'used coffee'],
    category: 'Wet/Organic',
    binColor: 'Green',
    preparation: 'Tear open tea bag if it contains synthetic nylon mesh or metal staple, keeping only the tea leaves.',
    recyclingPossibility: 'High (Natural fertilizer)',
    disposalMethod: 'Direct organic compost bin or sprinkle on acid-loving garden plants (roses, tomatoes).',
    safetyPrecautions: 'Ensure staples are removed.',
    environmentalImpact: 'High nitrogen source that supercharges microbial decomposition.',
    suggestedAction: 'Sprinkle directly onto garden soil or vermicompost.',
    canCompost: true,
    canRecycle: false,
    canReuse: false
  },

  // Dry / Recyclable / Plastic
  {
    id: 'plastic-bottle',
    name: 'PET Plastic Water / Soda Bottle',
    aliases: ['plastic bottle', 'mineral water bottle', 'cold drink bottle', 'coke bottle'],
    category: 'Plastic',
    binColor: 'Blue',
    preparation: 'Empty contents, rinse clean, flatten/crush bottle to save space, screw cap back on.',
    recyclingPossibility: 'High (Recyclable into polyester yarn, textiles, new bottles)',
    disposalMethod: 'Dry recyclable bin (Blue) or handover to registered dry waste collection center.',
    safetyPrecautions: 'Ensure no residual toxic chemicals or detergents.',
    environmentalImpact: 'Takes 450+ years to degrade in landfills; recycling 1 ton saves 1.5 tons of CO2.',
    suggestedAction: 'Clean, flatten, and deposit in plastic recycling bin.',
    canCompost: false,
    canRecycle: true,
    canReuse: true
  },
  {
    id: 'milk-pouch',
    name: 'Milk Pouch / LDPE Plastic Packet',
    aliases: ['milk packet', 'oil pouch', 'soft plastic'],
    category: 'Plastic',
    binColor: 'Blue',
    preparation: 'Cut along edge without detaching tiny corner snippet (keep snippet attached), rinse thoroughly and dry completely.',
    recyclingPossibility: 'High (Recycled into poly-granules, pipes, tarpaulins)',
    disposalMethod: 'Dry waste bin. Ensure completely dry to avoid fungal mold ruining recyclables.',
    safetyPrecautions: 'Clean dairy residue to prevent odor.',
    environmentalImpact: 'Prevents microplastic pollution and animal ingestion.',
    suggestedAction: 'Collect clean pouches in bundle and hand over to local dry waste center.',
    canCompost: false,
    canRecycle: true,
    canReuse: false
  },
  {
    id: 'shampoo-bottle',
    name: 'HDPE Shampoo / Detergent Bottle',
    aliases: ['shampoo bottle', 'conditioner bottle', 'body wash bottle', 'detergent bottle'],
    category: 'Plastic',
    binColor: 'Blue',
    preparation: 'Rinse out soap residue, remove pump nozzle if it contains a metal spring.',
    recyclingPossibility: 'High (HDPE is easily recycled into crates, containers, pipes)',
    disposalMethod: 'Dry recyclable bin (Blue).',
    safetyPrecautions: 'Wash off concentrated detergents.',
    environmentalImpact: 'Saves crude oil and petrochemical energy required for virgin plastic production.',
    suggestedAction: 'Refill if using bulk refills, or place in plastic recycling bin.',
    canCompost: false,
    canRecycle: true,
    canReuse: true
  },
  {
    id: 'cardboard-box',
    name: 'Corrugated Cardboard Box / Shipping Carton',
    aliases: ['amazon box', 'delivery box', 'packaging carton', 'cardboard'],
    category: 'Dry/Recyclable',
    binColor: 'Blue',
    preparation: 'Peel off shipping plastic tape, flatten the box completely to reduce volume.',
    recyclingPossibility: 'Very High (Can be pulped and recycled 5-7 times)',
    disposalMethod: 'Dry recyclable paper/cardboard bin or bundle for local paper recycling kabadiwala.',
    safetyPrecautions: 'Keep dry. Wet cardboard cannot be recycled and rots.',
    environmentalImpact: 'Recycling 1 ton of cardboard saves 17 trees, 7000 gallons of water, and 4000 kWh of energy.',
    suggestedAction: 'Flatten and reuse for storage or send to paper mill recyclers.',
    canCompost: true,
    canRecycle: true,
    canReuse: true
  },
  {
    id: 'newspaper',
    name: 'Newspaper & Office Paper',
    aliases: ['papers', 'waste paper', 'magazine', 'notebook', 'xerox paper'],
    category: 'Dry/Recyclable',
    binColor: 'Blue',
    preparation: 'Remove plastic clips, binder spirals, or metallic pins. Stack flat.',
    recyclingPossibility: 'High (Newsprint, paper bags, egg cartons)',
    disposalMethod: 'Dry recyclable paper bin or scrap dealer.',
    safetyPrecautions: 'Keep free from food grease, oil, and moisture.',
    environmentalImpact: 'Significantly reduces deforestation and paper mill carbon footprint.',
    suggestedAction: 'Bundle and donate/sell to paper recyclers, or use for wrapping.',
    canCompost: true,
    canRecycle: true,
    canReuse: true
  },

  // E-waste
  {
    id: 'old-mobile-phone',
    name: 'Old Smartphone / Mobile Phone',
    aliases: ['smartphone', 'cellphone', 'iphone', 'android phone', 'old mobile'],
    category: 'E-waste',
    binColor: 'Brown/E-waste Bin',
    preparation: 'Backup personal data, perform factory reset, remove SIM & memory cards. Do not puncture the lithium battery.',
    recyclingPossibility: 'High (Contains precious metals: gold, copper, silver, palladium)',
    disposalMethod: 'Drop at authorized e-waste collection center, brand exchange program, or schedule an EcoSort e-waste pickup.',
    safetyPrecautions: 'Lithium battery risk: if swollen, do not compress, puncture, or heat. Store in cool, dry place.',
    environmentalImpact: 'Prevents toxic lead, mercury, and cadmium from leaching into groundwater aquifers.',
    suggestedAction: 'Consider repair/refurbishment, donation to students, or drop at certified e-waste bin.',
    canCompost: false,
    canRecycle: true,
    canReuse: true
  },
  {
    id: 'used-battery',
    name: 'Used Alkaline / Lithium Battery',
    aliases: ['battery', 'aa battery', 'aaa battery', 'laptop battery', 'powerbank'],
    category: 'E-waste',
    binColor: 'Red / E-waste Bin',
    preparation: 'Tape both terminals with non-conductive electrical tape to avoid accidental short circuits.',
    recyclingPossibility: 'High (Recovers zinc, nickel, cobalt, lithium, steel)',
    disposalMethod: 'Authorized battery drop box at electronics retailers or municipal e-waste kiosks. NEVER throw in household garbage.',
    safetyPrecautions: 'CRITICAL HAZARD: Corrosive electrolytes, heavy metals, fire hazard if crushed in garbage trucks.',
    environmentalImpact: 'A single AA battery can contaminate thousands of liters of groundwater if landfilled.',
    suggestedAction: 'Store in airtight plastic container until dropping at a designated battery depot.',
    canCompost: false,
    canRecycle: true,
    canReuse: false
  },
  {
    id: 'broken-laptop-charger',
    name: 'Broken Laptop / Phone Charger & Cables',
    aliases: ['charger', 'usb cable', 'power cord', 'headphones', 'adapter'],
    category: 'E-waste',
    binColor: 'Brown/E-waste Bin',
    preparation: 'Coil neatly. Keep metal pins intact.',
    recyclingPossibility: 'High (High-grade copper wiring and PVC insulation recovery)',
    disposalMethod: 'Drop off at designated e-waste drop-off bins or community e-waste collection drives.',
    safetyPrecautions: 'Do not use frayed cables connected to live AC current.',
    environmentalImpact: 'Conserves copper mining resources and prevents open-air wire burning.',
    suggestedAction: 'Repair with heat-shrink tubing if minor wire cut, or recycle via certified e-waste handler.',
    canCompost: false,
    canRecycle: true,
    canReuse: true
  },

  // Glass
  {
    id: 'broken-glass',
    name: 'Broken Glass Tumbler / Window Pane',
    aliases: ['broken glass', 'glass bottle broken', 'shattered glass', 'mirror shards'],
    category: 'Glass',
    binColor: 'Cyan/Blue with Hazard Warning',
    preparation: 'Carefully wrap tightly in multiple layers of old newspaper or place inside a sealed cardboard box. Clearly mark: "DANGER: BROKEN GLASS".',
    recyclingPossibility: 'Medium-High (Container glass is 100% recyclable; window/mirror plate glass has different melting points and requires separate stream)',
    disposalMethod: 'Wrapped in box and placed alongside dry waste with clear handwritten warning, or hand directly to sanitation worker.',
    safetyPrecautions: 'SEVERE INJURY HAZARD: Use thick gloves and broom/dustpan. Sanitation workers suffer severe lacerations when broken glass is hidden in regular bags.',
    environmentalImpact: 'Glass never decomposes in nature, taking over 1 million years. Recycling 1 ton saves 1.2 tons of raw materials.',
    suggestedAction: 'Safely wrap, label with red marker, and hand over with notification.',
    canCompost: false,
    canRecycle: true,
    canReuse: false
  },
  {
    id: 'glass-jar',
    name: 'Glass Jam / Pickle Jar',
    aliases: ['glass jar', 'pickle jar', 'honey jar', 'glass bottle'],
    category: 'Glass',
    binColor: 'Cyan/Blue',
    preparation: 'Wash clean, soak off label if feasible, separate metal or plastic lid.',
    recyclingPossibility: 'Very High (Glass is infinitely recyclable with zero loss in quality)',
    disposalMethod: 'Dry recyclable bin or glass recycling station.',
    safetyPrecautions: 'Check for chips or hairline cracks.',
    environmentalImpact: 'Recycling glass saves 30% energy compared to manufacturing from raw silica sand.',
    suggestedAction: 'Reuse as pantry storage container, spice shaker, or plant propagator.',
    canCompost: false,
    canRecycle: true,
    canReuse: true
  },

  // Metal
  {
    id: 'aluminum-can',
    name: 'Aluminum Beverage Can',
    aliases: ['soda can', 'beer can', 'tin can', 'coke can'],
    category: 'Metal',
    binColor: 'Grey/Blue',
    preparation: 'Rinse out sticky sweet residue, crush can flat.',
    recyclingPossibility: 'Infinite (Aluminum can be recycled back onto store shelves in as little as 60 days)',
    disposalMethod: 'Dry recyclable metal bin.',
    safetyPrecautions: 'Watch for sharp pull-tab edges.',
    environmentalImpact: 'Recycling aluminum uses 95% less energy than extracting virgin bauxite ore.',
    suggestedAction: 'Crush and sell/give to scrap metal collectors.',
    canCompost: false,
    canRecycle: true,
    canReuse: true
  },

  // Hazardous
  {
    id: 'paint-can-chemicals',
    name: 'Paint Thinner / Solvent / Pesticide Bottle',
    aliases: ['paint can', 'solvent', 'insecticide', 'pesticide', 'bleach', 'chemical container'],
    category: 'Hazardous waste',
    binColor: 'Red Hazardous Bin',
    preparation: 'Keep in original labeled container. Tighten cap securely. Do not pour chemicals down domestic drains or stormwater drains.',
    recyclingPossibility: 'Low (Must be neutralized in authorized hazardous waste treatment plants)',
    disposalMethod: 'Designated hazardous waste kiosk or municipal chemical disposal center.',
    safetyPrecautions: 'CRITICAL HAZARD: Toxic fumes, corrosive skin burn, inflammable. Wear rubber gloves and goggles.',
    environmentalImpact: 'Chemical runoff contaminates municipal sewage treatment microbes, rivers, and aquatic wildlife.',
    suggestedAction: 'Seal tightly and surrender to municipal hazardous waste disposal facility.',
    canCompost: false,
    canRecycle: false,
    canReuse: false
  },

  // Medical / Sanitary
  {
    id: 'sanitary-pads-diapers',
    name: 'Sanitary Pads, Tampons & Diapers',
    aliases: ['sanitary napkin', 'pad', 'diaper', 'pampers', 'baby diaper'],
    category: 'Medical/sanitary waste',
    binColor: 'Red / Incineration Stream',
    preparation: 'Wrap securely in newspaper or biodegradable disposal bag, mark with a red cross or "Sanitary Waste". NEVER flush down toilets.',
    recyclingPossibility: 'None (Biohazard)',
    disposalMethod: 'Separate sanitary waste bag for high-temperature biomedical incineration.',
    safetyPrecautions: 'BIOHAZARD: Pathogens and bloodborne viruses. Always wrap discreetly and hygienically for sanitation worker dignity.',
    environmentalImpact: 'Contains super-absorbent polymers and plastics that take up to 500 years to break down.',
    suggestedAction: 'Wrap with red mark and hand over in separate sanitary waste stream.',
    canCompost: false,
    canRecycle: false,
    canReuse: false
  },
  {
    id: 'medical-blister-packs-medicines',
    name: 'Expired Medicines & Blister Packs',
    aliases: ['expired tablets', 'medicine strips', 'syrup bottle', 'pills'],
    category: 'Medical/sanitary waste',
    binColor: 'Red Hazardous/Medical Bin',
    preparation: 'Keep tablets in foil strips. Do not crush or flush down toilets as pharmaceuticals enter water supply.',
    recyclingPossibility: 'Low-Medium (Specialized high-temperature incineration)',
    disposalMethod: 'Pharmacy drug take-back boxes or municipal domestic hazardous waste collection.',
    safetyPrecautions: 'Keep out of reach of children and domestic pets.',
    environmentalImpact: 'Flushed antibiotics foster antibiotic-resistant bacteria superbugs in municipal water systems.',
    suggestedAction: 'Take to participating pharmacy take-back collection point.',
    canCompost: false,
    canRecycle: false,
    canReuse: false
  },

  // Textile
  {
    id: 'old-clothes-textile',
    name: 'Old Clothes / Fabric Scraps',
    aliases: ['jeans', 't-shirt', 'bedsheet', 'curtains', 'old clothes', 'cotton shirt'],
    category: 'Textile',
    binColor: 'Purple / Textile Bin',
    preparation: 'Wash clean and dry. Check if still wearable before discarding.',
    recyclingPossibility: 'High (Wearable clothes can be donated; damaged cloth can be shredded into automotive insulation or wiping rags)',
    disposalMethod: 'Textile donation bank, clothing thrift drop-box, or dry textile stream.',
    safetyPrecautions: 'Ensure dry and mold-free.',
    environmentalImpact: 'Fast fashion creates massive water footprint; 1 cotton t-shirt requires 2,700 liters of water.',
    suggestedAction: 'Donate wearable items to local charities/shelters, or upcycle into tote bags or cleaning cloths.',
    canCompost: false,
    canRecycle: true,
    canReuse: true
  }
];

// Initial Realistic Community Reports
export const INITIAL_REPORTS = [
  {
    id: 'rep-101',
    category: 'Overflowing bins',
    title: 'Overflowing commercial waste bin near Metro Station',
    description: 'The community twin-bins on 100ft road are overflowing onto the pedestrian footpath. Wet food waste is attracting stray animals.',
    locality: 'Indiranagar 12th Main',
    city: 'Bengaluru',
    lat: 12.9784,
    lng: 77.6408,
    severity: 'High',
    status: 'In Progress',
    reportedBy: 'Kavya S.',
    reportedAt: '2026-10-06T09:30:00Z',
    upvotes: 14,
    imageUrl: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'rep-102',
    category: 'Garbage dumping',
    title: 'Illegal construction debris and mixed plastic dumping in open plot',
    description: 'Empty vacant plot near 5th Block park has multiple sacks of mixed plastic waste and dry debris dumped overnight.',
    locality: 'Koramangala 5th Block',
    city: 'Bengaluru',
    lat: 12.9352,
    lng: 77.6245,
    severity: 'High',
    status: 'Under Review',
    reportedBy: 'Arjun Verma',
    reportedAt: '2026-10-07T14:15:00Z',
    upvotes: 22,
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'rep-103',
    category: 'E-waste dumping',
    title: 'Abandoned CRT monitors and broken tube lights behind tech park',
    description: 'Someone dumped 4 old computer cathode ray monitors and discarded fluorescent tubes near the stormwater culvert.',
    locality: 'Whitefield Outer Ring Rd',
    city: 'Bengaluru',
    lat: 12.9698,
    lng: 77.7499,
    severity: 'Critical',
    status: 'Reported',
    reportedBy: 'Pooja Hegde',
    reportedAt: '2026-10-08T07:45:00Z',
    upvotes: 31,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'rep-104',
    category: 'Plastic accumulation',
    title: 'Single-use plastic cups and packaging clogged in roadside drain',
    description: 'Accumulation of plastic disposable cups from nearby food stalls blocking storm drain before monsoon showers.',
    locality: 'Malleshwaram 8th Cross',
    city: 'Bengaluru',
    lat: 13.0035,
    lng: 77.5711,
    severity: 'Medium',
    status: 'Resolved',
    resolvedAt: '2026-10-07T18:00:00Z',
    reportedBy: 'Ramesh Gowda',
    reportedAt: '2026-10-05T11:20:00Z',
    upvotes: 18,
    imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'rep-105',
    category: 'Blocked garbage collection points',
    title: 'Sanitation vehicle access blocked by parked commercial goods vehicle',
    description: 'Daily municipal collection auto-tippers are unable to reach the apartment community waste depot.',
    locality: 'HSR Layout Sector 2',
    city: 'Bengaluru',
    lat: 12.9121,
    lng: 77.6446,
    severity: 'Low',
    status: 'Resolved',
    resolvedAt: '2026-10-06T12:00:00Z',
    reportedBy: 'Ananya Roy',
    reportedAt: '2026-10-06T08:10:00Z',
    upvotes: 8,
    imageUrl: ''
  }
];

// Initial Collection Requests
export const INITIAL_COLLECTIONS = [
  {
    id: 'col-501',
    wasteType: 'E-waste (Computers, Batteries, Cables)',
    quantity: 'approx. 18 kg (2 cartons)',
    pickupArea: 'Indiranagar 4th Cross',
    preferredDate: '2026-10-10',
    contactName: 'Rohit Kulkarni',
    contactPhone: '+91 98450 12345',
    email: 'rohit.kulkarni@example.com',
    status: 'Assigned',
    provider: 'GreenClean Karnataka E-Recyclers (Reg. #KA-EW-291)',
    notes: 'Please pick up after 10 AM. Contains two dead laptops and battery packs.',
    createdAt: '2026-10-06T15:20:00Z'
  },
  {
    id: 'col-502',
    wasteType: 'Dry/Recyclable (Cardboard & Paper)',
    quantity: 'approx. 45 kg',
    pickupArea: 'RV College Hostel Campus, Mysuru Rd',
    preferredDate: '2026-10-11',
    contactName: 'Vikas Sharma (Student Eco Club)',
    contactPhone: '+91 97412 88990',
    email: 'ecoclub@rvce.edu',
    status: 'Pending',
    provider: 'Unassigned',
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
    provider: 'Hasiru Dala Community Recyclers',
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
    provider: 'Goonj Urban Outreach Partner',
    notes: 'Washed and folded clothing sorted by age category. Acknowledged by NGO.',
    createdAt: '2026-10-02T10:00:00Z'
  }
];

// Initial Impact Logs
export const INITIAL_IMPACT_LOGS = [
  { id: 'imp-1', user: 'Demo User', plasticKg: 3.5, paperKg: 12.0, eWasteKg: 2.1, organicKg: 15.0, date: '2026-10-05' },
  { id: 'imp-2', user: 'Demo User', plasticKg: 1.8, paperKg: 6.5, eWasteKg: 0.0, organicKg: 18.0, date: '2026-10-06' },
  { id: 'imp-3', user: 'Demo User', plasticKg: 2.2, paperKg: 8.0, eWasteKg: 1.5, organicKg: 14.5, date: '2026-10-07' }
];

// Gamification Data
export const INITIAL_GAMIFICATION = {
  userPoints: 460,
  userLevel: 'Eco Guardian (Level 3)',
  userBadges: [
    { id: 'b1', name: 'Segregation Specialist', icon: '🌱', description: 'Classified over 10 items accurately', unlocked: true, unlockedAt: '2026-10-03' },
    { id: 'b2', name: 'Compost Hero', icon: '🍂', description: 'Logged 25+ kg of organic composting', unlocked: true, unlockedAt: '2026-10-05' },
    { id: 'b3', name: 'Watchful Citizen', icon: '📍', description: 'Reported an active community waste hotspot', unlocked: true, unlockedAt: '2026-10-06' },
    { id: 'b4', name: 'Zero-E-Waste Champion', icon: '⚡', description: 'Safely recycled e-waste via authorized pickup', unlocked: false },
    { id: 'b5', name: 'Community Pillar', icon: '🏆', description: 'Helped resolve 5 community waste issues', unlocked: false }
  ],
  weeklyChallenges: [
    {
      id: 'wc-1',
      title: 'Zero Single-Use Plastic Week',
      description: 'Carry a reusable bottle and canvas tote bag for 7 consecutive days.',
      rewardPoints: 100,
      currentProgress: 5,
      targetProgress: 7,
      unit: 'days',
      completed: false,
      deadline: '2026-10-12'
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
      deadline: '2026-10-11'
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
      deadline: '2026-10-15'
    }
  ],
  individualLeaderboard: [
    { rank: 1, name: 'Sunita Raman', avatar: '🌿', locality: 'Koramangala', points: 1420, divertedKg: 185 },
    { rank: 2, name: 'Karthik Raja', avatar: '🚴', locality: 'Indiranagar', points: 1280, divertedKg: 162 },
    { rank: 3, name: 'Ananya Roy', avatar: '🍃', locality: 'HSR Layout', points: 950, divertedKg: 110 },
    { rank: 4, name: 'You (Demo User)', avatar: '🌱', locality: 'Malleshwaram', points: 460, divertedKg: 78.6 },
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
    title: '⚠️ Overflowing Bin Reported in Your Vicinity',
    message: 'High priority alert: Indiranagar 12th Main pedestrian bin has accumulated excess wet waste. Sanitation ward team notified.',
    type: 'warning',
    locality: 'Indiranagar',
    date: '2 hours ago',
    active: true
  },
  {
    id: 'alt-2',
    title: '⚡ Community E-Waste Drive This Saturday',
    message: 'Free authorized collection depot open from 9 AM to 4 PM at Koramangala BDA Complex. Bring dead batteries, laptops, and cables.',
    type: 'info',
    locality: 'Koramangala & HSR',
    date: 'Yesterday',
    active: true
  },
  {
    id: 'alt-3',
    title: '📊 Household Impact Alert: Plastic Reduction Trend',
    message: 'Great progress! Your household single-use plastic disposal is down 32% compared to last month. Keep up the segregation habits!',
    type: 'success',
    locality: 'Household',
    date: '3 days ago',
    active: true
  },
  {
    id: 'alt-4',
    title: '🎯 Community Target 85% Completed',
    message: 'Whitefield ward has diverted 4.2 tons of cardboard and PET bottles toward registered circular recyclers this quarter.',
    type: 'success',
    locality: 'Whitefield',
    date: '4 days ago',
    active: true
  }
];

// Helper to load or initialize DB
class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Error reading db.json, initializing defaults:', err.message);
    }
    const defaultData = {
      wasteItems: INITIAL_WASTE_ITEMS,
      reports: INITIAL_REPORTS,
      collections: INITIAL_COLLECTIONS,
      impactLogs: INITIAL_IMPACT_LOGS,
      gamification: INITIAL_GAMIFICATION,
      alerts: INITIAL_ALERTS
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
      reports: INITIAL_REPORTS,
      collections: INITIAL_COLLECTIONS,
      impactLogs: INITIAL_IMPACT_LOGS,
      gamification: INITIAL_GAMIFICATION,
      alerts: INITIAL_ALERTS
    };
    this.save();
    return this.data;
  }
}

export const db = new Database();

