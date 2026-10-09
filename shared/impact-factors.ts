/**
 * EcoSort AI - LCA Environmental Impact Factors
 * 
 * Sources:
 * - EPA Waste Reduction Model (WARM) v15 (2020)
 * - Intergovernmental Panel on Climate Change (IPCC) 2019 Refinement Guidelines
 * - Central Pollution Control Board (CPCB) India Guidelines for Circular Material Flows (2022)
 * - Defra UK Government GHG Conversion Factors for Company Reporting (2023)
 */

export interface LCAFactor {
  kgCO2ePerKg: number;
  waterLitersPerKg: number;
  kwhEnergyPerKg: number;
  treesSavedPerKg: number;
  source: string;
}

export const IMPACT_FACTORS: Record<'plastic' | 'paper' | 'eWaste' | 'organic', LCAFactor> = {
  // Plastic recycling avoids petrochemical cracking and incineration
  plastic: {
    kgCO2ePerKg: 1.50, // EPA WARM: Mixed plastics recycling emission offset ~1.50 kg CO2e / kg
    waterLitersPerKg: 24.0, // Plastic bottle wash and resin loop avoidance vs virgin synthesis
    kwhEnergyPerKg: 5.60, // Avoided naphtha extraction and high-pressure polymerization
    treesSavedPerKg: 0.0,
    source: 'EPA WARM v15 (Plastic recycling avoided fossil production)'
  },

  // Paper & Cardboard recycling avoids deforestation, pulping water, and bleaching energy
  paper: {
    kgCO2ePerKg: 0.90, // Defra / EPA WARM: Avoided kraft pulping and landfill methane
    waterLitersPerKg: 26.0, // Significant water savings vs virgin wood chemical pulping
    kwhEnergyPerKg: 4.10, // Avoided wood chipping and thermo-mechanical pulping
    treesSavedPerKg: 0.017, // ~17 mature trees saved per 1,000 kg of clean paper recycled
    source: 'CPCB / Defra UK Conversion Factors (Recycled corrugated board and newsprint)'
  },

  // E-waste recycling avoids carbon-intensive virgin open-cast ore mining (gold, copper, lithium)
  eWaste: {
    kgCO2ePerKg: 2.80, // UNEP / CPCB: Urban mining avoids heavy open-pit metal extraction
    waterLitersPerKg: 18.0, // Avoided hydrometallurgical ore flotation water consumption
    kwhEnergyPerKg: 14.20, // Smelting avoidance: copper, silver, lithium, and rare earths recovery
    treesSavedPerKg: 0.0,
    source: 'UNEP Global E-waste Monitor & CPCB Circular Electronics Protocols'
  },

  // Organic Waste composting prevents anaerobic decomposition producing CH4 (methane is 28x more potent than CO2)
  organic: {
    kgCO2ePerKg: 0.50, // IPCC 2019: Direct landfill diversion avoids fugitive anaerobic methane emissions
    waterLitersPerKg: 3.5, // Aerobic humus maintains topsoil water retention capacity
    kwhEnergyPerKg: 0.20, // Natural bacterial thermophilic decomposition
    treesSavedPerKg: 0.001, // Soil regeneration benefits
    source: 'IPCC Guidelines for National GHG Inventories (Waste Composting Chapter)'
  }
};

/**
 * Calculates environmental savings based on verified LCA factors.
 */
export function calculateLCAImpact(inputs: {
  plasticKg: number;
  paperKg: number;
  eWasteKg: number;
  organicKg: number;
}) {
  const plastic = Math.max(0, Math.min(100000, Number(inputs.plasticKg) || 0));
  const paper = Math.max(0, Math.min(100000, Number(inputs.paperKg) || 0));
  const eWaste = Math.max(0, Math.min(100000, Number(inputs.eWasteKg) || 0));
  const organic = Math.max(0, Math.min(100000, Number(inputs.organicKg) || 0));

  const divertedLandfillKg = +(plastic + paper + eWaste + organic).toFixed(2);

  const co2SavingsKg = +(
    plastic * IMPACT_FACTORS.plastic.kgCO2ePerKg +
    paper * IMPACT_FACTORS.paper.kgCO2ePerKg +
    eWaste * IMPACT_FACTORS.eWaste.kgCO2ePerKg +
    organic * IMPACT_FACTORS.organic.kgCO2ePerKg
  ).toFixed(2);

  const waterSavedLiters = Math.round(
    plastic * IMPACT_FACTORS.plastic.waterLitersPerKg +
    paper * IMPACT_FACTORS.paper.waterLitersPerKg +
    eWaste * IMPACT_FACTORS.eWaste.waterLitersPerKg +
    organic * IMPACT_FACTORS.organic.waterLitersPerKg
  );

  const kwhEnergySaved = +(
    plastic * IMPACT_FACTORS.plastic.kwhEnergyPerKg +
    paper * IMPACT_FACTORS.paper.kwhEnergyPerKg +
    eWaste * IMPACT_FACTORS.eWaste.kwhEnergyPerKg +
    organic * IMPACT_FACTORS.organic.kwhEnergyPerKg
  ).toFixed(1);

  const treesEquivalent = +(
    paper * IMPACT_FACTORS.paper.treesSavedPerKg +
    organic * IMPACT_FACTORS.organic.treesSavedPerKg
  ).toFixed(3);

  return {
    divertedLandfillKg,
    co2SavingsKg,
    treesEquivalent,
    waterSavedLiters,
    kwhEnergySaved,
    breakdown: {
      plasticKg: plastic,
      paperKg: paper,
      eWasteKg: eWaste,
      organicKg: organic
    },
    factors: IMPACT_FACTORS,
    disclaimer:
      'ESTIMATE: Figures represent approximate avoided emissions and virgin resource savings based on standard Life Cycle Assessment (LCA) coefficients. Actual municipal net figures depend on local grid emission factors and recycling plant distances.'
  };
}

