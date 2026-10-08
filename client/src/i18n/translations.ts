import { LanguageCode } from '../types';

export interface Translations {
  appTitle: string;
  tagline: string;
  heroHeading: string;
  heroSubtitle: string;
  scanWaste: string;
  findDisposal: string;
  reportProblem: string;
  navHome: string;
  navScanner: string;
  navSearch: string;
  navSegregate: string;
  navImpact: string;
  navCollections: string;
  navReports: string;
  navChallenges: string;
  navEducation: string;
  navDashboard: string;
  navAdmin: string;
  ecoPoints: string;
  hackathonDemo: string;
  verifiedLocalities: string;
  divertedLandfill: string;
  co2Saved: string;
  hotspotsResolved: string;
  activeCitizens: string;
  searchPlaceholder: string;
  scannerTitle: string;
  scannerSubtitle: string;
  uploadPhoto: string;
  takePhoto: string;
  confidence: string;
  binColor: string;
  disposalMethod: string;
  environmentalImpact: string;
  safetyWarning: string;
  suggestedAction: string;
  canRecycle: string;
  canReuse: string;
  canCompost: string;
  confirmCategory: string;
  segregationTitle: string;
  segregationSubtitle: string;
  impactTitle: string;
  impactSubtitle: string;
  calculateImpact: string;
  logImpact: string;
  bookPickup: string;
  reportHotspot: string;
  leaderboard: string;
  adminPortal: string;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    appTitle: 'EcoSort AI',
    tagline: 'Smart Waste Management & Community Action',
    heroHeading: 'Turn Waste Into Action.',
    heroSubtitle: 'Identify. Segregate. Reuse. Recycle. Build a cleaner community.',
    scanWaste: 'Scan Waste',
    findDisposal: 'Find Disposal Method',
    reportProblem: 'Report Waste Problem',
    navHome: 'Home',
    navScanner: 'AI Scanner',
    navSearch: 'What to Do?',
    navSegregate: 'Segregation',
    navImpact: 'Eco Impact',
    navCollections: 'Pickups',
    navReports: 'Hotspot Map',
    navChallenges: 'Challenges',
    navEducation: 'Education Hub',
    navDashboard: 'Dashboard',
    navAdmin: 'Admin Area',
    ecoPoints: 'Eco Points',
    hackathonDemo: 'Hackathon Demo Mode',
    verifiedLocalities: 'Bengaluru Communities & Campuses',
    divertedLandfill: 'Waste Diverted',
    co2Saved: 'CO2e Prevented',
    hotspotsResolved: 'Hotspots Cleared',
    activeCitizens: 'Active Eco Champions',
    searchPlaceholder: 'Search any item: "banana peel", "old mobile", "broken glass"...',
    scannerTitle: 'AI Smart Waste Scanner',
    scannerSubtitle: 'Snap a picture or describe any waste item for instant segregation advice and safety guidance.',
    uploadPhoto: 'Upload Photo',
    takePhoto: 'Use Camera',
    confidence: 'AI Confidence',
    binColor: 'Designated Bin',
    disposalMethod: 'Correct Disposal',
    environmentalImpact: 'Environmental Impact',
    safetyWarning: 'Safety Warning',
    suggestedAction: 'Recommended Next Action',
    canRecycle: 'Recyclable',
    canReuse: 'Reusable',
    canCompost: 'Compostable',
    confirmCategory: 'Low confidence detected. Please confirm category:',
    segregationTitle: 'Smart Segregation Assistant',
    segregationSubtitle: 'Input mixed items from your home or college to generate instant color-coded sorting bins.',
    impactTitle: 'Eco Impact Calculator',
    impactSubtitle: 'Measure your personal or group contribution toward landfill diversion and carbon reduction.',
    calculateImpact: 'Calculate My Impact',
    logImpact: 'Log & Earn Eco Points',
    bookPickup: 'Book Special Collection',
    reportHotspot: 'Report Waste Hotspot',
    leaderboard: 'Eco Leaderboard',
    adminPortal: 'Municipal & Admin Portal'
  },
  kn: {
    appTitle: 'ಇಕೋಸಾರ್ಟ್ AI (EcoSort AI)',
    tagline: 'ಬುದ್ಧಿವಂತ ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ ಮತ್ತು ಸಮುದಾಯ ಕ್ರಮ',
    heroHeading: 'ತ್ಯಾಜ್ಯವನ್ನು ಸುಸ್ಥಿರ ಕ್ರಮವಾಗಿ ಪರಿವರ್ತಿಸಿ.',
    heroSubtitle: 'ಗುರುತಿಸಿ. ಬೇರ್ಪಡಿಸಿ. ಮರುಬಳಸಿ. ಮರುಬಳಕೆ ಮಾಡಿ. ಸ್ವಚ್ಛ ಸಮುದಾಯ ನಿರ್ಮಿಸಿ.',
    scanWaste: 'ತ್ಯಾಜ್ಯವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    findDisposal: 'ವಿಲೇವಾರಿ ವಿಧಾನ ಹುಡುಕಿ',
    reportProblem: 'ತ್ಯಾಜ್ಯ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ',
    navHome: 'ಮುಖಪುಟ',
    navScanner: 'AI ಸ್ಕ್ಯಾನರ್',
    navSearch: 'ಏನು ಮಾಡಬೇಕು?',
    navSegregate: 'ಬೇರ್ಪಡಿಸುವಿಕೆ',
    navImpact: 'ಪರಿಸರ ಪರಿಣಾಮ',
    navCollections: 'ಪಿಕಪ್ ವಿನಂತಿ',
    navReports: 'ಹಾಟ್‌ಸ್ಪಾಟ್ ನಕ್ಷೆ',
    navChallenges: 'ಸವಾಲುಗಳು',
    navEducation: 'ಶಿಕ್ಷಣ ಕೇಂದ್ರ',
    navDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    navAdmin: 'ನಿರ್ವಾಹಕ ಕೊಠಡಿ',
    ecoPoints: 'ಇಕೋ ಅಂಕಗಳು',
    hackathonDemo: 'ಹ್ಯಾಕಥಾನ್ ಡೆಮೊ ಮೋಡ್',
    verifiedLocalities: 'ಬೆಂಗಳೂರು ಸಮುದಾಯಗಳು ಮತ್ತು ಕ್ಯಾಂಪಸ್‌ಗಳು',
    divertedLandfill: 'ಭೂಕುಸಿತದಿಂದ ತಡೆದ ತ್ಯಾಜ್ಯ',
    co2Saved: 'CO2e ಉಳಿತಾಯ',
    hotspotsResolved: 'ಪರಿಹರಿಸಲಾದ ಸಮಸ್ಯೆಗಳು',
    activeCitizens: 'ಸಕ್ರಿಯ ಪರಿಸರ ರಕ್ಷಕರು',
    searchPlaceholder: 'ಯಾವುದೇ ವಸ್ತುವನ್ನು ಹುಡುಕಿ: "ಬಾಳೆಹಣ್ಣಿನ ಸಿಪ್ಪೆ", "ಹಳೆಯ ಮೊಬೈಲ್", "ಒಡೆದ ಗಾಜು"...',
    scannerTitle: 'AI ಬುದ್ಧಿವಂತ ತ್ಯಾಜ್ಯ ಸ್ಕ್ಯಾನರ್',
    scannerSubtitle: 'ತ್ವರಿತ ವಿಂಗಡಣೆ ಸಲಹೆ ಮತ್ತು ಸುರಕ್ಷತೆಗಾಗಿ ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ವಸ್ತುವನ್ನು ವಿವರಿಸಿ.',
    uploadPhoto: 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್',
    takePhoto: 'ಕ್ಯಾಮೆರಾ ಬಳಸಿ',
    confidence: 'AI ನಿಖರತೆ',
    binColor: 'ನಿಯೋಜಿತ ಕಸದಬುಟ್ಟಿ',
    disposalMethod: 'ಸರಿಯಾದ ವಿಲೇವಾರಿ ವಿಧಾನ',
    environmentalImpact: 'ಪರಿಸರ ಪ್ರಭಾವ',
    safetyWarning: 'ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ',
    suggestedAction: 'ಮುಂದಿನ ಕ್ರಮ',
    canRecycle: 'ಮರುಬಳಕೆ ಮಾಡಬಹುದು',
    canReuse: 'ಪುನರ್ಬಳಕೆ ಮಾಡಬಹುದು',
    canCompost: 'ಗೊಬ್ಬರವಾಗಿಸಬಹುದು',
    confirmCategory: 'ಕಡಿಮೆ ನಿಖರತೆ ಪತ್ತೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ವರ್ಗವನ್ನು ದೃಢೀಕರಿಸಿ:',
    segregationTitle: 'ಬುದ್ಧಿವಂತ ವಿಂಗಡಣೆ ಸಹಾಯಕ',
    segregationSubtitle: 'ನಿಮ್ಮ ಮನೆ ಅಥವಾ ಕಾಲೇಜಿನ ವಸ್ತುಗಳನ್ನು ನಮೂದಿಸಿ ಬಣ್ಣ-ಕೋಡೆಡ್ ತೊಟ್ಟಿಗಳಿಗೆ ವರ್ಗೀಕರಿಸಿ.',
    impactTitle: 'ಪರಿಸರ ಪ್ರಭಾವ ಕ್ಯಾಲ್ಕುಲೇಟರ್',
    impactSubtitle: 'ಕಾರ್ಬನ್ ಹೊರಸೂಸುವಿಕೆ ಕಡಿತಕ್ಕೆ ನಿಮ್ಮ ಕೊಡುಗೆಯನ್ನು ಅಂದಾಜು ಮಾಡಿ.',
    calculateImpact: 'ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ',
    logImpact: 'ದಾಖಲಿಸಿ ಮತ್ತು ಅಂಕಗಳನ್ನು ಗಳಿಸಿ',
    bookPickup: 'ವಿಶೇಷ ಪಿಕಪ್ ಬುಕ್ ಮಾಡಿ',
    reportHotspot: 'ತ್ಯಾಜ್ಯ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ',
    leaderboard: 'ಲೀಡರ್‌ಬೋರ್ಡ್',
    adminPortal: 'ಆಡಳಿತ ಮಂಡಳಿ ಪೋರ್ಟಲ್'
  },
  hi: {
    appTitle: 'इकोसॉर्ट AI (EcoSort AI)',
    tagline: 'स्मार्ट कचरा प्रबंधन एवं सामुदायिक पहल',
    heroHeading: 'कचरे को समाधान में बदलें।',
    heroSubtitle: 'पहचानें। अलग करें। पुनः उपयोग करें। रीसायकल करें। स्वच्छ समुदाय बनाएं।',
    scanWaste: 'कचरा स्कैन करें',
    findDisposal: 'निपटान विधि खोजें',
    reportProblem: 'कचरा समस्या रिपोर्ट करें',
    navHome: 'होम',
    navScanner: 'AI स्कैनर',
    navSearch: 'क्या करें?',
    navSegregate: 'कचरा पृथक्करण',
    navImpact: 'पर्यावरण प्रभाव',
    navCollections: 'पिकअप अनुरोध',
    navReports: 'हॉटस्पॉट मैप',
    navChallenges: 'इको चुनौतियां',
    navEducation: 'शिक्षा केंद्र',
    navDashboard: 'डैशबोर्ड',
    navAdmin: 'एडमिन पैनल',
    ecoPoints: 'इको पॉइंट्स',
    hackathonDemo: 'हैकाथॉन डेमो मोड',
    verifiedLocalities: 'बेंगलुरु समुदाय व कॉलेज परिसर',
    divertedLandfill: 'लैंडफिल से बचाया कचरा',
    co2Saved: 'CO2e बचत',
    hotspotsResolved: 'सुलझाई गई समस्याएं',
    activeCitizens: 'सक्रिय नागरिक',
    searchPlaceholder: 'कोई भी वस्तु खोजें: "केले का छिलका", "पुराना मोबाइल", "टूटा कांच"...',
    scannerTitle: 'AI स्मार्ट कचरा स्कैनर',
    scannerSubtitle: 'तुरंत सही डिब्बे और सुरक्षा सलाह के लिए फोटो अपलोड करें या वस्तु का नाम लिखें।',
    uploadPhoto: 'फोटो अपलोड करें',
    takePhoto: 'कैमरा उपयोग करें',
    confidence: 'AI सटीकता',
    binColor: 'निर्धारित कूड़ेदान',
    disposalMethod: 'सही निपटान विधि',
    environmentalImpact: 'पर्यावरणीय प्रभाव',
    safetyWarning: 'सुरक्षा चेतावनी',
    suggestedAction: 'अनुशंसित अगला कदम',
    canRecycle: 'रीसायकल योग्य',
    canReuse: 'पुनः उपयोग योग्य',
    canCompost: 'खाद योग्य',
    confirmCategory: 'कम सटीकता पाई गई। कृपया सही श्रेणी की पुष्टि करें:',
    segregationTitle: 'स्मार्ट पृथक्करण सहायक',
    segregationSubtitle: 'घर या कॉलेज के कचरे की सूची डालें और रंग-कोडित कूड़ेदानों में वर्गीकरण पाएं।',
    impactTitle: 'इको इम्पैक्ट कैलकुलेटर',
    impactSubtitle: 'पर्यावरण संरक्षण और कार्बन कटौती में अपने योगदान की गणना करें।',
    calculateImpact: 'गणना करें',
    logImpact: 'दर्ज करें और पॉइंट्स पाएं',
    bookPickup: 'स्पेशल पिकअप बुक करें',
    reportHotspot: 'कचरा डंपिंग रिपोर्ट करें',
    leaderboard: 'लीडरबोर्ड',
    adminPortal: 'प्रशासन पोर्टल'
  }
};

