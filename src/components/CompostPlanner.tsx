import React, { useState } from 'react';
import { 
  Recycle, 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Flame, 
  Layers,
  Clock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CompostMaterial, CompostAnalysis } from '../types';

export const CompostPlanner: React.FC = () => {
  const { language, t } = useLanguage();

  const [materials, setMaterials] = useState<CompostMaterial[]>([
    { id: '1', name: 'Fresh Green Grass & Crop Clippings', type: 'green', weightKg: 100, cnRatio: 20 },
    { id: '2', name: 'Cow Dung & Cattle Manure Slurry', type: 'green', weightKg: 150, cnRatio: 18 },
    { id: '3', name: 'Dry Wheat Straw & Paddy Husk', type: 'brown', weightKg: 120, cnRatio: 80 },
    { id: '4', name: 'Dry Leaves & Shredded Twigs', type: 'brown', weightKg: 80, cnRatio: 60 }
  ]);

  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'green' | 'brown'>('green');
  const [newWeight, setNewWeight] = useState<number>(50);
  const [newCn, setNewCn] = useState<number>(25);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<CompostAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalKg = materials.reduce((acc, m) => acc + m.weightKg, 0);

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const item: CompostMaterial = {
      id: Date.now().toString(),
      name: newName.trim(),
      type: newType,
      weightKg: Number(newWeight),
      cnRatio: Number(newCn)
    };

    setMaterials([...materials, item]);
    setNewName('');
    setNewWeight(50);
    setNewCn(newType === 'green' ? 20 : 60);
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const handleAnalyzeCompost = async () => {
    if (materials.length === 0) {
      setError('Please add at least one material.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-compost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials,
          totalKg,
          languageCode: language.code
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to analyze compost');
      }

      const result: CompostAnalysis = await response.json();
      setAnalysis(result);
    } catch (err: any) {
      setError(err?.message || 'Error occurred during compost calculation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-200/80 bg-gradient-to-r from-teal-900 via-emerald-900 to-green-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-1 text-xs font-semibold text-teal-200 border border-white/20 backdrop-blur-xs">
            <Recycle className="h-3.5 w-3.5 text-teal-300" />
            <span>Aerobic Microbe Balance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('compostTitle') || 'Smart Compost & Soil Optimizer'}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-normal">
            {t('compostSubtitle') || 'Balance Carbon-to-Nitrogen (C:N) ratios, forecast decomposition timelines, and optimize bio-accelerators.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Materials Table & Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Compost Ingredients</h3>
                <p className="text-xs text-slate-500">Total batch weight: <span className="font-bold text-emerald-700">{totalKg} kg</span></p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {materials.map((mat) => (
                <div key={mat.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${mat.type === 'green' ? 'bg-emerald-500' : 'bg-amber-600'}`} />
                    <div>
                      <span className="font-bold text-slate-900 block">{mat.name}</span>
                      <span className="text-[11px] text-slate-400 capitalize">{mat.type} material · C:N {mat.cnRatio}:1</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-700">{mat.weightKg} kg</span>
                    <button
                      onClick={() => handleRemoveMaterial(mat.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Material Inline */}
            <form onSubmit={handleAddMaterial} className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">+ Add Organic Waste</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Material name (e.g. Banana peels)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={newType}
                  onChange={(e) => {
                    const tVal = e.target.value as 'green' | 'brown';
                    setNewType(tVal);
                    setNewCn(tVal === 'green' ? 20 : 60);
                  }}
                  className="px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="green">Green (Nitrogen)</option>
                  <option value="brown">Brown (Carbon)</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    placeholder="Kg"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer"
                    title="Add ingredient"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            <button
              onClick={handleAnalyzeCompost}
              disabled={isLoading || materials.length === 0}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('analyzingCompost') || 'Evaluating Compost Balance...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{t('calculateCompost') || 'Analyze Compost Balance'}</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right: Analysis Result Display */}
        <div className="lg:col-span-5 space-y-6">
          {analysis ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    Biological Assessment
                  </span>
                  <h4 className="text-base font-black text-slate-900">{analysis.status}</h4>
                </div>
                <div className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs">
                  {analysis.qualityGrade}
                </div>
              </div>

              {/* C:N Gauge */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {t('cnRatio') || 'Estimated C:N Ratio'}
                </span>
                <div className="text-3xl font-black text-emerald-800">
                  {analysis.cnRatio}:1
                </div>
                <p className="text-[11px] text-slate-500">
                  Optimal biological composting ratio is 25:1 to 30:1.
                </p>
              </div>

              {/* Ready duration */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-900">
                  <Clock className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold">{t('readyTime') || 'Estimated Ready In'}</span>
                </div>
                <span className="text-sm font-extrabold text-teal-950">
                  {analysis.decompositionWeeks} Weeks
                </span>
              </div>

              {/* Bio-Accelerators */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t('accelerators') || 'Recommended Bio-Accelerators'}
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {analysis.bioAccelerators?.map((acc, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Turning Schedule */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Aeration & Turning Schedule
                </h5>
                <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                  {analysis.turningSchedule?.map((sched, i) => (
                    <li key={i}>{sched}</li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-400 space-y-2">
              <Recycle className="w-10 h-10 mx-auto text-slate-300" />
              <h4 className="text-sm font-bold text-slate-600">No Compost Analyzed Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Add your farm waste materials on the left and click "Analyze Compost Balance" to get exact microbial acceleration guidelines.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
