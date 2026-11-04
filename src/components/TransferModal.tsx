import React, { useState } from 'react';
import { Contact, OperatorType, Wallet, Transaction } from '../types';
import { formatFCFA, detectOperatorFromPhone, calculateTransferFee, generateReference, formatCameroonPhone } from '../utils/formatters';
import { X, Send, User, Search, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWallet: Wallet;
  contacts: Contact[];
  onCompleteTransfer: (newTx: Transaction, amountDebited: number) => void;
  onRequestBiometric: (actionName: string, onVerified: () => void) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  activeWallet,
  contacts,
  onCompleteTransfer,
  onRequestBiometric,
}) => {
  const [targetOperator, setTargetOperator] = useState<OperatorType>('orange');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [reason, setReason] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const amount = parseInt(amountStr || '0', 10);
  const fee = calculateTransferFee(amount, activeWallet.operator, targetOperator);
  const totalDebit = amount + fee;
  const hasEnoughFunds = activeWallet.balance >= totalDebit;

  const quickAmounts = [2000, 5000, 10000, 25000, 50000, 100000];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRecipientPhone(val);
    setErrorMsg('');

    // Auto-detect operator
    if (val.length >= 3) {
      const detected = detectOperatorFromPhone(val);
      setTargetOperator(detected);
    }

    // Match contact name
    const cleanDigits = val.replace(/\D/g, '');
    const matched = contacts.find(c => c.phone.replace(/\D/g, '').includes(cleanDigits) && cleanDigits.length > 5);
    if (matched) {
      setRecipientName(matched.name);
    }
  };

  const selectContact = (contact: Contact) => {
    soundManager.playKeyClick();
    setRecipientPhone(contact.phone);
    setRecipientName(contact.name);
    setTargetOperator(contact.operator);
    setErrorMsg('');
  };

  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!recipientPhone || recipientPhone.length < 8) {
      soundManager.playError();
      setErrorMsg('Veuillez entrer un numéro de téléphone camerounais valide (ex: 694 28 91 03)');
      return;
    }

    if (amount < 100) {
      soundManager.playError();
      setErrorMsg('Le montant minimum de transfert est de 100 FCFA');
      return;
    }

    if (!hasEnoughFunds) {
      soundManager.playError();
      setErrorMsg(`Solde insuffisant. Vous disposez de ${formatFCFA(activeWallet.balance)} (Total requis avec frais: ${formatFCFA(totalDebit)})`);
      return;
    }

    // Trigger biometric / PIN security verification
    onRequestBiometric(`Transfert de ${formatFCFA(amount)} vers ${recipientName || recipientPhone}`, () => {
      // Upon successful security verification:
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        reference: generateReference(activeWallet.operator),
        type: 'transfer_send',
        title: `Transfert ${targetOperator === 'orange' ? 'Orange Money' : targetOperator === 'mtn' ? 'MTN MoMo' : 'Blue Money'}`,
        recipientOrMerchant: recipientName || formatCameroonPhone(recipientPhone),
        recipientPhone: formatCameroonPhone(recipientPhone),
        amount: amount,
        fee: fee,
        currency: 'FCFA',
        operator: targetOperator,
        timestamp: new Date().toISOString(),
        status: 'completed',
        note: reason || 'Transfert mobile',
        category: 'Transfert d\'argent',
        balanceAfter: activeWallet.balance - totalDebit,
      };

      onCompleteTransfer(newTx, totalDebit);
      onClose();
    });
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.phone.includes(searchContact)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full sm:max-w-lg bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur-md px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Transfert d'argent Mobile</h3>
              <p className="text-xs text-neutral-400">Orange Money, MTN MoMo & CEMAC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleInitiateTransfer} className="p-5 space-y-4">
          {/* Operator Selection */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Réseau du destinataire
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playKeyClick();
                  setTargetOperator('orange');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  targetOperator === 'orange'
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                }`}
              >
                <span>Orange Money</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playKeyClick();
                  setTargetOperator('mtn');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  targetOperator === 'mtn'
                    ? 'bg-yellow-500 text-black border-yellow-400 shadow-md shadow-yellow-500/20'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                }`}
              >
                <span>MTN MoMo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playKeyClick();
                  setTargetOperator('blue');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  targetOperator === 'blue'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                }`}
              >
                <span>Blue CamTel</span>
              </button>
            </div>
          </div>

          {/* Recipient Phone and Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Numéro du bénéficiaire (+237)
              </label>
              {recipientName && (
                <span className="text-xs text-orange-400 font-bold truncate max-w-[180px]">
                  ✓ {recipientName}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 text-sm font-semibold">
                🇨🇲 +237
              </div>
              <input
                type="tel"
                value={recipientPhone}
                onChange={handlePhoneChange}
                placeholder="6XX XX XX XX"
                className="w-full pl-20 pr-4 py-3 bg-neutral-800/80 border border-neutral-700 rounded-2xl text-white font-mono placeholder-neutral-500 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Quick Contacts Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-400">Contacts récents & favoris</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {contacts.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => selectContact(c)}
                  className="px-3 py-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/80 shrink-0 text-left transition-colors flex items-center gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold text-white">
                    {c.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white truncate max-w-[100px]">{c.name}</p>
                    <p className="text-[10px] text-neutral-400 font-mono">{c.phone.slice(-9)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Montant à envoyer
              </label>
              <span className="text-xs text-neutral-400">
                Solde dispo : <strong className="text-white font-mono">{formatFCFA(activeWallet.balance)}</strong>
              </span>
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
                className="w-full pl-4 pr-16 py-3.5 bg-neutral-800/80 border border-neutral-700 rounded-2xl text-white font-mono font-bold text-xl placeholder-neutral-500 focus:outline-none focus:border-orange-500"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-neutral-400 font-bold text-sm">
                FCFA
              </div>
            </div>

            {/* Quick Amount Pills */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => {
                    soundManager.playKeyClick();
                    setAmountStr(q.toString());
                    setErrorMsg('');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors ${
                    amount === q
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                      : 'bg-neutral-800/60 text-neutral-300 border-neutral-700/60 hover:text-white'
                  }`}
                >
                  {q >= 1000 ? `${q / 1000}k` : q}
                </button>
              ))}
            </div>
          </div>

          {/* Reason / Motif (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Motif du transfert (facultatif)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Loyer, Frais de scolarité, Marché..."
              className="w-full px-4 py-2.5 bg-neutral-800/80 border border-neutral-700 rounded-xl text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Fee & Total Summary Card */}
          {amount > 0 && (
            <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Montant envoyé :</span>
                <span className="font-mono text-neutral-200">{formatFCFA(amount)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span className="flex items-center gap-1">
                  Frais de transfert réglementés :
                  {targetOperator !== activeWallet.operator && (
                    <span className="text-[10px] text-orange-400 font-semibold">(Inter-op GIMAC)</span>
                  )}
                </span>
                <span className="font-mono text-neutral-200">{formatFCFA(fee)}</span>
              </div>
              <div className="border-t border-neutral-700/60 pt-1.5 flex justify-between font-bold text-sm">
                <span className="text-white">Total débité :</span>
                <span className="font-mono text-orange-400">{formatFCFA(totalDebit)}</span>
              </div>
            </div>
          )}

          {/* Error notice */}
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!hasEnoughFunds && amount > 0}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Valider et Authentifier par Biométrie</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
