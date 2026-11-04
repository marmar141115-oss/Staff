import React from 'react';
import { soundManager } from '../utils/audio';

interface ServicesGridProps {
  onOpenBundles: () => void;
  onOpenRecharge: () => void;
  onOpenMerchantPay: () => void;
  onOpenTransfer: () => void;
  onOpenWithdraw: () => void;
  onOpenCancelTransfer: () => void;
  onOpenTickets: () => void;
  onOpenViewAll: () => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  onOpenBundles,
  onOpenRecharge,
  onOpenMerchantPay,
  onOpenTransfer,
  onOpenWithdraw,
  onOpenCancelTransfer,
  onOpenTickets,
  onOpenViewAll,
}) => {
  return (
    <div className="px-4 py-2">
      <div className="grid grid-cols-4 gap-y-4 gap-x-2">
        {/* 1. Acheter un forfait */}
        <button
          onClick={() => {
            soundManager.playKeyClick();
            onOpenBundles();
          }}
          className="flex flex-col items-center text-center group active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-2xl bg-neutral-100/80 flex items-center justify-center p-2 group-hover:bg-neutral-200/80 transition-colors relative">
            {/* SVG mimicking 3 floating colorful cards next to a phone */}
            <svg viewBox="0 0 64 64" className="w-full h-full">
              {/* Phone behind */}
              <rect x="28" y="10" width="22" height="42" rx="4" fill="#0F1115" />
              <rect x="30" y="14" width="18" height="34" rx="2" fill="#FF7900" />
              {/* Pink chat bubble */}
              <rect x="8" y="18" width="16" height="16" rx="4" fill="#F43F5E" transform="rotate(-8 16 26)" />
              <path d="M13 24 L19 24 M13 28 L17 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              {/* Green phone bubble */}
              <rect x="18" y="24" width="16" height="16" rx="4" fill="#10B981" />
              <path d="M24 28 C24 33, 27 36, 30 36" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Orange data bubble */}
              <rect x="26" y="30" width="15" height="15" rx="4" fill="#F97316" transform="rotate(8 33 37)" />
              <circle cx="33" cy="37" r="4" stroke="white" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-neutral-800 mt-1.5 leading-tight line-clamp-2 max-w-[70px]">
            Acheter un forfait
          </span>
        </button>

        {/* 2. Recharger */}
        <button
          onClick={() => {
            soundManager.playKeyClick();
            onOpenRecharge();
          }}
          className="flex flex-col items-center text-center group active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-2xl bg-neutral-100/80 flex items-center justify-center p-2 group-hover:bg-neutral-200/80 transition-colors relative">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              {/* Phone slanted */}
              <rect x="24" y="12" width="22" height="42" rx="4" fill="#0F1115" transform="rotate(10 35 33)" />
              <rect x="26" y="15" width="18" height="36" rx="2" fill="#FF7900" transform="rotate(10 35 33)" />
              {/* Yellow Coin with + */}
              <circle cx="20" cy="32" r="12" fill="#FBBF24" />
              <circle cx="20" cy="32" r="10" stroke="#D97706" strokeWidth="1.5" fill="#FBBF24" />
              <path d="M16 32 L24 32 M20 28 L20 36" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arrow entering phone */}
              <path d="M26 32 L38 32 M34 28 L38 32 L34 36" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-neutral-800 mt-1.5 leading-tight line-clamp-2 max-w-[70px]">
            Recharger
          </span>
        </button>

        {/* 3. Paiement marchand */}
        <button
          onClick={() => {
            soundManager.playKeyClick();
            onOpenMerchantPay();
          }}
          className="flex flex-col items-center text-center group active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1C1C1E] flex items-center justify-center p-2 group-hover:bg-neutral-800 transition-colors relative shadow-sm">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              {/* Outer Viewfinder brackets */}
              <path d="M14 24 L14 16 L22 16 M42 16 L50 16 L50 24 M50 40 L50 48 L42 48 M22 48 L14 48 L14 40" stroke="#A855F7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Inner Orange QR box */}
              <rect x="22" y="24" width="20" height="20" rx="3" fill="#FF7900" />
              <rect x="26" y="28" width="4" height="4" fill="white" />
              <rect x="34" y="28" width="4" height="4" fill="white" />
              <rect x="26" y="36" width="4" height="4" fill="white" />
              <rect x="34" y="36" width="4" height="4" fill="white" />
              {/* Purple Laser Beam */}
              <line x1="10" y1="32" x2="54" y2="32" stroke="#C084FC" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-neutral-800 mt-1.5 leading-tight line-clamp-2 max-w-[70px]">
            Paiement marchand
          </span>
        </button>

        {/* 4. Transfert d'Argent */}
        <button
          onClick={() => {
            soundManager.playKeyClick();
            onOpenTransfer();
          }}
          className="flex flex-col items-center text-center group active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-2xl bg-neutral-100/80 flex items-center justify-center p-2 group-hover:bg-neutral-200/80 transition-colors relative">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              {/* Hand holding black phone */}
              <path d="M12 48 C16 40, 20 38, 22 42 L24 50 C25 54, 18 56, 12 48 Z" fill="#78350F" />
              <rect x="18" y="22" width="14" height="26" rx="2" fill="#0F1115" />
              <circle cx="25" cy="35" r="4" fill="#10B981" />
              {/* Target Phone receiving */}
              <rect x="42" y="16" width="14" height="26" rx="2" fill="#0F1115" />
              {/* Flying CFA Green Banknotes */}
              <rect x="24" y="12" width="16" height="8" rx="2" fill="#34D399" transform="rotate(-15 32 16)" />
              <rect x="32" y="20" width="16" height="8" rx="2" fill="#10B981" transform="rotate(-5 40 24)" />
              <rect x="36" y="30" width="16" height="8" rx="2" fill="#059669" transform="rotate(15 44 34)" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-neutral-800 mt-1.5 leading-tight line-clamp-2 max-w-[70px]">
            Transfert d'Argent
          </span>
        </button>

        {/* 5. Retrait d'argent */}
        <button
          onClick={() => {
            soundManager.playKeyClick();
            onOpenWithdraw();
          }}
          className="flex flex-col items-center text-center group active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1C1C1E] flex items-center justify-center p-2 group-hover:bg-neutral-800 transition-colors relative shadow-sm">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              {/* Orange Outline Frame */}
              <rect x="16" y="14" width="32" height="36" rx="5" stroke="#FF7900" strokeWidth="3" fill="none" />
              {/* Purple note / cash being dispensed */}
              <rect x="10" y="24" width="30" height="16" rx="3" fill="#8B5CF6" />
              <circle cx="25" cy="32" r="3" fill="#EDE9FE" />
              {/* Arrow down */}
              <path d="M42 28 L42 38 M38 34 L42 38 L46 34" stroke="#FF7900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-neutral-800 mt-1.5 leading-tight line-clamp-2 max-w-[70px]">
            Retrait d'argent
          </span>
        </button>

        {/* 6. Annulation de transfert */}
        <button
          onClick={() => {
            soundManager.playKeyClick();
            onOpenCancelTransfer();
          }}
          className="flex flex-col items-center text-center group active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1C1C1E] flex items-center justify-center p-2 group-hover:bg-neutral-800 transition-colors relative shadow-sm">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              {/* Orange circle */}
              <circle cx="32" cy="32" r="18" fill="#FF7900" />
              {/* Green banknote inside */}
              <rect x="22" y="26" width="20" height="12" rx="2" fill="#10B981" />
              <circle cx="32" cy="32" r="2.5" fill="white" />
              {/* Purple cancel X badge */}
              <circle cx="42" cy="42" r="7" fill="#8B5CF6" />
              <path d="M39 39 L45 45 M45 39 L39 45" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-neutral-800 mt-1.5 leading-tight line-clamp-2 max-w-[70px]">
            Annulation de transfert
          </span>
        </button>

        {/* 7. Ticket */}
        <button
          onClick={() => {
            soundManager.playKeyClick();
            onOpenTickets();
          }}
          className="flex flex-col items-center text-center group active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-2xl bg-neutral-100/80 flex items-center justify-center p-2 group-hover:bg-neutral-200/80 transition-colors relative">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              {/* Orange Event Ticket */}
              <rect x="20" y="16" width="30" height="34" rx="4" fill="#F97316" />
              <path d="M20 30 C24 30, 24 36, 20 36 Z" fill="#F3F4F6" />
              <path d="M50 30 C46 30, 46 36, 50 36 Z" fill="#F3F4F6" />
              <line x1="26" y1="33" x2="44" y2="33" stroke="white" strokeWidth="2" strokeDasharray="2 2" />
              {/* Barcode lines */}
              <line x1="26" y1="40" x2="26" y2="44" stroke="white" strokeWidth="1.5" />
              <line x1="30" y1="40" x2="30" y2="44" stroke="white" strokeWidth="1.5" />
              <line x1="34" y1="40" x2="34" y2="44" stroke="white" strokeWidth="2.5" />
              <line x1="40" y1="40" x2="40" y2="44" stroke="white" strokeWidth="1.5" />
              {/* Broadcast rays */}
              <path d="M16 16 C12 20, 12 28, 16 32" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M12 12 C6 18, 6 32, 12 38" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-neutral-800 mt-1.5 leading-tight line-clamp-2 max-w-[70px]">
            Ticket
          </span>
        </button>

        {/* 8. Voir tout */}
        <button
          onClick={() => {
            soundManager.playKeyClick();
            onOpenViewAll();
          }}
          className="flex flex-col items-center text-center group active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-2xl bg-neutral-100/80 flex items-center justify-center p-2 group-hover:bg-neutral-200/80 transition-colors relative">
            {/* 3 Dots: Orange, Black, Grey */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7900]" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
            </div>
          </div>
          <span className="text-[11px] font-semibold text-neutral-800 mt-1.5 leading-tight line-clamp-2 max-w-[70px]">
            Voir tout
          </span>
        </button>
      </div>
    </div>
  );
};
