import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  Droplet, 
  Sparkles, 
  CheckCircle2, 
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { JournalEntry } from '../types';

interface FarmJournalProps {
  userId: string;
}

export const FarmJournal: React.FC<FarmJournalProps> = ({ userId }) => {
  const { t } = useLanguage();

  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(`agrisahay_journal_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: '1',
        userId,
        date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        plotName: 'North Plot (Sugarcane)',
        activity: 'Applied 200L Jeevamrut via venturi drip system after evening irrigation.',
        category: 'Bio-Fertilizer',
        inputsUsed: 'Jeevamrut & Cow Urine Slurry',
        quantity: '200 Liters',
        harvestYield: 'N/A',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        userId,
        date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
        plotName: 'South Terraces (Organic Tomato)',
        activity: 'Preventative foliar spray of 5% Neem seed kernel extract (NSKE) with soap nut solution.',
        category: 'Pest Control',
        inputsUsed: 'NSKE (Cold-pressed neem extract)',
        quantity: '15 Liters',
        harvestYield: 'N/A',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        userId,
        date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
        plotName: 'East Orchard (Pomegranate & Guava)',
        activity: 'First picking of export-grade Bhagwa pomegranate. Graded and crated.',
        category: 'Harvest',
        inputsUsed: 'None',
        quantity: 'N/A',
        harvestYield: '42 Quintals (₹1,68,000 APMC gross)',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [plotName, setPlotName] = useState('Plot A');
  const [activity, setActivity] = useState('');
  const [category, setCategory] = useState('Bio-Fertilizer');
  const [inputsUsed, setInputsUsed] = useState('');
  const [quantity, setQuantity] = useState('');
  const [harvestYield, setHarvestYield] = useState('');

  useEffect(() => {
    localStorage.setItem(`agrisahay_journal_${userId}`, JSON.stringify(entries));
  }, [entries, userId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) return;

    const newEntry: JournalEntry = {
      id: 'entry_' + Date.now(),
      userId,
      date,
      plotName: plotName.trim() || 'General Field',
      activity: activity.trim(),
      category,
      inputsUsed: inputsUsed.trim() || 'Organic Farm Compost',
      quantity: quantity.trim() || 'Standard dose',
      harvestYield: harvestYield.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    setEntries([newEntry, ...entries]);
    setIsAdding(false);
    setActivity('');
    setInputsUsed('');
    setQuantity('');
    setHarvestYield('');
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-200/80 bg-gradient-to-r from-sky-950 via-emerald-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-1 text-xs font-semibold text-sky-200 border border-white/20 backdrop-blur-xs">
            <BookOpen className="h-3.5 w-3.5 text-sky-300" />
            <span>Digital Field Records</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('journalTitle') || 'Digital Farm Journal & Operations Log'}
          </h2>
          <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed font-normal">
            {t('journalSubtitle') || 'Track plot activities, organic input applications, harvest yields, and farm economics.'}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {t('totalEntries') || 'Total Logs'}
          </span>
          <div className="text-2xl font-black text-slate-900">{entries.length} Entries</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {t('organicDosages') || 'Bio-Treatments Recorded'}
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {entries.filter((e) => e.category === 'Bio-Fertilizer' || e.category === 'Pest Control').length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {t('totalHarvest') || 'Harvest Yield Entries'}
          </span>
          <div className="text-2xl font-black text-sky-700">
            {entries.filter((e) => e.harvestYield && e.harvestYield !== 'N/A').length}
          </div>
        </div>
      </div>

      {/* Controls & Add Entry */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Recent Field Operations</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Close Form' : t('addEntry') || 'Log New Farm Activity'}</span>
        </button>
      </div>

      {/* Add Entry Card */}
      {isAdding && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{t('dateLabel') || 'Date'}</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{t('plotLabel') || 'Plot / Field Name'}</label>
              <input
                type="text"
                required
                value={plotName}
                onChange={(e) => setPlotName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{t('categoryLabel') || 'Category'}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
              >
                <option value="Bio-Fertilizer">Bio-Fertilizer / Inoculant</option>
                <option value="Pest Control">Organic Pest Control / Spray</option>
                <option value="Irrigation">Irrigation / Water Schedule</option>
                <option value="Sowing">Sowing / Transplanting</option>
                <option value="Harvest">Harvest & Yield</option>
                <option value="General">General Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">{t('activityLabel') || 'Activity Description'}</label>
            <textarea
              rows={2}
              required
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="Detail work performed, weather conditions, formulation used..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{t('inputsUsedLabel') || 'Inputs Applied'}</label>
              <input
                type="text"
                value={inputsUsed}
                onChange={(e) => setInputsUsed(e.target.value)}
                placeholder="e.g. Jeevamrut, Neem Cake, Dashaparni"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{t('quantityLabel') || 'Quantity / Dose'}</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 200L, 50kg, 2L/acre"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{t('harvestLabel') || 'Harvest Yield (if any)'}</label>
              <input
                type="text"
                value={harvestYield}
                onChange={(e) => setHarvestYield(e.target.value)}
                placeholder="e.g. 15 Quintals"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              {t('saveLog') || 'Save Journal Entry'}
            </button>
          </div>
        </form>
      )}

      {/* Entries List */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
                  {entry.category}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-bold text-emerald-800">
                  {entry.plotName}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-400 font-mono">
                  {entry.date}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {entry.activity}
              </p>

              {(entry.inputsUsed || entry.harvestYield) && (
                <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-slate-500">
                  {entry.inputsUsed && (
                    <span><strong className="text-slate-700">Inputs:</strong> {entry.inputsUsed} ({entry.quantity})</span>
                  )}
                  {entry.harvestYield && entry.harvestYield !== 'N/A' && (
                    <span className="text-emerald-700 font-bold"><strong>Yield:</strong> {entry.harvestYield}</span>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => handleDelete(entry.id)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors self-end sm:self-start cursor-pointer"
              title="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
