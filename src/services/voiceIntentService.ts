import { Type } from '@google/genai';
import { generateContentWithFallback, cleanAndExtractJson } from './geminiService';

export type VoiceIntentType = 
  | 'OPEN_CAMERA'
  | 'OPEN_DISEASE_DETECTION'
  | 'OPEN_MARKET_PRICES'
  | 'OPEN_FARM_DETAILS'
  | 'GO_HOME'
  | 'GO_BACK'
  | 'OPEN_PROFILE'
  | 'OPEN_SETTINGS'
  | 'OPEN_COMPOST'
  | 'OPEN_ROTATION'
  | 'OPEN_JOURNAL'
  | 'OPEN_ADVISOR'
  | 'UNKNOWN';

export interface VoiceIntentResult {
  intent: VoiceIntentType;
  action: string;
  spokenResponse: string;
  detectedLanguage: 'Telugu' | 'Hindi' | 'English' | string;
}

const ACTION_MAP: Record<VoiceIntentType, string> = {
  OPEN_CAMERA: 'openCamera',
  OPEN_DISEASE_DETECTION: 'openDiseaseDetection',
  OPEN_MARKET_PRICES: 'openMarketPrices',
  OPEN_FARM_DETAILS: 'openFarmDetails',
  GO_HOME: 'goHome',
  GO_BACK: 'goBack',
  OPEN_PROFILE: 'openProfile',
  OPEN_SETTINGS: 'openSettings',
  OPEN_COMPOST: 'openCompost',
  OPEN_ROTATION: 'openRotation',
  OPEN_JOURNAL: 'openJournal',
  OPEN_ADVISOR: 'openAdvisor',
  UNKNOWN: 'promptClarification'
};

/**
 * Fast sub-millisecond local intent recognizer for common farmer commands in
 * Telugu, Hindi, English, and transliterated mixed speech.
 */
