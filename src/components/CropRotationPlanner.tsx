import React, { useState } from 'react';
import { 
  RotateCw, 
  Sparkles, 
  Leaf, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Clock 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CropRotationStrategy } from '../types';

export const CropRotationPlanner: React.FC = () => {
  const { language, t } = useLanguage();

  const [currentCrop, setCurrentCrop] = useState('Paddy Rice (Oryza sativa)');
  const [soilCondition, setSoilCondition] = useState('Depleted Nitrogen, Heavy Clay Layer');
  const [targetSeason, setTargetSeason] = useState('Rabi (Winter Season)');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [strategy, setStrategy] = useState<CropRotationStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/plan-rotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCrop,
          soilCondition,
          season: targetSeason,
          languageCode: language.code
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate crop rotation strategy');
      }

      const resData: CropRotationStrategy = await response.json();
      setStrategy(resData);
    } catch (err: any) {
      setError(err?.message || 'Crop rotation planning failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-green-200/80 bg-gradient-to-r from-green-950 via-emerald-900 to-teal-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-1 text-xs font-semibold text-green-200 border border-white/20 backdrop-blur-xs">
            <RotateCw className="h-3.5 w-3.5 text-green-300" />
            <span>Succession & Biological Pest Interrupt</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('rotationTitle') || 'Regenerative Crop Rotation Strategy'}
          </h2>
          <p className="text-xs sm:text-sm text-green-100/90 leading-relaxed font-normal">
            {t('rotationSubtitle') || 'Prevent soil depletion, break pathogen cycles, and boost organic yields through sequential planting.'}
          </p>
        </div>
      </div>

      {/* Form Input */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <form onSubmit={handleGenerateRotation} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('currentCropLabel') || 'Current or Last Harvested Crop'}
              </label>
              <input
                type="text"
                required
                value={currentCrop}
                onChange={(e) => setCurrentCrop(e.target.value)}
                placeholder="e.g. Paddy / Rice, Tomato, Cotton"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('soilConditionLabel') || 'Current Soil Condition'}
              </label>
              <input
                type="text"
                required
                value={soilCondition}
                onChange={(e) => setSoilCondition(e.target.value)}
                placeholder="e.g. Depleted Nitrogen, compacted soil, pest history"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('targetSeasonLabel') || 'Upcoming Target Season'}
              </label>
              <select
                value={targetSeason}
                onChange={(e) => setTargetSeason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Rabi (Winter)">Rabi (Winter Season)</option>
                <option value="Zaid (Summer)">Zaid (Summer Season)</option>
                <option value="Kharif (Monsoon)">Kharif (Monsoon Season)</option>
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
                  <span>{t('generatingRotation') || 'Formulating Succession...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{t('generateRotation') || 'Generate Rotation Strategy'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Output Results */}
      {strategy && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Succession Plan Cards */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-emerald-700" />
              <span>{t('nextCrops') || 'Recommended Succession Crops'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {strategy.successionPlan?.map((item, idx) => (
                <div key={idx} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
                      Cycle {idx + 1} · {item.season}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{item.family}</span>
                  </div>

                  <h4 className="text-lg font-extrabold text-slate-900">{item.crop}</h4>

                  <div className="space-y-2 text-xs text-slate-600">
                    <p><span className="font-bold text-slate-800">Agronomic Benefits:</span> {item.benefits}</p>
                    <p><span className="font-bold text-emerald-800">Soil Impact:</span> {item.nutrientImpact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Intercropping & Companion Planting */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-700" />
              <span>{t('intercropping') || 'Intercropping & Companion Planting Options'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategy.intercroppingOptions?.map((opt, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                  <h4 className="font-extrabold text-slate-900 text-sm">{opt.crop}</h4>
                  <p><span className="font-semibold text-slate-700">Role: </span>{opt.role}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{opt.arrangement}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Soil Restoration Strategy */}
          <div className="p-6 rounded-3xl bg-emerald-900 text-white shadow-md space-y-4">
            <div className="flex items-center gap-2 text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="text-base font-bold text-white">
                {t('soilRestoration') || 'Soil Biology & Health Strategy'}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-emerald-100">
              <div>
                <span className="font-bold text-white block mb-1">Nitrogen Fixation & Cover Crop:</span>
                <p>{strategy.soilRestorationStrategy?.nitrogenFixation}</p>
              </div>

              <div>
                <span className="font-bold text-white block mb-1">Organic Matter & Humus:</span>
                <p>{strategy.soilRestorationStrategy?.organicMatterPlan}</p>
              </div>
            </div>

            {strategy.soilRestorationStrategy?.pestBreakerActions?.length > 0 && (
              <div className="pt-3 border-t border-emerald-800 text-xs">
                <span className="font-bold text-emerald-200 block mb-1">Pest Breaking Measures:</span>
                <ul className="list-disc pl-4 space-y-1 text-emerald-100/90">
                  {strategy.soilRestorationStrategy.pestBreakerActions.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
