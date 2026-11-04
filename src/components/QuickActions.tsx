import React from 'react';
import { 
  Send, 
  ArrowDownToLine, 
  WalletCards, 
  QrCode, 
  ScanLine, 
  Zap, 
  Wifi, 
  Users,
  Building2,
  Globe2
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface QuickActionsProps {
  onOpenTransfer: () => void;
  onOpenWithdraw: () => void;
  onOpenDeposit: () => void;
  onOpenMerchantPay: () => void;
  onOpenMyQr: () => void;
  onOpenBills: () => void;
  onOpenBundles: () => void;
  onOpenTontine: () => void;
  onOpenLinkedAccounts: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenTransfer,
  onOpenWithdraw,
  onOpenDeposit,
  onOpenMerchantPay,
  onOpenMyQr,
  onOpenBills,
  onOpenBundles,
  onOpenTontine,
  onOpenLinkedAccounts,
}) => {
  const actions = [
    {
      id: 'transfer',
      label: 'Transfert',
      sublabel: 'OM / MoMo / CEMAC',
      icon: Send,
      color: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      badge: 'GIMAC',
      onClick: onOpenTransfer,
    },
    {
      id: 'merchant',
      label: 'Scanner & Payer',
      sublabel: 'Marchands QR',
      icon: ScanLine,
      color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      badge: '0 FCFA',
      onClick: onOpenMerchantPay,
    },
    {
      id: 'my_qr',
      label: 'Mon QR Code',
      sublabel: 'Recevoir de l\'argent',
      icon: QrCode,
      color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      onClick: onOpenMyQr,
    },
    {
      id: 'withdraw',
      label: 'Retrait d\'argent',
      sublabel: 'Agent ou DAB GIMAC',
      icon: ArrowDownToLine,
      color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      onClick: onOpenWithdraw,
    },
    {
      id: 'deposit',
      label: 'Dépôt d\'argent',
      sublabel: 'Carte ou Agence',
      icon: WalletCards,
      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      onClick: onOpenDeposit,
    },
    {
      id: 'bundles',
      label: 'Pass & Crédit',
      sublabel: 'Data 4G+ & Appels',
      icon: Wifi,
      color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      badge: 'Promo',
      onClick: onOpenBundles,
    },
    {
      id: 'bills',
      label: 'Factures CMR',
      sublabel: 'ENEO, Camwater, Canal+',
      icon: Zap,
      color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      onClick: onOpenBills,
    },
    {
      id: 'tontine',
      label: 'Njangi / Tontine',
      sublabel: 'Épargne collective',
      icon: Users,
      color: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
      onClick: onOpenTontine,
    },
  ];

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white tracking-tight">Services Essentiels</h3>
        <span className="text-[11px] text-orange-400 font-semibold cursor-pointer hover:underline">
          Tout le nécessaire
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {actions.map((act) => {
          const IconComponent = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => {
                soundManager.playKeyClick();
                act.onClick();
              }}
              className="flex flex-col items-center justify-start p-2.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800/80 border border-neutral-800/80 hover:border-neutral-700 transition-all active:scale-95 group text-center relative"
            >
              {act.badge && (
                <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 bg-orange-600 text-[9px] font-bold text-white rounded-full shadow-sm">
                  {act.badge}
                </span>
              )}
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border mb-2 transition-transform group-hover:scale-105 ${act.color}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-neutral-200 line-clamp-1 group-hover:text-white">
                {act.label}
              </span>
              <span className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                {act.sublabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Promotional Banner: CEMAC Interoperability & Zero Fees */}
      <button
        onClick={() => {
          soundManager.playKeyClick();
          onOpenLinkedAccounts();
        }}
        className="w-full mt-4 p-3 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-orange-950/40 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between text-left transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 group-hover:scale-105 transition-transform">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                GIMAC Pay Interopérable
              </span>
              <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-400 font-bold rounded">
                GÉRER
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Gérer MTN MoMo, Cartes Visa & comptes rattachés
            </p>
          </div>
        </div>
      </button>
    </div>
  );
};
