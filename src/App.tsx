import React, { useState } from 'react';
import { 
  INITIAL_WALLETS, 
  INITIAL_CONTACTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_SECURITY,
  INTERNET_BUNDLES
} from './data/mockData';
import { Wallet, Transaction, Contact, SecurityConfig } from './types';
import { Header } from './components/Header';
import { DualAccountCard } from './components/DualAccountCard';
import { ServicesGrid } from './components/ServicesGrid';
import { DiscoverSection } from './components/DiscoverSection';
import { BottomNav, BottomTabType } from './components/BottomNav';
import { TransactionHistory } from './components/TransactionHistory';
import { BiometricModal } from './components/BiometricModal';
import { PinPadModal } from './components/PinPadModal';
import { TransferModal } from './components/TransferModal';
import { WithdrawModal } from './components/WithdrawModal';
import { DepositModal } from './components/DepositModal';
import { MerchantPaymentModal } from './components/MerchantPaymentModal';
import { MyQrModal } from './components/MyQrModal';
import { BillsAndBundlesModal } from './components/BillsAndBundlesModal';
import { CancelTransferModal } from './components/CancelTransferModal';
import { TicketModal } from './components/TicketModal';
import { MaxItHubModal } from './components/MaxItHubModal';
import { ReceiptModal } from './components/ReceiptModal';
import { SecuritySettingsModal } from './components/SecuritySettingsModal';
import { NotificationToast } from './components/NotificationToast';
import { soundManager } from './utils/audio';
import { formatFCFA } from './utils/formatters';
import { 
  Smartphone, 
  Monitor, 
  RotateCcw, 
  Wifi, 
  BatteryCharging, 
  Send, 
  ArrowDownToLine, 
  WalletCards, 
  ScanLine,
  PhoneCall,
  ShoppingBag,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Search,
  MessageCircle,
  Bell
} from 'lucide-react';

