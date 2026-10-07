import { GoogleGenAI, Type } from '@google/genai';
import { DiseaseDetection, DiseaseType, SeverityLevel } from '../types';

let aiClient: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

const FRIENDLY_PARSING_ERROR = 'AI diagnosis could not be completed. Please try again with a clearer crop or leaf image.';

/**
 * Resilient content generation with model fallback:
 * Tries primary 'gemini-3.8-flash'. If it encounters 503, 500, 429 or temporary high-demand spikes,
 * seamlessly falls back to 'gemini-flash-latest' and 'gemini-3.1-flash-lite' to guarantee uptime.
 */
export async function generateContentWithFallback(options: any): Promise<any> {
  const ai = getAiClient();
  const models = [
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.1-pro-preview'
  ];
  let lastError: any = null;

  // Multimodal image tasks need sufficient time (25s) for transmission & vision pathology
  const hasInlineImage = options?.contents?.parts?.some?.((p: any) => p.inlineData) ||
                         (typeof options?.contents === 'object' && Boolean(options?.contents?.inlineData));
  const timeoutMs = options.timeoutMs || (hasInlineImage ? 25000 : 7000);

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI request timeout')), timeoutMs)
      );
      const { timeoutMs: _t, ...genOptions } = options;
      const response = await Promise.race([
        ai.models.generateContent({
          ...genOptions,
          model
        }),
        timeoutPromise
      ]);
      return response;
    } catch (err: any) {
      const errMsg = err?.message || String(err || '');
      const status = err?.status || err?.statusCode;
      console.warn(`Gemini model ${model} notice (${status || 'info'}): ${errMsg.slice(0, 100)}`);
      lastError = err;

      // If high demand spike, 503, 500, 429, or timeout, try next model with brief pause
      if (
        status === 503 ||
        status === 500 ||
        status === 429 ||
        errMsg.includes('503') ||
        errMsg.includes('high demand') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('overloaded') ||
        errMsg.includes('timeout')
      ) {
        if (i < models.length - 1) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
      }

      if (status === 400 && !errMsg.includes('deadline')) {
        throw err;
      }
    }
  }

  throw lastError;
}

/**
 * Safely extracts and cleans JSON from raw Gemini response.
 * Handles markdown code fences (```json ... ```), extraneous text, and trailing content.
 */
export function cleanAndExtractJson(rawText: string | undefined): any {
  if (!rawText || typeof rawText !== 'string') {
    console.warn('Gemini returned non-JSON response: [Empty or non-string response]');
    throw new Error(FRIENDLY_PARSING_ERROR);
  }

  let cleaned = rawText.trim();

  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
    cleaned = cleaned.trim();
  }

  // Extract JSON object if extra text exists before or after
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1).trim();
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    const safeSnippet = cleaned.length > 200 ? cleaned.slice(0, 200) + '...' : cleaned;
    console.warn('Gemini returned non-JSON response:', safeSnippet);
    throw new Error(FRIENDLY_PARSING_ERROR);
  }

  return parsed;
}

/**
 * Validates parsed object against the required DiseaseDetection schema.
 */
