import React from 'react';
import { Home, ArrowLeftRight, Phone, ShoppingBag, LayoutGrid } from 'lucide-react';
import { soundManager } from '../utils/audio';

export type BottomTabType = 'accueil' | 'money' | 'hub' | 'maligne' | 'plaza';

interface BottomNavProps {
  activeTab: BottomTabType;
  onChangeTab: (tab: BottomTabType) => void;
  onOpenHub: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenHub,
}) => {
  return (
    <nav className="fixed sm:absolute bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-100 px-3 py-2 flex items-center justify-between">
      {/* 1. Accueil */}
      <button
        onClick={() => {
          soundManager.playKeyClick();
          onChangeTab('accueil');
        }}
        className="flex flex-col items-center justify-center min-w-[54px] min-h-[48px] transition-all"
      >
        <div
          className={`px-3 py-1 rounded-full transition-all flex items-center justify-center ${
            activeTab === 'accueil'
              ? 'bg-amber-100/60 text-[#FF7900]'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'accueil' ? 'fill-current' : ''}`} />
        </div>
        <span
          className={`text-[10px] mt-0.5 tracking-tight ${
            activeTab === 'accueil' ? 'font-bold text-[#FF7900]' : 'font-medium text-neutral-500'
          }`}
        >
          Accueil
        </span>
      </button>

      {/* 2. Money */}
      <button
        onClick={() => {
          soundManager.playKeyClick();
          onChangeTab('money');
        }}
        className="flex flex-col items-center justify-center min-w-[54px] min-h-[48px] transition-all"
      >
        <div
          className={`px-3 py-1 rounded-full transition-all flex items-center justify-center ${
            activeTab === 'money'
              ? 'bg-amber-100/60 text-[#FF7900]'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
        </div>
        <span
          className={`text-[10px] mt-0.5 tracking-tight ${
            activeTab === 'money' ? 'font-bold text-[#FF7900]' : 'font-medium text-neutral-500'
          }`}
        >
          Money
        </span>
      </button>

      {/* 3. Center Max it Orange Button */}
      <button
        onClick={() => {
          soundManager.playKeyClick();
          onOpenHub();
        }}
        className="flex flex-col items-center justify-center -mt-5 transition-transform active:scale-95"
        aria-label="Max it Hub Services"
      >
        <div className="w-14 h-14 rounded-full bg-[#FF7900] shadow-lg shadow-orange-500/35 border-4 border-white flex items-center justify-center text-white">
          {/* 4 Rounded Squares Grid (like official Max it logo) */}
          <div className="grid grid-cols-2 gap-1 w-6 h-6">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-white" />
            <div className="w-2.5 h-2.5 rounded-[3px] bg-white" />
            <div className="w-2.5 h-2.5 rounded-[3px] bg-white" />
            <div className="w-2.5 h-2.5 rounded-[3px] bg-white" />
          </div>
        </div>
      </button>

      {/* 4. Ma ligne */}
      <button
        onClick={() => {
          soundManager.playKeyClick();
          onChangeTab('maligne');
        }}
        className="flex flex-col items-center justify-center min-w-[54px] min-h-[48px] transition-all"
      >
        <div
          className={`px-3 py-1 rounded-full transition-all flex items-center justify-center ${
            activeTab === 'maligne'
              ? 'bg-amber-100/60 text-[#FF7900]'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Phone className="w-5 h-5" />
        </div>
        <span
          className={`text-[10px] mt-0.5 tracking-tight ${
            activeTab === 'maligne' ? 'font-bold text-[#FF7900]' : 'font-medium text-neutral-500'
          }`}
        >
          Ma ligne
        </span>
      </button>

      {/* 5. Plaza */}
      <button
        onClick={() => {
          soundManager.playKeyClick();
          onChangeTab('plaza');
        }}
        className="flex flex-col items-center justify-center min-w-[54px] min-h-[48px] transition-all"
      >
        <div
          className={`px-3 py-1 rounded-full transition-all flex items-center justify-center ${
            activeTab === 'plaza'
              ? 'bg-amber-100/60 text-[#FF7900]'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
        </div>
        <span
          className={`text-[10px] mt-0.5 tracking-tight ${
            activeTab === 'plaza' ? 'font-bold text-[#FF7900]' : 'font-medium text-neutral-500'
          }`}
        >
          Plaza
        </span>
      </button>
    </nav>
  );
};
