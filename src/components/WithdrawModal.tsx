import React, { useState, useEffect } from 'react';
import { Wallet, Transaction } from '../types';
import { formatFCFA, calculateWithdrawalFee, generateReference } from '../utils/formatters';
import { X, ArrowDownToLine, Landmark, Store, ShieldCheck, AlertCircle, Copy, Check, Clock, QrCode } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWallet: Wallet;
  onCompleteWithdrawal: (newTx: Transaction, amountDebited: number) => void;
  onRequestBiometric: (actionName: string, onVerified: () => void) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  activeWallet,
  onCompleteWithdrawal,
  onRequestBiometric,
}) => {
  const [method, setMethod] = useState<'atm' | 'agent'>('atm');
  const [amountStr, setAmountStr] = useState('25000');
  const [agentCode, setAgentCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // ATM OTP code generation state
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(900); // 15 mins
  const [copiedOtp, setCopiedOtp] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generatedOtp && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [generatedOtp, countdown]);

  if (!isOpen) return null;

  const amount = parseInt(amountStr || '0', 10);
  const fee = calculateWithdrawalFee(amount);
  const totalDebit = amount + fee;
  const hasEnoughFunds = activeWallet.balance >= totalDebit;

  const quickAmounts = [10000, 20000, 50000, 100000, 200000];

  const handleStartWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (amount < 1000) {
      soundManager.playError();
      setErrorMsg('Le montant minimum de retrait est de 1 000 FCFA');
      return;
    }

    if (method === 'agent' && (!agentCode || agentCode.length < 5)) {
      soundManager.playError();
      setErrorMsg('Veuillez entrer le code de l\'agent agréé (5 à 6 chiffres)');
      return;
    }

    if (!hasEnoughFunds) {
      soundManager.playError();
      setErrorMsg(`Solde insuffisant pour couvrir le retrait et les frais de ${formatFCFA(fee)}.`);
      return;
    }

    const actionDescription = method === 'atm' 
      ? `Génération code retrait DAB GIMAC pour ${formatFCFA(amount)}`
      : `Retrait de ${formatFCFA(amount)} chez l'agent #${agentCode}`;

    onRequestBiometric(actionDescription, () => {
      if (method === 'atm') {
        // Generate random 4-digit ATM code
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(code);
        setCountdown(900);
        soundManager.playBiometricSuccess();
      }

      // Record transaction
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        reference: generateReference(activeWallet.operator),
        type: 'withdrawal',
        title: method === 'atm' ? 'Retrait Distributeur DAB (Sans carte)' : `Retrait Point Relais #${agentCode}`,
        recipientOrMerchant: method === 'atm' ? 'DAB GIMAC Multibanque' : `Kiosque Agréé #${agentCode}`,
        amount: amount,
        fee: fee,
        currency: 'FCFA',
        operator: activeWallet.operator,
        timestamp: new Date().toISOString(),
        status: 'completed',
        note: method === 'atm' ? 'Code guichet généré' : 'Retrait espèces en point de vente',
        category: 'Retrait d\'espèces',
        balanceAfter: activeWallet.balance - totalDebit,
      };

      onCompleteWithdrawal(newTx, totalDebit);
      if (method === 'agent') {
        onClose();
      }
    });
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const copyOtpToClipboard = () => {
    if (!generatedOtp) return;
    navigator.clipboard.writeText(generatedOtp);
    setCopiedOtp(true);
    soundManager.playKeyClick();
    setTimeout(() => setCopiedOtp(false), 2000);
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
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Retrait d'argent</h3>
              <p className="text-xs text-neutral-400">DAB sans carte ou Agent agréé</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Generated ATM Code Screen or Form */}
        {generatedOtp ? (
          <div className="p-6 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              <span>Code de Retrait DAB Prêt</span>
            </div>

            <h4 className="text-xl font-bold text-white">Code Guichet Distributeur</h4>
            <p className="text-xs text-neutral-400">
              Présentez-vous à n'importe quel distributeur GAB GIMAC (UBA, Afriland, SG, Ecobank).
            </p>

            {/* Big Code Card */}
            <div className="p-5 bg-neutral-800/80 rounded-3xl border border-neutral-700 relative">
              <div className="text-xs text-neutral-400 mb-1">Code Secret Temporaire</div>
              <div className="text-4xl font-extrabold font-mono tracking-widest text-orange-400 py-1">
                {generatedOtp}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 mt-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Expire dans : </span>
                <span className="font-mono font-bold text-white">{formatCountdown(countdown)}</span>
              </div>

              <button
                type="button"
                onClick={copyOtpToClipboard}
                className="mt-4 px-4 py-2 bg-neutral-700/80 hover:bg-neutral-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-300" />}
                <span>{copiedOtp ? 'Code copié !' : 'Copier le code'}</span>
              </button>
            </div>

            {/* ATM instructions step-by-step */}
            <div className="text-left text-xs text-neutral-300 bg-neutral-800/40 p-4 rounded-2xl border border-neutral-800 space-y-2">
              <p className="font-bold text-white">Instructions au distributeur :</p>
              <p>1. Appuyez sur n'importe quelle touche pour réveiller le GAB.</p>
              <p>2. Choisissez « Retrait Sans Carte » / « Orange Money ».</p>
              <p>3. Entrez votre numéro : <span className="font-mono font-bold text-orange-400">{activeWallet.phoneNumber}</span></p>
              <p>4. Entrez ce code temporaire : <span className="font-mono font-bold text-orange-400">{generatedOtp}</span></p>
              <p>5. Récupérez vos <span className="font-bold text-white">{formatFCFA(amount)}</span> sans frais supplémentaires au guichet !</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm rounded-2xl transition-colors"
            >
              Terminé
            </button>
          </div>
        ) : (
          <form onSubmit={handleStartWithdrawal} className="p-5 space-y-4">
            {/* Method switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playKeyClick();
                  setMethod('atm');
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                  method === 'atm'
                    ? 'bg-orange-500/15 border-orange-500 text-white shadow-md'
                    : 'bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                <Landmark className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">Distributeur DAB</p>
                  <p className="text-[10px] text-neutral-400">Sans carte au GAB GIMAC</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playKeyClick();
                  setMethod('agent');
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                  method === 'agent'
                    ? 'bg-orange-500/15 border-orange-500 text-white shadow-md'
                    : 'bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                <Store className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">Point Relais / Kiosque</p>
                  <p className="text-[10px] text-neutral-400">Chez un agent agréé</p>
                </div>
              </button>
            </div>

            {/* Agent code input if agent method */}
            {method === 'agent' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Code de l'Agent agréé (5 à 6 chiffres)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={agentCode}
                    onChange={(e) => {
                      setAgentCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setErrorMsg('');
                    }}
                    placeholder="Ex: 582104"
                    className="w-full px-4 py-3 bg-neutral-800/80 border border-neutral-700 rounded-2xl text-white font-mono placeholder-neutral-500 text-sm focus:outline-none focus:border-orange-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setAgentCode('410293')}
                      className="text-[11px] px-2 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-lg"
                    >
                      Ex: Kiosque Akwa
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Montant à retirer
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
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                        : 'bg-neutral-800/60 text-neutral-300 border-neutral-700/60 hover:text-white'
                    }`}
                  >
                    {q >= 1000 ? `${q / 1000}k` : q}
                  </button>
                ))}
              </div>
            </div>

            {/* Fee Breakdown */}
            {amount > 0 && (
              <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Montant du retrait en espèces :</span>
                  <span className="font-mono text-neutral-200">{formatFCFA(amount)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Frais de retrait réglementés :</span>
                  <span className="font-mono text-neutral-200">{formatFCFA(fee)}</span>
                </div>
                <div className="border-t border-neutral-700/60 pt-1.5 flex justify-between font-bold text-sm">
                  <span className="text-white">Débit total du compte :</span>
                  <span className="font-mono text-rose-400">{formatFCFA(totalDebit)}</span>
                </div>
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
              disabled={!hasEnoughFunds && amount > 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Valider le Retrait par Biométrie</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
