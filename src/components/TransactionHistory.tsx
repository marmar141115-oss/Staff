import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatFCFA, formatTxDate } from '../utils/formatters';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ScanLine, 
  Zap, 
  Wifi, 
  WalletCards, 
  Search, 
  ChevronRight, 
  FileText,
  Filter
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filterTabs = [
    { id: 'all', label: 'Toutes' },
    { id: 'transfer_send', label: 'Envois' },
    { id: 'transfer_receive', label: 'Réceptions' },
    { id: 'merchant_payment', label: 'Marchands' },
    { id: 'withdrawal', label: 'Retraits' },
    { id: 'deposit', label: 'Dépôts' },
    { id: 'bill_payment', label: 'Factures' },
  ];

  const filtered = transactions.filter((tx) => {
    // Category filter
    if (filter !== 'all' && tx.type !== filter) return false;

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        tx.recipientOrMerchant.toLowerCase().includes(q) ||
        tx.reference.toLowerCase().includes(q) ||
        (tx.note && tx.note.toLowerCase().includes(q)) ||
        (tx.recipientPhone && tx.recipientPhone.includes(q))
      );
    }
    return true;
  });

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'transfer_send':
        return <ArrowUpRight className="w-4 h-4 text-orange-400" />;
      case 'transfer_receive':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'merchant_payment':
        return <ScanLine className="w-4 h-4 text-amber-400" />;
      case 'withdrawal':
        return <ArrowDownLeft className="w-4 h-4 text-rose-400" />;
      case 'deposit':
        return <WalletCards className="w-4 h-4 text-emerald-400" />;
      case 'bill_payment':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'airtime_bundle':
        return <Wifi className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-neutral-400" />;
    }
  };

  const isPositive = (type: Transaction['type']) => {
    return type === 'transfer_receive' || type === 'deposit';
  };

  return (
    <div className="px-4 py-3">
      {/* Title & Search bar */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white tracking-tight">Historique des Opérations</h3>
        <span className="text-xs text-neutral-400 font-mono">
          {filtered.length} transaction{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par nom, marchand, référence..."
          className="w-full pl-9 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
        {filterTabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playKeyClick();
                setFilter(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'bg-neutral-900/60 text-neutral-400 hover:text-white border border-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 px-4 bg-neutral-900/40 rounded-3xl border border-neutral-800/80">
            <FileText className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-neutral-300">Aucune transaction trouvée</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Vos nouvelles opérations s'afficheront instantanément ici.
            </p>
          </div>
        ) : (
          filtered.map((tx) => {
            const positive = isPositive(tx.type);
            return (
              <button
                key={tx.id}
                onClick={() => {
                  soundManager.playKeyClick();
                  onSelectTransaction(tx);
                }}
                className="w-full p-3.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800/80 border border-neutral-800/80 hover:border-neutral-700 transition-all text-left flex items-center justify-between group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700/80 flex items-center justify-center shrink-0">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                        {tx.recipientOrMerchant}
                      </p>
                    </div>
                    {/* Clean unboxed metadata with bullet separators */}
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
                      <span>{tx.title}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatTxDate(tx.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className={`text-xs font-extrabold font-mono tracking-tight ${
                      positive ? 'text-emerald-400' : 'text-white'
                    }`}>
                      {positive ? '+' : '-'}{formatFCFA(tx.amount)}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-500">
                      Réf: {tx.reference.slice(-6)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-300 transition-colors" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
