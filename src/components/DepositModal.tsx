import React, { useState } from 'react';
import { Wallet, Transaction } from '../types';
import { formatFCFA, generateReference } from '../utils/formatters';
import { X, WalletCards, CreditCard, Store, ShieldCheck, AlertCircle, Building2, CheckCircle2, QrCode } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWallet: Wallet;
  onCompleteDeposit: (newTx: Transaction, amountCredited: number) => void;
  onRequestBiometric: (actionName: string, onVerified: () => void) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  activeWallet,
  onCompleteDeposit,
  onRequestBiometric,
}) => {
  const [method, setMethod] = useState<'card' | 'agent' | 'bank'>('card');
  const [amountStr, setAmountStr] = useState('50000');
  const [cardNumber, setCardNumber] = useState('4234 8812 9012 3049');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('812');
  const [selectedBank, setSelectedBank] = useState('Afriland First Bank');
  const [depositCode, setDepositCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const amount = parseInt(amountStr || '0', 10);
  const fee = 0; // Deposits to Orange Money / MoMo are typically free (0 FCFA)
  const quickAmounts = [10000, 25000, 50000, 100000, 250000];

  const handleStartDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (amount < 500) {
      soundManager.playError();
      setErrorMsg('Le montant minimum de dépôt est de 500 FCFA');
      return;
    }

    if (method === 'agent') {
      // Generate agent deposit QR code & code
      const code = 'DEP-' + Math.floor(100000 + Math.random() * 900000).toString();
      setDepositCode(code);
      soundManager.playBiometricSuccess();
      return;
    }

    const actionDescription = method === 'card'
      ? `Rechargement de ${formatFCFA(amount)} par Carte Bancaire Visa/Mastercard`
      : `Virement bancaire de ${formatFCFA(amount)} depuis ${selectedBank}`;

    onRequestBiometric(actionDescription, () => {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        reference: generateReference(activeWallet.operator),
        type: 'deposit',
        title: method === 'card' ? 'Dépôt Carte Bancaire Visa' : `Virement Bancaire ${selectedBank}`,
        recipientOrMerchant: method === 'card' ? 'Paiement Sécurisé 3D-Secure' : selectedBank,
        amount: amount,
        fee: 0,
        currency: 'FCFA',
        operator: activeWallet.operator,
        timestamp: new Date().toISOString(),
        status: 'completed',
        note: 'Rechargement de compte',
        category: 'Dépôt d\'argent',
        balanceAfter: activeWallet.balance + amount,
      };

      onCompleteDeposit(newTx, amount);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full sm:max-w-md bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur-md px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <WalletCards className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Dépôt & Rechargement</h3>
              <p className="text-xs text-neutral-400">Créditer votre compte {activeWallet.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {depositCode ? (
          <div className="p-6 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Bordereau Numérique Généré</span>
            </div>
            <h4 className="text-lg font-bold text-white">Présentez ce code au Kiosque</h4>
            <p className="text-xs text-neutral-400">
              L'agent saisit ce code pour créditer <strong className="text-white">{formatFCFA(amount)}</strong> directement sans divulguer votre numéro.
            </p>

            <div className="p-5 bg-neutral-800/80 rounded-3xl border border-neutral-700">
              <div className="text-3xl font-extrabold font-mono tracking-wider text-emerald-400 py-1">
                {depositCode}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">Valable pendant 30 minutes dans tous les points relais</p>
            </div>

            <button
              onClick={() => {
                // complete deposit
                const newTx: Transaction = {
                  id: `tx-${Date.now()}`,
                  reference: generateReference(activeWallet.operator),
                  type: 'deposit',
                  title: 'Dépôt en Kiosque / Point Agréé',
                  recipientOrMerchant: 'Point Relais Orange Money',
                  amount: amount,
                  fee: 0,
                  currency: 'FCFA',
                  operator: activeWallet.operator,
                  timestamp: new Date().toISOString(),
                  status: 'completed',
                  note: `Bordereau ${depositCode}`,
                  category: 'Dépôt d\'argent',
                  balanceAfter: activeWallet.balance + amount,
                };
                onCompleteDeposit(newTx, amount);
                onClose();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm rounded-2xl transition-all"
            >
              Simuler validation par l'agent (+{formatFCFA(amount)})
            </button>
          </div>
        ) : (
          <form onSubmit={handleStartDeposit} className="p-5 space-y-4">
            {/* Method selection */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playKeyClick();
                  setMethod('card');
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  method === 'card'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                    : 'bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs font-bold">Carte Bancaire</p>
                <p className="text-[9px] text-neutral-400">Visa / Mastercard</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playKeyClick();
                  setMethod('agent');
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  method === 'agent'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                    : 'bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                <Store className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs font-bold">En Agence</p>
                <p className="text-[9px] text-neutral-400">Bordereau Kiosque</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playKeyClick();
                  setMethod('bank');
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  method === 'bank'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                    : 'bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                <Building2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs font-bold">Banque CMR</p>
                <p className="text-[9px] text-neutral-400">Afriland, UBA, SG</p>
              </button>
            </div>

            {/* Amount input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Montant à recharger
                </label>
                <span className="text-xs text-emerald-400 font-semibold">Frais : 0 FCFA</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amountStr}
                  onChange={(e) => {
                    setAmountStr(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="0"
                  className="w-full pl-4 pr-16 py-3.5 bg-neutral-800/80 border border-neutral-700 rounded-2xl text-white font-mono font-bold text-xl placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-neutral-400 font-bold text-sm">
                  FCFA
                </div>
              </div>

              {/* Quick Amounts */}
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {quickAmounts.map((q) => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => {
                      soundManager.playKeyClick();
                      setAmountStr(q.toString());
                      setErrorMsg('');
                    }}
                    className={`py-1.5 px-1 rounded-lg text-xs font-semibold border transition-colors ${
                      amount === q
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-neutral-800/60 text-neutral-300 border-neutral-700/60 hover:text-white'
                    }`}
                  >
                    {q >= 1000 ? `${q / 1000}k` : q}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Details if card method */}
            {method === 'card' && (
              <div className="space-y-3 bg-neutral-800/40 p-3.5 rounded-2xl border border-neutral-800">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Numéro de Carte Bancaire
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Expiration (MM/AA)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bank details if bank method */}
            {method === 'bank' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Sélectionnez votre banque camerounaise
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Afriland First Bank">Afriland First Bank Cameroun</option>
                  <option value="UBA Cameroun">UBA (United Bank for Africa)</option>
                  <option value="Société Générale Cameroun">Société Générale Cameroun (SGC)</option>
                  <option value="Ecobank Cameroun">Ecobank Cameroun</option>
                  <option value="CCA-Bank">CCA-Bank</option>
                  <option value="SCB Cameroun">SCB Cameroun (Groupe Attijariwafa)</option>
                </select>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {method === 'agent' ? 'Générer le bordereau de dépôt' : `Confirmer le Dépôt de ${formatFCFA(amount)}`}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
