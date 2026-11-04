import React from 'react';
import { X, Send, ArrowDownToLine, WalletCards, ScanLine, Undo2, Zap, Wifi, Ticket, Users, QrCode, Shield } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface MaxItHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTransfer: () => void;
  onOpenWithdraw: () => void;
  onOpenDeposit: () => void;
  onOpenMerchantPay: () => void;
  onOpenCancelTransfer: () => void;
  onOpenMyQr: () => void;
  onOpenBills: () => void;
  onOpenBundles: () => void;
  onOpenTickets: () => void;
  onOpenTontine: () => void;
  onOpenSecurity: () => void;
}

export const MaxItHubModal: React.FC<MaxItHubModalProps> = ({
  isOpen,
  onClose,
  onOpenTransfer,
  onOpenWithdraw,
  onOpenDeposit,
  onOpenMerchantPay,
  onOpenCancelTransfer,
  onOpenMyQr,
  onOpenBills,
  onOpenBundles,
  onOpenTickets,
  onOpenTontine,
  onOpenSecurity,
}) => {
  if (!isOpen) return null;

  const categories = [
    {
      title: 'Orange Money & Finances',
      items: [
        { label: 'Transfert d\'argent', icon: Send, color: 'text-orange-500 bg-orange-100', action: onOpenTransfer },
        { label: 'Retrait d\'argent', icon: ArrowDownToLine, color: 'text-rose-500 bg-rose-100', action: onOpenWithdraw },
        { label: 'Recharger / Dépôt', icon: WalletCards, color: 'text-emerald-500 bg-emerald-100', action: onOpenDeposit },
        { label: 'Paiement marchand', icon: ScanLine, color: 'text-amber-500 bg-amber-100', action: onOpenMerchantPay },
        { label: 'Mon QR Code', icon: QrCode, color: 'text-blue-500 bg-blue-100', action: onOpenMyQr },
        { label: 'Annulation transfert', icon: Undo2, color: 'text-purple-500 bg-purple-100', action: onOpenCancelTransfer },
      ],
    },
    {
      title: 'Ma Ligne & Forfaits',
      items: [
        { label: 'Acheter un forfait', icon: Wifi, color: 'text-purple-500 bg-purple-100', action: onOpenBundles },
        { label: 'Recharge crédit', icon: WalletCards, color: 'text-emerald-500 bg-emerald-100', action: onOpenDeposit },
      ],
    },
    {
      title: 'Factures & Services Cameroun',
      items: [
        { label: 'Factures ENEO & Canal+', icon: Zap, color: 'text-cyan-500 bg-cyan-100', action: onOpenBills },
        { label: 'Billetterie & Tickets', icon: Ticket, color: 'text-orange-500 bg-orange-100', action: onOpenTickets },
        { label: 'Tontine Njangi', icon: Users, color: 'text-teal-500 bg-teal-100', action: onOpenTontine },
        { label: 'Sécurité & Biométrie', icon: Shield, color: 'text-neutral-800 bg-neutral-200', action: onOpenSecurity },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full sm:max-w-md bg-white border-t sm:border border-neutral-200 rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF7900] flex items-center justify-center text-white">
              <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                <div className="w-1.5 h-1.5 rounded-[1px] bg-white" />
                <div className="w-1.5 h-1.5 rounded-[1px] bg-white" />
                <div className="w-1.5 h-1.5 rounded-[1px] bg-white" />
                <div className="w-1.5 h-1.5 rounded-[1px] bg-white" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-neutral-900">Hub Max it Services</h3>
              <p className="text-xs text-neutral-500">Tous les services en un clic</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {categories.map((cat, idx) => (
            <div key={idx}>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                {cat.title}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {cat.items.map((item, itemIdx) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={itemIdx}
                      onClick={() => {
                        soundManager.playKeyClick();
                        onClose();
                        item.action();
                      }}
                      className="p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 flex flex-col items-center text-center transition-all active:scale-95 group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${item.color}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-neutral-800 line-clamp-2 leading-tight">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
