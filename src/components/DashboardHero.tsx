import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, MapPin, TrendingUp, Users } from 'lucide-react';

interface DashboardHeroProps {
  onExploreTools: () => void;
  onOpenMarketplace: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  onExploreTools,
  onOpenMarketplace
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-green-950 text-white shadow-xl">
      {/* Decorative background glow & pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#22C55E_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Next-Generation Sustainable Agronomy Platform</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Smart Farming. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-300 to-teal-200">
                  Better Decisions.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-emerald-100/90 max-w-xl leading-relaxed font-normal">
                AgriSahay helps farmers make smarter decisions using AI-powered agriculture tools.
                Diagnose crop diseases instantly, formulate regenerative organic crop roadmaps, balance compost nutrients, and discover prime farmland.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <button
                onClick={onExploreTools}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Tools</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenMarketplace}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 hover:border-emerald-300/40 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-emerald-300" />
                <span>Farm Marketplace</span>
              </button>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-6 border-t border-emerald-800/40 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">12,000+</div>
                <div className="text-xs text-emerald-200/70 font-medium">Active Farmers</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-300">98.4%</div>
                <div className="text-xs text-emerald-200/70 font-medium">Pathology Accuracy</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">100%</div>
                <div className="text-xs text-emerald-200/70 font-medium">Zero-Chemical Bio Plans</div>
              </div>
            </div>

          </div>

          {/* Right Column: Agriculture Photo Card with Subtle Overlay */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Photo Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-400/20 aspect-[4/3] sm:aspect-[16/11] group">
                <img
                  src="https://images.unsplash.com/photo-1592417817098-8f3d6eb22521?auto=format&fit=crop&w=1200&q=80"
                  alt="Indian farmers inspecting lush healthy green crops"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                
                {/* Subtle Green Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-950/20 to-transparent" />
                
                {/* Floating Info Pill on Image */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-slate-950/70 backdrop-blur-md border border-emerald-500/30 text-white flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">ICAR & Regenerative Compliant</h4>
                      <p className="text-[11px] text-emerald-200/80">Biological remedies and bio-humus formulas</p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    Live
                  </span>
                </div>
              </div>

              {/* Accent Floating Badge */}
              <div className="hidden sm:flex absolute -top-4 -right-4 px-4 py-2.5 rounded-2xl bg-white/95 text-slate-900 shadow-xl border border-slate-200 items-center gap-2.5 backdrop-blur-md">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">Kharif Season Active</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
