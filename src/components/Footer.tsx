import React from 'react';
import { Sprout, ShieldCheck, Heart, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onSelectTab: (tabId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200/80 bg-white py-12 text-xs text-slate-500 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                <Sprout className="w-4 h-4 text-emerald-100" />
              </div>
              <span className="text-xl font-black text-slate-900 font-serif">AgriSahay 🌱</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Empowering smallholder and progressive farmers with AI crop diagnostics, customized organic eco-plans, and verified farmland exchange.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
            <button onClick={() => onSelectTab('home')} className="hover:text-emerald-700 cursor-pointer">Home</button>
            <button onClick={() => onSelectTab('ecoPlan')} className="hover:text-emerald-700 cursor-pointer">Eco Plan</button>
            <button onClick={() => onSelectTab('diseaseDetection')} className="hover:text-emerald-700 cursor-pointer">Disease Detection</button>
            <button onClick={() => onSelectTab('compost')} className="hover:text-emerald-700 cursor-pointer">Compost</button>
            <button onClick={() => onSelectTab('rotation')} className="hover:text-emerald-700 cursor-pointer">Crop Rotation</button>
            <button onClick={() => onSelectTab('journal')} className="hover:text-emerald-700 cursor-pointer">Journal</button>
            <button onClick={() => onSelectTab('marketplace')} className="hover:text-emerald-700 cursor-pointer">Marketplace</button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-400">
            {t('footerText', { year: new Date().getFullYear() }) || `© ${new Date().getFullYear()} AgriSahay. Empowering sustainable regenerative agriculture worldwide.`}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>Non-Toxic Agronomy</span>
            <span>·</span>
            <span>Microbiome Friendly</span>
            <span>·</span>
            <span>Farmer Verified</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
