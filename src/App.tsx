/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Home, 
  Heart, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ExternalLink,
  Loader2,
  Trash2,
  Info,
  MessageSquare,
  BadgeIndianRupee,
  Calendar,
  Building2,
  Stethoscope,
  Wheat,
  ShoppingBag,
  ShieldCheck,
  PersonStanding,
  Lightbulb,
  Droplets,
  Plane
} from 'lucide-react';
import { CitizenProfile, Scheme, SchemeCategory, ChatMessage, SupportedLanguage } from './types';
import { checkEligibility, getApplyHelp } from './services/geminiService';

const INITIAL_PROFILE: CitizenProfile = {
  age: '',
  gender: 'Male',
  state: 'Delhi',
  residence: 'Urban',
  caste: 'General',
  income: '',
  occupation: '',
  marital: 'Not Married',
  children: '0',
  land: 'None',
  education: 'None',
  pregnant: false,
  student: false,
  disability: false,
  senior: false,
  ration: false,
  bpl: false,
  entrepreneur: false,
  house: false,
  health: false,
  pension: false,
  skill: false,
  sanitation: false,
};

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const CASTES = ["General", "OBC", "SC", "ST", "Minority", "EWS"];

const CATEGORY_ICONS: Record<SchemeCategory, React.ElementType> = {
  Health: Stethoscope,
  Housing: Home,
  Farming: Wheat,
  Business: ShoppingBag,
  Student: GraduationCap,
  Insurance: ShieldCheck,
  Employment: Briefcase,
  Pension: Calendar,
  Sanitation: Droplets,
  Energy: Lightbulb,
  Financial: BadgeIndianRupee,
  Skill: Info,
  Disability: PersonStanding
};

