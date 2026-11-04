import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Gift } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface DiscoverSectionProps {
  onOpenBundles: () => void;
  onOpenTontine: () => void;
  onOpenBills: () => void;
}

export const DiscoverSection: React.FC<DiscoverSectionProps> = ({
  onOpenBundles,
  onOpenTontine,
  onOpenBills,
}) => {
  return (
    <div className="px-4 py-3">
      {/* Title matching screenshot */}
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-sm font-extrabold text-neutral-900 tracking-tight">Découvrir</h3>
        <span className="text-xs text-orange-600 font-semibold cursor-pointer hover:underline">
          Nouveautés
        </span>
      </div>

      {/* Discovery horizontal carousel cards */}
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar snap-x">
        {/* Banner 1: Giga Data 4G+ */}
        <div 
          onClick={() => {
            soundManager.playKeyClick();
            onOpenBundles();
          }}
          className="min-w-[240px] max-w-[260px] p-3.5 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md relative overflow-hidden cursor-pointer snap-start hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-black/30 rounded text-amber-200">
              OFFRE SPÉCIALE
            </span>
            <Sparkles className="w-4 h-4 text-amber-200" />
          </div>
          <h4 className="text-sm font-black mt-1">Pass Giga Data 20 Go</h4>
          <p className="text-[11px] text-white/90">Valable 30 jours partout au Cameroun à 5 000 FCFA</p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-amber-100">
            <span>Activer maintenant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Banner 2: Tontine Digitale Njangi */}
        <div 
          onClick={() => {
            soundManager.playKeyClick();
            onOpenTontine();
          }}
          className="min-w-[240px] max-w-[260px] p-3.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md relative overflow-hidden cursor-pointer snap-start hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-black/30 rounded text-emerald-200">
              ÉPARGNE SÉCURISÉE
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
          </div>
          <h4 className="text-sm font-black mt-1">Tontine Njangi Digitale</h4>
          <p className="text-[11px] text-white/90">Cotisez en famille et entre amis en toute transparence</p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-100">
            <span>Accéder au groupe</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Banner 3: ENEO Factures */}
        <div 
          onClick={() => {
            soundManager.playKeyClick();
            onOpenBills();
          }}
          className="min-w-[240px] max-w-[260px] p-3.5 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-800 text-white shadow-md relative overflow-hidden cursor-pointer snap-start hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-black/30 rounded text-purple-200">
              0 DÉPLACEMENT
            </span>
            <Zap className="w-4 h-4 text-amber-300" />
          </div>
          <h4 className="text-sm font-black mt-1">Factures ENEO & MyEasyLight</h4>
          <p className="text-[11px] text-white/90">Payez ou rechargez vos compteurs prépayés en 30 secondes</p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-purple-100">
            <span>Régler ma facture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