export function validateDiseaseDetection(parsed: any): Omit<DiseaseDetection, 'id' | 'userId' | 'imageUrl' | 'createdAt'> {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(FRIENDLY_PARSING_ERROR);
  }

  // 1. diseaseName must be a string
  if (typeof parsed.diseaseName !== 'string' || !parsed.diseaseName.trim()) {
    console.warn('Gemini returned non-JSON response: [Missing or invalid diseaseName]');
    throw new Error(FRIENDLY_PARSING_ERROR);
  }

  // 2. confidenceScore must be a number
  let confidence = Number(parsed.confidenceScore);
  if (isNaN(confidence)) {
    console.warn('Gemini returned non-JSON response: [Missing or invalid confidenceScore]');
    throw new Error(FRIENDLY_PARSING_ERROR);
  }
  confidence = Math.min(100, Math.max(1, Math.round(confidence)));

  // 3. type must be one of: Disease, Pest, Nutrient Deficiency, Healthy
  const validTypes: DiseaseType[] = ['Disease', 'Pest', 'Nutrient Deficiency', 'Healthy'];
  let matchedType: DiseaseType | undefined = validTypes.find(
    (t) => t.toLowerCase() === String(parsed.type).toLowerCase()
  );
  if (!matchedType) {
    matchedType = 'Disease';
  }

  // 4. severity must be: Low, Medium, High
  const validSeverities: SeverityLevel[] = ['Low', 'Medium', 'High'];
  let matchedSeverity: SeverityLevel | undefined = validSeverities.find(
    (s) => s.toLowerCase() === String(parsed.severity).toLowerCase()
  );
  if (!matchedSeverity) {
    matchedSeverity = matchedType === 'Healthy' ? 'Low' : 'Medium';
  }

  // 5. symptoms must be an array
  if (!Array.isArray(parsed.symptoms)) {
    console.warn('Gemini returned non-JSON response: [symptoms is not an array]');
    throw new Error(FRIENDLY_PARSING_ERROR);
  }
  const cleanSymptoms = parsed.symptoms.map(String).filter((s: string) => s.trim().length > 0);

  // 6. organicRemedies must be an array
  if (!Array.isArray(parsed.organicRemedies)) {
    console.warn('Gemini returned non-JSON response: [organicRemedies is not an array]');
    throw new Error(FRIENDLY_PARSING_ERROR);
  }
  const cleanRemedies = parsed.organicRemedies.map(String).filter((r: string) => r.trim().length > 0);

  // 7. preventativeMeasures must be an array
  if (!Array.isArray(parsed.preventativeMeasures)) {
    console.warn('Gemini returned non-JSON response: [preventativeMeasures is not an array]');
    throw new Error(FRIENDLY_PARSING_ERROR);
  }
  const cleanPreventatives = parsed.preventativeMeasures.map(String).filter((p: string) => p.trim().length > 0);

  return {
    diseaseName: parsed.diseaseName.trim(),
    scientificName: typeof parsed.scientificName === 'string' ? parsed.scientificName.trim() : undefined,
    confidenceScore: confidence,
    type: matchedType,
    severity: matchedSeverity,
    pathogenType: typeof parsed.pathogenType === 'string' ? parsed.pathogenType.trim() : undefined,
    symptoms: cleanSymptoms.length > 0 ? cleanSymptoms : ['Atypical foliage discoloration or stress'],
    organicRemedies: cleanRemedies.length > 0 ? cleanRemedies : ['Apply cold-pressed neem seed kernel extract (5%) with soap emulsifier'],
    preventativeMeasures: cleanPreventatives.length > 0 ? cleanPreventatives : ['Ensure adequate crop spacing and maintain soil organic aeration'],
    spraySchedule: typeof parsed.spraySchedule === 'string' ? parsed.spraySchedule.trim() : undefined
  };
}

/**
 * Handles Gemini API and network errors, mapping to farmer-friendly explanations.
 */
export function handleGeminiApiError(error: any): Error {
  const errMsg = error?.message || String(error || '');
  const status = error?.status || error?.statusCode;

  if (status === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
    return new Error('AI diagnosis service is currently experiencing high demand. Please wait a moment and click Run AI Diagnosis again.');
  }

  if (status === 400 || errMsg.includes('400') || errMsg.includes('INVALID_ARGUMENT')) {
    return new Error('The provided image could not be processed. Please check image format and try again.');
  }

  if (status === 401 || status === 403 || errMsg.includes('401') || errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED')) {
    return new Error('AI service authentication issue. Please verify service configuration.');
  }

  if (status === 500 || status === 503 || errMsg.includes('500') || errMsg.includes('503') || errMsg.includes('INTERNAL') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand') || errMsg.includes('overloaded')) {
    return new Error('AI diagnosis service temporarily unavailable. Please try again in a moment.');
  }

  if (errMsg.includes('timeout') || errMsg.includes('deadline')) {
    return new Error('AI diagnosis request timed out. Please click Run AI Diagnosis again.');
  }

  if (errMsg.includes('fetch failed') || errMsg.includes('network') || errMsg.includes('ECONNREFUSED') || errMsg.includes('ETIMEDOUT')) {
    return new Error('Network connection issue. Please check your internet connectivity and try again.');
  }

  if (errMsg === FRIENDLY_PARSING_ERROR) {
    return new Error(FRIENDLY_PARSING_ERROR);
  }

  return new Error(errMsg || FRIENDLY_PARSING_ERROR);
}

/**
 * Robust disease detection using Gemini AI with structured schema,
 * safe parsing, error mapping, post-parsing validation, and resilient model fallback.
 */