export function matchFastLocalIntent(rawInput: string): VoiceIntentResult | null {
  const text = rawInput.trim().toLowerCase();

  // Telugu / Mixed patterns
  const isTeluguScript = /[\u0C00-\u0C7F]/.test(text);
  const isHindiScript = /[\u0C80-\u0D7F\u0900-\u097F]/.test(text);

  // 1. Camera Intent
  if (
    text.includes('camera') || 
    text.includes('కెమెరా') || 
    text.includes('कैमरा') || 
    text.includes('photo theeyi') ||
    text.includes('photo teey') ||
    text.includes('snap photo')
  ) {
    if (isTeluguScript || text.includes('cheyyi') || text.includes('teey') || text.includes('chudu')) {
      return {
        intent: 'OPEN_CAMERA',
        action: ACTION_MAP.OPEN_CAMERA,
        spokenResponse: 'Camera open chestunnanu.',
        detectedLanguage: 'Telugu'
      };
    }
    if (isHindiScript || text.includes('kholo') || text.includes('khol')) {
      return {
        intent: 'OPEN_CAMERA',
        action: ACTION_MAP.OPEN_CAMERA,
        spokenResponse: 'कैमरा खोला जा रहा है।',
        detectedLanguage: 'Hindi'
      };
    }
    return {
      intent: 'OPEN_CAMERA',
      action: ACTION_MAP.OPEN_CAMERA,
      spokenResponse: 'Opening Camera.',
      detectedLanguage: 'English'
    };
  }

  // 2. Disease Detection Intent
  if (
    text.includes('disease') || 
    text.includes('pathology') || 
    text.includes('వ్యాధి') || 
    text.includes('రోగం') || 
    text.includes('తెగులు') || 
    text.includes('బీమారీ') || 
    text.includes('बीमारी') || 
    text.includes('rog') ||
    text.includes('keeda') ||
    text.includes('purugu')
  ) {
    if (isTeluguScript || text.includes('cheyyi') || text.includes('chupinchu') || text.includes('panta')) {
      return {
        intent: 'OPEN_DISEASE_DETECTION',
        action: ACTION_MAP.OPEN_DISEASE_DETECTION,
        spokenResponse: 'Disease Detection open chestunnanu.',
        detectedLanguage: 'Telugu'
      };
    }
    if (isHindiScript || text.includes('kholo') || text.includes('dikhao') || text.includes('fasal')) {
      return {
        intent: 'OPEN_DISEASE_DETECTION',
        action: ACTION_MAP.OPEN_DISEASE_DETECTION,
        spokenResponse: 'फसल रोग निदान खोला जा रहा है।',
        detectedLanguage: 'Hindi'
      };
    }
    return {
      intent: 'OPEN_DISEASE_DETECTION',
      action: ACTION_MAP.OPEN_DISEASE_DETECTION,
      spokenResponse: 'Opening Disease Detection.',
      detectedLanguage: 'English'
    };
  }

  // 3. Market Prices Intent
  if (
    text.includes('market') || 
    text.includes('mandi') || 
    text.includes('price') || 
    text.includes('rate') || 
    text.includes('ధర') || 
    text.includes('ధరలు') || 
    text.includes('భావ') || 
    text.includes('भाव') || 
    text.includes('రేటు')
  ) {
    if (isTeluguScript || text.includes('chupinchu') || text.includes('cheyyi') || text.includes('ee roju')) {
      return {
        intent: 'OPEN_MARKET_PRICES',
        action: ACTION_MAP.OPEN_MARKET_PRICES,
        spokenResponse: 'Market prices chupistunnanu.',
        detectedLanguage: 'Telugu'
      };
    }
    if (isHindiScript || text.includes('dikhao') || text.includes('bhav') || text.includes('aaj')) {
      return {
        intent: 'OPEN_MARKET_PRICES',
        action: ACTION_MAP.OPEN_MARKET_PRICES,
        spokenResponse: 'मंडी भाव दिखाए जा रहे हैं।',
        detectedLanguage: 'Hindi'
      };
    }
    return {
      intent: 'OPEN_MARKET_PRICES',
      action: ACTION_MAP.OPEN_MARKET_PRICES,
      spokenResponse: 'Showing market prices.',
      detectedLanguage: 'English'
    };
  }

  // 4. Farm / Land Details Intent
  if (
    text.includes('farm details') || 
    text.includes('land details') || 
    text.includes('పొలం') || 
    text.includes('భూమి') || 
    text.includes('ఖేత్') || 
    text.includes('खेत') || 
    text.includes('polam') || 
    text.includes('na farm')
  ) {
    if (isTeluguScript || text.includes('chupinchu') || text.includes('na polam')) {
      return {
        intent: 'OPEN_FARM_DETAILS',
        action: ACTION_MAP.OPEN_FARM_DETAILS,
        spokenResponse: 'Mee farm details chupistunnanu.',
        detectedLanguage: 'Telugu'
      };
    }
    if (isHindiScript || text.includes('dikhao') || text.includes('khet')) {
      return {
        intent: 'OPEN_FARM_DETAILS',
        action: ACTION_MAP.OPEN_FARM_DETAILS,
        spokenResponse: 'आपके खेत का विवरण दिखाया जा रहा है।',
        detectedLanguage: 'Hindi'
      };
    }
    return {
      intent: 'OPEN_FARM_DETAILS',
      action: ACTION_MAP.OPEN_FARM_DETAILS,
      spokenResponse: 'Opening your farm details.',
      detectedLanguage: 'English'
    };
  }

  // 5. Home Intent
  if (
    text === 'home' || 
    text.includes('home ki') || 
    text.includes('go home') || 
    text.includes('హోమ్') || 
    text.includes('होम') || 
    text.includes('main page')
  ) {
    if (isTeluguScript || text.includes('vellu') || text.includes('ki')) {
      return {
        intent: 'GO_HOME',
        action: ACTION_MAP.GO_HOME,
        spokenResponse: 'Home page ki velthunnanu.',
        detectedLanguage: 'Telugu'
      };
    }
    if (isHindiScript || text.includes('jao') || text.includes('par')) {
      return {
        intent: 'GO_HOME',
        action: ACTION_MAP.GO_HOME,
        spokenResponse: 'होम पेज पर जा रहे हैं।',
        detectedLanguage: 'Hindi'
      };
    }
    return {
      intent: 'GO_HOME',
      action: ACTION_MAP.GO_HOME,
      spokenResponse: 'Going to Home.',
      detectedLanguage: 'English'
    };
  }

  // 6. Back Intent
  if (
    text === 'back' || 
    text.includes('back ki') || 
    text.includes('go back') || 
    text.includes('వెనక్కి') || 
    text.includes('పీచే') || 
    text.includes('पीछे') || 
    text.includes('venakki')
  ) {
    if (isTeluguScript || text.includes('vellu') || text.includes('venakki')) {
      return {
        intent: 'GO_BACK',
        action: ACTION_MAP.GO_BACK,
        spokenResponse: 'Venakki velthunnanu.',
        detectedLanguage: 'Telugu'
      };
    }
    if (isHindiScript || text.includes('jao') || text.includes('peeche')) {
      return {
        intent: 'GO_BACK',
        action: ACTION_MAP.GO_BACK,
        spokenResponse: 'पीछे जा रहे हैं।',
        detectedLanguage: 'Hindi'
      };
    }
    return {
      intent: 'GO_BACK',
      action: ACTION_MAP.GO_BACK,
      spokenResponse: 'Going back.',
      detectedLanguage: 'English'
    };
  }

  // 7. Profile / Settings Intent
  if (text.includes('profile') || text.includes('ప్రొఫైల్') || text.includes('प्रोफाइल')) {
    if (isTeluguScript || text.includes('cheyyi') || text.includes('open')) {
      return {
        intent: 'OPEN_PROFILE',
        action: ACTION_MAP.OPEN_PROFILE,
        spokenResponse: 'Profile open chestunnanu.',
        detectedLanguage: 'Telugu'
      };
    }
    if (isHindiScript || text.includes('kholo')) {
      return {
        intent: 'OPEN_PROFILE',
        action: ACTION_MAP.OPEN_PROFILE,
        spokenResponse: 'प्रोफाइल खोली जा रही है।',
        detectedLanguage: 'Hindi'
      };
    }
    return {
      intent: 'OPEN_PROFILE',
      action: ACTION_MAP.OPEN_PROFILE,
      spokenResponse: 'Opening Profile.',
      detectedLanguage: 'English'
    };
  }

  if (text.includes('setting') || text.includes('సెట్టింగ్') || text.includes('सेटिंग')) {
    return {
      intent: 'OPEN_SETTINGS',
      action: ACTION_MAP.OPEN_SETTINGS,
      spokenResponse: isTeluguScript || text.includes('cheyyi')
        ? 'Settings open chestunnanu.'
        : isHindiScript || text.includes('kholo')
        ? 'सेटिंग्स खोली जा रही है।'
        : 'Opening Settings.',
      detectedLanguage: isTeluguScript ? 'Telugu' : isHindiScript ? 'Hindi' : 'English'
    };
  }

  return null;
}

