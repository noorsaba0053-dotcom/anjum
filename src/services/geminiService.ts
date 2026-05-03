import { GoogleGenAI, Type } from "@google/genai";
import { CitizenProfile, Scheme, ChatMessage, SupportedLanguage, EligibilityResult } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

const SYSTEM_PROMPT = `You are an Indian government scheme eligibility expert. 
Analyze the citizen profile and return a JSON object containing matched schemes.

IMPORTANT RULES FOR ACCURATE MATCHING:
- Be highly comprehensive. Look for matches in ALL categories: Health, Housing, Farming, Business, Student, Insurance, Employment, Pension, Sanitation, Energy, Financial, Skill, Disability.
- Special emphasis on 'Business': Always check for PM SVANidhi, PMEGP, Stand-Up India, Mudra Yojana, etc. if the user wants to start a business.
- Special emphasis on 'Financial': Check for PM Jan Dhan Yojana, PM Suraksha Bima Yojana, etc.
- Special emphasis on 'Student': Check for scholarships (PM-USP), education loans, etc.
- eligibility_reason MUST reference the user's specific age, income, caste, occupation etc. — not generic text.
- If the user criteria do NOT satisfy any scheme (e.g. income too high, age doesn't match), or if the data is logically contradictory (e.g. age 10 and senior citizen), return an empty array [] for schemes AND provide a highly detailed, empathetic 'rejection_reason' in the requested language. Explain exactly which criteria (age, income, occupation, etc.) likely caused the lack of matches and suggest what kind of details might help find matches (if any).
- Always ensure the 'rejection_reason' is returned if 'schemes' is empty.
- Do NOT hallucinate matches. Accuracy is paramount.
- Return between 0 and 15 schemes.`;

const SCHEME_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    schemes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          scheme_id: { type: Type.STRING },
          scheme_name: { type: Type.STRING },
          ministry: { type: Type.STRING },
          category: { 
            type: Type.STRING, 
            enum: ["Health", "Housing", "Farming", "Business", "Student", "Insurance", "Employment", "Pension", "Sanitation", "Energy", "Financial", "Skill", "Disability"] 
          },
          benefit: { type: Type.STRING },
          match_strength: { type: Type.STRING, enum: ["high", "medium"] },
          eligibility_reason: { type: Type.STRING },
          apply_steps: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          required_documents: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          official_link: { type: Type.STRING }
        },
        required: [
          "scheme_id", 
          "scheme_name", 
          "ministry", 
          "category", 
          "benefit", 
          "match_strength", 
          "eligibility_reason", 
          "apply_steps",
          "required_documents"
        ]
      }
    },
    rejection_reason: { type: Type.STRING }
  },
  required: ["schemes"]
};

export async function checkEligibility(profile: CitizenProfile, lang: SupportedLanguage): Promise<EligibilityResult> {
  const langMap: Record<SupportedLanguage, string> = {
    EN: "English",
    HI: "Hindi",
    KN: "Kannada",
    BN: "Bengali",
    GU: "Gujarati",
    ML: "Malayalam",
    PA: "Punjabi",
    OR: "Odia",
    ES: "Spanish",
    FR: "French",
    DE: "German"
  };

  const userPrompt = `Citizen Profile:
${JSON.stringify(profile, null, 2)}

TASK: Find all eligible Indian government schemes.
OUTPUT LANGUAGE: ${langMap[lang]}. Please return all string values (names, reasons, steps, documents) in ${langMap[lang]}.
IMPORTANT: If "entrepreneur" is true or occupation is "Small business", prioritize matching with "Business" category schemes like PMEGP, Mudra, or PM SVANidhi. Ensure you use the exact categories provided in the schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: SCHEME_RESPONSE_SCHEMA
      }
    });

    const text = response.text;
    if (!text) return { schemes: [] };
    
    return JSON.parse(text) as EligibilityResult;
  } catch (error) {
    console.error("Error checking eligibility:", error);
    throw error;
  }
}

export async function getApplyHelp(schemeName: string | null, profile: CitizenProfile, history: ChatMessage[], lang: SupportedLanguage): Promise<string> {
  const langMap: Record<SupportedLanguage, string> = {
    EN: "English", HI: "Hindi", KN: "Kannada", BN: "Bengali", GU: "Gujarati", 
    ML: "Malayalam", PA: "Punjabi", OR: "Odia", ES: "Spanish", FR: "French", 
    DE: "German"
  };

  const systemInstruction = schemeName 
    ? `You are an expert assistant helping citizens apply for the scheme: "${schemeName}".
       User Profile: ${JSON.stringify(profile)}.
       Provide practical, helpful guidance on documents, where to go, and steps. Keep it concise. 
       Answer in ${langMap[lang]}.`
    : `You are the "Yojana Scout AI Assistant". 
       You help Indian citizens find and understand government schemes.
       User Profile: ${JSON.stringify(profile)}.
       Answer questions about eligibility, documentation, and various government benefits in India.
       If the user asks about a specific scheme, provide details based on your knowledge.
       Keep your tone helpful, empathetic, and professional.
       Answer in ${langMap[lang]}.`;

  try {
    const lastMsg = history[history.length - 1].content;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: lastMsg,
      config: {
        systemInstruction,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Chat Help Error:", error);
    return "I'm having trouble connecting to the helper. Please try again later.";
  }
}
