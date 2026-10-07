export type LanguageCode = 'en' | 'hi' | 'mr' | 'te' | 'ta' | 'pa';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  state?: string;
  district?: string;
  village?: string;
  landSizeAcres?: number;
  crops?: string[];
  soilType?: string;
  authMethod: 'phone' | 'google' | 'guest';
  isGuest: boolean;
  profileComplete: boolean;
  createdAt: string;
}

export type DiseaseType = 'Disease' | 'Pest' | 'Nutrient Deficiency' | 'Healthy';
export type SeverityLevel = 'Low' | 'Medium' | 'High';

export interface DiseaseDetection {
  id: string;
  userId: string;
  imageUrl: string;
  diseaseName: string;
  scientificName?: string;
  confidenceScore: number;
  type: DiseaseType;
  severity: SeverityLevel;
  pathogenType?: string;
  symptoms: string[];
  organicRemedies: string[];
  preventativeMeasures: string[];
  spraySchedule?: string;
  createdAt: string;
}

export interface RecommendedCrop {
  cropName: string;
  variety: string;
  duration: string;
  expectedYield: string;
  estProfit: string;
  waterRequirement: string;
  idealCompanion: string;
}

export interface GrowthTimelinePhase {
  phase: string;
  weekRange: string;
  tasks: string[];
  organicNutrition: string[];
}

export interface EcoPlan {
  id?: string;
  title: string;
  sustainabilityScore: number;
  summary: string;
  recommendedCrops: RecommendedCrop[];
  growthTimeline: GrowthTimelinePhase[];
  waterStrategy: {
    method: string;
    frequency: string;
    conservationTips: string[];
  };
  keyPractices: string[];
  riskAnalysis: Array<{
    threat: string;
    mitigation: string;
  }>;
  marketInsights: {
    bestMandi: string;
    peakWindow: string;
    expectedRatePerQuintal: string;
    trend: string;
  };
}

export interface CompostMaterial {
  id: string;
  name: string;
  type: 'green' | 'brown';
  weightKg: number;
  cnRatio: number;
}

export interface CompostAnalysis {
  cnRatio: number;
  decompositionWeeks: number;
  qualityGrade: string;
  status: string;
  nitrogenPercentage: number;
  carbonPercentage: number;
  moistureRecommendation: string;
  bioAccelerators: string[];
  turningSchedule: string[];
  warnings: string[];
}

export interface CropRotationStrategy {
  successionPlan: Array<{
    crop: string;
    season: string;
    family: string;
    benefits: string;
    nutrientImpact: string;
  }>;
  intercroppingOptions: Array<{
    crop: string;
    role: string;
    arrangement: string;
  }>;
  soilRestorationStrategy: {
    nitrogenFixation: string;
    organicMatterPlan: string;
    pestBreakerActions: string[];
  };
  warnings: string[];
}

export interface FarmListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  landSizeAcres: number;
  state: string;
  district: string;
  village: string;
  latitude: number;
  longitude: number;
  cropType: string;
  soilType: string;
  waterAvailability: string;
  electricityAvailability: string;
  roadAccess: string;
  facilities: string[];
  status: 'published' | 'draft' | 'sold';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  plotName: string;
  activity: string;
  category: string;
  inputsUsed: string;
  quantity: string;
  harvestYield?: string;
  notes?: string;
  createdAt: string;
}