const TRANSLATIONS = {
  EN: {
    heroTitle: "Unlock the benefits you're entitled to receive.",
    heroSub: "Fill in your details and our AI will scan thousands of state and central schemes to find your perfect match.",
    nextStep: "Next Step",
    prevStep: "Back",
    findSchemes: "Find Matched Schemes",
    matchedSchemes: "Matched Schemes",
    found: "Found",
    programs: "programs you are likely eligible for.",
    startOver: "Start Over",
    downloadReport: "Download Report",
    whyQualify: "Why you qualify",
    howToApply: "How to apply",
    docsNeeded: "Required Documents",
    visitPortal: "Visit Official Portal",
    askHelp: "Ask for help applying",
    noMatches: "No direct matches found in this category.",
    notEligibleTitle: "Currently Not Eligible",
    notEligibleDesc: "Based on the details provided, we couldn't find any major schemes that match your profile accurately. Try updating your profile with more specific details.",
    insufficientDetailsTitle: "Details Not Satisfying",
    insufficientDetailsDesc: "The information provided is too sparse for a meaningful eligibility check. Please select at least one specific situation or provide more socio-economic details.",
    allCategories: "All Categories",
    updateProfile: "Update Profile",
    loadingDemographics: "Analyzing your demographic data...",
    loadingDatabases: "Scanning all Ministry databases...",
    loadingCriteria: "Verifying income and occupation criteria...",
    loadingLatest: "Matching you with the latest schemes...",
    loadingPersonalized: "Generating personalized application steps...",
    editProfile: "Back to Profile",
    strongMatch: "Strong Match",
    eligible: "Eligible",
    notEligible: "Not Eligible",
    eligibilityStatus: "Eligibility Status",
    benefit: "Benefit",
    finalDetails: "Final Details",
    working: "Our AI expert is working his magic...",
    backToForm: "Go Back to Form",
    assistantTitle: "Application Assistant",
    assistantSub: "Hello! I'm your AI assistant. How can I help you?",
    assistantPlaceholder: "Ask for guidance...",
    generalAssistantTitle: "Yojana Scout AI Assistant",
    generalAssistantWelcome: "Hello! I'm your Yojana Scout assistant. Ask me anything about Indian government schemes, eligibility, or how to apply for benefits based on your profile.",
    details: "Personal Details",
    criteria: "Income & Occupation",
    situations: "Specific Situations",
    howItWorks: "How it works",
    ministries: "Ministries",
    contact: "Contact",
    step1Title: "1. Create Profile",
    step1Desc: "Fill in your demographic and socio-economic details to help our AI understand your unique context.",
    step2Title: "2. AI Analysis",
    step2Desc: "Our intelligent engine scans thousands of central and state schemes against your specific eligibility criteria.",
    step3Title: "3. Direct Application",
    step3Desc: "Get a personalized list with clear steps, required documents, and direct links to official portals.",
    ministryDesc: "We aggregate schemes from over 50+ central ministries and all state governments.",
    contactDesc: "Need help? Reach out to our technical team for assistance with the scout engine.",
    supportEmail: "support@yojanascout.gov.in"
  },
  HI: {
    heroTitle: "उन लाभों को अनलॉक करें जिनके आप हकदार हैं।",
    heroSub: "अपना विवरण भरें और हमारा एआई आपकी सही मैच खोजने के लिए हजारों राज्य और केंद्रीय योजनाओं को स्कैन करेगा।",
    nextStep: "अगला कदम",
    prevStep: "पीछे",
    findSchemes: "मिलती हुई योजनाएं खोजें",
    matchedSchemes: "मैच हुई योजनाएं",
    found: "मिले",
    programs: "योजनाएं जिनमें आप पात्र हो सकते हैं।",
    startOver: "फिर से शुरू करें",
    downloadReport: "रिपोर्ट डाउनलोड करें",
    whyQualify: "आप क्यों योग्य हैं",
    howToApply: "आवेदन कैसे करें",
    docsNeeded: "आवश्यक दस्तावेज़",
    visitPortal: "आधिकारिक पोर्टल पर जाएं",
    askHelp: "आवेदन में मदद मांगें",
    noMatches: "इस श्रेणी में कोई सीधा मैच नहीं मिला।",
    notEligibleTitle: "वर्तमान में पात्र नहीं",
    notEligibleDesc: "दिए गए विवरणों के आधार पर, हमें आपकी प्रोफ़ाइल से पूरी तरह मेल खाने वाली कोई प्रमुख योजना नहीं मिली। अधिक विशिष्ट विवरणों के साथ अपनी प्रोफ़ाइल अपडेट करने का प्रयास करें।",
    insufficientDetailsTitle: "विवरण संतोषजनक नहीं हैं",
    insufficientDetailsDesc: "प्रदान की गई जानकारी सार्थक पात्रता जांच کے لیے بہت کم ہے۔ براہ کرم کم از کم ایک مخصوص صورتحال منتخب کریں یا مزید سماجی و اقتصادی تفصیلات فراہم کریں۔",
    allCategories: "सभी श्रेणियां",
    updateProfile: "प्रोफ़ाइल अपडेट करें",
    loadingDemographics: "आपके जनसांख्यिकीय डेटा का विश्लेषण कर रहे हैं...",
    loadingDatabases: "सभी मंत्रालय डेटाबेस को स्कैन कर रहे हैं...",
    loadingCriteria: "आय और व्यवसाय मानदंडों की पुष्टि कर रहे हैं...",
    loadingLatest: "आपको नवीनतम योजनाओं से मिला रहे हैं...",
    loadingPersonalized: "व्यक्तिगत आवेदन चरणों को तैयार किया जा रहा है...",
    eligibilityStatus: "पात्रता स्थिति",
    notEligible: "पात्र नहीं",
    editProfile: "प्रोफ़ाइल पर वापस जाएं",
    strongMatch: "मजबूत मैच",
    eligible: "योग्य",
    benefit: "लाभ",
    finalDetails: "अंतिम विवरण",
    working: "हमारा AI विशेषज्ञ काम कर रहा है...",
    backToForm: "फॉर्म पर वापस जाएं",
    assistantTitle: "आवेदन सहायक",
    assistantSub: "नमस्ते! मैं आपका AI सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
    assistantPlaceholder: "मार्गदर्शन मांगें...",
    generalAssistantTitle: "योजना स्काउट एआई सहायक",
    generalAssistantWelcome: "नमस्ते! मैं आपका योजना स्काउट सहायक हूँ। मुझसे भारतीय सरकारी योजनाओं, पात्रता, या आपके प्रोफ़ाइल के आधार पर लाभों के लिए आवेदन करने के बारे में कुछ भी पूछें।",
    details: "व्यक्तिगत विवरण",
    criteria: "आय और व्यवसाय",
    situations: "विशिष्ट स्थितियां",
    howItWorks: "यह कैसे काम करता है",
    ministries: "मंत्रालय",
    contact: "संपर्क",
    step1Title: "1. प्रोफ़ाइल बनाएं",
    step1Desc: "हमारे AI को आपके अद्वितीय संदर्भ को समझने में मदद करने के लिए अपना जनसांख्यिकीय और सामाजिक-आर्थिक विवरण भरें।",
    step2Title: "2. एआई विश्लेषण",
    step2Desc: "हमारा स्मार्ट इंजन आपके विशिष्ट पात्रता मानदंडों के आधार पर हजारों केंद्रीय और राज्य योजनाओं को स्कैन करता है।",
    step3Title: "3. सीधा आवेदन",
    step3Desc: "स्पष्ट चरणों, आवश्यक दस्तावेजों और आधिकारिक पोर्टलों के सीधे लिंक के साथ एक व्यक्तिगत सूची प्राप्त करें।",
    ministryDesc: "हम 50+ केंद्रीय मंत्रालयों और सभी राज्य सरकारों की योजनाओं को एकत्रित करते हैं।",
    contactDesc: "मदद चाहिए? स्काउट इंजन के साथ सहायता के लिए हमारी तकनीकी टीम से संपर्क करें।",
    supportEmail: "support@yojanascout.gov.in"
  },
  KN: {
    heroTitle: "ನಿಮಗೆ ಅರ್ಹತೆಯಿರುವ ಸೌಲಭ್ಯಗಳನ್ನು ಅನ್ಲಾಕ್ ಮಾಡಿ.",
    heroSub: "ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ ಮತ್ತು ನಮ್ಮ ಎಐ ಸಾವಿರಾರು ರಾಜ್ಯ ಮತ್ತು केंद्रीय ಯೋಜನೆಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ನಿಮಗಾಗಿ ಸೂಕ್ತವಾದದ್ದನ್ನು ಹುಡುಕುತ್ತದೆ.",
    nextStep: "ಮುಂದಿನ ಹಂತ",
    prevStep: "ಹಿಂದೆ",
    findSchemes: "ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ",
    matchedSchemes: "ಹೊಂದಾಣಿಕೆಯ ಯೋಜನೆಗಳು",
    found: "ಸಿಕ್ಕಿವೆ",
    programs: "ನೀವು ಅರ್ಹರಾಗಬಹುದಾದ ಕಾರ್ಯಕ್ರಮಗಳು.",
    startOver: "ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ",
    downloadReport: "ವರದಿ ಡೌನ್ಲೋಡ್ ಮಾಡಿ",
    whyQualify: "ನೀವು ಯಾಕೆ ಅರ್ಹರು",
    howToApply: "ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ",
    docsNeeded: "ಅಗತ್ಯ ದಾಖಲೆಗಳು",
    visitPortal: "ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗೆ ಭೇಟಿ ನೀಡಿ",
    askHelp: "ಸಹಾಯ ಕೇಳಿ",
    noMatches: "ಈ ವರ್ಗದಲ್ಲಿ ಯಾವುದೇ ನೇರ ಹೊಂದಾಣಿಕೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    notEligibleTitle: "ಪ್ರಸ್ತುત ಅರ್ಹರಲ್ಲ",
    notEligibleDesc: "ನೀವು ನೀಡಿದ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ, ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ನಿಖರವಾಗಿ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ಪ್ರಮುಖ ಯೋಜನೆಗಳನ್ನು ನಾವು ಕಂಡುಹಿಡಿಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಹೆಚ್ಚಿನ ವಿವರಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಅನ್ನು ನವೀಕರಿಸಲು ಪ್ರಯತ್ನಿಸಿ.",
    insufficientDetailsTitle: "ವಿವರಗಳು ತೃಪ್ತಿಕರವಾಗಿಲ್ಲ",
    insufficientDetailsDesc: "ಒದಗಿಸಿದ ಮಾಹಿತಿಯು ಅರ್ಥಪೂರ್ಣ ಅರ್ಹತಾ ಪರಿಶೀಲನೆಗಾಗಿ ತುಂಬಾ ವಿರಳವಾಗಿದೆ. ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ನಿರ್ದಿಷ್ಟ ಸನ್ನಿವೇಶವನ್ನು ಆಯ್কেಮಾಡಿ ಅಥವಾ ಹೆಚ್ಚಿನ ಸಾಮಾಜಿಕ-ಆರ್ಥಿಕ ವಿವರಗಳನ್ನು ಒದಗಿಸಿ.",
    allCategories: "ಎಲ್ಲಾ ವರ್ಗಗಳು",
    updateProfile: "ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ",
    loadingDemographics: "ನಿಮ್ಮ ಭೌಗೋಳಿಕ ಡೇಟಾವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    loadingDatabases: "ಎಲ್ಲಾ ಸಚಿವಾಲಯದ ಡೇಟಾಬೇಸ್‌ಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    loadingCriteria: "ಆದಾಯ ಮತ್ತು ಉದ್ಯೋಗ ಮಾನದಂಡಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    loadingLatest: "ಇತ್ತೀಚಿನ ಯೋಜನೆಗಳೊಂದಿಗೆ ನಿಮ್ಮನ್ನು ಹೊಂದಿಸಲಾಗುತ್ತಿದೆ...",
    loadingPersonalized: "ವೈಯಿಕಗೊಳಿಸಿದ ಅರ್ಜಿ ಹಂತಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...",
    editProfile: "ಪ್ರೊಫೈಲ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    eligibilityStatus: "ಅರ್ಹತೆಯ ಸ್ಥಿತಿ",
    notEligible: "ಅರ್ಹತೆಯಿಲ್ಲ",
    strongMatch: "ಬಲವಾದ ಹೊಂದಾಣಿಕೆ",
    eligible: "ಅರ್ಹ",
    benefit: "ಪ್ರಯೋಜನ",
    finalDetails: "ಅಂತಿಮ ವಿವರಗಳು",
    working: "ನಮ್ಮ ಎಐ ತಜ್ಞ ಕೆಲಸ ಮಾಡುತ್ತಿದ್ದಾರೆ...",
    backToForm: "ಫಾರ್ಮ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    assistantTitle: "ಅರ್ಜಿ ಸಹಾಯಕ",
    assistantSub: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಎಐ ಸಹಾಯಕ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    assistantPlaceholder: "ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಕೇಳಿ...",
    generalAssistantTitle: "ಯೋಜನಾ ಸ್ಕೌಟ್ ಎಐ ಸಹಾಯಕ",
    generalAssistantWelcome: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಯೋಜನಾ ಸ್ಕೌಟ್ ಸಹಾಯಕ. ಭಾರತೀಯ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಅರ್ಹತೆ ಅಥವಾ ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಆಧರಿಸಿ ಸೌಲಭ್ಯಗಳಿಗೆ ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬೇಕು ಎಂಬುದರ ಕುರಿತು ನನ್ನನ್ನು ಏನು ಬೇಕಾದರೂ ಕೇಳಿ.",
    details: "ವೈಯಕ್ತಿಕ ವಿವರಗಳು",
    criteria: "ಆದಾಯ ಮತ್ತು ಉದ್ಯೋಗ",
    situations: "ನಿರ್ದಿಷ್ಟ ಸಂದರ್ಭಗಳು",
    howItWorks: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
    ministries: "ಸಚಿವಾಲಯಗಳು",
    contact: "ಸಂಪರ್ಕ",
    step1Title: "1. ಪ್ರೊಫೈಲ್ ರಚಿಸಿ",
    step1Desc: "ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.",
    step2Title: "2. ಎಐ ವಿಶ್ಲೇಷಣೆ",
    step2Desc: "ನಮ್ಮ ಎಂಜಿನ್ ಸಚಿವಾಲಯದ ಡೇಟಾಬೇಸ್‌ಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡುತ್ತದೆ.",
    step3Title: "3. ನೇರ ಅರ್ಜಿ",
    step3Desc: "ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಹಂತಗಳನ್ನು ಪಡೆಯಿರಿ.",
    ministryDesc: "ನಾವು 50+ ಸಚಿವಾಲಯಗಳಿಂದ ಯೋಜನೆಗಳನ್ನು ಒಟ್ಟುಗೂಡಿಸುತ್ತೇವೆ.",
    contactDesc: "ಸಹಾಯ ಬೇಕೇ? ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    supportEmail: "support@yojanascout.gov.in"
  },
  BN: {
    heroTitle: "আপনার প্রাপ্য সুবিধাগুলি আনলক করুন।",
    heroSub: "আপনার বিবরণ পূরণ করুন এবং আমাদের AI আপনার জন্য নিখুঁত ম্যাচ খুঁজে পেতে হাজার হাজার রাজ্য এবং কেন্দ্রীয় স্কিম স্ক্যান করবে।",
    nextStep: "পরবর্তী পদক্ষেপ",
    prevStep: "পিছনে",
    findSchemes: "ম্যাচ করা স্কিম খুঁজুন",
    matchedSchemes: "ম্যাচ করা স্কিম",
    found: "পাওয়া গেছে",
    programs: "প্রকল্প যাতে আপনি যোগ্য হতে পারেন।",
    startOver: "আবার শুরু করুন",
    downloadReport: "রিপোর্ট ডাউনলোড করুন",
    whyQualify: "আপনি কেন যোগ্য",
    howToApply: "কিভাবে আবেদন করতে হবে",
    docsNeeded: "প্রয়োজনীয় কাগজপত্র",
    visitPortal: "অফিসিয়াল পোর্টালে যান",
    askHelp: "আবেদনের জন্য সাহায্য চান",
    noMatches: "এই বিভাগে সরাসরি কোন ম্যাচ পাওয়া যায়নি।",
    notEligibleTitle: "বর্তমানে যোগ্য নয়",
    notEligibleDesc: "প্রদত্ত বিবরণের ভিত্তিতে, আমরা আপনার প্রোফাইলের সাথে সঠিকভাবে মেলে এমন কোন প্রধান স্কিম খুঁজে পাইনি। আরও নির্দিষ্ট বিবরণ সহ আপনার প্রোফাইল আপডেট করার চেষ্টা করুন।",
    insufficientDetailsTitle: "বিবরণ সন্তোষজনক নয়",
    insufficientDetailsDesc: "প্রদত্ত তথ্য একটি অর্থবহ যোগ্যতা যাচাইয়ের জন্য খুব কম। দয়া করে অন্তত একটি নির্দিষ্ট পরিস্থিতি নির্বাচন করুন বা আরও আর্থ-সামাজিক বিবরণ প্রদান করুন।",
    allCategories: "সমস্ত বিভাগ",
    updateProfile: "প্রোফাইল আপডেট করুন",
    loadingDemographics: "আপনার জনসাंख्यিকীয় তথ্য বিশ্লেষণ করা হচ্ছে...",
    loadingDatabases: "সমস্ত মন্ত্রকের ডেটাবেস স্ক্যান করা হচ্ছে...",
    loadingCriteria: "আয় এবং বৃত্তির মানদণ্ড যাচাই করা হচ্ছে...",
    loadingLatest: "আপনাকে সর্বশেষ প্রকল্পের সাথে মেলানো হচ্ছে...",
    loadingPersonalized: "ব্যক্তিগত আবেদন পদক্ষেপ তৈরি করা হচ্ছে...",
    eligibilityStatus: "যোগ্যতার স্থিতি",
    notEligible: "যোগ্য নয়",
    editProfile: "প্রোফাইলে ফিরে যান",
    strongMatch: "শক্তিশালী মিল",
    eligible: "যোগ্য",
    benefit: "সুবিধা",
    finalDetails: "চূড়ান্ত বিবরণ",
    working: "আমাদের AI বিশেষজ্ঞ কাজ করছেন...",
    backToForm: "ফর্মে ফিরে যান",
    assistantTitle: "আবেদন সহকারী",
    assistantSub: "হ্যালো! আমি আপনার AI সহকারী। আমি আপনাকে কিভাবে সাহায্য করতে পারি?",
    assistantPlaceholder: "সাহায্যের জন্য জিজ্ঞাসা করুন...",
    generalAssistantTitle: "যোজনা স্কাউট এআই সহকারী",
    generalAssistantWelcome: "হ্যালো! আমি আপনার যোজনা স্কাউট সহকারী। ভারতীয় সরকারি প্রকল্প, যোগ্যতা বা আপনার প্রোফাইলের ভিত্তিতে সুবিধার জন্য কীভাবে আবেদন করবেন সে সম্পর্কে আমাকে যেকোনো কিছু জিজ্ঞাসা করুন।",
    details: "ব্যক্তিগত বিবরণ",
    criteria: "আয় এবং পেশা",
    situations: "নির্দিষ্ট পরিস্থিতি",
    howItWorks: "কিভাবে এটা কাজ করে",
    ministries: "মন্ত্রণালয়",
    contact: "যোগাযোগ",
    step1Title: "১. প্রোফাইল তৈরি করুন",
    step1Desc: "আপনার বিবরণ পূরণ করুন।",
    step2Title: "২. এআই বিশ্লেষণ",
    step2Desc: "আমাদের ইঞ্জিন মন্ত্রণালয়ের ডেটাবেস স্ক্যান করে।",
    step3Title: "৩. সরাসরি আবেদন",
    step3Desc: "ব্যক্তিগতকৃত পদক্ষেপ পান।",
    ministryDesc: "আমরা ৫০+ মন্ত্রণালয়ের স্কিম সংগ্রহ করি।",
    contactDesc: "সাহায্য প্রয়োজন? আমাদের সাথে যোগাযোগ করুন।",
    supportEmail: "support@yojanascout.gov.in"
  },
  GU: {
    heroTitle: "તમને મળવાપાત્ર લાભો મેળવો.",
    heroSub: "તમારી વિગતો ભરો અને આપણું AI તમારા માટે યોગ્ય યોજના શોધવા માટે હજારો રાજ્ય અને કેન્દ્રીય યોજનાઓ સ્કેન કરશે.",
    nextStep: "આગળનું પગલું",
    prevStep: "પાછળ",
    findSchemes: "મેળ ખાતી યોજનાઓ શોધો",
    matchedSchemes: "મેળ ખાતી યોજનાઓ",
    found: "મળી",
    programs: "યોજનાઓ જેના માટે તમે કદાચ પાત્ર છો.",
    startOver: "ફરીથી શરૂ કરો",
    downloadReport: "રિપોર્ટ ડાઉનલોડ કરો",
    whyQualify: "તમે કેમ પાત્ર છો",
    howToApply: "કેવી રીતે અરજી કરવી",
    docsNeeded: "જરૂરી દસ્તાવેજો",
    visitPortal: "સત્તાવાર પોર્ટલની મુલાકાત લો",
    askHelp: "અરજીમાં મદદ માંગો",
    noMatches: "આ શ્રેણીમાં કોઈ સીધો મેળ મળ્યો નથી.",
    allCategories: "બધી શ્રેણીઓ",
    updateProfile: "પ્રોફાઇલ અપડેટ કરો",
    loadingDemographics: "તમારા ડેમોગ્રાફિક ડેટાનું વિશ્લેષણ કરી રહ્યા છીએ...",
    loadingDatabases: "તમામ મંત્રાલય ડેટાબેઝ સ્કેન કરી રહ્યા છીએ...",
    loadingCriteria: "આવક અને વ્યવસાયના માપદંડો ચકાસી રહ્યા છીએ...",
    loadingLatest: "તમને નવીનતમ યોજનાઓ સાથે મેળવી રહ્યા છીએ...",
    loadingPersonalized: "વ્યક્તિગત અરજીના સ્ટેપ્સ તૈયાર કરી રહ્યા છીએ...",
    editProfile: "પ્રોફાઇલ પર પાછા જાઓ",
    strongMatch: "મજબૂત મેળ",
    eligible: "પાત્ર",
    benefit: "લાભ",
    finalDetails: "અંતિમ વિગતો",
    working: "આપણું AI નિષ્ણાત કામ કરી રહ્યા છે...",
    backToForm: "ફોર્મ પર પાછા જાઓ",
    assistantTitle: "અરજી સહાયક",
    assistantSub: "નમસ્તે! હું તમારો AI સહાયક છું. હું તમને કેવી રીતે મદદ કરી શકું?",
    assistantPlaceholder: "માર્ગદર્શન માટે પૂછો...",
    generalAssistantTitle: "યોજના સ્કાઉટ AI સહાયક",
    generalAssistantWelcome: "નમસ્તે! હું તમારો યોજના સ્કાઉટ સહાયક છું. ભારતીય સરકારી યોજનાઓ, પાત્રતા અથવા તમારી પ્રોફાઇલના આધારે લાભો માટે કેવી રીતે અરજી કરવી તે વિશે મને કંઈપણ પૂછો.",
    details: "વ્યક્તિગત વિગતો",
    criteria: "આવક અને વ્યવસાય",
    situations: "વિશિષ્ટ પરિસ્થિતિઓ",
    howItWorks: "કેવી રીતે કામ કરે છે",
    ministries: "મંત્રાલયો",
    contact: "સંપર્ક",
    step1Title: "1. પ્રોફાઇલ બનાવો",
    step1Desc: "તમારી વિગતો ભરો.",
    step2Title: "2. AI વિશ્લેષણ",
    step2Desc: "અમારું એન્જિન મંત્રાલય ડેટાબેસેસ સ્કેન કરે છે.",
    step3Title: "3. સીધી અરજી",
    step3Desc: "વ્યક્તિગત પગલાં મેળવો.",
    ministryDesc: "અમે 50+ મંત્રાલયોની યોજનાઓ એકત્રિત કરીએ છીએ.",
    contactDesc: "મદદ જોઈએ છે? અમારો સંપર્ક કરો.",
    supportEmail: "support@yojanascout.gov.in"
  },
  ML: {
    heroTitle: "നിങ്ങൾക്ക് അർഹമായ ആനുകൂല്യങ്ങൾ നേടുക.",
    heroSub: "നിങ്ങളുടെ വിവരങ്ങൾ നൽകുക, ആയിരക്കണക്കിന് സംസ്ഥാന-കേന്ദ്ര പദ്ധതികൾ സ്കാൻ ചെയ്ത് ഞങ്ങളുടെ AI നിങ്ങൾക്ക് അനുയോജ്യമായവ കണ്ടെത്തും.",
    nextStep: "അടുത്ത ഘട്ടം",
    prevStep: "പുറകോട്ട്",
    findSchemes: "യോജിച്ച പദ്ധതികൾ കണ്ടെത്തുക",
    matchedSchemes: "കണ്ടെത്തിയ പദ്ധതികൾ",
    found: "കണ്ടെത്തി",
    programs: "നിങ്ങൾക്ക് അർഹതയുണ്ടായേക്കാവുന്ന പദ്ധതികൾ.",
    startOver: "വീണ്ടും തുടങ്ങുക",
    downloadReport: "റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക",
    whyQualify: "എന്തുകൊണ്ട് നിങ്ങൾ അർഹനാണ്",
    howToApply: "എങ്ങനെ അപേക്ഷിക്കാം",
    docsNeeded: "ആവശ്യമായ രേഖകൾ",
    visitPortal: "ഔദ്യോഗിക പോർട്ടൽ സന്ദർശിക്കുക",
    askHelp: "അപേക്ഷിക്കാൻ സഹായം ചോദിക്കുക",
    noMatches: "ഈ വിഭാഗത്തിൽ നേരിട്ടുള്ള ഫലങ്ങളൊന്നും ലഭ്യമല്ല.",
    allCategories: "എല്ലാ വിഭാഗങ്ങളും",
    updateProfile: "പ്രൊഫൈൽ പുതുക്കുക",
    loadingDemographics: "നിങ്ങളുടെ ജനസംഖ്യാപരമായ വിവരങ്ങൾ വിശകലനം ചെയ്യുന്നു...",
    loadingDatabases: "എല്ലാ മന്ത്രാലയ ഡാറ്റാബേസുകളും സ്കാൻ ചെയ്യുന്നു...",
    loadingCriteria: "വരുമാനവും തൊഴിൽ മാനദണ്ഡങ്ങളും പരിശോധിക്കുന്നു...",
    loadingLatest: "ഏറ്റവും പുതിയ പദ്ധതികളുമായി നിങ്ങളെ ബന്ധിപ്പിക്കുന്നു...",
    loadingPersonalized: "അപേക്ഷാ ഘട്ടങ്ങൾ തയ്യാറാക്കുന്നു...",
    editProfile: "പ്രൊഫൈലിലേക്ക് തിരികെ",
    strongMatch: "മികച്ച അനുയോജ്യം",
    eligible: "അർഹതയുണ്ട്",
    benefit: "ആനുകൂല്യം",
    finalDetails: "അന്തിമ വിവരങ്ങൾ",
    working: "ഞങ്ങളുടെ AI വിദഗ്ദ്ധൻ ജോലി ചെയ്യുന്നു...",
    backToForm: "ഫോമിലേക്ക് തിരികെ",
    assistantTitle: "അപേക്ഷാ സഹായി",
    assistantSub: "ഹലോ! ഞാൻ നിങ്ങളുടെ AI സഹായിയാണ്. എനിക്ക് എങ്ങനെ സഹായിക്കാനാകും?",
    assistantPlaceholder: "സഹായത്തിനായി ചോദിക്കുക...",
    generalAssistantTitle: "യോജന സ്കൗട്ട് AI സഹായി",
    generalAssistantWelcome: "ഹലോ! ഞാൻ നിങ്ങളുടെ യോജന സ്കൗട്ട് സഹായിയാണ്. ഇന്ത്യൻ സർക്കാർ പദ്ധതികൾ, യോഗ്യത, അല്ലെങ്കിൽ നിങ്ങളുടെ പ്രൊഫൈൽ അടിസ്ഥാനമാക്കി ആനുകൂല്യങ്ങൾക്കായി എങ്ങനെ അപേക്ഷിക്കാം എന്നതിനെക്കുറിച്ച് എന്നോട് എന്തും ചോദിക്കാം.",
    details: "വ്യക്തിഗത വിവരങ്ങൾ",
    criteria: "വരുമാനവും തൊഴിലും",
    situations: "പ്രത്യേക സാഹചര്യങ്ങൾ",
    howItWorks: "ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു",
    ministries: "മന്ത്രാലയങ്ങൾ",
    contact: "ബന്ധപ്പെടുക",
    step1Title: "1. പ്രൊഫൈൽ സൃഷ്ടിക്കുക",
    step1Desc: "നിങ്ങളുടെ വിവരങ്ങൾ നൽകുക.",
    step2Title: "2. എഐ വിശകലനം",
    step2Desc: "ഞങ്ങളുടെ എഞ്ചിൻ മന്ത്രാലയ ഡാറ്റാബേസുകൾ സ്കാൻ ചെയ്യുന്നു.",
    step3Title: "3. നേരിട്ടുള്ള അപേക്ഷ",
    step3Desc: "വ്യക്തിഗതമാക്കിയ ഘട്ടങ്ങൾ നേടുക.",
    ministryDesc: "ഞങ്ങൾ 50+ മന്ത്രാലയങ്ങളിൽ നിന്നുള്ള വിവരങ്ങൾ ശേഖരിക്കുന്നു.",
    contactDesc: "സഹായം വേണോ? ഞങ്ങളെ ബന്ധപ്പെടുക.",
    supportEmail: "support@yojanascout.gov.in"
  },
  PA: {
    heroTitle: "ਮਿਲਣ ਵਾਲੇ ਲਾਭਾਂ ਨੂੰ ਅਨਲੌਕ ਕਰੋ।",
    heroSub: "ਆਪਣੇ ਵੇਰਵੇ ਭਰੋ ਅਤੇ ਸਾਡਾ AI ਹਜ਼ਾਰਾਂ ਰਾਜ ਅਤੇ ਕੇਂਦਰੀ ਸਕੀਮਾਂ ਨੂੰ ਸਕੈਨ ਕਰਕੇ ਤੁਹਾਡੇ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਮੈਚ ਲੱਭੇਗਾ।",
    nextStep: "ਅਗਲਾ ਕਦਮ",
    prevStep: "ਪਿੱਛੇ",
    findSchemes: "ਮੇਲ ਖਾਂਦੀਆਂ ਸਕੀਮਾਂ ਲੱਭੋ",
    matchedSchemes: "ਮੇਲ ਖਾਂਦੀਆਂ ਸਕੀਮਾਂ",
    found: "ਮਿਲੇ",
    programs: "ਪ੍ਰੋਗਰਾਮ ਜਿਨ੍ਹਾਂ ਲਈ ਤੁਸੀਂ ਸ਼ਾਇਦ ਯੋਗ ਹੋ।",
    startOver: "ਦੁਬਾਰਾ ਸ਼ੁਰੂ ਕਰੋ",
    downloadReport: "ਰਿਪੋਰਟ ਡਾਉਨਲੋਡ ਕਰੋ",
    whyQualify: "ਤੁਸੀਂ ਕਿਉਂ ਯੋਗ ਹੋ",
    howToApply: "ਅਰਜ਼ੀ ਕਿਵੇਂ ਦੇਣੀ ਹੈ",
    docsNeeded: "ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼",
    visitPortal: "ਅਧਿਕਾਰਤ ਪੋਰਟਲ 'ਤੇ ਜਾਓ",
    askHelp: "ਅਰਜ਼ੀ ਵਿੱਚ ਮਦਦ ਮੰਗੋ",
    noMatches: "ਇਸ ਸ਼੍ਰੇਣੀ ਵਿੱਚ ਕੋਈ ਸਿੱਧਾ ਮੈਚ ਨਹੀਂ ਮਿਲਿਆ।",
    allCategories: "ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ",
    updateProfile: "ਪ੍ਰੋਫਾਈਲ ਅਪਡੇਟ ਕਰੋ",
    loadingDemographics: "ਤੁਹਾਡੇ ਜਨਸੰਖਿਆ ਡੇਟਾ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    loadingDatabases: "ਸਾਰੇ ਮੰਤਰਾਲੇ ਦੇ ਡੇਟਾਬੇਸ ਨੂੰ ਸਕੈਨ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    loadingCriteria: "ਆਮਦਨ ਅਤੇ ਕਿੱਤੇ ਦੇ ਮਾਪਦੰਡਾਂ ਦੀ ਪੁਸ਼ਟੀ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
    loadingLatest: "ਤੁਹਾਨੂੰ ਨਵੀਨਤਮ ਸਕੀਮਾਂ ਨਾਲ ਮਿਲਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...",
    loadingPersonalized: "ਨਿੱਜੀ ਅਰਜ਼ੀ ਦੇ ਕਦਮ ਤਿਆਰ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ...",
    editProfile: "ਪ੍ਰੋਫਾਈਲ 'ਤੇ ਵਾਪਸ ਜਾਓ",
    strongMatch: "ਮਜ਼ਬੂਤ ਮੈਚ",
    eligible: "ਯੋਗ",
    benefit: "ਲਾਭ",
    finalDetails: "ਅੰਤਿਮ ਵੇਰਵੇ",
    working: "ਸਾਡਾ AI ਮਾਹਰ ਕੰਮ ਕਰ ਰਿਹਾ ਹੈ...",
    backToForm: "ਫਾਰਮ 'ਤੇ ਵਾਪਸ ਜਾਓ",
    assistantTitle: "ਅਰਜ਼ੀ ਸਹਾਇਕ",
    assistantSub: "ਹੈਲੋ! ਮੈਂ ਤੁਹਾਡਾ AI ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    assistantPlaceholder: "ਮਾਰਗਦਰਸ਼ਨ ਲਈ ਪੁੱਛੋ...",
    generalAssistantTitle: "ਯੋਜਨਾ ਸਕਾਉਟ AI ਸਹਾਇਕ",
    generalAssistantWelcome: "ਹੈਲੋ! ਮੈਂ ਤੁਹਾਡਾ ਯੋਜਨਾ ਸਕਾਉਟ ਸਹਾਇਕ ਹਾਂ। ਭਾਰਤੀ ਸਰਕਾਰੀ ਸਕੀਮਾਂ, ਯੋਗਤਾ, ਜਾਂ ਤੁਹਾਡੇ ਪ੍ਰੋਫਾਈਲ ਦੇ ਅਧਾਰ ਤੇ ਲਾਭਾਂ ਲਈ ਅਰਜ਼ੀ ਕਿਵੇਂ ਦੇਣੀ ਹੈ ਬਾਰੇ ਮੈਨੂੰ ਕੁਝ ਵੀ ਪੁੱਛੋ।",
    details: "ਨਿੱਜੀ ਵੇਰਵੇ",
    criteria: "ਆਮਦਨ ਅਤੇ ਕਿੱਤਾ",
    situations: "ਖਾਸ ਹਾਲਾਤ",
    howItWorks: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
    ministries: "ਮੰਤਰਾਲੇ",
    contact: "ਸੰਪਰਕ",
    step1Title: "1. ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ",
    step1Desc: "ਵੇਰਵੇ ਭਰੋ।",
    step2Title: "2. AI ਵਿਸ਼ਲੇਸ਼ਣ",
    step2Desc: "ਸਾਡਾ ਇੰਜਣ ਮੰਤਰਾਲੇ ਦੇ ਡੇਟਾਬੇਸ ਸਕੈਨ ਕਰਦਾ ਹੈ।",
    step3Title: "3. ਸਿੱਧੀ ਅਰਜ਼ੀ",
    step3Desc: "ਨਿੱਜੀ ਕਦਮ ਪ੍ਰਾਪತ ਕਰੋ।",
    ministryDesc: "ਅਸੀਂ 50+ ਮੰਤਰਾਲਿਆਂ ਤੋਂ ਜਾਣਕਾਰੀ ਲੈਂਦੇ ਹਾਂ।",
    contactDesc: "ਮਦਦ ਚਾਹੀਦੀ ਹੈ? ਸੰਪਰਕ ਕਰੋ।",
    supportEmail: "support@yojanascout.gov.in"
  },
  OR: {
    heroTitle: "ଆପଣଙ୍କର ପ୍ରାପ୍ୟ ସୁବିଧାଗୁଡ଼ିକ ଅନଲକ୍ କରନ୍ତୁ।",
    heroSub: "ଆପଣଙ୍କର ବିବରଣୀ ପୂରଣ କରନ୍ତୁ ଏବଂ ଆମର AI ହଜାର ହଜାର ରାଜ୍ୟ ଏବଂ କେନ୍ଦ୍ରୀୟ ଯୋଜନା ସ୍କାନ କରି ଆପଣଙ୍କ ପାଇଁ ଉପଯୁକ୍ତ ଯୋଜନା ଖୋଜିବ।",
    nextStep: "ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ",
    prevStep: "ପଛକୁ",
    findSchemes: "ମେଳ ଖାଉଥିବା ଯୋଜନା ଖୋଜନ୍ତୁ",
    matchedSchemes: "ମେଳ ଖାଉଥିବା ଯୋଜନା",
    found: "ମିଳିଲା",
    programs: "ଯୋଜନାଗୁଡ଼ିକ ଯେଉଁଥିପାଇଁ ଆପଣ ଯୋଗ୍ୟ ହୋଇପାରନ୍ତି।",
    startOver: "ପୁଣି ଆରମ୍ଭ କରନ୍ତୁ",
    downloadReport: "ରିପୋର୍ଟ ଡାଉନଲୋଡ୍ କରନ୍ତୁ",
    whyQualify: "ଆପଣ କାହିଁକି ଯୋଗ୍ୟ",
    howToApply: "କିପରି ଆବେଦନ କରିବେ",
    docsNeeded: "ଆବଶ୍ୟକୀୟ ଦଲିଲ",
    visitPortal: "ଅଫିସିଆଲ୍ ପୋର୍ଟାଲ୍ ପରିଦର୍ଶନ କରନ୍ତୁ",
    askHelp: "ଆବେଦନ ପାଇଁ ସାହାଯ್ಯ ମାଗନ୍ତୁ",
    noMatches: "ଏହି ବିଭାଗରେ କୌଣସି ସିଧାସଳଖ ମେଳ ମିଳିଲା ନାହିଁ।",
    allCategories: "ସମସ୍ତ ବିଭାଗ",
    updateProfile: "ପ୍ରୋଫାଇଲ୍ ଅଦ୍ୟତନ କରନ୍ତୁ",
    loadingDemographics: "ଆପଣଙ୍କର ଜନସଂଖ୍ୟା ତଥ୍ୟ ବିଶ୍ଳେଷଣ କରାଯାଉଛି...",
    loadingDatabases: "ସମସ୍ତ ମନ୍ତ୍ରଣାଳୟ ଡାଟାବେସ୍ ସ୍କାନ କରାଯାଉଛି...",
    loadingCriteria: "ଆୟ ଏବଂ ବୃତ୍ତି ମାନଦଣ୍ଡ ଯାଞ୍ਚ କରାଯାଉଛି...",
    loadingLatest: "ଆପଣଙ୍କୁ ନୂତନ ଯୋଜନା ସହିତ ମେଳ କରାଯାଉଛି...",
    loadingPersonalized: "ଆବେଦନ ପଦକ୍ଷେਪ ପ୍ରସ୍ତୁତ କରାଯାଉଛି...",
    editProfile: "ପ୍ରୋଫାଇଲକୁ ଫେରିଯାଅ",
    strongMatch: "ଦୃଢ ମେଳ",
    eligible: "ଯୋଗ୍ୟ",
    benefit: "ଲାଭ",
    finalDetails: "ଶେଷ ବିବରଣୀ",
    working: "ଆମର AI ବିଶେଷଜ୍ଞ କାମ କରୁଛନ୍ତି...",
    backToForm: "ଫର୍ମକୁ ଫେରିଯାଅ",
    assistantTitle: "ଆବେଦନ ସହାୟକ",
    assistantSub: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର AI ସହାୟକ | ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
    assistantPlaceholder: "ମାର୍ଗଦର୍ଶନ ପାଇଁ ପଚାରନ୍ତୁ...",
    generalAssistantTitle: "ଯୋଜନା ସ୍କାଉଟ୍ AI ସହାୟକ",
    generalAssistantWelcome: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର ଯୋଜନା ସ୍କାଉଟ୍ ସହାୟକ | ଭାରତୀୟ ସରକାରୀ ଯୋଜନା, ଯୋଗ୍ୟତା, କିମ୍ବା ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ୍ ଉପରେ ଆଧାର କରି ସୁବିଧା ପାଇଁ କିପରି ଆବେଦନ କରିବେ ସେ ବିଷୟରେ ମୋତે କିଛି ବି ପଚାରନ୍ତୁ |",
    details: "ବ୍ୟକ୍ତିଗତ ବିବରଣୀ",
    criteria: "ଆୟ ଏବଂ ବୃତ୍ତି",
    situations: "ନିର୍ଦ୍ଦିଷ୍ଟ ପରିସ୍ଥିତି",
    howItWorks: "ଏହା କିପରି କାମ କରେ",
    ministries: "ମନ୍ତ୍ରଣାଳୟ",
    contact: "ଯୋଗାଯୋଗ",
    step1Title: "୧. ପ୍ରୋଫାଇଲ୍ ସୃଷ୍ଟି କରନ୍ତୁ",
    step1Desc: "ଆପଣଙ୍କର ବିବରଣୀ ପୂରଣ କରନ୍ତୁ |",
    step2Title: "୨. AI ବିଶ୍ଳେଷଣ",
    step2Desc: "ଆମର ଇଞ୍ଜିନ୍ ମନ୍ତ୍ରଣାଳୟ ଡାଟାବେସ୍ ସ୍କାନ କରେ |",
    step3Title: "୩. ସିଧାସଳଖ ପ୍ରୟୋଗ",
    step3Desc: "ବ୍ୟକ୍ତିଗତ ପଦକ୍ଷେପଗୁଡିକ ପାଆନ୍ତୁ |",
    ministryDesc: "ଆମେ ୫୦+ ମନ୍ତ୍ରଣାଳୟର ସୂଚନା ସଂଗ୍ରହ କରୁ |",
    contactDesc: "ସାହାଯ୍ୟ ଦରକାର? ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ |",
    supportEmail: "support@yojanascout.gov.in"
  },
  ES: {
    heroTitle: "Descubra los beneficios que le corresponden.",
    heroSub: "Complete sus datos y nuestra IA escaneará miles de programas estatales y centrales para encontrar su combinación perfecta.",
    nextStep: "Siguiente paso",
    prevStep: "Atrás",
    findSchemes: "Buscar programas",
    matchedSchemes: "Programas encontrados",
    found: "Encontrados",
    programs: "programas para los que probablemente sea elegible.",
    startOver: "Empezar de nuevo",
    downloadReport: "Descargar informe",
    whyQualify: "Por qué califica",
    howToApply: "Cómo aplicar",
    docsNeeded: "Documentos requeridos",
    visitPortal: "Visitar portal oficial",
    askHelp: "Pedir ayuda para aplicar",
    noMatches: "No se encontraron coincidencias directas en esta categoría.",
    allCategories: "Todas las categorías",
    updateProfile: "Actualizar perfil",
    loadingDemographics: "Analizando sus datos demográficos...",
    loadingDatabases: "Escaneando todas las bases de datos ministeriales...",
    loadingCriteria: "Verificando criterios de ingresos y ocupación...",
    loadingLatest: "Buscando los últimos programas para usted...",
    loadingPersonalized: "Generando pasos de solicitud personalizados...",
    editProfile: "Volver al perfil",
    strongMatch: "Coincidencial fuerte",
    eligible: "Elegible",
    benefit: "Beneficio",
    finalDetails: "Detalles finales",
    working: "Nuestro experto en IA está trabajando...",
    backToForm: "Volver al formulario",
    assistantTitle: "Asistente de Aplicación",
    assistantSub: "¡Hola! Soy tu asistente de IA. ¿Cómo puedo ayudarte?",
    assistantPlaceholder: "Pide orientación...",
    generalAssistantTitle: "Asistente de IA de Yojana Scout",
    generalAssistantWelcome: "¡Hola! Soy tu asistente de Yojana Scout. Pregúntame lo que quieras sobre los programas del gobierno indio, la elegibilidad o cómo solicitar beneficios según tu perfil.",
    details: "Detalles Personales",
    criteria: "Ingresos y Ocupación",
    situations: "Situaciones Específicas",
    howItWorks: "Cómo funciona",
    ministries: "Ministerios",
    contact: "Contacto",
    step1Title: "1. Crear perfil",
    step1Desc: "Complete sus detalles demográficos y socioeconómicos.",
    step2Title: "2. Análisis de IA",
    step2Desc: "Nuestro motor escanea miles de esquemas estatales y centrales.",
    step3Title: "3. Aplicación directa",
    step3Desc: "Obtenga una lista personalizada con pasos claros.",
    ministryDesc: "Agregamos esquemas de más de 50 ministerios centrales.",
    contactDesc: "¿Necesitas ayuda? Contacta a nuestro equipo técnico.",
    supportEmail: "support@yojanascout.gov.in"
  },
  FR: {
    heroTitle: "Débloquez les avantages auxquels vous avez droit.",
    heroSub: "Remplissez vos coordonnées et notre IA scannera des milliers de programmes étatiques et centraux pour trouver votre correspondance parfaite.",
    nextStep: "Étape suivante",
    prevStep: "Retour",
    findSchemes: "Trouver des programmes",
    matchedSchemes: "Programmes correspondants",
    found: "Trouvé",
    programs: "programmes pour lesquels vous êtes probablement éligible.",
    startOver: "Recommencer",
    downloadReport: "Télécharger le rapport",
    whyQualify: "Pourquoi vous êtes qualifié",
    howToApply: "Comment postuler",
    docsNeeded: "Documents requis",
    visitPortal: "Visiter le portail officiel",
    askHelp: "Demander de l'aide pour postuler",
    noMatches: "Aucune correspondance directe trouvée dans cette catégorie.",
    allCategories: "Toutes les catégories",
    updateProfile: "Mettre à jour le profil",
    loadingDemographics: "Analyse de vos données démographiques...",
    loadingDatabases: "Analyse de toutes les bases de données ministérielles...",
    loadingCriteria: "Vérification des critères de revenus et de profession...",
    loadingLatest: "Recherche des derniers programmes pour vous...",
    loadingPersonalized: "Génération d'étapes de candidature personnalisées...",
    editProfile: "Retour au profil",
    strongMatch: "Forte correspondance",
    eligible: "Éligible",
    benefit: "Avantage",
    finalDetails: "Détails finaux",
    working: "Notre expert IA travaille...",
    backToForm: "Retour au formulaire",
    assistantTitle: "Assistant de Candidature",
    assistantSub: "Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider ?",
    assistantPlaceholder: "Demandez des conseils...",
    generalAssistantTitle: "Assistant IA Yojana Scout",
    generalAssistantWelcome: "Bonjour ! Je suis votre assistant Yojana Scout. Posez-moi toutes vos questions sur les programmes du gouvernement indien, l'éligibilité ou la manière de demander des prestations en fonction de votre profil.",
    details: "Détails Personnels",
    criteria: "Revenus et Profession",
    situations: "Situations Spécifiques",
    howItWorks: "Comment ça marche",
    ministries: "Ministères",
    contact: "Contact",
    step1Title: "1. Créer un profil",
    step1Desc: "Remplissez vos données démographiques et socio-économiques.",
    step2Title: "2. Analyse IA",
    step2Desc: "Notre moteur analyse des milliers de programmes d'État et centraux.",
    step3Title: "3. Candidature directe",
    step3Desc: "Obtenez une liste personnalisée avec des étapes claires.",
    ministryDesc: "Nous regroupons les programmes de plus de 50 ministères centraux.",
    contactDesc: "Besoin d'aide ? Contactez notre équipe technique.",
    supportEmail: "support@yojanascout.gov.in"
  },
  DE: {
    heroTitle: "Schalten Sie die Vorteile frei, auf die Sie Anspruch haben.",
    heroSub: "Geben Sie Ihre Daten ein und unsere KI wird Tausende von staatlichen und zentralen Programmen scannen, um die perfekte Übereinstimmung für Sie zu finden.",
    nextStep: "Nächster Schritt",
    prevStep: "Zurück",
    findSchemes: "Programme finden",
    matchedSchemes: "Passende Programme",
    found: "Gefunden",
    programs: "Programme, für die Sie wahrscheinlich berechtigt sind.",
    startOver: "Neu starten",
    downloadReport: "Bericht herunterladen",
    whyQualify: "Warum Sie qualifiziert sind",
    howToApply: "Wie man sich bewirbt",
    docsNeeded: "Erforderliche Dokumente",
    visitPortal: "Offizielles Portal besuchen",
    askHelp: "Hilfe bei der Bewerbung anfordern",
    noMatches: "Keine direkten Treffer in dieser Kategorie gefunden.",
    allCategories: "Alle Kategorien",
    updateProfile: "Profil aktualisieren",
    loadingDemographics: "Analyse Ihrer demografischen Daten...",
    loadingDatabases: "Scannen aller Ministeriumsdatenbanken...",
    loadingCriteria: "Überprüfung der Einkommens- und Berufskriterien...",
    loadingLatest: "Passende aktuelle Programme für Sie finden...",
    loadingPersonalized: "Erstellung personalisierter Bewerbungsschritte...",
    editProfile: "Zurück zum Profil",
    strongMatch: "Starke Übereinstimmung",
    eligible: "Berechtigt",
    benefit: "Vorteil",
    finalDetails: "Letzte Details",
    working: "Unser KI-Experte arbeitet...",
    backToForm: "Zurück zum Formular",
    assistantTitle: "Bewerbungsassistent",
    assistantSub: "Hallo! Ich bin Ihr KI-Assistent. Wie kann Ihenen helfen?",
    assistantPlaceholder: "Fragen Sie nach einer Anleitung...",
    generalAssistantTitle: "Yojana Scout KI-Assistent",
    generalAssistantWelcome: "Hallo! Ich bin Ihr Yojana Scout-Assistent. Fragen Sie mich alles über indische Regierungsprogramme, Teilnahmebedingungen oder wie Sie Leistungen basierend auf Ihrem Profil beantragen können.",
    details: "Persönliche Details",
    criteria: "Einkommen & Beruf",
    situations: "Spezifische Situationen",
    howItWorks: "Wie es funktioniert",
    ministries: "Ministerien",
    contact: "Kontakt",
    step1Title: "1. Profil erstellen",
    step1Desc: "Geben Sie Ihre demografischen und sozioökonomischen Daten ein.",
    step2Title: "2. KI-Analyse",
    step2Desc: "Unsere Engine scannt Tausende von Regierungsdatenbanken.",
    step3Title: "3. Direkte Bewerbung",
    step3Desc: "Erhalten Sie eine personalisierte Liste mit klaren Schritten.",
    ministryDesc: "Wir bündeln Programme von über 50 Ministerien.",
    contactDesc: "Benötigen Sie Hilfe? Kontaktieren Sie unser Support-Team.",
    supportEmail: "support@yojanascout.gov.in"
  }
};