export async function analyzeCropDisease(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  languageCode: string = 'en'
): Promise<Omit<DiseaseDetection, 'id' | 'userId' | 'imageUrl' | 'createdAt'>> {
  // Normalize and clean image input
  let cleanBase64 = imageBase64;
  let cleanMime = mimeType || 'image/jpeg';

  // If a full remote URL was passed, download it to base64 buffer
  if (cleanBase64.startsWith('http://') || cleanBase64.startsWith('https://')) {
    try {
      const imgRes = await fetch(cleanBase64);
      const arrayBuf = await imgRes.arrayBuffer();
      cleanBase64 = Buffer.from(arrayBuf).toString('base64');
      cleanMime = imgRes.headers.get('content-type') || 'image/jpeg';
    } catch (e) {
      console.warn('Failed to fetch remote image url:', e);
    }
  }

  // Strip data URI prefixes
  if (cleanBase64.includes('base64,')) {
    cleanBase64 = cleanBase64.split('base64,')[1];
  } else if (cleanBase64.includes(',')) {
    cleanBase64 = cleanBase64.split(',')[1];
  }
  cleanBase64 = cleanBase64.trim();

  // If cleanMime is svg or generic, default to image/png or image/jpeg
  if (cleanMime.includes('svg') || cleanMime.includes('xml')) {
    cleanMime = 'image/png';
  }

  const langPrompt = {
    hi: 'Provide disease name, symptoms, organic remedies, and prevention in Hindi (Devanagari script) alongside standard English agricultural terms.',
    mr: 'Provide disease name, symptoms, organic remedies, and prevention in Marathi (मराठी) alongside standard English agricultural terms.',
    te: 'Provide disease name, symptoms, organic remedies, and prevention in Telugu (తెలుగు) alongside standard English agricultural terms.',
    ta: 'Provide disease name, symptoms, organic remedies, and prevention in Tamil (தமிழ்) alongside standard agricultural terms.',
    pa: 'Provide disease name, symptoms, organic remedies, and prevention in Punjabi (ਪੰਜਾਬੀ) alongside standard agricultural terms.',
    en: 'Provide standard agronomic plant pathology diagnosis in clear English.'
  }[languageCode] || 'Provide standard agronomic plant pathology diagnosis in clear English.';

  const systemInstruction = `You are AgriSahay's Senior Agronomist and Plant Pathologist.
Analyze the provided crop, leaf, stem, or fruit photo for visible biological diseases, fungal/bacterial blights, insect/pest damage, nutrient deficiencies, or confirmation of healthy vigor.
Diagnose objectively. If the image depicts healthy leaves, designate type="Healthy", severity="Low", and diseaseName="Healthy Foliage / No Active Disease Detected".
For any pathology, provide practical, 100% organic, locally producible biological treatments (such as Jeevamrut, Neem oil, Trichoderma viride, Beauveria bassiana, sour buttermilk spray, wood ash, panchagavya).
Language instruction: ${langPrompt}
Output strictly valid JSON complying with the requested schema.`;

  try {
    const response = await generateContentWithFallback({
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: cleanMime.includes('png') ? 'image/png' : 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: 'Perform plant pathology diagnostic on this crop or leaf specimen. Identify diseaseName, confidenceScore (0-100), type, severity, symptoms, organicRemedies, and preventativeMeasures.'
          }
        ]
      },
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diseaseName: {
              type: Type.STRING,
              description: 'Primary disease, pest, or nutrient condition name'
            },
            scientificName: {
              type: Type.STRING,
              description: 'Pathogen scientific Latin nomenclature if known'
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: 'Confidence rating from 0 to 100'
            },
            type: {
              type: Type.STRING,
              description: 'Must be one of: Disease, Pest, Nutrient Deficiency, Healthy'
            },
            severity: {
              type: Type.STRING,
              description: 'Must be one of: Low, Medium, High'
            },
            pathogenType: {
              type: Type.STRING,
              description: 'Pathogen biological category e.g. Fungal, Bacterial, Viral, Insect, Oomycete'
            },
            symptoms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of visible symptoms observed on the crop leaf or stem'
            },
            organicRemedies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable 100% organic bio-treatments and field inoculants'
            },
            preventativeMeasures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Agronomic hygiene and cultural farm practices to break pathogen cycle'
            },
            spraySchedule: {
              type: Type.STRING,
              description: 'Recommended bio-spray schedule interval'
            }
          },
          required: [
            'diseaseName',
            'confidenceScore',
            'type',
            'severity',
            'symptoms',
            'organicRemedies',
            'preventativeMeasures'
          ]
        }
      }
    });

    const rawResponse = response.text;
    const parsedData = cleanAndExtractJson(rawResponse);
    const validatedResult = validateDiseaseDetection(parsedData);

    return validatedResult;
  } catch (error: any) {
    throw handleGeminiApiError(error);
  }
}
