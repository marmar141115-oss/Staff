import React, { useState } from 'react';
import { Wallet } from '../types';
import { formatFCFA } from '../utils/formatters';
import { 
  Eye, 
  EyeOff, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Copy, 
  Check, 
  PhoneCall,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface WalletCardProps {
  wallet: Wallet; // Primary Orange Money account
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenTransfer: () => void;
  onRequestCheckBalanceBiometric: () => void;
  requirePinForBalance: boolean;
  onOpenLinkedAccounts: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenTransfer,
  onRequestCheckBalanceBiometric,
  requirePinForBalance,
  onOpenLinkedAccounts,
}) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const handleToggleBalance = () => {
    soundManager.playKeyClick();
    if (!showBalance && requirePinForBalance) {
      // Trigger security verification before revealing
      onRequestCheckBalanceBiometric();
    } else {
      setShowBalance(!showBalance);
    }
  };

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playKeyClick();
    navigator.clipboard.writeText(wallet.phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const percentSpent = Math.min(
    Math.round((wallet.spentToday / wallet.dailyLimit) * 100),
    100
  );

  return (
    <div className="px-4 pt-2 pb-2">
      {/* Primary Orange Money Card (Exclusive on Home Interface) */}
      <div 
        className="relative overflow-hidden rounded-3xl p-5 border border-neutral-800 shadow-2xl transition-all"
        style={{
          background: 'linear-gradient(135deg, #1c140d 0%, #0d0c0c 100%)',
        }}
      >
        {/* Subtle orange ambient glow */}
        <div 
          className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-25 pointer-events-none bg-orange-500"
        />

        {/* Card Header: Orange Money Badge, Phone & USSD shortcut */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white bg-orange-600 shadow-sm"
            >
              ORANGE MONEY
            </span>
            <button
              onClick={handleCopyPhone}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors bg-neutral-900/80 px-2 py-0.5 rounded-md border border-neutral-800"
              title="Copier le numéro"
            >
              <span className="font-mono">{wallet.phoneNumber}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-neutral-400" />}
            </button>
          </div>

          {/* Quick USSD code indicator */}
          <div className="flex items-center gap-1 text-[11px] text-neutral-400">
            <PhoneCall className="w-3 h-3 text-neutral-500" />
            <span className="font-mono text-neutral-300">#150#</span>
          </div>
        </div>

        {/* Balance Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Solde Orange Money disponible</span>
            <button
              onClick={handleToggleBalance}
              className="p-1 hover:text-white text-neutral-400 transition-colors"
              title={showBalance ? 'Masquer le solde' : 'Afficher le solde'}
              aria-label="Masquer ou afficher le solde"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-orange-400" />}
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {showBalance ? formatFCFA(wallet.balance) : '•••••••• FCFA'}
            </span>
          </div>

          <p className="text-[11px] text-neutral-500 mt-1">
            {wallet.tier}
          </p>
        </div>

        {/* Daily Spending Limit Bar */}
        <div className="mb-5 bg-neutral-900/60 p-2.5 rounded-2xl border border-neutral-800/80">
          <div className="flex justify-between text-[11px] text-neutral-400 mb-1.5">
            <span>Plafond journalier utilisé</span>
            <span className="font-mono font-medium text-neutral-300">
              {formatFCFA(wallet.spentToday)} / {formatFCFA(wallet.dailyLimit)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-orange-500"
              style={{
                width: `${percentSpent}%`,
              }}
            />
          </div>
        </div>

        {/* 3 Core Fast Actions on the Card */}
        <div className="grid grid-cols-3 gap-2">
          {/* Dépôt */}
          <button
            onClick={() => {
              soundManager.playKeyClick();
              onOpenDeposit();
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-neutral-800/90 hover:bg-neutral-700/90 text-white font-semibold text-xs transition-all active:scale-95 border border-neutral-700/70"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Dépôt</span>
          </button>

          {/* Retrait */}
          <button
            onClick={() => {
              soundManager.playKeyClick();
              onOpenWithdraw();
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-neutral-800/90 hover:bg-neutral-700/90 text-white font-semibold text-xs transition-all active:scale-95 border border-neutral-700/70"
          >
            <ArrowDownLeft className="w-4 h-4 text-orange-400" />
            <span>Retrait</span>
          </button>

          {/* Transfert */}
          <button
            onClick={() => {
              soundManager.playKeyClick();
              onOpenTransfer();
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-white font-semibold text-xs transition-all active:scale-95 shadow-lg bg-orange-600 hover:bg-orange-500"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Envoyer</span>
          </button>
        </div>
      </div>

      {/* Dedicated field button to access MTN MoMo, Cards and other linked accounts */}
      <div className="mt-2.5">
        <button
          onClick={() => {
            soundManager.playKeyClick();
            onOpenLinkedAccounts();
          }}
          className="w-full p-2.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800/80 border border-neutral-800/80 hover:border-neutral-700 flex items-center justify-between text-left transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                Comptes & Cartes Associés
              </p>
              <p className="text-[10px] text-neutral-400">
                Gérer MTN MoMo, Carte Visa & GIMAC Pay
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-neutral-400 group-hover:text-white">
            <span className="text-[11px] font-medium text-orange-400">Accéder</span>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300" />
          </div>
        </button>
      </div>
    </div>
  );
};