const OCCUPATIONS = [
  'Farmer', 'Daily wage labour', 'Small business', 'Salaried private', 
  'Salaried government', 'Student', 'Unemployed', 'Homemaker', 'Artisan'
];

const LAND_OPTIONS = ['None', 'Agricultural land', 'House', 'Both'];

const EDUCATION_LEVELS = [
  'None', 'Primary School', 'High School', 'Graduate', 'Post-Graduate', 'Doctorate'
];

function ChatAssistant({ scheme, profile, lang, onClose }: { scheme: Scheme | null, profile: CitizenProfile, lang: SupportedLanguage, onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await getApplyHelp(scheme?.scheme_name || null, profile, [...messages, userMsg], lang);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I encountered an error. Please try asking again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-[white] dark:bg-[#1a1a1a] w-full max-w-lg rounded-[32px] shadow-2xl flex flex-col h-[600px] overflow-hidden border border-[#E2D2B5]"
      >
        <div className="p-6 border-b border-[#E2D2B5] bg-[#FDFCF9] dark:bg-[#252525] flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold italic text-lg dark:text-white">
              {scheme 
                ? (TRANSLATIONS[lang].assistantTitle || "Application Assistant") 
                : (TRANSLATIONS[lang].generalAssistantTitle || "Yojana Scout AI Assistant")}
            </h3>
            {scheme && <p className="text-xs text-[#A59477] font-bold uppercase tracking-wider">{scheme.scheme_name}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#E2D2B5] rounded-full transition-colors dark:text-white">
            <Trash2 className="w-5 h-5 rotate-45" />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-white dark:bg-[#1a1a1a]">
          <div className="bg-[#FDFCF9] dark:bg-[#252525] border border-[#E2D2B5] rounded-2xl p-4 text-sm text-[#6B6B6B] dark:text-gray-400">
            {scheme 
              ? (TRANSLATIONS[lang].assistantSub || "Hello! I'm your AI assistant. How can I help you with this specific scheme?")
              : (TRANSLATIONS[lang].generalAssistantWelcome || "Hello! I'm your Yojana Scout assistant. Ask me anything about Indian government schemes, eligibility, or how to apply for benefits based on your profile.")}
          </div>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                m.role === 'user' 
                  ? 'bg-[#1A1A1A] text-white rounded-tr-none' 
                  : 'bg-[#FDFCF9] dark:bg-[#252525] border border-[#E2D2B5] text-[#1A1A1A] dark:text-white rounded-tl-none shadow-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#FDFCF9] dark:bg-[#252525] border border-[#E2D2B5] p-4 rounded-2xl rounded-tl-none shadow-sm space-x-1 flex items-center">
                <div className="w-1.5 h-1.5 bg-[#A59477] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1.5 h-1.5 bg-[#A59477] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-[#A59477] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#E2D2B5] bg-[#FDFCF9] dark:bg-[#252525]">
          <div className="relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={TRANSLATIONS[lang].assistantPlaceholder || "Ask for guidance..."}
              className="w-full bg-white dark:bg-[#1a1a1a] dark:text-white border border-[#E2D2B5] rounded-full pl-6 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1.5 p-2 bg-[#1A1A1A] text-white rounded-full hover:bg-[#333333]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoModal({ type, lang, onClose }: { type: 'how-it-works' | 'ministries' | 'contact', lang: SupportedLanguage, onClose: () => void }) {
  const content = {
    'how-it-works': (
      <div className="space-y-6">
        <h3 className="text-2xl font-serif font-bold italic dark:text-white">{TRANSLATIONS[lang].howItWorks || "How it works"}</h3>
        <div className="space-y-8">
          {[
            { title: TRANSLATIONS[lang].step1Title, desc: TRANSLATIONS[lang].step1Desc, icon: User },
            { title: TRANSLATIONS[lang].step2Title, desc: TRANSLATIONS[lang].step2Desc, icon: Search },
            { title: TRANSLATIONS[lang].step3Title, desc: TRANSLATIONS[lang].step3Desc, icon: CheckCircle2 }
          ].map((step, i) => (
             <div key={i} className="flex gap-4">
               <div className="w-12 h-12 bg-[#FDFCF9] dark:bg-[#252525] border border-[#E2D2B5] rounded-2xl flex items-center justify-center flex-shrink-0 text-[#A59477]">
                 <step.icon className="w-6 h-6" />
               </div>
               <div>
                 <h4 className="font-bold text-[#1A1A1A] dark:text-white text-lg mb-1">{step.title}</h4>
                 <p className="text-[#6B6B6B] dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
               </div>
             </div>
          ))}
        </div>
      </div>
    ),
    'ministries': (
       <div className="space-y-6">
        <h3 className="text-2xl font-serif font-bold italic dark:text-white">{TRANSLATIONS[lang].ministries || "Ministries"}</h3>
        <p className="text-[#6B6B6B] dark:text-gray-400 text-sm">{TRANSLATIONS[lang].ministryDesc || "We aggregate schemes from over 50+ central ministries and all state governments."}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            "Agriculture", "Education", "Finance", "Health", "Housing", 
            "Labor", "Micro-Enterprises", "Rural Dev", "Social Justice", "Women & Child"
          ].map((m) => (
            <div key={m} className="p-3 bg-[#FDFCF9] dark:bg-[#252525] border border-[#E2D2B5] rounded-xl text-xs font-bold text-[#A59477] flex items-center gap-2">
              <Building2 className="w-3 h-3" /> {m}
            </div>
          ))}
        </div>
      </div>
    ),
    'contact': (
       <div className="space-y-6">
        <h3 className="text-2xl font-serif font-bold italic dark:text-white">{TRANSLATIONS[lang].contact || "Contact"}</h3>
        <p className="text-[#6B6B6B] dark:text-gray-400 text-sm">{TRANSLATIONS[lang].contactDesc || "Need help? Reach out to our technical team for assistance with the scout engine."}</p>
        <div className="bg-[#1A1A1A] p-6 rounded-3xl text-white">
           <p className="text-xs uppercase tracking-widest font-bold opacity-60 mb-2">Technical Support</p>
           <a 
             href={`mailto:${TRANSLATIONS[lang].supportEmail || "support@yojanascout.gov.in"}`}
             className="text-xl font-serif italic mb-4 block hover:text-[#A59477] transition-colors"
           >
             {TRANSLATIONS[lang].supportEmail || "support@yojanascout.gov.in"}
           </a>
           <div className="flex gap-4">
             <div className="text-center flex-1 p-3 bg-white/10 rounded-xl">
               <p className="text-[10px] uppercase font-bold opacity-60">Avg Response</p>
               <p className="font-bold">2 Hours</p>
             </div>
             <div className="text-center flex-1 p-3 bg-white/10 rounded-xl">
               <p className="text-[10px] uppercase font-bold opacity-60">Success Rate</p>
               <p className="font-bold">98%</p>
             </div>
           </div>
        </div>
      </div>
    )
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-[white] dark:bg-[#1a1a1a] w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-[#E2D2B5]"
      >
        <div className="p-8">
          <div className="flex justify-end mb-2">
            <button onClick={onClose} className="p-2 hover:bg-[#F6F4F0] dark:hover:bg-[#252525] rounded-full transition-colors">
               <Trash2 className="w-5 h-5 rotate-45 text-[#A59477]" />
            </button>
          </div>
          {content[type]}
          <button 
            onClick={onClose}
            className="mt-8 w-full py-4 bg-[#1A1A1A] text-white rounded-full font-bold hover:bg-[#333333] transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [profile, setProfile] = useState<CitizenProfile>(INITIAL_PROFILE);
  const [schemes, setSchemes] = useState<Scheme[] | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [selectedSchemeForHelp, setSelectedSchemeForHelp] = useState<Scheme | null>(null);
  const [isGeneralChatOpen, setIsGeneralChatOpen] = useState(false);
  const [activeInfoSection, setActiveInfoSection] = useState<'how-it-works' | 'ministries' | 'contact' | null>(null);

  const filteredSchemes = useMemo(() => {
    if (!schemes) return [];
    let list = [...schemes];
    
    // Filter
    if (selectedCategory !== 'All') {
      list = list.filter(s => s.category === selectedCategory);
    }
    
    // Sort: High match first
    list.sort((a, b) => {
      if (a.match_strength === 'high' && b.match_strength === 'medium') return -1;
      if (a.match_strength === 'medium' && b.match_strength === 'high') return 1;
      return 0;
    });
    
    return list;
  }, [schemes, selectedCategory]);

  const categories = useMemo(() => {
    if (!schemes) return [];
    const set = new Set(schemes.map(s => s.category));
    return ['All', ...Array.from(set)];
  }, [schemes]);

  const categoryGroups = useMemo(() => {
    if (!schemes) return {};
    const groups: Record<string, number> = {};
    schemes.forEach(s => {
      groups[s.category] = (groups[s.category] || 0) + 1;
    });
    return groups;
  }, [schemes]);

  const [lang, setLang] = useState<SupportedLanguage>('EN');

  const LANG_NAMES: Record<SupportedLanguage, string> = {
    EN: 'English',
    HI: 'Hindi',
    KN: 'Kannada',
    BN: 'Bengali',
    GU: 'Gujarati',
    ML: 'Malayalam',
    PA: 'Punjabi',
    OR: 'Odia',
    ES: 'Spanish',
    FR: 'French',
    DE: 'German'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleToggle = (name: keyof CitizenProfile) => {
    setProfile(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleCheck = async () => {
    setError(null);
    setRejectionReason(null);
    setIsLoading(true);
    try {
      const { schemes: results, rejection_reason } = await checkEligibility(profile, lang);
      setSchemes(results);
      setRejectionReason(rejection_reason || null);
      setStep(4); // Move to results step
    } catch (err) {
      setError("We encountered an error while analyzing your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setProfile(INITIAL_PROFILE);
    setSchemes(null);
    setError(null);
    setStep(1);
  };

  const loadingMessages = [
    "Analyzing your demographic data...",
    "Scanning all Ministry databases...",
    "Verifying income and occupation criteria...",
    "Matching you with the latest schemes...",
    "Generating personalized application steps...",
  ];

  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useMemo(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-[#FDFCF9] dark:bg-[#121212] text-[#2D2D2D] dark:text-gray-100 font-sans selection:bg-[#E2D2B5] selection:text-[#1A1A1A]">
      {/* Navbar */}
      <nav className="border-b border-[#E2D2B5] bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
            <div className="bg-[#1A1A1A] p-1.5 rounded-lg">
              <Search className="w-5 h-5 text-[#FDFCF9]" strokeWidth={2.5} />
            </div>
            <span className="font-serif italic text-xl font-bold tracking-tight">Yojana Scout</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button 
                className="px-3 py-1.5 bg-[#F6F4F0] dark:bg-[#252525] border border-[#E2D2B5] dark:border-[#333] rounded-lg text-[10px] font-bold text-[#A59477] hover:bg-[#1A1A1A] hover:text-white transition-all shadow-sm flex items-center gap-2"
              >
                {LANG_NAMES[lang]}
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#1f1f1f] border border-[#E2D2B5] dark:border-[#333] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                {(Object.keys(LANG_NAMES) as SupportedLanguage[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`w-full px-4 py-2 text-left text-[10px] font-bold transition-colors ${
                      lang === l ? 'bg-[#1A1A1A] text-white' : 'text-[#A59477] hover:bg-[#F6F4F0] dark:hover:bg-[#252525]'
                    }`}
                  >
                    {LANG_NAMES[l]}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium opacity-60">
              <button onClick={() => setActiveInfoSection('how-it-works')} className="hover:opacity-100 transition-opacity cursor-pointer">
                {TRANSLATIONS[lang].howItWorks || "How it works"}
              </button>
              <button onClick={() => setActiveInfoSection('ministries')} className="hover:opacity-100 transition-opacity cursor-pointer">
                {TRANSLATIONS[lang].ministries || "Ministries"}
              </button>
              <button onClick={() => setActiveInfoSection('contact')} className="hover:opacity-100 transition-opacity cursor-pointer">
                {TRANSLATIONS[lang].contact || "Contact"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {step <= 3 && !isLoading && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-12">
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#A59477] mb-3 block">
                   Government of India • Eligibility Portal
                </span>
                <h1 className="text-4xl md:text-5xl font-serif font-bold italic mb-6 leading-tight">
                  {TRANSLATIONS[lang].heroTitle}
                </h1>
                <p className="text-[#6B6B6B] text-lg max-w-xl mx-auto leading-relaxed">
                  {TRANSLATIONS[lang].heroSub}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-16 relative">
                 <div className="absolute top-1/2 left-0 w-full h-px bg-[#E2D2B5] dark:bg-[#333] -z-10" />
                 {[1, 2, 3].map((s) => (
                   <button 
                    key={s} 
                    onClick={() => s < step && setStep(s)}
                    disabled={s >= step}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 cursor-default ${
                      step >= s ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#FDFCF9] text-[#A59477] border-[#E2D2B5] dark:border-[#333]'
                    } ${s < step ? 'cursor-pointer hover:bg-[#333]' : ''}`}
                   >
                     {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                   </button>
                 ))}
              </div>

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-white border border-[#E2D2B5] rounded-3xl p-8 shadow-sm">
                    <h3 className="text-lg font-serif font-bold italic mb-6 flex items-center gap-2">
                       <User className="w-5 h-5 text-[#A59477]" /> Demographic Essence
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-[#A59477]">Full Age</label>
                        <input 
                          type="number"
                          name="age"
                          value={profile.age}
                          onChange={handleInputChange}
                          placeholder="e.g. 28"
                          className="w-full bg-[#FDFCF9] border border-[#E2D2B5] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-[#A59477]">Gender Identity</label>
                        <select 
                          name="gender"
                          value={profile.gender}
                          onChange={handleInputChange}
                          className="w-full bg-[#FDFCF9] border border-[#E2D2B5] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Transgender</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-[#A59477]">State / UT of Residence</label>
                        <select 
                          name="state"
                          value={profile.state}
                          onChange={handleInputChange}
                          className="w-full bg-[#FDFCF9] border border-[#E2D2B5] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all"
                        >
                          {STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-[#A59477]">Geography</label>
                        <select 
                          name="residence"
                          value={profile.residence}
                          onChange={handleInputChange}
                          className="w-full bg-[#FDFCF9] border border-[#E2D2B5] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all"
                        >
                          <option>Urban</option>
                          <option>Rural</option>
                          <option>Semi-Urban</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setStep(2)}
                      disabled={!profile.age}
                      className="group bg-[#1A1A1A] text-[#FDFCF9] px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-[#333333] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {TRANSLATIONS[lang].nextStep} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Socio-Economic */}
              {step === 2 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-white border border-[#E2D2B5] rounded-3xl p-8 shadow-sm">
                    <h3 className="text-lg font-serif font-bold italic mb-6 flex items-center gap-2">
                       <MapPin className="w-5 h-5 text-[#A59477]" /> Socio-Economic Profile
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-[#A59477]">Category / Caste</label>
                        <select 
                          name="caste"
                          value={profile.caste}
                          onChange={handleInputChange}
                          className="w-full bg-[#FDFCF9] border border-[#E2D2B5] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all"
                        >
                          {CASTES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-[#A59477]">Annual Income (₹)</label>
                        <input 
                          type="number"
                          name="income"
                          value={profile.income}
                          onChange={handleInputChange}
                          placeholder="e.g. 150000"
                          className="w-full bg-[#FDFCF9] border border-[#E2D2B5] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-[#A59477]">Occupation</label>
                        <select 
                          name="occupation"
                          value={profile.occupation}
                          onChange={handleInputChange}
                          className="w-full bg-[#FDFCF9] border border-[#E2D2B5] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all"
                        >
                          <option value="">Select Occupation</option>
                          {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                       <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-[#A59477]">Education Level</label>
                        <select 
                          name="education"
                          value={profile.education}
                          onChange={handleInputChange}
                          className="w-full bg-[#FDFCF9] border border-[#E2D2B5] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all"
                        >
                          {EDUCATION_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-[#A59477]">Marital Status</label>
                        <select 
                          name="marital"
                          value={profile.marital}
                          onChange={handleInputChange}
                          className="w-full bg-[#FDFCF9] border border-[#E2D2B5] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all"
                        >
                          <option>Not Married</option>
                          <option>Married</option>
                          <option>Widowed</option>
                          <option>Divorced</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-[#A59477]">Number of Children</label>
                        <input 
                          type="number"
                          name="children"
                          value={profile.children}
                          onChange={handleInputChange}
                          placeholder="e.g. 2"
                          className="w-full bg-[#FDFCF9] border border-[#E2D2B5] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-[#A59477]">Land Owned</label>
                        <select 
                          name="land"
                          value={profile.land}
                          onChange={handleInputChange}
                          className="w-full bg-[#FDFCF9] border border-[#E2D2B5] rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all"
                        >
                          <option value="">Select Ownership</option>
                          {LAND_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button 
                      onClick={() => setStep(1)}
                      className="px-8 py-4 rounded-full font-bold text-[#A59477] hover:text-[#1A1A1A] transition-all"
                    >
                      {TRANSLATIONS[lang].prevStep}
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      disabled={!profile.income || !profile.occupation}
                      className="group bg-[#1A1A1A] text-[#FDFCF9] px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-[#333333] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {TRANSLATIONS[lang].finalDetails} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Specific Situations */}
              {step === 3 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-white border border-[#E2D2B5] rounded-3xl p-8 shadow-sm">
                    <h3 className="text-lg font-serif font-bold italic mb-6 flex items-center gap-2">
                       <AlertCircle className="w-5 h-5 text-[#A59477]" /> Personal Context
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { id: 'pregnant', label: 'Pregnant / New Mother' },
                        { id: 'student', label: 'Currently Studying' },
                        { id: 'disability', label: 'Person with Disability' },
                        { id: 'senior', label: 'Senior Citizen (60+)' },
                        { id: 'ration', label: 'Has Ration Card' },
                        { id: 'bpl', label: 'BPL Card Holder' },
                        { id: 'entrepreneur', label: 'Want to start Business' },
                        { id: 'house', label: 'Need Housing Support' },
                        { id: 'health', label: 'Need Health Coverage' },
                        { id: 'pension', label: 'Need Retirement Support' },
                        { id: 'skill', label: 'Want Skill Training' },
                        { id: 'sanitation', label: 'No Toilet Access' },
                      ].map((sit) => (
                        <button
                          key={sit.id}
                          onClick={() => handleToggle(sit.id as keyof CitizenProfile)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                            profile[sit.id as keyof CitizenProfile] 
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md' 
                              : 'bg-[#FDFCF9] text-[#6B6B6B] border-[#E2D2B5] hover:border-[#1A1A1A]'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${profile[sit.id as keyof CitizenProfile] ? 'bg-[#A59477]' : 'bg-[#E2D2B5]'}`} />
                          <span className="text-sm font-semibold">{sit.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button 
                      onClick={() => setStep(2)}
                      className="px-8 py-4 rounded-full font-bold text-[#A59477] hover:text-[#1A1A1A] transition-all"
                    >
                      {TRANSLATIONS[lang].prevStep}
                    </button>
                    <button 
                      onClick={handleCheck}
                      className="group bg-[#1A1A1A] text-[#FDFCF9] px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-[#333333] transition-all shadow-xl hover:shadow-[#1A1A1A]/20"
                    >
                      {TRANSLATIONS[lang].findSchemes} <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="relative mb-12">
                <Loader2 className="w-16 h-16 text-[#1A1A1A] animate-spin" strokeWidth={1.5} />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
                  className="absolute inset-0 bg-[#A59477]/10 rounded-full blur-2xl"
                />
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingMsgIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-2xl font-serif italic text-[#1A1A1A] font-bold"
                >
                  {TRANSLATIONS[lang][(['loadingDemographics', 'loadingDatabases', 'loadingCriteria', 'loadingLatest', 'loadingPersonalized'][loadingMsgIdx]) as keyof (typeof TRANSLATIONS.EN)]}
                </motion.p>
              </AnimatePresence>
              <p className="mt-4 text-[#A59477] animate-pulse">{TRANSLATIONS[lang].working || "Our AI expert is working his magic..."}</p>
              <button 
                onClick={() => setIsLoading(false)}
                className="mt-8 px-6 py-2 border border-[#E2D2B5] dark:border-[#333] text-[#A59477] rounded-full text-sm font-bold hover:bg-[#1A1A1A] hover:text-white transition-all"
              >
                {TRANSLATIONS[lang].backToForm || "Go Back to Form"}
              </button>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center py-20"
            >
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
              <p className="text-[#6B6B6B] mb-8">{error}</p>
              <button 
                onClick={() => setStep(3)}
                className="bg-[#1A1A1A] text-white px-8 py-3 rounded-full font-bold"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Results State */}
          {step === 4 && schemes && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="space-y-8 border-b border-[#E2D2B5] pb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A59477]">{TRANSLATIONS[lang].eligibilityStatus}</span>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${schemes.length > 0 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                        {schemes.length > 0 ? (TRANSLATIONS[lang].eligible || "Eligible") : (TRANSLATIONS[lang].notEligible || "Not Eligible")}
                      </span>
                    </div>
                    <h2 className="text-4xl font-serif font-bold italic mb-3">{TRANSLATIONS[lang].matchedSchemes}</h2>
                    <p className="text-[#A59477] font-medium">{TRANSLATIONS[lang].found} {schemes.length} {TRANSLATIONS[lang].programs}</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setStep(3)}
                      className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl border border-[#E2D2B5] dark:border-[#333] font-bold text-[#A59477] hover:text-[#1A1A1A] hover:bg-white transition-all shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" /> {TRANSLATIONS[lang].editProfile}
                    </button>
                    <button 
                      onClick={reset}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#E2D2B5] font-bold text-[#A59477] hover:text-[#1A1A1A] hover:bg-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" /> {TRANSLATIONS[lang].startOver}
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A1A1A] text-white font-bold hover:bg-[#333333] transition-all shadow-lg"
                    >
                      <Plane className="w-4 h-4 rotate-90" /> {TRANSLATIONS[lang].downloadReport}
                    </button>
                  </div>
                </div>

                {/* Profile Summary Chips */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Age', value: profile.age },
                    { label: 'Gender', value: profile.gender },
                    { label: 'State', value: profile.state },
                    { label: 'Income', value: `₹${profile.income}` },
                    { label: 'Occupation', value: profile.occupation },
                  ].map((chip) => (
                    <div key={chip.label} className="bg-white dark:bg-[#1f1f1f] border border-[#E2D2B5] dark:border-[#333] px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-sm">
                      <span className="text-[#A59477] font-bold uppercase tracking-wider">{chip.label}:</span>
                      <span className="text-[#1A1A1A] dark:text-white font-bold">{chip.value}</span>
                    </div>
                  ))}
                  <button 
                    onClick={() => setStep(3)}
                    className="md:hidden bg-[#A59477]/10 text-[#A59477] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
                  >
                    Edit Profile
                  </button>
                </div>

                {/* Category Header or Breadcrumb */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        selectedCategory === 'All' 
                          ? 'bg-[#1A1A1A] text-white' 
                          : 'bg-white dark:bg-[#1f1f1f] border border-[#E2D2B5] dark:border-[#333] text-[#A59477] hover:border-[#1A1A1A]'
                      }`}
                    >
                      {TRANSLATIONS[lang].allCategories}
                    </button>
                    {Object.keys(categoryGroups).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          selectedCategory === cat 
                            ? 'bg-[#1A1A1A] text-white' 
                            : 'bg-white dark:bg-[#1f1f1f] border border-[#E2D2B5] dark:border-[#333] text-[#A59477] hover:border-[#1A1A1A]'
                        }`}
                      >
                        {cat} ({categoryGroups[cat]})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {schemes.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-24 bg-white dark:bg-[#1a1a1a] border border-[#E2D2B5] dark:border-[#333] rounded-[40px] shadow-sm max-w-2xl mx-auto"
                >
                  <div className="w-20 h-20 bg-[#FDFCF9] dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-6 text-[#A59477]">
                    <AlertCircle className="w-10 h-10" strokeWidth={1} />
                  </div>
                  <h3 className="text-3xl font-serif font-bold italic mb-4 text-[#1A1A1A] dark:text-white">
                    {TRANSLATIONS[lang].notEligibleTitle || "Currently Not Eligible"}
                  </h3>
                  <div className="bg-[#FDFCF9] dark:bg-[#252525] border border-[#E2D2B5] dark:border-[#333] rounded-3xl p-8 mb-10 text-left">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-[#A59477] mb-4 flex items-center gap-2">
                       <Info className="w-4 h-4" /> AI Explanation
                    </h4>
                    <p className="text-[#6B6B6B] dark:text-gray-400 leading-relaxed text-lg italic">
                      {rejectionReason || TRANSLATIONS[lang].notEligibleDesc || "Based on the details provided, we couldn't find any major schemes that match your profile accurately."}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={() => setStep(3)} 
                      className="px-10 py-4 bg-[#1A1A1A] text-white rounded-full font-bold shadow-xl hover:bg-[#333] transition-all"
                    >
                      {TRANSLATIONS[lang].updateProfile}
                    </button>
                    <button 
                      onClick={reset}
                      className="px-10 py-4 bg-white dark:bg-[#252525] border border-[#E2D2B5] dark:border-[#333] text-[#A59477] rounded-full font-bold hover:bg-[#F6F4F0] transition-all"
                    >
                      {TRANSLATIONS[lang].startOver}
                    </button>
                  </div>
                </motion.div>
              ) : selectedCategory === 'All' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Object.entries(categoryGroups).map(([cat, count]) => {
                    const Icon = CATEGORY_ICONS[cat as SchemeCategory] || Info;
                    return (
                      <motion.button
                        key={cat}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5, shadow: '0 20px 40px rgba(165, 148, 119, 0.15)' }}
                        onClick={() => setSelectedCategory(cat)}
                        className="group bg-white dark:bg-[#1A1A1A] border border-[#E2D2B5] dark:border-[#333] rounded-[32px] p-8 text-left transition-all relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#A59477]/5 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700" />
                        
                        <div className="w-14 h-14 bg-[#FDFCF9] dark:bg-[#252525] border border-[#E2D2B5] dark:border-[#333] rounded-2xl flex items-center justify-center mb-6 text-[#A59477] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                          <Icon className="w-7 h-7" strokeWidth={1.5} />
                        </div>
                        
                        <h3 className="text-2xl font-serif font-bold italic mb-2 dark:text-white">{cat}</h3>
                        <p className="text-[#A59477] text-xs font-bold uppercase tracking-[0.2em] mb-8">{count} {TRANSLATIONS[lang].programs}</p>
                        
                        <div className="flex items-center gap-2 text-[#1A1A1A] dark:text-white font-bold text-sm">
                          <span>View Classified Schemes</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : filteredSchemes.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-24 bg-white dark:bg-[#1a1a1a] border border-[#E2D2B5] dark:border-[#333] rounded-[40px] shadow-sm max-w-2xl mx-auto"
                >
                  <div className="w-20 h-20 bg-[#FDFCF9] dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-6 text-[#A59477]">
                    <AlertCircle className="w-10 h-10" strokeWidth={1} />
                  </div>
                  <h3 className="text-3xl font-serif font-bold italic mb-4 text-[#1A1A1A] dark:text-white">
                    {schemes.length === 0 
                      ? (TRANSLATIONS[lang].notEligibleTitle || "Currently Not Eligible")
                      : TRANSLATIONS[lang].noMatches}
                  </h3>
                  <p className="text-[#6B6B6B] dark:text-gray-400 max-w-md mx-auto mb-10 leading-relaxed text-lg">
                    {schemes.length === 0 
                      ? (rejectionReason || TRANSLATIONS[lang].notEligibleDesc || "Based on the details provided, we couldn't find any major schemes that match your profile accurately.")
                      : TRANSLATIONS[lang].heroSub}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {schemes.length > 0 && (
                      <button 
                        onClick={() => setSelectedCategory('All')} 
                        className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-bold shadow-md hover:bg-[#333] transition-all"
                      >
                        {TRANSLATIONS[lang].allCategories}
                      </button>
                    )}
                    <button 
                      onClick={() => setStep(3)} 
                      className="px-8 py-3 bg-white dark:bg-[#252525] border border-[#E2D2B5] text-[#1A1A1A] dark:text-white rounded-full font-bold shadow-sm hover:bg-[#F6F4F0] transition-all"
                    >
                      {TRANSLATIONS[lang].updateProfile}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredSchemes.map((scheme, idx) => {
                    const Icon = CATEGORY_ICONS[scheme.category] || Info;
                    return (
                      <motion.div
                        key={scheme.scheme_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group bg-white dark:bg-[#1A1A1A] border border-[#E2D2B5] dark:border-[#333] rounded-[32px] p-8 hover:shadow-2xl hover:shadow-[#A59477]/10 transition-all relative flex flex-col h-full"
                      >
                        <div className="absolute top-8 right-8">
                          {scheme.match_strength === 'high' ? (
                            <div className="bg-[#1A1A1A] dark:bg-[#A59477] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-sm">
                              {TRANSLATIONS[lang].strongMatch}
                            </div>
                          ) : (
                            <div className="bg-[#FDFCF9] dark:bg-[#252525] border border-[#E2D2B5] dark:border-[#444] text-[#A59477] text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                              {TRANSLATIONS[lang].eligible}
                            </div>
                          )}
                        </div>

                        <div className="w-14 h-14 bg-[#FDFCF9] dark:bg-[#252525] border border-[#E2D2B5] dark:border-[#444] rounded-2xl flex items-center justify-center mb-6 text-[#1A1A1A] dark:text-white group-hover:bg-[#1A1A1A] group-hover:text-white dark:group-hover:bg-[#A59477] transition-colors duration-300">
                          <Icon className="w-7 h-7" strokeWidth={1.5} />
                        </div>

                        <div className="text-xs uppercase tracking-wider font-bold text-[#A59477] mb-2">{scheme.ministry}</div>
                        <h3 className="text-2xl font-serif font-bold italic mb-4 leading-snug dark:text-white">
                          {scheme.scheme_name}
                        </h3>
                        
                        <div className="bg-[#F6F4F0] dark:bg-[#252525] border border-[#E2D2B5] dark:border-[#444] rounded-2xl p-4 mb-6">
                           <div className="text-xs uppercase tracking-widest font-bold text-[#A59477] mb-1">{TRANSLATIONS[lang].benefit}</div>
                           <p className="font-bold text-[#1A1A1A] dark:text-white text-lg">{scheme.benefit}</p>
                        </div>

                        <div className="mb-8 flex-grow">
                           <h4 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#A59477] mb-3 flex items-center gap-2">
                             <Heart className="w-3 h-3 text-red-500" fill="currentColor" /> {TRANSLATIONS[lang].whyQualify}
                           </h4>
                           <p className="text-[#6B6B6B] dark:text-gray-400 text-sm leading-relaxed">{scheme.eligibility_reason}</p>
                        </div>

                        <div className="space-y-6">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <div className="space-y-4">
                               <h4 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-white mb-1">{TRANSLATIONS[lang].howToApply}</h4>
                               <div className="space-y-3">
                                 {scheme.apply_steps.map((step, sIdx) => (
                                   <div key={sIdx} className="flex gap-3 text-xs">
                                     <div className="flex-shrink-0 w-5 h-5 bg-[#E2D2B5] dark:bg-[#A59477] text-[#1A1A1A] dark:text-white rounded-full flex items-center justify-center font-bold">
                                       {sIdx + 1}
                                     </div>
                                     <p className="text-[#6B6B6B] dark:text-gray-400 leading-relaxed">{step}</p>
                                   </div>
                                 ))}
                               </div>
                             </div>

                             <div className="space-y-4">
                               <h4 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-white mb-1">{TRANSLATIONS[lang].docsNeeded}</h4>
                               <div className="space-y-2">
                                 {scheme.required_documents.map((doc, dIdx) => (
                                   <div key={dIdx} className="flex items-center gap-2 text-xs text-[#6B6B6B] dark:text-gray-400">
                                     <div className="w-1.5 h-1.5 bg-[#E2D2B5] rounded-full" />
                                     {doc}
                                   </div>
                                 ))}
                               </div>
                             </div>
                           </div>

                           <div className="pt-6 border-t border-[#E2D2B5] dark:border-[#333] flex flex-col gap-3">
                             <button
                               onClick={() => setSelectedSchemeForHelp(scheme)}
                               className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#252525] border border-[#E2D2B5] dark:border-[#444] font-bold text-[#1A1A1A] dark:text-white hover:bg-[#F6F4F0] dark:hover:bg-[#333] transition-all shadow-sm"
                             >
                               <Info className="w-4 h-4 text-[#A59477]" /> {TRANSLATIONS[lang].askHelp}
                             </button>
                             {scheme.official_link && (
                               <a 
                                 href={scheme.official_link} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1A1A1A] dark:bg-[#A59477] text-white font-bold hover:bg-[#333333] dark:hover:bg-[#C5B497] transition-all shadow-md"
                               >
                                 {TRANSLATIONS[lang].visitPortal} <ExternalLink className="w-4 h-4" />
                               </a>
                             )}
                           </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Chat Modal Toggle */}
              <AnimatePresence>
                {selectedSchemeForHelp && (
                  <ChatAssistant 
                    scheme={selectedSchemeForHelp} 
                    profile={profile} 
                    lang={lang}
                    onClose={() => setSelectedSchemeForHelp(null)} 
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-[#E2D2B5] py-12 mt-20 text-center">
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs font-bold uppercase tracking-widest text-[#A59477]">
          <button onClick={() => setActiveInfoSection('how-it-works')} className="hover:text-[#1A1A1A] cursor-pointer">
            {TRANSLATIONS[lang].howItWorks || "How it works"}
          </button>
          <button onClick={() => setActiveInfoSection('ministries')} className="hover:text-[#1A1A1A] cursor-pointer">
            {TRANSLATIONS[lang].ministries || "Ministries"}
          </button>
          <button onClick={() => setActiveInfoSection('contact')} className="hover:text-[#1A1A1A] cursor-pointer">
            {TRANSLATIONS[lang].contact || "Contact"}
          </button>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#A59477] mb-4">
          Data sourced from official Government portals
        </p>
        <p className="text-[#6B6B6B] text-sm max-w-md mx-auto">
          Yojana Scout uses advanced AI to simplify citizen access to social security. 
          Please verify details on the official portals before applying.
        </p>
      </footer>

      <AnimatePresence>
        {activeInfoSection && (
          <InfoModal 
            type={activeInfoSection} 
            lang={lang} 
            onClose={() => setActiveInfoSection(null)} 
          />
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsGeneralChatOpen(true)}
        className="fixed bottom-8 right-8 z-[90] w-16 h-16 bg-[#1A1A1A] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#333] transition-all group"
      >
        <MessageSquare className="w-8 h-8" strokeWidth={1.5} />
        <div className="absolute right-full mr-4 bg-white dark:bg-[#1A1A1A] px-4 py-2 rounded-xl border border-[#E2D2B5] dark:border-[#333] shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <p className="text-xs font-bold text-[#A59477]">Ask Anything</p>
        </div>
      </motion.button>

      <AnimatePresence>
        {isGeneralChatOpen && (
          <ChatAssistant 
            scheme={null} 
            profile={profile} 
            lang={lang} 
            onClose={() => setIsGeneralChatOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
