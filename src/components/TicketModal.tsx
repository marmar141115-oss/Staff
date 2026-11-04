import React, { useState } from 'react';
import { Wallet, Transaction } from '../types';
import { formatFCFA, generateReference } from '../utils/formatters';
import { X, Ticket, Bus, Film, Music, ShieldCheck, MapPin, Calendar, Clock } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWallet: Wallet;
  onCompleteTicketPurchase: (newTx: Transaction, amountDebited: number) => void;
  onRequestBiometric: (actionName: string, onVerified: () => void) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  activeWallet,
  onCompleteTicketPurchase,
  onRequestBiometric,
}) => {
  const [category, setCategory] = useState<'bus' | 'event' | 'cinema'>('bus');

  if (!isOpen) return null;

  const tickets = [
    {
      id: 't-1',
      type: 'bus',
      title: 'Voyage Douala ⇄ Yaoundé (VIP Climatisé)',
      company: 'Touristique Express VIP',
      date: 'Aujourd\'hui 14:30',
      terminal: 'Agence Bonabéri Douala',
      price: 6000,
      icon: Bus,
    },
    {
      id: 't-2',
      type: 'bus',
      title: 'Voyage Douala ⇄ Bafoussam (Direct)',
      company: 'Général Express Voyages',
      date: 'Demain 07:00',
      terminal: 'Gare Routière Bassa',
      price: 4500,
      icon: Bus,
    },
    {
      id: 't-3',
      type: 'event',
      title: 'Concert Live Afro-Jazz & Makossa',
      company: 'Palais des Congrès Yaoundé',
      date: 'Samedi 20:00',
      terminal: 'Hall Principal VIP',
      price: 10000,
      icon: Music,
    },
    {
      id: 't-4',
      type: 'cinema',
      title: 'Séance Cinéma Avant-Première',
      company: 'Canal Olympia Bessengué Douala',
      date: 'Ce soir 19:30',
      terminal: 'Salle 1 Laser',
      price: 2500,
      icon: Film,
    },
  ];

  const filteredTickets = tickets.filter(t => t.type === category);

  const handleBuy = (t: typeof tickets[0]) => {
    soundManager.playKeyClick();
    if (activeWallet.balance < t.price) {
      soundManager.playError();
      alert(`Solde insuffisant pour acheter ce billet (${formatFCFA(t.price)})`);
      return;
    }

    onRequestBiometric(`Achat Billet ${t.title} (${formatFCFA(t.price)})`, () => {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        reference: generateReference(activeWallet.operator),
        type: 'merchant_payment',
        title: `Billet ${t.company}`,
        recipientOrMerchant: t.company,
        amount: t.price,
        fee: 0,
        currency: 'FCFA',
        operator: activeWallet.operator,
        timestamp: new Date().toISOString(),
        status: 'completed',
        note: `${t.title} · ${t.date}`,
        category: 'Billetterie & Tickets',
        balanceAfter: activeWallet.balance - t.price,
      };

      onCompleteTicketPurchase(newTx, t.price);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full sm:max-w-md bg-white border-t sm:border border-neutral-200 rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Billetterie & Tickets</h3>
              <p className="text-xs text-neutral-500">Bus interurbain, Concerts & Cinéma</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Category Tabs */}
          <div className="flex p-1 bg-neutral-100 rounded-xl">
            <button
              onClick={() => {
                soundManager.playKeyClick();
                setCategory('bus');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                category === 'bus' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
              }`}
            >
              <Bus className="w-3.5 h-3.5 text-orange-500" />
              <span>Bus Voyages</span>
            </button>
            <button
              onClick={() => {
                soundManager.playKeyClick();
                setCategory('event');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                category === 'event' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-purple-500" />
              <span>Concerts</span>
            </button>
            <button
              onClick={() => {
                soundManager.playKeyClick();
                setCategory('cinema');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                category === 'cinema' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-blue-500" />
              <span>Cinéma</span>
            </button>
          </div>

          {/* Ticket Cards */}
          <div className="space-y-3">
            {filteredTickets.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl border border-neutral-200 bg-white hover:border-orange-300 transition-all flex flex-col justify-between shadow-sm relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                      {t.company}
                    </span>
                    <h4 className="text-xs font-bold text-neutral-900 mt-0.5">{t.title}</h4>
                  </div>
                  <span className="text-sm font-extrabold text-neutral-900 font-mono">
                    {formatFCFA(t.price)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-neutral-500 my-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{t.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{t.terminal}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(t)}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#FF7900] hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Acheter le billet ({formatFCFA(t.price)})</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
