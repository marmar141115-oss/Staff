import React, { useState } from 'react';
import { Wallet, Transaction, BillProvider, InternetBundle } from '../types';
import { BILL_PROVIDERS, INTERNET_BUNDLES } from '../data/mockData';
import { formatFCFA, generateReference } from '../utils/formatters';
import { X, Zap, Wifi, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Tv, Droplet, Globe, Building } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BillsAndBundlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWallet: Wallet;
  initialTab?: 'bills' | 'bundles';
  onCompleteBillOrBundle: (newTx: Transaction, amountDebited: number) => void;
  onRequestBiometric: (actionName: string, onVerified: () => void) => void;
}

export const BillsAndBundlesModal: React.FC<BillsAndBundlesModalProps> = ({
  isOpen,
  onClose,
  activeWallet,
  initialTab = 'bills',
  onCompleteBillOrBundle,
  onRequestBiometric,
}) => {
  const [tab, setTab] = useState<'bills' | 'bundles'>(initialTab);
  const [selectedProvider, setSelectedProvider] = useState<BillProvider | null>(null);
  const [contractNumber, setContractNumber] = useState('');
  const [billAmountStr, setBillAmountStr] = useState('18500');
  
  // Bundles state
  const [selectedBundle, setSelectedBundle] = useState<InternetBundle | null>(null);
  const [bundlePhone, setBundlePhone] = useState(activeWallet.phoneNumber);

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePayBill = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedProvider) {
      setErrorMsg('Veuillez sélectionner un fournisseur');
      return;
    }

    if (!contractNumber) {
      soundManager.playError();
      setErrorMsg('Veuillez entrer le numéro de compteur ou contrat');
      return;
    }

    const amount = parseInt(billAmountStr || '0', 10);
    if (amount <= 0) {
      soundManager.playError();
      setErrorMsg('Veuillez saisir un montant valide');
      return;
    }

    const fee = 100;
    const totalDebit = amount + fee;

    if (activeWallet.balance < totalDebit) {
      soundManager.playError();
      setErrorMsg(`Solde insuffisant pour régler la facture de ${formatFCFA(amount)}`);
      return;
    }

    onRequestBiometric(`Règlement facture ${selectedProvider.name} (${formatFCFA(amount)})`, () => {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        reference: generateReference(activeWallet.operator),
        type: 'bill_payment',
        title: `Facture ${selectedProvider.name}`,
        recipientOrMerchant: selectedProvider.name,
        amount: amount,
        fee: fee,
        currency: 'FCFA',
        operator: activeWallet.operator,
        timestamp: new Date().toISOString(),
        status: 'completed',
        note: `Contrat / Réf : ${contractNumber}`,
        category: 'Factures de base',
        balanceAfter: activeWallet.balance - totalDebit,
      };

      onCompleteBillOrBundle(newTx, totalDebit);
      onClose();
    });
  };

  const handleBuyBundle = (bundle: InternetBundle) => {
    setSelectedBundle(bundle);
    setErrorMsg('');

    if (activeWallet.balance < bundle.price) {
      soundManager.playError();
      setErrorMsg(`Solde insuffisant pour acheter le forfait ${bundle.name} (${formatFCFA(bundle.price)})`);
      return;
    }

    onRequestBiometric(`Achat ${bundle.name} pour ${bundlePhone}`, () => {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        reference: generateReference(bundle.operator),
        type: 'airtime_bundle',
        title: `Forfait ${bundle.name}`,
        recipientOrMerchant: `${bundle.operator.toUpperCase()} Cameroun`,
        recipientPhone: bundlePhone,
        amount: bundle.price,
        fee: 0,
        currency: 'FCFA',
        operator: bundle.operator,
        timestamp: new Date().toISOString(),
        status: 'completed',
        note: `${bundle.volume} · Validité ${bundle.validity}`,
        category: 'Forfaits & Crédit',
        balanceAfter: activeWallet.balance - bundle.price,
      };

      onCompleteBillOrBundle(newTx, bundle.price);
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
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              {tab === 'bills' ? <Zap className="w-5 h-5 text-amber-400" /> : <Wifi className="w-5 h-5 text-purple-400" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Factures & Forfaits Cameroun</h3>
              <p className="text-xs text-neutral-400">ENEO, Camwater, Canal+ & Pass Internet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-5 pt-3">
          <div className="flex p-1 bg-neutral-800 rounded-xl">
            <button
              onClick={() => {
                soundManager.playKeyClick();
                setTab('bills');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                tab === 'bills' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Factures Cameroun</span>
            </button>
            <button
              onClick={() => {
                soundManager.playKeyClick();
                setTab('bundles');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                tab === 'bundles' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Wifi className="w-3.5 h-3.5 text-purple-400" />
              <span>Forfaits Internet 4G/5G</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Bills */}
        {tab === 'bills' && (
          <div className="p-5 space-y-4">
            {!selectedProvider ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-300">
                  Choisissez le service à régler :
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {BILL_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        soundManager.playKeyClick();
                        setSelectedProvider(provider);
                        if (provider.id === 'bill-eneo') setContractNumber('204918231');
                        if (provider.id === 'bill-canal') setContractNumber('01428891002345');
                        if (provider.id === 'bill-camwater') setContractNumber('014-99823-01');
                      }}
                      className="p-3.5 rounded-2xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/70 text-left transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform">{provider.logo}</span>
                        <div>
                          <p className="text-xs font-bold text-white">{provider.name}</p>
                          <p className="text-[10px] text-neutral-400">Paiement instantané sans vous déplacer</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handlePayBill} className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-800/80 rounded-2xl border border-neutral-700">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{selectedProvider.logo}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{selectedProvider.name}</h4>
                      <p className="text-[10px] text-neutral-400">Règlement en ligne certifié</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProvider(null)}
                    className="text-xs text-orange-400 hover:underline"
                  >
                    Changer
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Numéro de Contrat / Compteur / Décodeur
                  </label>
                  <input
                    type="text"
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    placeholder="Ex: 204918231"
                    className="w-full px-4 py-3 bg-neutral-800/80 border border-neutral-700 rounded-2xl text-white font-mono text-sm placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Montant de la facture
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={billAmountStr}
                      onChange={(e) => setBillAmountStr(e.target.value)}
                      placeholder="0"
                      className="w-full pl-4 pr-16 py-3.5 bg-neutral-800/80 border border-neutral-700 rounded-2xl text-white font-mono font-bold text-xl placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-neutral-400 font-bold text-sm">
                      FCFA
                    </div>
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
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Régler la Facture par Biométrie</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Bundles */}
        {tab === 'bundles' && (
          <div className="p-5 space-y-3">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-300">
                Numéro bénéficiaire du forfait :
              </label>
              <input
                type="tel"
                value={bundlePhone}
                onChange={(e) => setBundlePhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-800/80 border border-neutral-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              {INTERNET_BUNDLES.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/70 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        b.operator === 'orange' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {b.operator}
                      </span>
                      <h4 className="text-xs font-bold text-white">{b.name}</h4>
                    </div>
                    <p className="text-xs font-semibold text-purple-400 mt-0.5">{b.volume}</p>
                    <p className="text-[10px] text-neutral-400">Validité : {b.validity}</p>
                  </div>

                  <button
                    onClick={() => handleBuyBundle(b)}
                    className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-md shadow-purple-600/20"
                  >
                    <span>{formatFCFA(b.price)}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
