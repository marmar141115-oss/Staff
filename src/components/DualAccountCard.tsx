import React, { useState } from 'react';
import { Eye, EyeOff, ChevronRight, ArrowDownLeft, Plus, ArrowUpRight } from 'lucide-react';
import { formatFCFA } from '../utils/formatters';
import { soundManager } from '../utils/audio';

interface DualAccountCardProps {
  mainBalance: number;
  prepaidUnits: number;
  onToggleMainBalanceAuth: () => void;
  onTogglePrepaidBalanceAuth: () => void;
  onViewDetails: () => void;
  onOpenMyQr: () => void;
  isMainRevealed: boolean;
  isPrepaidRevealed: boolean;
}

export const DualAccountCard: React.FC<DualAccountCardProps> = ({
  mainBalance,
  prepaidUnits,
  onToggleMainBalanceAuth,
  onTogglePrepaidBalanceAuth,
  onViewDetails,
  onOpenMyQr,
  isMainRevealed,
  isPrepaidRevealed,
}) => {
  return (
    <div className="px-4 pt-3 pb-2">
      {/* Horizontal Carousel of the 2 Cards matching the screenshot */}
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar snap-x snap-mandatory">
        {/* CARD 1: Compte Principal (Orange Money) */}
        <div className="min-w-[270px] max-w-[290px] flex-1 bg-white rounded-3xl p-4 border border-neutral-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] relative overflow-hidden snap-start flex flex-col justify-between">
          {/* Top visual section: QR Code + Rainbow arcs */}
          <div className="flex items-center justify-between mb-3 relative">
            {/* Clickable QR Code */}
            <button
              onClick={() => {
                soundManager.playKeyClick();
                onOpenMyQr();
              }}
              className="w-20 h-20 bg-white p-1 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center justify-center hover:scale-105 transition-transform shrink-0 relative z-10"
              title="Agrandir mon QR Code"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-900">
                {/* 3 Corner markers */}
                <rect x="4" y="4" width="28" height="28" fill="black" rx="3" />
                <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                <rect x="14" y="14" width="8" height="8" fill="#FF7900" rx="1" />

                <rect x="68" y="4" width="28" height="28" fill="black" rx="3" />
                <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                <rect x="78" y="14" width="8" height="8" fill="#FF7900" rx="1" />

                <rect x="4" y="68" width="28" height="28" fill="black" rx="3" />
                <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                <rect x="14" y="78" width="8" height="8" fill="#FF7900" rx="1" />

                {/* Matrix dots */}
                <rect x="38" y="8" width="6" height="6" fill="black" />
                <rect x="48" y="14" width="6" height="6" fill="black" />
                <rect x="56" y="8" width="6" height="6" fill="black" />
                <rect x="38" y="24" width="6" height="6" fill="black" />
                <rect x="8" y="42" width="6" height="6" fill="black" />
                <rect x="22" y="46" width="6" height="6" fill="black" />
                <rect x="40" y="38" width="6" height="6" fill="black" />
                <rect x="72" y="40" width="6" height="6" fill="black" />
                <rect x="86" y="44" width="6" height="6" fill="black" />
                <rect x="42" y="56" width="6" height="6" fill="black" />
                <rect x="54" y="54" width="6" height="6" fill="black" />
                <rect x="72" y="70" width="6" height="6" fill="black" />
                <rect x="84" y="76" width="6" height="6" fill="black" />
                <rect x="68" y="86" width="6" height="6" fill="black" />
                <rect x="44" y="80" width="6" height="6" fill="black" />

                {/* Orange center arrows badge */}
                <circle cx="50" cy="50" r="10" fill="#FF7900" />
                <path d="M46 54 L54 46 M50 46 L54 46 L54 50" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>

            {/* Official Max it Colorful concentric decorative arcs on the right */}
            <div className="w-24 h-20 relative overflow-hidden pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Arc 1: Green */}
                <path d="M 0 20 C 40 20, 70 30, 95 60" fill="none" stroke="#22C55E" strokeWidth="6" strokeLinecap="round" />
                {/* Arc 2: Yellow */}
                <path d="M 0 38 C 40 38, 70 48, 95 78" fill="none" stroke="#EAB308" strokeWidth="6" strokeLinecap="round" />
                {/* Arc 3: Purple */}
                <path d="M 0 56 C 40 56, 70 66, 95 96" fill="none" stroke="#A855F7" strokeWidth="6" strokeLinecap="round" />
                {/* Arc 4: Orange */}
                <path d="M 0 74 C 40 74, 65 82, 85 105" fill="none" stroke="#FF7900" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Account Label */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-orange-500 font-bold text-sm">⤢</span>
            <span className="text-xs font-bold text-neutral-900">Compte Principal</span>
          </div>

          {/* Balance */}
          <div className="mb-3">
            <p className="text-sm font-extrabold text-neutral-900 font-mono tracking-wide">
              {isMainRevealed ? formatFCFA(mainBalance) : '***** FCFA'}
            </p>
          </div>

          {/* Toggle Button matching exact screenshot pill */}
          <button
            onClick={() => {
              soundManager.playKeyClick();
              onToggleMainBalanceAuth();
            }}
            className="w-full py-2 px-3 rounded-full border border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:bg-neutral-50 shadow-sm"
          >
            <span>{isMainRevealed ? 'Masquer le solde' : 'Afficher le solde'}</span>
            {isMainRevealed ? <EyeOff className="w-4 h-4 text-neutral-600" /> : <Eye className="w-4 h-4 text-neutral-800" />}
          </button>
        </div>

        {/* CARD 2: Prépayé (Ligne Mobile / Unités de crédit) */}
        <div className="min-w-[240px] max-w-[270px] flex-1 bg-white rounded-3xl p-4 border border-neutral-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] relative overflow-hidden snap-start flex flex-col justify-between">
          {/* Top visual section: Phone illustration on mint background */}
          <div className="flex items-center justify-center mb-3">
            <div className="w-20 h-20 rounded-full bg-emerald-100/60 flex items-center justify-center relative overflow-hidden">
              {/* Smartphone mockup */}
              <div className="w-9 h-16 bg-neutral-800 rounded-lg p-0.5 shadow-md border border-neutral-700 flex flex-col items-center justify-between">
                <div className="w-3 h-0.5 bg-neutral-600 rounded-full mt-0.5" />
                <div className="w-full flex-1 bg-gradient-to-br from-cyan-400 via-teal-300 to-emerald-200 rounded-sm mt-0.5 mb-0.5" />
                <div className="w-1.5 h-1.5 rounded-full border border-neutral-600 mb-0.5" />
              </div>
            </div>
          </div>

          {/* Account Label */}
          <div className="text-center mb-1">
            <span className="text-xs font-bold text-neutral-900">Prépayé</span>
          </div>

          {/* Balance in Units (U) */}
          <div className="text-center mb-3">
            <p className="text-sm font-extrabold text-neutral-900 font-mono tracking-wide">
              {isPrepaidRevealed ? `${prepaidUnits.toLocaleString('fr-FR')} U` : '****** U'}
            </p>
          </div>

          {/* Toggle Button matching exact screenshot pill */}
          <button
            onClick={() => {
              soundManager.playKeyClick();
              onTogglePrepaidBalanceAuth();
            }}
            className="w-full py-2 px-3 rounded-full border border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:bg-neutral-50 shadow-sm"
          >
            <span>{isPrepaidRevealed ? 'Masquer le solde' : 'Afficher le solde'}</span>
            {isPrepaidRevealed ? <EyeOff className="w-4 h-4 text-neutral-600" /> : <Eye className="w-4 h-4 text-neutral-800" />}
          </button>
        </div>
      </div>

      {/* "Voir les détails >" Link at bottom right as in screenshot */}
      <div className="flex justify-end pt-2 pr-1">
        <button
          onClick={() => {
            soundManager.playKeyClick();
            onViewDetails();
          }}
          className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
        >
          <span>Voir les détails</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
