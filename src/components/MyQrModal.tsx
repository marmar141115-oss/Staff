import React, { useState } from 'react';
import { Wallet } from '../types';
import { formatFCFA } from '../utils/formatters';
import { X, QrCode, Share2, Copy, Check, Download, ShieldCheck } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface MyQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWallet: Wallet;
}

export const MyQrModal: React.FC<MyQrModalProps> = ({
  isOpen,
  onClose,
  activeWallet,
}) => {
  const [customAmount, setCustomAmount] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    soundManager.playKeyClick();
    const textToCopy = `Paiement Max it ${activeWallet.name} - Numéro : ${activeWallet.phoneNumber}${customAmount ? ` - Montant : ${formatFCFA(parseInt(customAmount, 10))}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    soundManager.playKeyClick();
    const text = encodeURIComponent(`Bonjour ! Voici mes coordonnées Max it / Orange Money Cameroun pour le paiement : ${activeWallet.phoneNumber}${customAmount ? ` (Montant : ${formatFCFA(parseInt(customAmount, 10))})` : ''}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full sm:max-w-sm bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-6 text-center shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-semibold text-orange-400 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>QR Code Réception Max it</span>
        </div>

        <h3 className="text-lg font-bold text-white mb-0.5">Mon QR Code de Réception</h3>
        <p className="text-xs text-neutral-400 mb-4">
          Faites scanner ce code pour recevoir de l'argent instantanément
        </p>

        {/* QR Code Container */}
        <div className="bg-white p-5 rounded-3xl mx-auto w-56 h-56 flex flex-col items-center justify-center shadow-xl relative border-4 border-orange-500/30">
          {/* Authentic SVG QR Code representation */}
          <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-950">
            {/* Corner 1 */}
            <rect x="5" y="5" width="26" height="26" fill="black" rx="4" />
            <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
            <rect x="13" y="13" width="10" height="10" fill="#FF7900" rx="2" />

            {/* Corner 2 */}
            <rect x="69" y="5" width="26" height="26" fill="black" rx="4" />
            <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
            <rect x="77" y="13" width="10" height="10" fill="#FF7900" rx="2" />

            {/* Corner 3 */}
            <rect x="5" y="69" width="26" height="26" fill="black" rx="4" />
            <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
            <rect x="13" y="77" width="10" height="10" fill="#FF7900" rx="2" />

            {/* Simulated Data Matrix dots */}
            <rect x="36" y="8" width="6" height="6" fill="black" />
            <rect x="46" y="8" width="6" height="6" fill="black" />
            <rect x="56" y="14" width="6" height="6" fill="black" />
            <rect x="36" y="24" width="6" height="6" fill="black" />
            <rect x="50" y="26" width="6" height="6" fill="black" />
            <rect x="10" y="40" width="6" height="6" fill="black" />
            <rect x="24" y="44" width="6" height="6" fill="black" />
            <rect x="38" y="38" width="6" height="6" fill="black" />
            <rect x="48" y="44" width="6" height="6" fill="black" />
            <rect x="60" y="40" width="6" height="6" fill="black" />
            <rect x="72" y="38" width="6" height="6" fill="black" />
            <rect x="84" y="44" width="6" height="6" fill="black" />
            <rect x="38" y="56" width="6" height="6" fill="black" />
            <rect x="50" y="58" width="6" height="6" fill="black" />
            <rect x="62" y="56" width="6" height="6" fill="black" />
            <rect x="74" y="68" width="6" height="6" fill="black" />
            <rect x="84" y="76" width="6" height="6" fill="black" />
            <rect x="68" y="84" width="6" height="6" fill="black" />

            {/* Center Logo badge */}
            <circle cx="50" cy="50" r="11" fill="black" />
            <circle cx="50" cy="50" r="9" fill="#FF7900" />
            <text x="50" y="54" fontSize="10" fontWeight="bold" textAnchor="middle" fill="white">M</text>
          </svg>
        </div>

        {/* User Info */}
        <div className="mt-4">
          <p className="text-sm font-bold text-white">Marcelle NGUEMO</p>
          <p className="text-xs font-mono text-neutral-400">{activeWallet.phoneNumber}</p>
          {customAmount && (
            <p className="text-sm font-mono font-bold text-orange-400 mt-1">
              Montant demandé : {formatFCFA(parseInt(customAmount, 10))}
            </p>
          )}
        </div>

        {/* Optional Custom Amount Input */}
        <div className="mt-3">
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Définir un montant (facultatif)"
            className="w-full px-3 py-2 bg-neutral-800/80 border border-neutral-700 rounded-xl text-center text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={handleCopy}
            className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié !' : 'Copier'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
