import React, { useState, useRef, useEffect } from 'react';
import { Merchant, Wallet, Transaction } from '../types';
import { POPULAR_MERCHANTS } from '../data/mockData';
import { formatFCFA, generateReference } from '../utils/formatters';
import { X, ScanLine, Camera, Flashlight, Store, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface MerchantPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWallet: Wallet;
  onCompletePayment: (newTx: Transaction, amountDebited: number) => void;
  onRequestBiometric: (actionName: string, onVerified: () => void) => void;
}

export const MerchantPaymentModal: React.FC<MerchantPaymentModalProps> = ({
  isOpen,
  onClose,
  activeWallet,
  onCompletePayment,
  onRequestBiometric,
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize camera stream if user approves or simulated feed
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && activeTab === 'scan' && !selectedMerchant) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then((s) => {
            stream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = s;
              setCameraActive(true);
            }
          })
          .catch(() => {
            // Camera not available or denied; fallback to interactive simulation HUD
            setCameraActive(false);
          });
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, activeTab, selectedMerchant]);

  if (!isOpen) return null;

  const amount = parseInt(amountStr || '0', 10);
  const fee = 0; // Regulated: Merchant payment is always 0 FCFA for the customer in Cameroon
  const totalDebit = amount;
  const hasEnoughFunds = activeWallet.balance >= totalDebit;

  const quickAmounts = [2500, 5000, 12000, 25000, 50000];

  const handleSelectMerchant = (m: Merchant) => {
    soundManager.playQrScanBeep();
    setSelectedMerchant(m);
    setErrorMsg('');
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const matched = POPULAR_MERCHANTS.find(m => m.code === manualCode.trim());
    if (matched) {
      soundManager.playQrScanBeep();
      setSelectedMerchant(matched);
    } else if (manualCode.length >= 5) {
      soundManager.playQrScanBeep();
      setSelectedMerchant({
        id: `m-custom-${manualCode}`,
        code: manualCode,
        name: `Marchand Partenaire #${manualCode}`,
        category: 'Commerce de proximité',
        city: 'Douala / Yaoundé',
        logo: '🏪',
        acceptsOperator: ['orange', 'mtn'],
      });
    } else {
      soundManager.playError();
      setErrorMsg('Veuillez entrer un code marchand à 5 ou 6 chiffres valide');
    }
  };

  const handlePayMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedMerchant) {
      setErrorMsg('Veuillez sélectionner ou scanner un marchand');
      return;
    }

    if (amount <= 0) {
      soundManager.playError();
      setErrorMsg('Veuillez saisir un montant valide');
      return;
    }

    if (!hasEnoughFunds) {
      soundManager.playError();
      setErrorMsg(`Solde insuffisant (${formatFCFA(activeWallet.balance)}) pour régler cet achat.`);
      return;
    }

    const actionText = `Paiement Marchand de ${formatFCFA(amount)} chez ${selectedMerchant.name}`;
    onRequestBiometric(actionText, () => {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        reference: generateReference(activeWallet.operator),
        type: 'merchant_payment',
        title: 'Paiement Marchand QR',
        recipientOrMerchant: `${selectedMerchant.name} (${selectedMerchant.city})`,
        amount: amount,
        fee: 0,
        currency: 'FCFA',
        operator: activeWallet.operator,
        timestamp: new Date().toISOString(),
        status: 'completed',
        note: `Code Marchand : ${selectedMerchant.code}`,
        category: 'Courses & Marchands',
        balanceAfter: activeWallet.balance - totalDebit,
      };

      onCompletePayment(newTx, totalDebit);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full sm:max-w-md bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur-md px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Paiement Marchand QR</h3>
              <p className="text-xs text-neutral-400">0 FCFA de frais pour vous</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedMerchant ? (
          /* Step 2: Amount Entry for Confirmed Merchant */
          <form onSubmit={handlePayMerchant} className="p-5 space-y-4">
            <div className="p-4 bg-gradient-to-br from-neutral-800/90 to-neutral-900 rounded-2xl border border-neutral-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl">
                  {selectedMerchant.logo}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white">{selectedMerchant.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 font-bold rounded">
                      Vérifié
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">{selectedMerchant.category} · {selectedMerchant.city}</p>
                  <p className="text-[11px] font-mono text-orange-400 mt-0.5">Code #{selectedMerchant.code}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundManager.playKeyClick();
                  setSelectedMerchant(null);
                }}
                className="text-xs text-neutral-400 hover:text-white underline"
              >
                Changer
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Montant à régler
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
                  autoFocus
                  className="w-full pl-4 pr-16 py-3.5 bg-neutral-800/80 border border-neutral-700 rounded-2xl text-white font-mono font-bold text-xl placeholder-neutral-500 focus:outline-none focus:border-amber-500"
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
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-neutral-800/60 text-neutral-300 border-neutral-700/60 hover:text-white'
                    }`}
                  >
                    {q >= 1000 ? `${q / 1000}k` : q}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-800 space-y-1 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Frais de paiement marchand :</span>
                <span className="font-mono text-emerald-400 font-bold">0 FCFA (Gratuit)</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1 border-t border-neutral-700/60">
                <span>Total débité :</span>
                <span className="font-mono text-amber-400 text-sm">{formatFCFA(totalDebit)}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!hasEnoughFunds && amount > 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirmer le Paiement par Biométrie</span>
            </button>
          </form>
        ) : (
          /* Step 1: Scanner & Popular Merchants list */
          <div className="p-5 space-y-4">
            {/* Tab switch: Scan QR vs Enter Merchant Code */}
            <div className="flex p-1 bg-neutral-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  soundManager.playKeyClick();
                  setActiveTab('scan');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'scan' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scanner QR Marchand</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playKeyClick();
                  setActiveTab('manual');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'manual' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Saisir Code Marchand</span>
              </button>
            </div>

            {activeTab === 'scan' ? (
              <div className="space-y-4">
                {/* Scanner Viewfinder Box */}
                <div className="relative w-full h-56 rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center shadow-inner">
                  {cameraActive ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : (
                    /* Futuristic Camera Reticle Simulation */
                    <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 to-neutral-950 flex flex-col items-center justify-center p-6 text-center">
                      <div className="relative w-40 h-40 border-2 border-dashed border-amber-400/60 rounded-2xl flex items-center justify-center">
                        {/* 4 Corner Markers */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400" />
                        
                        {/* Laser beam */}
                        <div className="absolute left-2 right-2 h-0.5 bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-bounce" />
                        
                        <ScanLine className="w-12 h-12 text-amber-400/80 animate-pulse" />
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-2">
                        Pointez vers le QR Code Orange Money / MTN MoMo du commerçant
                      </p>
                    </div>
                  )}

                  {/* Flashlight toggle */}
                  <button
                    onClick={() => setFlashlightOn(!flashlightOn)}
                    className={`absolute bottom-3 right-3 p-2.5 rounded-full transition-colors ${
                      flashlightOn ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-800/80 text-white'
                    }`}
                    title="Lampe torche"
                  >
                    <Flashlight className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Merchant Selection in Cameroon */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">Ou scannez un marchand partenaire :</span>
                    <span className="text-[10px] text-amber-400">1-clic direct</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {POPULAR_MERCHANTS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMerchant(m)}
                        className="p-2.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/70 text-left transition-all flex items-center gap-2.5 group"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">{m.logo}</span>
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{m.name}</p>
                          <p className="text-[10px] text-neutral-400">{m.city} · #{m.code}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Manual Code Entry */
              <form onSubmit={handleManualCodeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Code Marchand (Affiché sur le présentoir du commerçant)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => {
                        setManualCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setErrorMsg('');
                      }}
                      placeholder="Ex: 482109"
                      className="w-full px-4 py-3 bg-neutral-800/80 border border-neutral-700 rounded-2xl text-white font-mono text-lg font-bold placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Généralement 5 ou 6 chiffres (ex: Carrefour Akwa: 482109, Dovv: 301982)
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Trouver le marchand</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