export default function App() {
  // Financial & Wallet State
  const [wallets, setWallets] = useState<Wallet[]>(INITIAL_WALLETS);
  const [activeWalletId, setActiveWalletId] = useState<string>('wallet-orange');
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(INITIAL_SECURITY);

  // Phone numbers management
  const [currentPhone, setCurrentPhone] = useState('+237 699 757 821');
  const [prepaidUnits, setPrepaidUnits] = useState(15450);

  // Balance reveal states (toggled by Eye or Biometric verification)
  const [isMainRevealed, setIsMainRevealed] = useState(false);
  const [isPrepaidRevealed, setIsPrepaidRevealed] = useState(false);

  // Bottom Navigation tab
  const [activeTab, setActiveTab] = useState<BottomTabType>('accueil');

  // Device Frame View Mode
  const [viewMode, setViewMode] = useState<'mobile' | 'expanded'>('mobile');

  // Modals state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isMerchantPayOpen, setIsMerchantPayOpen] = useState(false);
  const [isMyQrOpen, setIsMyQrOpen] = useState(false);
  const [isBillsOpen, setIsBillsOpen] = useState(false);
  const [billsInitialTab, setBillsInitialTab] = useState<'bills' | 'bundles'>('bills');
  const [isCancelTransferOpen, setIsCancelTransferOpen] = useState(false);
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);

  // Receipt Modal
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  // Biometric / PIN Verification Workflow
  const [isBiometricOpen, setIsBiometricOpen] = useState(false);
  const [isPinPadOpen, setIsPinPadOpen] = useState(false);
  const [pendingActionDesc, setPendingActionDesc] = useState('');
  const [onVerifiedCallback, setOnVerifiedCallback] = useState<(() => void) | null>(null);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const activeWallet = wallets.find((w) => w.id === activeWalletId) || wallets[0];

  // Request Security Verification
  const requestSecurityVerification = (actionDescription: string, callback: () => void) => {
    if (securityConfig.isAccountFrozen) {
      soundManager.playError();
      setToastMsg('Opération impossible : Votre compte est temporairement gelé.');
      setToastType('error');
      return;
    }

    setPendingActionDesc(actionDescription);
    setOnVerifiedCallback(() => callback);

    if (securityConfig.biometricsEnabled) {
      setIsBiometricOpen(true);
    } else {
      setIsPinPadOpen(true);
    }
  };

  const handleBiometricSuccess = () => {
    setIsBiometricOpen(false);
    if (onVerifiedCallback) {
      onVerifiedCallback();
      setOnVerifiedCallback(null);
    }
  };

  const handlePinSuccess = () => {
    setIsPinPadOpen(false);
    if (onVerifiedCallback) {
      onVerifiedCallback();
      setOnVerifiedCallback(null);
    }
  };

  // Toggle main balance with security
  const handleToggleMainBalance = () => {
    if (!isMainRevealed && securityConfig.requirePinForBalance) {
      requestSecurityVerification('Vérification du solde Compte Principal', () => {
        setIsMainRevealed(true);
        setToastMsg('Solde Compte Principal affiché');
        setToastType('success');
      });
    } else {
      setIsMainRevealed(!isMainRevealed);
    }
  };

  // Toggle prepaid units
  const handleTogglePrepaidBalance = () => {
    setIsPrepaidRevealed(!isPrepaidRevealed);
  };

  // Debit Transaction
  const handleCompleteDebit = (newTx: Transaction, amountDebited: number) => {
    soundManager.playTransactionSuccess();
    setTransactions((prev) => [newTx, ...prev]);
    setWallets((prev) =>
      prev.map((w) =>
        w.id === activeWalletId
          ? {
              ...w,
              balance: Math.max(0, w.balance - amountDebited),
              spentToday: w.spentToday + amountDebited,
            }
          : w
      )
    );
    setSelectedReceiptTx(newTx);
    setToastMsg(`${newTx.title} validé : -${newTx.amount.toLocaleString('fr-FR')} FCFA`);
    setToastType('success');
  };

  // Credit Transaction
  const handleCompleteCredit = (newTx: Transaction, amountCredited: number) => {
    soundManager.playTransactionSuccess();
    setTransactions((prev) => [newTx, ...prev]);
    setWallets((prev) =>
      prev.map((w) =>
        w.id === activeWalletId
          ? {
              ...w,
              balance: w.balance + amountCredited,
            }
          : w
      )
    );
    setSelectedReceiptTx(newTx);
    setToastMsg(`Rechargement réussi : +${amountCredited.toLocaleString('fr-FR')} FCFA`);
    setToastType('success');
  };

  // Cancel mistaken transfer
  const handleConfirmCancelTransfer = (targetTx: Transaction) => {
    soundManager.playTransactionSuccess();
    // refund
    const refundTx: Transaction = {
      id: `refund-${Date.now()}`,
      reference: `CANCEL-${targetTx.reference.slice(-6)}`,
      type: 'transfer_receive',
      title: 'Annulation & Remboursement Transfert',
      recipientOrMerchant: `Annulation de ${targetTx.recipientOrMerchant}`,
      amount: targetTx.amount,
      fee: 0,
      currency: 'FCFA',
      operator: 'orange',
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: `Rappel de fonds pour ${targetTx.reference}`,
      category: 'Annulation de transfert',
      balanceAfter: activeWallet.balance + targetTx.amount,
    };

    setTransactions((prev) => [refundTx, ...prev]);
    setWallets((prev) =>
      prev.map((w) =>
        w.id === activeWalletId
          ? { ...w, balance: w.balance + targetTx.amount }
          : w
      )
    );
    setSelectedReceiptTx(refundTx);
    setToastMsg(`Transfert annulé : +${formatFCFA(targetTx.amount)} recrédités sur votre compte`);
    setToastType('success');
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    soundManager.playKeyClick();
    setWallets(INITIAL_WALLETS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSecurityConfig(INITIAL_SECURITY);
    setIsMainRevealed(false);
    setIsPrepaidRevealed(false);
    setToastMsg('Données réinitialisées au solde de référence');
    setToastType('info');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-900 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* Background Graphic: Matching the Orange splash curve seen in the reference screenshot */}
      <div 
        className="fixed -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-90 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #FF7900 0%, #EA580C 60%, transparent 100%)',
        }}
      />
      <div 
        className="fixed -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-60 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #F97316 0%, #C2410C 70%, transparent 100%)',
        }}
      />

      {/* Top Presentation Bar for Testing & Controls */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2.5 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 text-xs text-neutral-300 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#FF7900] flex items-center justify-center font-bold text-white text-xs">
            M
          </div>
          <span className="font-bold text-white tracking-tight">Max it Cameroun</span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-400">Design conforme à la capture d'écran officielle</span>
          <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold text-[10px]">
            Orange Money & MoMo GIMAC
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDemoData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les soldes</span>
          </button>

          <div className="flex items-center p-0.5 bg-neutral-800 rounded-xl">
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'mobile' ? 'bg-[#FF7900] text-white shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Format Smartphone</span>
            </button>
            <button
              onClick={() => setViewMode('expanded')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'expanded' ? 'bg-[#FF7900] text-white shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Format Large</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <main className="flex-1 flex items-center justify-center p-0 sm:p-4 md:p-6 z-10">
        {/* Smartphone Mockup matching reference screenshot */}
        <div
          className={`w-full transition-all duration-300 ${
            viewMode === 'mobile'
              ? 'max-w-[420px] min-h-[850px] sm:rounded-[48px] sm:border-[10px] sm:border-neutral-900 sm:shadow-[0_30px_90px_rgba(0,0,0,0.85)] bg-neutral-50 overflow-hidden relative flex flex-col justify-between'
              : 'max-w-4xl bg-neutral-50 sm:rounded-3xl sm:border border-neutral-200 shadow-2xl relative flex flex-col'
          }`}
        >
          {/* Smartphone Status Bar (11:49, WhatsApp, 4G, Battery 69% as in screenshot) */}
          <div className="flex items-center justify-between px-6 pt-2 pb-1 text-xs font-bold text-neutral-900 bg-white">
            <div className="flex items-center gap-1.5">
              <span>11:49</span>
              <MessageCircle className="w-3 h-3 text-neutral-600 ml-1" />
            </div>

            {/* Subtle Camera notch */}
            <div className="w-3.5 h-3.5 rounded-full bg-neutral-900/90 mx-auto hidden sm:block" />

            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-[10px] text-neutral-700 font-semibold">4G</span>
              <Wifi className="w-3 h-3 text-neutral-800" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-bold">69</span>
                <BatteryCharging className="w-3.5 h-3.5 text-neutral-800" />
              </div>
            </div>
          </div>

          {/* Top Bar matching screenshot */}
          <Header
            currentPhone={currentPhone}
            onSelectPhone={(phone) => setCurrentPhone(phone)}
            onOpenSearch={() => setIsHubOpen(true)}
            onOpenNotifications={() => {
              soundManager.playKeyClick();
              setToastMsg('Aucune notification non-lue : votre compte est à jour');
              setToastType('info');
            }}
            onOpenSupport={() => {
              soundManager.playKeyClick();
              window.open('https://api.whatsapp.com/send?phone=237699757821&text=Bonjour%20Service%20Client%20Max%20it%20Cameroun', '_blank');
            }}
            onOpenSecurity={() => setIsSecurityOpen(true)}
            unreadCount={3}
          />

          {/* Scrollable Screen Content */}
          <div className="flex-1 overflow-y-auto pb-24 bg-neutral-50">
            {/* TAB 1: ACCUEIL (Exact layout from reference screenshot) */}
            {activeTab === 'accueil' && (
              <>
                {/* 1. Dual Cards: Compte Principal (QR & Arcs) + Prépayé */}
                <DualAccountCard
                  mainBalance={activeWallet.balance}
                  prepaidUnits={prepaidUnits}
                  onToggleMainBalanceAuth={handleToggleMainBalance}
                  onTogglePrepaidBalanceAuth={handleTogglePrepaidBalance}
                  onViewDetails={() => {
                    soundManager.playKeyClick();
                    setActiveTab('money');
                  }}
                  onOpenMyQr={() => setIsMyQrOpen(true)}
                  isMainRevealed={isMainRevealed}
                  isPrepaidRevealed={isPrepaidRevealed}
                />

                {/* 2. Grid of 8 Services (Exact icons & titles) */}
                <ServicesGrid
                  onOpenBundles={() => {
                    setBillsInitialTab('bundles');
                    setIsBillsOpen(true);
                  }}
                  onOpenRecharge={() => setIsDepositOpen(true)}
                  onOpenMerchantPay={() => setIsMerchantPayOpen(true)}
                  onOpenTransfer={() => setIsTransferOpen(true)}
                  onOpenWithdraw={() => setIsWithdrawOpen(true)}
                  onOpenCancelTransfer={() => setIsCancelTransferOpen(true)}
                  onOpenTickets={() => setIsTicketsOpen(true)}
                  onOpenViewAll={() => setIsHubOpen(true)}
                />

                {/* 3. Découvrir Section (Promotions, Pass Giga, Tontines) */}
                <DiscoverSection
                  onOpenBundles={() => {
                    setBillsInitialTab('bundles');
                    setIsBillsOpen(true);
                  }}
                  onOpenTontine={() => {
                    soundManager.playKeyClick();
                    setActiveWalletId('wallet-tontine');
                    setToastMsg('Basculé sur la Tontine Njangi "Douala Progrès"');
                    setToastType('info');
                  }}
                  onOpenBills={() => {
                    setBillsInitialTab('bills');
                    setIsBillsOpen(true);
                  }}
                />

                {/* 4. Recent Transactions Overview */}
                <div className="mt-1">
                  <TransactionHistory
                    transactions={transactions.slice(0, 4)}
                    onSelectTransaction={(tx) => setSelectedReceiptTx(tx)}
                  />
                </div>
              </>
            )}

            {/* TAB 2: MONEY (Finances, OM, MoMo & Full History) */}
            {activeTab === 'money' && (
              <div className="p-4 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-neutral-900">Orange Money Cameroun</h2>
                    <p className="text-xs text-neutral-500">Interopérabilité CEMAC GIMAC Pay</p>
                  </div>
                  <button
                    onClick={() => setIsSecurityOpen(true)}
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    title="Sécurité"
                  >
                    <ShieldCheck className="w-5 h-5 text-orange-500" />
                  </button>
                </div>

                {/* Big Orange Money Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-950 text-white shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FF7900] text-black font-extrabold text-xs">
                      ORANGE MONEY
                    </span>
                    <span className="text-xs font-mono text-neutral-400">#150# Cameroun</span>
                  </div>

                  <p className="text-xs text-neutral-400 mb-1">Solde Compte Principal</p>
                  <p className="text-3xl font-extrabold font-mono tracking-tight text-white mb-4">
                    {isMainRevealed ? formatFCFA(activeWallet.balance) : '•••••••• FCFA'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800">
                    <button
                      onClick={() => setIsTransferOpen(true)}
                      className="py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer</span>
                    </button>
                    <button
                      onClick={() => setIsWithdrawOpen(true)}
                      className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                      <span>Retirer</span>
                    </button>
                    <button
                      onClick={() => setIsDepositOpen(true)}
                      className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <WalletCards className="w-3.5 h-3.5" />
                      <span>Recharger</span>
                    </button>
                  </div>
                </div>

                {/* Full Transaction History */}
                <TransactionHistory
                  transactions={transactions}
                  onSelectTransaction={(tx) => setSelectedReceiptTx(tx)}
                />
              </div>
            )}

            {/* TAB 3: MA LIGNE (Mobile SIM Line & Internet Data) */}
            {activeTab === 'maligne' && (
              <div className="p-4 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-neutral-900">Ma Ligne Orange</h2>
                    <p className="text-xs text-neutral-500 font-mono">{currentPhone}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    SIM Identifiée ✓
                  </span>
                </div>

                {/* Airtime Card */}
                <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-neutral-500">Crédit d'appel (Prépayé)</span>
                    <button
                      onClick={() => setIsDepositOpen(true)}
                      className="text-xs font-bold text-orange-500 hover:underline"
                    >
                      + Recharger
                    </button>
                  </div>
                  <p className="text-2xl font-black font-mono text-neutral-900">
                    {prepaidUnits.toLocaleString('fr-FR')} Unités
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">Équivalent à {formatFCFA(prepaidUnits)}</p>
                </div>

                {/* Available Bundles */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Forfaits Internet Disponibles
                  </h3>
                  {INTERNET_BUNDLES.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-2xl bg-white border border-neutral-200 flex items-center justify-between hover:border-orange-300 transition-colors"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900">{b.name}</h4>
                        <p className="text-xs font-semibold text-purple-600">{b.volume}</p>
                        <p className="text-[10px] text-neutral-500">Validité : {b.validity}</p>
                      </div>
                      <button
                        onClick={() => {
                          setBillsInitialTab('bundles');
                          setIsBillsOpen(true);
                        }}
                        className="py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
                      >
                        {formatFCFA(b.price)}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: PLAZA (Marketplace & Events) */}
            {activeTab === 'plaza' && (
              <div className="p-4 space-y-4 animate-fadeIn">
                <div>
                  <h2 className="text-lg font-black text-neutral-900">Plaza Max it</h2>
                  <p className="text-xs text-neutral-500">Billetterie, Événements & Bons Plans au Cameroun</p>
                </div>

                {/* Tickets card */}
                <div
                  onClick={() => setIsTicketsOpen(true)}
                  className="p-5 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg cursor-pointer hover:scale-[1.01] transition-transform flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-black/20 rounded-full">VOYAGES & SPECTACLES</span>
                    <h3 className="text-base font-extrabold mt-1">Billets de Bus & Concerts</h3>
                    <p className="text-xs text-white/90">Touristique Express, Général Express, Canal Olympia</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white" />
                </div>

                {/* Popular Cameroonian Merchants */}
                <div>
                  <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                    Commerces Populaires (Payer en 1 clic)
                  </h3>
                  <button
                    onClick={() => setIsMerchantPayOpen(true)}
                    className="w-full p-4 rounded-2xl bg-white border border-neutral-200 hover:border-orange-300 text-left flex items-center justify-between transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
                        🛒
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-900">Carrefour Market Akwa & Dovv Bastos</p>
                        <p className="text-[11px] text-neutral-500">Scannez le QR Code en caisse à 0 FCFA de frais</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation Bar (Exact 5 Tabs from reference screenshot) */}
          <BottomNav
            activeTab={activeTab}
            onChangeTab={(t) => setActiveTab(t)}
            onOpenHub={() => setIsHubOpen(true)}
          />
        </div>
      </main>

      {/* ALL INTERACTIVE MODALS */}

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        activeWallet={activeWallet}
        contacts={contacts}
        onCompleteTransfer={handleCompleteDebit}
        onRequestBiometric={requestSecurityVerification}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        activeWallet={activeWallet}
        onCompleteWithdrawal={handleCompleteDebit}
        onRequestBiometric={requestSecurityVerification}
      />

      {/* Deposit / Recharge Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        activeWallet={activeWallet}
        onCompleteDeposit={handleCompleteCredit}
        onRequestBiometric={requestSecurityVerification}
      />

      {/* Merchant Payment Modal */}
      <MerchantPaymentModal
        isOpen={isMerchantPayOpen}
        onClose={() => setIsMerchantPayOpen(false)}
        activeWallet={activeWallet}
        onCompletePayment={handleCompleteDebit}
        onRequestBiometric={requestSecurityVerification}
      />

      {/* Cancel Transfer Modal (Icon 6 from screenshot) */}
      <CancelTransferModal
        isOpen={isCancelTransferOpen}
        onClose={() => setIsCancelTransferOpen(false)}
        recentTransfers={transactions}
        onConfirmCancelTransfer={handleConfirmCancelTransfer}
        onRequestBiometric={requestSecurityVerification}
      />

      {/* Tickets Modal (Icon 7 from screenshot) */}
      <TicketModal
        isOpen={isTicketsOpen}
        onClose={() => setIsTicketsOpen(false)}
        activeWallet={activeWallet}
        onCompleteTicketPurchase={handleCompleteDebit}
        onRequestBiometric={requestSecurityVerification}
      />

      {/* My QR Code Modal */}
      <MyQrModal
        isOpen={isMyQrOpen}
        onClose={() => setIsMyQrOpen(false)}
        activeWallet={activeWallet}
      />

      {/* Bills and Bundles Modal */}
      <BillsAndBundlesModal
        isOpen={isBillsOpen}
        onClose={() => setIsBillsOpen(false)}
        activeWallet={activeWallet}
        initialTab={billsInitialTab}
        onCompleteBillOrBundle={handleCompleteDebit}
        onRequestBiometric={requestSecurityVerification}
      />

      {/* Max it Super App Hub (Center Orange Button) */}
      <MaxItHubModal
        isOpen={isHubOpen}
        onClose={() => setIsHubOpen(false)}
        onOpenTransfer={() => setIsTransferOpen(true)}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenMerchantPay={() => setIsMerchantPayOpen(true)}
        onOpenCancelTransfer={() => setIsCancelTransferOpen(true)}
        onOpenMyQr={() => setIsMyQrOpen(true)}
        onOpenBills={() => {
          setBillsInitialTab('bills');
          setIsBillsOpen(true);
        }}
        onOpenBundles={() => {
          setBillsInitialTab('bundles');
          setIsBillsOpen(true);
        }}
        onOpenTickets={() => setIsTicketsOpen(true)}
        onOpenTontine={() => {
          setActiveWalletId('wallet-tontine');
          setToastMsg('Basculé sur la Tontine Njangi "Douala Progrès"');
          setToastType('info');
        }}
        onOpenSecurity={() => setIsSecurityOpen(true)}
      />

      {/* Official Transaction Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceiptTx)}
        onClose={() => setSelectedReceiptTx(null)}
        transaction={selectedReceiptTx}
      />

      {/* Security Settings Modal */}
      <SecuritySettingsModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
        config={securityConfig}
        onUpdateConfig={(updated) => {
          setSecurityConfig((prev) => ({ ...prev, ...updated }));
          setToastMsg('Paramètres de sécurité enregistrés');
          setToastType('success');
        }}
      />

      {/* Biometric Verification Modal */}
      <BiometricModal
        isOpen={isBiometricOpen}
        onClose={() => setIsBiometricOpen(false)}
        onSuccess={handleBiometricSuccess}
        onFallbackPin={() => {
          setIsBiometricOpen(false);
          setIsPinPadOpen(true);
        }}
        title="Validation Biométrique"
        subtitle={pendingActionDesc || "Confirmation de sécurité requise"}
        biometricType={securityConfig.biometricType}
      />

      {/* Secret PIN Keypad Modal */}
      <PinPadModal
        isOpen={isPinPadOpen}
        onClose={() => setIsPinPadOpen(false)}
        onSuccess={handlePinSuccess}
        onSwitchToBiometric={
          securityConfig.biometricsEnabled
            ? () => {
                setIsPinPadOpen(false);
                setIsBiometricOpen(true);
              }
            : undefined
        }
        correctPin={securityConfig.pinCode}
        title="Code Secret Orange Money"
        subtitle={pendingActionDesc || "Entrez votre code confidentiel à 4 chiffres"}
        antiShoulderSurfing={securityConfig.antiShoulderSurfing}
      />

      {/* Floating Push Toast Notification */}
      <NotificationToast
        message={toastMsg}
        type={toastType}
        onClose={() => setToastMsg(null)}
      />
    </div>
  );
}
