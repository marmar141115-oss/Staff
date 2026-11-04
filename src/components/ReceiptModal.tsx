import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatFCFA, formatTxDate } from '../utils/formatters';
import { X, CheckCircle2, Share2, Copy, Check, Download, ShieldCheck, ArrowDownLeft, Send, ScanLine, Zap, Wifi } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleCopyRef = () => {
    soundManager.playKeyClick();
    navigator.clipboard.writeText(transaction.reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleShareWhatsApp = () => {
    soundManager.playKeyClick();
    const text = encodeURIComponent(
      `Reçu Max it Cameroun 🇨🇲\n` +
      `Référence : ${transaction.reference}\n` +
      `Opération : ${transaction.title}\n` +
      `Destinataire / Marchand : ${transaction.recipientOrMerchant}\n` +
      `Montant : ${formatFCFA(transaction.amount)}\n` +
      `Frais : ${formatFCFA(transaction.fee)}\n` +
      `Date : ${formatTxDate(transaction.timestamp)}\n` +
      `Statut : Succès (Opération certifiée GIMAC / Orange Money)`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full sm:max-w-md bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur-md px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-300">Reçu Officiel Numérique</span>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Ticket Body */}
        <div className="p-6">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 text-center shadow-xl relative overflow-hidden">
            {/* Top saw-tooth / punch decoration effect */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500" />

            {/* Success icon */}
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              Transaction Réussie
            </p>
            <h3 className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {formatFCFA(transaction.amount)}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">{transaction.title}</p>

            {/* Dashed divider */}
            <div className="my-5 border-b border-dashed border-neutral-800" />

            {/* Line-by-line Financial Details */}
            <div className="space-y-2.5 text-left text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Bénéficiaire / Marchand :</span>
                <span className="font-semibold text-white truncate max-w-[200px]">
                  {transaction.recipientOrMerchant}
                </span>
              </div>

              {transaction.recipientPhone && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Numéro de téléphone :</span>
                  <span className="font-mono text-neutral-300">{transaction.recipientPhone}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Frais de service :</span>
                <span className="font-mono text-neutral-300">
                  {transaction.fee === 0 ? 'Gratuit (0 FCFA)' : formatFCFA(transaction.fee)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Total débité :</span>
                <span className="font-mono font-bold text-orange-400">
                  {formatFCFA(transaction.amount + transaction.fee)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Date & Heure :</span>
                <span className="text-neutral-300">{formatTxDate(transaction.timestamp)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Référence Unique Tx :</span>
                <button
                  onClick={handleCopyRef}
                  className="flex items-center gap-1 font-mono text-[11px] text-orange-400 hover:text-orange-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800"
                >
                  <span>{transaction.reference}</span>
                  {copiedRef ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-neutral-900">
                <span className="text-neutral-400">Nouveau Solde :</span>
                <span className="font-mono font-bold text-neutral-200">
                  {formatFCFA(transaction.balanceAfter)}
                </span>
              </div>
            </div>

            {/* Official Certification Seal */}
            <div className="mt-6 pt-4 border-t border-dashed border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                <span>Certifié conforme CEMAC / BEAC</span>
              </div>
              <span className="font-mono">Max it 2026 CMR</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <button
              onClick={handleShareWhatsApp}
              className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Partager WhatsApp</span>
            </button>

            <button
              onClick={handleCopyRef}
              className="py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {copiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedRef ? 'Référence Copiée' : 'Copier Réf'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
