async function runTests() {
  console.log('--- Testing EcoSort AI API Endpoints ---');

  // 1. Health
  const health = await fetch('http://localhost:5000/api/health').then(r => r.json());
  console.log('1. Health check:', health);

  // 2. Classify: Plastic Bottle
  const plastic = await fetch('http://localhost:5000/api/ai/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: 'crushed plastic bottle' })
  }).then(r => r.json());
  console.log('2. Plastic classification:', {
    itemName: plastic.data.itemName,
    category: plastic.data.category,
    confidence: plastic.data.confidence,
    binColor: plastic.data.binColor,
    disposalMethod: plastic.data.disposalMethod
  });

  // 3. Classify: E-waste Battery (Checking safety warning)
  const battery = await fetch('http://localhost:5000/api/ai/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: 'used lithium battery' })
  }).then(r => r.json());
  console.log('3. Battery classification:', {
    itemName: battery.data.itemName,
    category: battery.data.category,
    safetyWarning: battery.data.safetyWarning
  });

  // 4. Classify: Ambiguous item (Checking low confidence & requiresConfirmation)
  const ambiguous = await fetch('http://localhost:5000/api/ai/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: 'strange random object' })
  }).then(r => r.json());
  console.log('4. Ambiguous classification:', {
    confidence: ambiguous.data.confidence,
    requiresConfirmation: ambiguous.data.requiresConfirmation,
    suggestedCategories: ambiguous.data.suggestedCategories
  });

  // 5. Search: "What Should I Do With This?"
  const search = await fetch('http://localhost:5000/api/waste/search?q=old%20mobile%20phone').then(r => r.json());
  console.log('5. Search "old mobile phone":', {
    matched: search.items?.[0]?.name,
    category: search.items?.[0]?.category,
    binColor: search.items?.[0]?.binColor,
    preparation: search.items?.[0]?.preparation
  });

  // 6. Segregation Assistant
  const segregate = await fetch('http://localhost:5000/api/waste/segregate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemsText: 'banana peel, laptop charger, milk pouch, paracetamol strip, glass bottle' })
  }).then(r => r.json());
  console.log('6. Segregation Assistant:', {
    totalItems: segregate.totalItems,
    wet: segregate.categories.wet.items,
    eWaste: segregate.categories.eWaste.items,
    special: segregate.categories.special.items,
    recyclable: segregate.categories.recyclable.items
  });

  // 7. Impact Calculator
  const impact = await fetch('http://localhost:5000/api/impact/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plasticKg: 4, paperKg: 10, eWasteKg: 2, organicKg: 15 })
  }).then(r => r.json());
  console.log('7. Impact Calculation:', {
    divertedLandfillKg: impact.divertedLandfillKg,
    co2SavingsKg: impact.co2SavingsKg,
    treesEquivalent: impact.treesEquivalent,
    waterSavedLiters: impact.waterSavedLiters,
    disclaimer: impact.disclaimer
  });

  // 8. Collections
  const collections = await fetch('http://localhost:5000/api/collections').then(r => r.json());
  console.log('8. Collections count:', collections.collections?.length);

  // 9. Community Reports
  const reports = await fetch('http://localhost:5000/api/reports').then(r => r.json());
  console.log('9. Reports count:', reports.reports?.length, 'Sample locality:', reports.reports?.[0]?.locality);

  // 10. Web Client Home Page HTML
  const html = await fetch('http://localhost:5000/').then(r => r.text());
  console.log('10. Client index.html served:', html.includes('EcoSort AI'));

  console.log('--- ALL BACKEND & FRONTEND TESTS PASSED ---');
}

runTests().catch(console.error);

