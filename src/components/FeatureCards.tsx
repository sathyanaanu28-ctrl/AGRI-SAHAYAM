import React from 'react';
import { 
  FileText, 
  ScanLine, 
  Recycle, 
  RotateCw, 
  BookOpen, 
  MapPin, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FeatureCardsProps {
  onSelectTab: (tabId: string) => void;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({ onSelectTab }) => {
  const { t } = useLanguage();

  const tools = [
    {
      id: 'ecoPlan',
      name: t('ecoPlan') || 'Eco Plan',
      description: 'Custom regenerative crop plans, multi-stage nutrition roadmaps, water strategies & APMC mandi price forecasts.',
      icon: FileText,
      iconColor: 'text-emerald-700 bg-emerald-100',
      badge: 'AI Planning',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'diseaseDetection',
      name: t('diseaseDetection') || 'Disease Detection',
      description: 'Upload crop or leaf photos to detect pathogens, leaf blights, insect pests & 100% organic bio-remedies.',
      icon: ScanLine,
      iconColor: 'text-amber-700 bg-amber-100',
      badge: 'Vision AI',
      image: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'compost',
      name: t('compost') || 'Compost Planner',
      description: 'Calculate Carbon-to-Nitrogen ratios, decomposition durations & microbial acceleration formulations.',
      icon: Recycle,
      iconColor: 'text-teal-700 bg-teal-100',
      badge: 'Soil Biology',
      image: 'https://images.unsplash.com/photo-1585336261026-77564d6e6d1b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'rotation',
      name: t('rotation') || 'Crop Rotation',
      description: 'Plan sequential planting cycles, leguminous nitrogen replenishment & pest lifecycle interruption.',
      icon: RotateCw,
      iconColor: 'text-green-700 bg-green-100',
      badge: 'Succession',
      image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'journal',
      name: t('journal') || 'Farm Journal',
      description: 'Record daily farm operations, bio-input dosages, labor logs & seasonal harvest yield records.',
      icon: BookOpen,
      iconColor: 'text-sky-700 bg-sky-100',
      badge: 'Operations',
      image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'marketplace',
      name: t('marketplace') || 'Farm Marketplace',
      description: 'Explore verified agricultural farmland listings with water rights, borewells, soil tests & interactive maps.',
      icon: MapPin,
      iconColor: 'text-purple-700 bg-purple-100',
      badge: 'Land & Assets',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Regenerative Toolkit
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Core Agriculture Tools
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md">
          Zero-waste, biological agronomy workflows designed specifically for smallholders and progressive Indian farmers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => onSelectTab(tool.id)}
              className="group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* Top Photo Banner */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={tool.image}
                  alt={tool.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                
                {/* Floating Icon & Badge */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${tool.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="absolute top-3.5 right-3.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-white/90 text-slate-800 backdrop-blur-md shadow-xs">
                    {tool.badge}
                  </span>
                </div>

                {/* Title on image */}
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-lg font-black text-white drop-shadow-sm group-hover:text-emerald-200 transition-colors">
                    {tool.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {tool.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 group-hover:text-emerald-600 flex items-center gap-1.5 transition-colors">
                    Open Tool
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Free Access
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
