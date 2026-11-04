import React, { useState, useEffect } from 'react';
import { Fingerprint, ScanFace, X, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onFallbackPin: () => void;
  title?: string;
  subtitle?: string;
  biometricType?: 'fingerprint' | 'face' | 'both';
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onFallbackPin,
  title = 'Authentification Biométrique',
  subtitle = 'Vérification de sécurité pour valider votre opération',
  biometricType = 'both',
}) => {
  const [mode, setMode] = useState<'fingerprint' | 'face'>('fingerprint');
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      setSuccess(false);

      // Simulate biometric sensor capture delay (approx 1.2s for realistic feel)
      const timer = setTimeout(() => {
        setScanning(false);
        setSuccess(true);
        soundManager.playBiometricSuccess();

        const closeTimer = setTimeout(() => {
          onSuccess();
        }, 600);

        return () => clearTimeout(closeTimer);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-medium text-orange-400 mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sécurité Max it CEMAC</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1.5">{title}</h3>
        <p className="text-xs text-neutral-400 mb-6">{subtitle}</p>

        {/* Biometric Interactive Animation Display */}
        <div className="relative my-8 flex items-center justify-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Outer animated ring */}
            <div 
              className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${
                success 
                  ? 'border-emerald-500 bg-emerald-500/10 scale-105' 
                  : scanning 
                  ? 'border-orange-500 border-dashed animate-spin' 
                  : 'border-neutral-700'
              }`} 
              style={{ animationDuration: '4s' }}
            />

            {/* Inner pulsating glow */}
            <div 
              className={`absolute inset-2 rounded-full transition-all duration-500 ${
                success 
                  ? 'bg-emerald-500/20' 
                  : scanning 
                  ? 'bg-orange-500/10 animate-pulse' 
                  : 'bg-neutral-800'
              }`} 
            />

            {/* Sensor icon */}
            <div className="relative z-10 transition-transform duration-300 transform scale-110">
              {success ? (
                <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce" />
              ) : mode === 'fingerprint' ? (
                <Fingerprint className={`w-14 h-14 transition-colors ${scanning ? 'text-orange-400' : 'text-neutral-400'}`} />
              ) : (
                <ScanFace className={`w-14 h-14 transition-colors ${scanning ? 'text-orange-400' : 'text-neutral-400'}`} />
              )}
            </div>

            {/* Scanning beam animation when active */}
            {scanning && (
              <div 
                className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_8px_#FF7900] animate-pulse"
                style={{
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            )}
          </div>
        </div>

        <div className="text-sm font-medium mb-6">
          {success ? (
            <span className="text-emerald-400">Identité confirmée avec succès</span>
          ) : scanning ? (
            <span className="text-orange-400">
              {mode === 'fingerprint' ? 'Posez votre doigt sur le capteur...' : 'Scannage du visage en cours...'}
            </span>
          ) : (
            <span className="text-neutral-400">En attente de détection</span>
          )}
        </div>

        {/* Biometric Type Switcher (if both supported) */}
        {biometricType === 'both' && !success && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => {
                setMode('fingerprint');
                setScanning(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
                mode === 'fingerprint'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              Empreinte Touch ID
            </button>
            <button
              onClick={() => {
                setMode('face');
                setScanning(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
                mode === 'face'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <ScanFace className="w-3.5 h-3.5" />
              Face ID
            </button>
          </div>
        )}

        {/* Fallback to secret PIN */}
        <button
          onClick={() => {
            onClose();
            onFallbackPin();
          }}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition-colors flex items-center justify-center gap-2 border border-neutral-800"
        >
          <KeyRound className="w-4 h-4 text-orange-400" />
          Utiliser mon code secret PIN
        </button>
      </div>
    </div>
  );
};
