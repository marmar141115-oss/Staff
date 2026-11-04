import React, { useState } from 'react';
import { Wallet, Transaction } from '../types';
import { formatFCFA, generateReference } from '../utils/formatters';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Users, 
  ArrowRightLeft, 
  Plus, 
  Check, 
  Copy, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Lock, 
  Unlock,
  ExternalLink
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface LinkedAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  activeWallet: Wallet;
  onTransferBetweenAccounts: (fromId: string, toId: string, amount: number) => void;
  onRequestBiometric: (actionName: string, onVerified: () => void) => void;
}

export const LinkedAccountsModal: React.FC<LinkedAccountsModalProps> = ({
  isOpen,
  onClose,
  wallets,
  activeWallet,
  onTransferBetweenAccounts,
  onRequestBiometric,
}) => {
  const [showBalances, setShowBalances] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLinkNewOpen, setIsLinkNewOpen] = useState(false);
  const [newAccountType, setNewAccountType] = useState<'mtn' | 'card' | 'bank'>('mtn');
  const [newAccountIdentifier, setNewAccountIdentifier] = useState('');
  const [linkSuccess, setLinkSuccess] = useState(false);

  // Transfer between Orange Money and linked account
  const [transferTargetId, setTransferTargetId] = useState<string | null>(null);
  const [transferDirection, setTransferDirection] = useState<'to_linked' | 'from_linked'>('to_linked');
  const [transferAmount, setTransferAmount] = useState('10000');
  const [transferError, setTransferError] = useState('');

  if (!isOpen) return null;

  // Filter out the primary Orange Money account to show the other linked accounts
  const linkedWallets = wallets.filter((w) => w.id !== 'wallet-orange');

  const toggleBalance = (id: string) => {
    soundManager.playKeyClick();
    setShowBalances((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, text: string) => {
    soundManager.playKeyClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');

    const targetWallet = wallets.find((w) => w.id === transferTargetId);
    if (!targetWallet) return;

    const amount = parseInt(transferAmount || '0', 10);
    if (amount <= 0) {
      soundManager.playError();
      setTransferError('Veuillez entrer un montant valide');
      return;
    }

    const sourceWallet = transferDirection === 'to_linked' ? activeWallet : targetWallet;
    if (sourceWallet.balance < amount) {
      soundManager.playError();
      setTransferError(`Solde insuffisant sur ${sourceWallet.name} (${formatFCFA(sourceWallet.balance)})`);
      return;
    }

    const fromId = transferDirection === 'to_linked' ? activeWallet.id : targetWallet.id;
    const toId = transferDirection === 'to_linked' ? targetWallet.id : activeWallet.id;

    const desc = transferDirection === 'to_linked'
      ? `Rechargement de ${formatFCFA(amount)} vers ${targetWallet.name}`
      : `Rapatriement de ${formatFCFA(amount)} depuis ${targetWallet.name} vers Orange Money`;

    onRequestBiometric(desc, () => {
      onTransferBetweenAccounts(fromId, toId, amount);
      setTransferTargetId(null);
      soundManager.playTransactionSuccess();
    });
  };

  const handleLinkNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountIdentifier) return;
    soundManager.playBiometricSuccess();
    setLinkSuccess(true);
    setTimeout(() => {
      setLinkSuccess(false);
      setIsLinkNewOpen(false);
      setNewAccountIdentifier('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full sm:max-w-lg bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur-md px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Comptes & Cartes Associés</h3>
              <p className="text-xs text-neutral-400">MTN MoMo, Cartes Bancaires & GIMAC Pay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Transfer between accounts sub-modal */}
          {transferTargetId ? (
            (() => {
              const target = wallets.find((w) => w.id === transferTargetId);
              if (!target) return null;
              return (
                <form onSubmit={handleExecuteTransfer} className="p-4 bg-neutral-800/80 rounded-2xl border border-neutral-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ArrowRightLeft className="w-4 h-4 text-orange-400" />
                      <span>Passerelle Interopérable GIMAC</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setTransferTargetId(null)}
                      className="text-xs text-neutral-400 hover:text-white underline"
                    >
                      Retour
                    </button>
                  </div>

                  {/* Direction Switch */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setTransferDirection('to_linked')}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                        transferDirection === 'to_linked'
                          ? 'bg-orange-500/20 border-orange-500 text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <p className="text-[10px] text-neutral-400">Débiter Orange Money →</p>
                      <p className="truncate">Vers {target.name.split(' ')[0]}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTransferDirection('from_linked')}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                        transferDirection === 'from_linked'
                          ? 'bg-orange-500/20 border-orange-500 text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <p className="text-[10px] text-neutral-400">Rapatrier depuis {target.name.split(' ')[0]} →</p>
                      <p className="truncate">Vers Orange Money</p>
                    </button>
                  </div>

                  {/* Amount input */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Montant du transfert
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className="w-full pl-4 pr-16 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono font-bold text-lg focus:outline-none focus:border-orange-500"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-neutral-400 text-xs font-bold">
                        FCFA
                      </div>
                    </div>
                  </div>

                  {transferError && (
                    <p className="text-xs text-red-400 font-semibold">{transferError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                  >
                    Confirmer le transfert par Biométrie
                  </button>
                </form>
              );
            })()
          ) : (
            /* Linked accounts list */
            <div className="space-y-3">
              <p className="text-xs text-neutral-400">
                Ces comptes et cartes sont rattachés à votre profil Max it via le switch interopérable GIMAC Pay et la réglementation CEMAC :
              </p>

              {linkedWallets.map((wallet) => {
                const isRevealed = showBalances[wallet.id] ?? false;
                const isCopied = copiedId === wallet.id;

                return (
                  <div
                    key={wallet.id}
                    className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-800 hover:border-neutral-700 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-bold shadow-sm"
                          style={{ backgroundColor: wallet.accentColor }}
                        >
                          {wallet.operator === 'mtn' ? (
                            <Smartphone className="w-5 h-5 text-neutral-950" />
                          ) : wallet.id === 'wallet-gimac' ? (
                            <CreditCard className="w-5 h-5 text-white" />
                          ) : (
                            <Users className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white">{wallet.name}</h4>
                            <span className="text-[9px] px-1.5 py-0.2 bg-neutral-700 text-neutral-300 font-semibold rounded">
                              {wallet.operator === 'mtn' ? 'MOMO' : 'GIMAC'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 mt-0.5">
                            <span>{wallet.phoneNumber}</span>
                            <button
                              onClick={() => handleCopy(wallet.id, wallet.phoneNumber)}
                              className="text-neutral-500 hover:text-white"
                              title="Copier"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Balance section */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-sm font-extrabold font-mono text-white">
                            {isRevealed ? formatFCFA(wallet.balance) : '•••••••• FCFA'}
                          </span>
                          <button
                            onClick={() => toggleBalance(wallet.id)}
                            className="text-neutral-500 hover:text-white"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-orange-400" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-neutral-500">{wallet.tier}</p>
                      </div>
                    </div>

                    {/* Quick action buttons for this linked account */}
                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-700/50">
                      <button
                        onClick={() => {
                          soundManager.playKeyClick();
                          setTransferTargetId(wallet.id);
                          setTransferDirection('to_linked');
                        }}
                        className="flex-1 py-2 px-3 bg-neutral-700/80 hover:bg-neutral-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-orange-400" />
                        <span>Transférer / Passerelle</span>
                      </button>

                      <button
                        onClick={() => {
                          soundManager.playKeyClick();
                          toggleBalance(wallet.id);
                        }}
                        className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700/80 text-neutral-300 hover:text-white text-xs font-medium rounded-xl transition-colors"
                      >
                        {isRevealed ? 'Masquer' : 'Vérifier solde'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add New Linked Account Form toggle */}
              {!isLinkNewOpen ? (
                <button
                  type="button"
                  onClick={() => setIsLinkNewOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl border border-dashed border-neutral-700 hover:border-neutral-600 text-neutral-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4 text-orange-400" />
                  <span>Rattacher un autre compte ou une nouvelle carte</span>
                </button>
              ) : (
                <form onSubmit={handleLinkNewAccount} className="p-4 bg-neutral-800/80 rounded-2xl border border-neutral-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">Lier un nouveau moyen de paiement</h4>
                    <button
                      type="button"
                      onClick={() => setIsLinkNewOpen(false)}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Annuler
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAccountType('mtn')}
                      className={`p-2 rounded-xl text-xs font-semibold border ${
                        newAccountType === 'mtn' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      MTN MoMo
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAccountType('card')}
                      className={`p-2 rounded-xl text-xs font-semibold border ${
                        newAccountType === 'card' ? 'bg-blue-500/20 text-blue-400 border-blue-400' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      Carte Visa
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAccountType('bank')}
                      className={`p-2 rounded-xl text-xs font-semibold border ${
                        newAccountType === 'bank' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      Banque CMR
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={newAccountIdentifier}
                      onChange={(e) => setNewAccountIdentifier(e.target.value)}
                      placeholder={
                        newAccountType === 'mtn' ? 'Numéro MTN (+237 67X XX XX XX)' : 'Numéro de carte ou RIB'
                      }
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {linkSuccess && (
                    <p className="text-xs text-emerald-400 font-semibold">Compte lié avec succès !</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Valider le rattachement
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
