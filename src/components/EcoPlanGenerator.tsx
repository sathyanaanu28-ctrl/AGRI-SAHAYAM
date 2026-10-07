import React, { useState } from 'react';
import { 
  Sprout, 
  Sparkles, 
  Droplets, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  MapPin, 
  ArrowRight,
  Layers,
  Leaf
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { EcoPlan } from '../types';

export const EcoPlanGenerator: React.FC = () => {
  const { language, t } = useLanguage();

  const [formData, setFormData] = useState({
    location: 'Nashik, Maharashtra',
    soilType: 'Deep Black Cotton Soil',
    season: 'Kharif',
    farmSize: '5',
    budget: 'Medium (₹35,000 - ₹60,000)',
    irrigation: 'Drip Irrigation with Filter Unit',
    farmingGoal: 'High Net Profit & Organic Soil Enrichment'
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<EcoPlan | null>(() => {
    const saved = localStorage.getItem('agrisahay_last_ecoplan');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-eco-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          languageCode: language.code
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error generating eco plan');
      }

      const plan: EcoPlan = await response.json();
      setGeneratedPlan(plan);
      localStorage.setItem('agrisahay_last_ecoplan', JSON.stringify(plan));
    } catch (err: any) {
      setError(err?.message || 'Failed to generate eco-farming plan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-900 via-green-900 to-emerald-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-1 text-xs font-semibold text-emerald-100 border border-white/20 backdrop-blur-xs">
            <Sprout className="h-3.5 w-3.5 text-emerald-300" />
            <span>Regenerative Agriculture Blueprint</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('ecoPlanTitle') || 'Custom Regenerative Eco-Plan'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
            {t('ecoPlanSubtitle') || 'Tailored organic crop recommendations, multi-phase growth roadmaps, water strategies, and market forecasts.'}
          </p>
        </div>
      </div>

      {/* Form Input Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        <form onSubmit={handleGeneratePlan} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('locationLabel') || 'Farm Location / Region'}
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('soilTypeLabel') || 'Soil Type'}
              </label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Deep Black Cotton Soil">Deep Black Cotton Soil (Regur)</option>
                <option value="Alluvial Loamy Clay">Alluvial Loamy Clay</option>
                <option value="Red Sandy Loam">Red Sandy Loam</option>
                <option value="Laterite & Gravelly Soil">Laterite & Gravelly Soil</option>
                <option value="Clayey Loam">Clayey Loam</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('seasonLabel') || 'Current Season'}
              </label>
              <select
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Kharif (Monsoon)">Kharif (Monsoon / June - Oct)</option>
                <option value="Rabi (Winter)">Rabi (Winter / Oct - March)</option>
                <option value="Zaid (Summer)">Zaid (Summer / March - June)</option>
                <option value="Perennial / Multi-Year">Perennial / Multi-Year</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('farmSizeLabel') || 'Farm Size (Acres)'}
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={formData.farmSize}
                onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('budgetLabel') || 'Investment Budget'}
              </label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Low (Under ₹20,000)">Low (Under ₹20,000)</option>
                <option value="Medium (₹20,000 - ₹60,000)">Medium (₹20,000 - ₹60,000)</option>
                <option value="High (Above ₹60,000)">High (Above ₹60,000)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('irrigationLabel') || 'Irrigation Setup'}
              </label>
              <select
                value={formData.irrigation}
                onChange={(e) => setFormData({ ...formData, irrigation: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Drip Irrigation">Drip Irrigation</option>
                <option value="Sprinkler Irrigation">Sprinkler Irrigation</option>
                <option value="Canal / Flood Furrow">Canal / Flood Furrow</option>
                <option value="Rainfed (No Permanent Irrigation)">Rainfed (Dryland)</option>
              </select>
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('generatingPlan') || 'Formulating Plan...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{t('generatePlan') || 'Generate Eco-Farming Plan'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Generated Eco-Plan Display */}
      {generatedPlan && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Plan Header Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Generated Roadmap
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {generatedPlan.title}
                </h3>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  {t('sustainabilityScore') || 'Eco-Sustainability'}
                </span>
                <span className="text-lg font-black text-emerald-700">
                  {generatedPlan.sustainabilityScore}/100
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {generatedPlan.summary}
            </p>
          </div>

          {/* High-Yield Recommended Crops */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-700" />
              <h3 className="text-lg font-bold text-slate-900">
                {t('recommendedCropsTitle') || 'Recommended Organic Crops'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedPlan.recommendedCrops?.map((crop, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{crop.cropName}</h4>
                      <span className="text-xs text-emerald-700 font-semibold">{crop.variety}</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {crop.duration}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Expected Yield:</span>
                      <span className="font-bold text-slate-800">{crop.expectedYield}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Est. Net Profit:</span>
                      <span className="font-bold text-emerald-700">{crop.estProfit}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1">
                    <span className="font-semibold text-slate-700">Companion: </span>
                    {crop.idealCompanion}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Timeline & Organic Nutrition */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>{t('growthTimeline') || 'Chronological Organic Growth Plan'}</span>
            </h3>

            <div className="space-y-4">
              {generatedPlan.growthTimeline?.map((phase, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      {phase.phase}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {phase.weekRange}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 pt-1">
                    <div>
                      <span className="font-bold text-slate-900 block mb-1">Key Operations:</span>
                      <ul className="list-disc pl-4 space-y-1">
                        {phase.tasks.map((task, tIdx) => (
                          <li key={tIdx}>{task}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-emerald-900 block mb-1">Bio-Inputs & Foliar Sprays:</span>
                      <ul className="list-disc pl-4 space-y-1 text-emerald-950">
                        {phase.organicNutrition.map((nutr, nIdx) => (
                          <li key={nIdx}>{nutr}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Water Strategy & Market APMC Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Water Strategy */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sky-800">
                <Droplets className="w-5 h-5 text-sky-600" />
                <h4 className="font-bold text-base text-slate-900">
                  {t('waterStrategy') || 'Water Conservation Strategy'}
                </h4>
              </div>

              <div className="text-xs space-y-2 text-slate-700">
                <p><span className="font-bold text-slate-900">Method:</span> {generatedPlan.waterStrategy?.method}</p>
                <p><span className="font-bold text-slate-900">Interval:</span> {generatedPlan.waterStrategy?.frequency}</p>
                
                <div className="pt-2">
                  <span className="font-bold text-slate-900 block mb-1">Conservation Practices:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {generatedPlan.waterStrategy?.conservationTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* APMC Mandi Market Forecast */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-base text-slate-900">
                  {t('marketTitle') || 'Local Mandi & APMC Market Insights'}
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                  <span className="text-slate-600">Best Mandi Hub:</span>
                  <span className="font-bold text-emerald-900">{generatedPlan.marketInsights?.bestMandi}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                  <span className="text-slate-600">Peak Rate Window:</span>
                  <span className="font-bold text-emerald-900">{generatedPlan.marketInsights?.peakWindow}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                  <span className="text-slate-600">Expected Rate:</span>
                  <span className="font-bold text-emerald-900">{generatedPlan.marketInsights?.expectedRatePerQuintal}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