/**
 * Resolves natural multilingual user speech commands into structured app actions.
 * Employs Gemini AI for nuanced conversational or colloquial sentences with graceful fallback.
 */
export async function resolveVoiceIntent(
  rawTranscript: string,
  userLanguageHint: string = 'en'
): Promise<VoiceIntentResult> {
  const cleanTranscript = (rawTranscript || '').trim();
  if (!cleanTranscript) {
    return {
      intent: 'UNKNOWN',
      action: ACTION_MAP.UNKNOWN,
      spokenResponse: userLanguageHint === 'te' 
        ? 'Meeru emi open cheyyalanukuntunnaru?' 
        : userLanguageHint === 'hi' 
        ? 'आप क्या खोलना चाहते हैं?' 
        : "I didn't understand that. Please tell me what you want to open.",
      detectedLanguage: userLanguageHint === 'te' ? 'Telugu' : userLanguageHint === 'hi' ? 'Hindi' : 'English'
    };
  }

  // 1. Check instant local rule matcher
  const quickMatch = matchFastLocalIntent(cleanTranscript);
  if (quickMatch) {
    return quickMatch;
  }

  // 2. Deep intent recognition via Gemini
  try {
    const systemInstruction = `You are AgriSahay AI Multilingual Voice Assistant Router for Indian farmers.
Interpret the farmer's voice command, which may be in Telugu, Hindi, English, or mixed language (e.g. Telugu + English or Hinglish).
Identify user intent among:
- OPEN_CAMERA (e.g., "Camera open cheyyi", "open camera", "take photo of leaf", "ఫోటో తీయి")
- OPEN_DISEASE_DETECTION (e.g., "Crop disease check cheyyali", "నా పంటకు disease ఉందో check చెయ్యి", "मेरी फसल की बीमारी चेक करो")
- OPEN_MARKET_PRICES (e.g., "Market prices chupinchu", "Show today's crop prices", "ఈరోజు పంట ధరలు చూపించు", "फसल के आज के भाव दिखाओ")
- OPEN_FARM_DETAILS (e.g., "Na farm details chupinchu", "Show my land details", "నా పొలం వివరాలు చూపించు")
- GO_HOME (e.g., "Home ki vellu", "home page", "హోమ్ కి వెళ్ళు")
- GO_BACK (e.g., "Back ki vellu", "previous page", "వెనక్కి వెళ్ళు")
- OPEN_PROFILE (e.g., "Profile open cheyyi", "my profile")
- OPEN_SETTINGS (e.g., "Settings open cheyyi")
- OPEN_COMPOST (e.g., "Compost planner", "खाद कैलकुलेटर")
- OPEN_ROTATION (e.g., "Crop rotation", "పంట మార్పిడి")
- OPEN_JOURNAL (e.g., "Farm journal", "డైరీ")
- OPEN_ADVISOR (e.g., "Ask bio advisor", "సలహాదారు")
- UNKNOWN

Rules for spokenResponse:
- Respond naturally in the SAME language spoken by the user.
- For Telugu / Telugu+English: Give short spoken confirmation like "Disease Detection open chestunnanu." or "Camera open chestunnanu." or "Market prices chupistunnanu."
- For Hindi: Give short confirmation like "फसल रोग निदान खोला जा रहा है।" or "कैमरा खोला जा रहा है।"
- For English: Give short confirmation like "Opening Disease Detection." or "Opening Camera."
- If UNKNOWN or unclear:
  - Telugu: "Meeru emi open cheyyalanukuntunnaru?"
  - Hindi: "आप क्या खोलना चाहते हैं?"
  - English: "I didn't understand that. Please tell me what you want to open."
Output strictly valid JSON complying with schema.`;

    const response = await generateContentWithFallback({
      contents: cleanTranscript,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              description: 'One of the supported intent names'
            },
            spokenResponse: {
              type: Type.STRING,
              description: 'Short spoken confirmation in the user language'
            },
            detectedLanguage: {
              type: Type.STRING,
              description: 'Detected language name e.g. Telugu, Hindi, English'
            }
          },
          required: ['intent', 'spokenResponse', 'detectedLanguage']
        }
      }
    });

    let parsed: any = {};
    try {
      parsed = cleanAndExtractJson(response.text || '{}');
    } catch {
      parsed = {};
    }
    const validIntents: VoiceIntentType[] = [
      'OPEN_CAMERA',
      'OPEN_DISEASE_DETECTION',
      'OPEN_MARKET_PRICES',
      'OPEN_FARM_DETAILS',
      'GO_HOME',
      'GO_BACK',
      'OPEN_PROFILE',
      'OPEN_SETTINGS',
      'OPEN_COMPOST',
      'OPEN_ROTATION',
      'OPEN_JOURNAL',
      'OPEN_ADVISOR',
      'UNKNOWN'
    ];

    let intent: VoiceIntentType = validIntents.includes(parsed.intent) ? parsed.intent : 'UNKNOWN';

    return {
      intent,
      action: ACTION_MAP[intent] || ACTION_MAP.UNKNOWN,
      spokenResponse: parsed.spokenResponse || (userLanguageHint === 'te' ? 'Meeru emi open cheyyalanukuntunnaru?' : 'I didn\'t understand that. Please tell me what you want to open.'),
      detectedLanguage: parsed.detectedLanguage || 'English'
    };
  } catch (err) {
    console.warn('Voice intent fallback due to AI error:', err);
    return {
      intent: 'UNKNOWN',
      action: ACTION_MAP.UNKNOWN,
      spokenResponse: userLanguageHint === 'te' 
        ? 'Meeru emi open cheyyalanukuntunnaru?' 
        : 'I didn\'t understand that. Please tell me what you want to open.',
      detectedLanguage: userLanguageHint === 'te' ? 'Telugu' : 'English'
    };
  }
}
