import React, { useState } from 'react';
import { 
  Sprout, 
  Menu, 
  X, 
  Globe, 
  User as UserIcon, 
  LogOut, 
  Check, 
  ChevronDown,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import { Language } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenProfile }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', labelKey: 'home', defaultLabel: 'Home' },
    { id: 'ecoPlan', labelKey: 'ecoPlan', defaultLabel: 'Eco Plan' },
    { id: 'diseaseDetection', labelKey: 'diseaseDetection', defaultLabel: 'Disease Detection' },
    { id: 'compost', labelKey: 'compost', defaultLabel: 'Compost' },
    { id: 'rotation', labelKey: 'rotation', defaultLabel: 'Crop Rotation' },
    { id: 'journal', labelKey: 'journal', defaultLabel: 'Journal' },
    { id: 'marketplace', labelKey: 'marketplace', defaultLabel: 'Farm Marketplace' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20 group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950 font-serif">
                  AgriSahay
                </span>
                <span className="text-lg">🌱</span>
              </div>
              <p className="text-[10px] font-semibold tracking-wider text-emerald-700/80 uppercase">
                Smart Eco-Farming
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const label = t(item.labelKey) || item.defaultLabel;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60 shadow-2xs'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Island: Language, Profile, Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangMenuOpen(!langMenuOpen);
                  setUserMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 text-xs font-semibold text-slate-700 hover:text-emerald-900 bg-white shadow-2xs transition-colors cursor-pointer"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">{language.nativeName}</span>
                <span className="sm:hidden uppercase">{language.code}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setLangMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Language
                    </div>
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const isSelected = lang.code === language.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleSelectLanguage(lang)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-50 text-emerald-800 font-bold' 
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <span className="block font-medium">{lang.nativeName}</span>
                            <span className="text-[10px] text-slate-400">{lang.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* User Profile / Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen);
                    setLangMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white shadow-2xs transition-all cursor-pointer"
                  title="Farmer Profile"
                >
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="w-7 h-7 rounded-lg object-cover border border-emerald-500/20"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0) || 'K'}
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <span className="block text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                      {user.name || 'Farmer'}
                    </span>
                    <span className="block text-[10px] text-emerald-600 leading-tight">
                      {user.district || user.state || 'Verified'}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setUserMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-20">
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.phone || user.email || 'Guest Farmer'}</p>
                        {user.village && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{user.village}, {user.district}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenProfile();
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-emerald-600" />
                        Edit Farm Profile
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:text-emerald-800 hover:bg-slate-50 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-1 shadow-md">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const label = t(item.labelKey) || item.defaultLabel;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{label}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
