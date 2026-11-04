import React, { useState } from 'react';
import { SecurityConfig } from '../types';
import { formatFCFA } from '../utils/formatters';
import { 
  X, 
  ShieldCheck, 
  Fingerprint, 
  ScanFace, 
  KeyRound, 
  Shuffle, 
  Eye, 
  AlertTriangle, 
  Smartphone, 
  MapPin, 
  Check,
  Lock,
  Unlock
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SecurityConfig;
  onUpdateConfig: (updated: Partial<SecurityConfig>) => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const [pinChangeOpen, setPinChangeOpen] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const handleToggleBiometrics = () => {
    soundManager.playKeyClick();
    onUpdateConfig({ biometricsEnabled: !config.biometricsEnabled });
  };

  const handleToggleAntiShoulder = () => {
    soundManager.playKeyClick();
    onUpdateConfig({ antiShoulderSurfing: !config.antiShoulderSurfing });
  };

  const handleToggleRequirePinForBalance = () => {
    soundManager.playKeyClick();
    onUpdateConfig({ requirePinForBalance: !config.requirePinForBalance });
  };

  const handleToggleFreezeAccount = () => {
    soundManager.playKeyClick();
    const nextState = !config.isAccountFrozen;
    onUpdateConfig({ isAccountFrozen: nextState });
    if (nextState) {
      soundManager.playError();
    } else {
      soundManager.playBiometricSuccess();
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (oldPin !== config.pinCode) {
      soundManager.playError();
      setPinError('Ancien code secret incorrect');
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      soundManager.playError();
      setPinError('Le nouveau code doit comporter 4 chiffres');
      return;
    }
    if (newPin !== confirmPin) {
      soundManager.playError();
      setPinError('Les deux nouveaux codes ne correspondent pas');
      return;
    }

    onUpdateConfig({ pinCode: newPin });
    soundManager.playBiometricSuccess();
    setPinSuccess(true);
    setTimeout(() => {
      setPinSuccess(false);
      setPinChangeOpen(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    }, 1500);
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
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sécurité & Authentification</h3>
              <p className="text-xs text-neutral-400">Biométrie, Code PIN et Confidentialité</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Account Frozen Banner if active */}
          {config.isAccountFrozen && (
            <div className="p-3.5 bg-red-500/15 border border-red-500/40 rounded-2xl flex items-center gap-3 text-xs text-red-300">
              <Lock className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Compte temporairement gelé</p>
                <p className="text-[11px] text-red-300">Toutes les sorties d'argent sont bloquées pour votre sécurité.</p>
              </div>
            </div>
          )}

          {/* Section 1: Biometrics */}
          <div className="p-4 bg-neutral-800/50 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Authentification Biométrique</h4>
                  <p className="text-[11px] text-neutral-400">Touch ID & Reconnaissance faciale</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={handleToggleBiometrics}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  config.biometricsEnabled ? 'bg-orange-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    config.biometricsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 border-t border-neutral-700/40 pt-2">
              Permet de valider rapidement les transferts d'argent, retraits et paiements marchands en posant le doigt ou en scannant le visage.
            </p>
          </div>

          {/* Section 2: Shoulder Surfing Protection */}
          <div className="p-4 bg-neutral-800/50 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Shuffle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Mode Anti-Espionnage</h4>
                  <p className="text-[11px] text-neutral-400">Clavier numérique aléatoire</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleAntiShoulder}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  config.antiShoulderSurfing ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    config.antiShoulderSurfing ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 border-t border-neutral-700/40 pt-2">
              Mélange les touches du clavier lors de la saisie du code PIN afin d'empêcher les regards indiscrets dans les taxis et marchés.
            </p>
          </div>

          {/* Section 3: Require Auth for Balance */}
          <div className="p-4 bg-neutral-800/50 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Protéger la vue du solde</h4>
                <p className="text-[11px] text-neutral-400">Exiger la biométrie pour révéler</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleRequirePinForBalance}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                config.requirePinForBalance ? 'bg-blue-600' : 'bg-neutral-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  config.requirePinForBalance ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Section 4: Change Secret PIN */}
          <div className="p-4 bg-neutral-800/50 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Code Secret Orange Money</h4>
                  <p className="text-[11px] text-neutral-400">4 chiffres (Actuel: {config.pinCode})</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPinChangeOpen(!pinChangeOpen)}
                className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-xl text-xs font-semibold text-white transition-colors"
              >
                {pinChangeOpen ? 'Annuler' : 'Modifier'}
              </button>
            </div>

            {pinChangeOpen && (
              <form onSubmit={handleSaveNewPin} className="space-y-2.5 pt-2 border-t border-neutral-700/60">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Ancien code PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-center font-mono text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Nouveau code</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-center font-mono text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Confirmer</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-center font-mono text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {pinError && <p className="text-[11px] text-red-400">{pinError}</p>}
                {pinSuccess && <p className="text-[11px] text-emerald-400">Code secret mis à jour avec succès !</p>}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Enregistrer le nouveau code PIN
                </button>
              </form>
            )}
          </div>

          {/* Section 5: Device & Security Status */}
          <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-neutral-300 font-semibold">
              <Smartphone className="w-4 h-4 text-orange-400" />
              <span>{config.lastLoginDevice}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-neutral-500" />
              <span>{config.lastLoginLocation}</span>
            </div>
          </div>

          {/* Section 6: Emergency Freeze Account Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleToggleFreezeAccount}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                config.isAccountFrozen
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400'
              }`}
            >
              {config.isAccountFrozen ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Débloquer mon compte Max it</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Verrou d'urgence : Bloquer mon compte temporairement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
