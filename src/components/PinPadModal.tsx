import React, { useState, useEffect } from 'react';
import { X, Delete, Shield, Fingerprint, Shuffle, Lock } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PinPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToBiometric?: () => void;
  correctPin: string;
  title?: string;
  subtitle?: string;
  antiShoulderSurfing?: boolean;
}

export const PinPadModal: React.FC<PinPadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToBiometric,
  correctPin = '2026',
  title = 'Code Secret Orange Money',
  subtitle = 'Entrez votre code secret à 4 chiffres pour confirmer',
  antiShoulderSurfing = false,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState(false);
  const [isScrambled, setIsScrambled] = useState(antiShoulderSurfing);
  const [keypadOrder, setKeypadOrder] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);

  // Scramble numbers if anti-shoulder-surfing enabled
  useEffect(() => {
    if (isScrambled) {
      const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }
      setKeypadOrder(numbers);
    } else {
      setKeypadOrder([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
    }
  }, [isScrambled, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
    }
  }, [isOpen]);

  const handleDigitPress = (digit: number) => {
    if (pin.length >= 4) return;
    soundManager.playKeyClick();
    const newPin = pin + digit.toString();
    setPin(newPin);

    if (newPin.length === 4) {
      if (newPin === correctPin) {
        soundManager.playBiometricSuccess();
        setTimeout(() => {
          onSuccess();
        }, 200);
      } else {
        soundManager.playError();
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 700);
      }
    }
  };

  const handleDelete = () => {
    soundManager.playKeyClick();
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-medium text-orange-400 mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>Code Confidentiel (Défaut: 2026)</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-xs text-neutral-400 mb-6">{subtitle}</p>

        {/* 4 Pin Indicator Dots */}
        <div className={`flex justify-center items-center gap-4 my-4 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-red-500 scale-110 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                    : isFilled
                    ? 'bg-orange-500 scale-110 shadow-[0_0_10px_rgba(255,121,0,0.5)]'
                    : 'bg-neutral-700 border border-neutral-600'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-medium text-red-400 mt-2 mb-2 animate-bounce">
            Code secret incorrect. Réessayez.
          </p>
        )}

        {/* Anti-Shoulder Surfing Toggle */}
        <div className="flex items-center justify-between text-xs text-neutral-400 px-2 py-2 mb-3 bg-neutral-800/40 rounded-xl border border-neutral-800">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <Lock className="w-3.5 h-3.5 text-orange-400" />
            Mode Clavier Aléatoire
          </span>
          <button
            onClick={() => setIsScrambled(!isScrambled)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
              isScrambled ? 'bg-orange-500 text-white' : 'bg-neutral-700 text-neutral-300 hover:text-white'
            }`}
          >
            <Shuffle className="w-3 h-3" />
            {isScrambled ? 'Activé' : 'Normal'}
          </button>
        </div>

        {/* Keypad Grid (3x4) */}
        <div className="grid grid-cols-3 gap-3 my-2">
          {keypadOrder.slice(0, 9).map((num) => (
            <button
              key={num}
              onClick={() => handleDigitPress(num)}
              className="h-14 rounded-2xl bg-neutral-800/80 hover:bg-neutral-700/80 active:scale-95 text-white font-bold text-xl flex items-center justify-center transition-all border border-neutral-800 hover:border-orange-500/30"
            >
              {num}
            </button>
          ))}

          {/* Bottom Row */}
          {onSwitchToBiometric ? (
            <button
              onClick={() => {
                onClose();
                onSwitchToBiometric();
              }}
              className="h-14 rounded-2xl bg-neutral-800/50 hover:bg-neutral-700/80 active:scale-95 text-orange-400 font-medium text-xs flex flex-col items-center justify-center transition-all border border-neutral-800"
              title="Biométrie"
            >
              <Fingerprint className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Biométrie</span>
            </button>
          ) : (
            <div className="h-14" />
          )}

          <button
            onClick={() => handleDigitPress(keypadOrder[9])}
            className="h-14 rounded-2xl bg-neutral-800/80 hover:bg-neutral-700/80 active:scale-95 text-white font-bold text-xl flex items-center justify-center transition-all border border-neutral-800 hover:border-orange-500/30"
          >
            {keypadOrder[9]}
          </button>

          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-neutral-800/50 hover:bg-neutral-700/80 active:scale-95 text-neutral-400 hover:text-white font-medium text-xs flex items-center justify-center transition-all border border-neutral-800"
            aria-label="Effacer"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
