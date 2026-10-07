import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Type } from '@google/genai';
import { 
  analyzeCropDisease, 
  generateContentWithFallback,
  cleanAndExtractJson 
} from './src/services/geminiService';
import { resolveVoiceIntent } from './src/services/voiceIntentService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Support base64 image uploads up to 35MB
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// 1. Plant Pathology Disease Detection API
app.post('/api/diagnose-crop', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, languageCode } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid crop or leaf image.' });
    }

    const diagnosis = await analyzeCropDisease(
      imageBase64,
      mimeType || 'image/jpeg',
      languageCode || 'en'
    );

    return res.json(diagnosis);
  } catch (error: any) {
    const errMsg = error?.message || 'AI diagnosis could not be completed. Please try again with a clearer crop or leaf image.';
    console.warn('Diagnostic notice:', errMsg);
    const statusCode = errMsg.includes('high demand') || errMsg.includes('temporarily unavailable') ? 503 :
                       errMsg.includes('quota') ? 429 : 500;
    return res.status(statusCode).json({ error: errMsg });
  }
});

// 2. Custom Regenerative Eco-Plan Generator
app.post('/api/generate-eco-plan', async (req: Request, res: Response) => {
  try {
    const { location, soilType, season, farmSize, budget, irrigation, farmingGoal, languageCode } = req.body;

    const prompt = `Generate a comprehensive regenerative agriculture plan for a farmer in India.
Field parameters:
- Location/District: ${location || 'Maharashtra'}
- Soil Type: ${soilType || 'Black Soil'}
- Season: ${season || 'Kharif'}
- Farm Size: ${farmSize || '5'} Acres
- Investment Budget: ${budget || 'Medium (₹30,000 - ₹60,000)'}
- Irrigation: ${irrigation || 'Drip Irrigation'}
- Farming Goal: ${farmingGoal || 'High Profit & Soil Regeneration'}
- Language code: ${languageCode || 'en'}

Output high-yield organic crops, growth timeline, water conservation strategy, key practices, risk mitigation, and APMC/Mandi market rate projections.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: 'You are AgriSahay Senior Agro-Ecologist. Provide practical, high-profit organic farming roadmap complying strictly with the requested JSON schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            sustainabilityScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            recommendedCrops: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  cropName: { type: Type.STRING },
                  variety: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  expectedYield: { type: Type.STRING },
                  estProfit: { type: Type.STRING },
                  waterRequirement: { type: Type.STRING },
                  idealCompanion: { type: Type.STRING }
                },
                required: ['cropName', 'variety', 'duration', 'expectedYield', 'estProfit', 'waterRequirement', 'idealCompanion']
              }
            },
            growthTimeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING },
                  weekRange: { type: Type.STRING },
                  tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  organicNutrition: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['phase', 'weekRange', 'tasks', 'organicNutrition']
              }
            },
            waterStrategy: {
              type: Type.OBJECT,
              properties: {
                method: { type: Type.STRING },
                frequency: { type: Type.STRING },
                conservationTips: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['method', 'frequency', 'conservationTips']
            },
            keyPractices: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  threat: { type: Type.STRING },
                  mitigation: { type: Type.STRING }
                },
                required: ['threat', 'mitigation']
              }
            },
            marketInsights: {
              type: Type.OBJECT,
              properties: {
                bestMandi: { type: Type.STRING },
                peakWindow: { type: Type.STRING },
                expectedRatePerQuintal: { type: Type.STRING },
                trend: { type: Type.STRING }
              },
              required: ['bestMandi', 'peakWindow', 'expectedRatePerQuintal', 'trend']
            }
          },
          required: [
            'title',
            'sustainabilityScore',
            'summary',
            'recommendedCrops',
            'growthTimeline',
            'waterStrategy',
            'keyPractices',
            'riskAnalysis',
            'marketInsights'
          ]
        }
      }
    });

    const parsed = cleanAndExtractJson(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Eco plan notice:', error?.message || error);
    return res.status(500).json({ error: error?.message || 'Failed to generate eco-farming plan.' });
  }
});

// 3. Smart Compost C:N Optimizer API
app.post('/api/analyze-compost', async (req: Request, res: Response) => {
  try {
    const { materials, totalKg, languageCode } = req.body;

    const response = await generateContentWithFallback({
      contents: `Analyze these compost ingredients (Total weight: ${totalKg} kg):
${JSON.stringify(materials, null, 2)}
Calculate estimated C:N ratio (optimal 25:1 to 30:1), estimated weeks until mature humus, bio-accelerators (Jeevamrut, cow dung slurry, waste decomposer), turning schedule, and actionable microbial tips. Language: ${languageCode || 'en'}.`,
      config: {
        systemInstruction: 'You are an organic soil microbiology expert. Output strictly valid JSON with exact schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cnRatio: { type: Type.NUMBER },
            decompositionWeeks: { type: Type.NUMBER },
            qualityGrade: { type: Type.STRING },
            status: { type: Type.STRING },
            nitrogenPercentage: { type: Type.NUMBER },
            carbonPercentage: { type: Type.NUMBER },
            moistureRecommendation: { type: Type.STRING },
            bioAccelerators: { type: Type.ARRAY, items: { type: Type.STRING } },
            turningSchedule: { type: Type.ARRAY, items: { type: Type.STRING } },
            warnings: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: [
            'cnRatio',
            'decompositionWeeks',
            'qualityGrade',
            'status',
            'nitrogenPercentage',
            'carbonPercentage',
            'moistureRecommendation',
            'bioAccelerators',
            'turningSchedule',
            'warnings'
          ]
        }
      }
    });

    const parsed = cleanAndExtractJson(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Compost analysis notice:', error?.message || error);
    return res.status(500).json({ error: error?.message || 'Failed to analyze compost balance.' });
  }
});

// 4. Crop Rotation Succession Strategy API
app.post('/api/plan-rotation', async (req: Request, res: Response) => {
  try {
    const { currentCrop, soilCondition, season, languageCode } = req.body;

    const response = await generateContentWithFallback({
      contents: `Formulate a 3-cycle regenerative crop rotation and intercropping succession strategy for:
Current / Last Crop: ${currentCrop}
Soil condition: ${soilCondition}
Upcoming target season: ${season}
Language: ${languageCode || 'en'}`,
      config: {
        systemInstruction: 'You are an expert in agro-biodiversity, legume nitrogen fixation, and pest cycle interruption.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            successionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  crop: { type: Type.STRING },
                  season: { type: Type.STRING },
                  family: { type: Type.STRING },
                  benefits: { type: Type.STRING },
                  nutrientImpact: { type: Type.STRING }
                },
                required: ['crop', 'season', 'family', 'benefits', 'nutrientImpact']
              }
            },
            intercroppingOptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  crop: { type: Type.STRING },
                  role: { type: Type.STRING },
                  arrangement: { type: Type.STRING }
                },
                required: ['crop', 'role', 'arrangement']
              }
            },
            soilRestorationStrategy: {
              type: Type.OBJECT,
              properties: {
                nitrogenFixation: { type: Type.STRING },
                organicMatterPlan: { type: Type.STRING },
                pestBreakerActions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['nitrogenFixation', 'organicMatterPlan', 'pestBreakerActions']
            },
            warnings: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['successionPlan', 'intercroppingOptions', 'soilRestorationStrategy', 'warnings']
        }
      }
    });

    const parsed = cleanAndExtractJson(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Rotation strategy notice:', error?.message || error);
    return res.status(500).json({ error: error?.message || 'Failed to generate crop rotation strategy.' });
  }
});

// 5. Bio-Agronomy Advisor Q&A API
app.post('/api/farm-advisory', async (req: Request, res: Response) => {
  try {
    const { question, languageCode } = req.body;

    const response = await generateContentWithFallback({
      contents: question,
      config: {
        systemInstruction: `You are AgriSahay's senior organic agricultural advisor (Kisan Sahayak). Answer the farmer's question with practical, non-chemical, regenerative farming wisdom. Keep answers concise, actionable, and warm. Language code: ${languageCode || 'en'}.`
      }
    });

    return res.json({ answer: response.text || 'No response generated.' });
  } catch (error: any) {
    console.warn('Farm advisory notice:', error?.message || error);
    return res.status(500).json({ error: error?.message || 'Failed to consult Bio-Advisor.' });
  }
});

// 6. Multilingual Voice Assistant Intent API
app.post('/api/voice-intent', async (req: Request, res: Response) => {
  try {
    const { transcript, languageCode } = req.body;
    const result = await resolveVoiceIntent(transcript || '', languageCode || 'te');
    return res.json(result);
  } catch (error: any) {
    console.warn('Voice intent router notice:', error?.message || error);
    return res.status(500).json({
      intent: 'UNKNOWN',
      action: 'promptClarification',
      spokenResponse: 'Meeru emi open cheyyalanukuntunnaru?',
      detectedLanguage: 'Telugu'
    });
  }
});

// Vite middleware mounting in development, or static hosting in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 AgriSahay server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
