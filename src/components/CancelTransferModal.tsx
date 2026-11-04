import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatFCFA, formatTxDate } from '../utils/formatters';
import { X, Undo2, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface CancelTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentTransfers: Transaction[];
  onConfirmCancelTransfer: (tx: Transaction) => void;
  onRequestBiometric: (actionName: string, onVerified: () => void) => void;
}

export const CancelTransferModal: React.FC<CancelTransferModalProps> = ({
  isOpen,
  onClose,
  recentTransfers,
  onConfirmCancelTransfer,
  onRequestBiometric,
}) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [reason, setReason] = useState('Numéro erroné saisi par erreur');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Filter transfers that can be cancelled (e.g. transfer_send)
  const eligibleTransfers = recentTransfers.filter(t => t.type === 'transfer_send');

  const handleStartCancel = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedTx) {
      soundManager.playError();
      setErrorMsg('Veuillez sélectionner le transfert à annuler');
      return;
    }

    const actionText = `Annulation du transfert de ${formatFCFA(selectedTx.amount)} vers ${selectedTx.recipientOrMerchant}`;
    onRequestBiometric(actionText, () => {
      onConfirmCancelTransfer(selectedTx);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full sm:max-w-md bg-white border-t sm:border border-neutral-200 rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
              <Undo2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Annulation de Transfert</h3>
              <p className="text-xs text-neutral-500">Service exclusif Orange Money Cameroun</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleStartCancel} className="p-5 space-y-4">
          {/* Information banner */}
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Délai réglementaire CEMAC</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Vous disposez d'un délai légal pour rappeler les fonds vers votre compte tant que le destinataire n'a pas effectué de retrait.
              </p>
            </div>
          </div>

          {/* List of recent outgoing transfers */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-2">
              Sélectionnez le transfert erroné :
            </label>

            {eligibleTransfers.length === 0 ? (
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-center text-xs text-neutral-500">
                Aucun transfert récent éligible à l'annulation.
              </div>
            ) : (
              <div className="space-y-2">
                {eligibleTransfers.map((tx) => {
                  const isSelected = selectedTx?.id === tx.id;
                  return (
                    <button
                      key={tx.id}
                      type="button"
                      onClick={() => {
                        soundManager.playKeyClick();
                        setSelectedTx(tx);
                        setErrorMsg('');
                      }}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-orange-50/80 border-orange-500 shadow-sm'
                          : 'bg-white hover:bg-neutral-50 border-neutral-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-neutral-900">{tx.recipientOrMerchant}</p>
                          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold rounded">
                            Éligible
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                          {tx.recipientPhone || 'Numéro mobile'} · {formatTxDate(tx.timestamp)}
                        </p>
                        <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                          Réf: {tx.reference}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-extrabold text-neutral-900 font-mono">
                          {formatFCFA(tx.amount)}
                        </p>
                        <div className="flex items-center justify-end gap-1 text-[10px] text-orange-600 font-semibold mt-1">
                          <Undo2 className="w-3 h-3" />
                          <span>Rappeler</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reason selection */}
          {selectedTx && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Motif de la demande d'annulation
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-orange-500"
              >
                <option value="Numéro erroné saisi par erreur">Erreur de frappe sur le numéro de téléphone</option>
                <option value="Doublon de transaction">Doublon de transaction (envoyé deux fois)</option>
                <option value="Montant incorrect">Montant erroné saisi</option>
                <option value="Bénéficiaire injoignable">Bénéficiaire non concerné</option>
              </select>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={!selectedTx}
            className="w-full py-3.5 rounded-2xl bg-[#FF7900] hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Confirmer l'annulation par Biométrie / PIN</span>
          </button>
        </form>
      </div>
    </div>
  );
};
