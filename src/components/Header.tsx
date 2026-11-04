import React, { useState } from 'react';
import { Search, MessageSquare, Bell, ChevronDown, User, Check, X, Shield, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  currentPhone: string;
  onSelectPhone: (phone: string) => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenSupport: () => void;
  onOpenSecurity: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPhone,
  onSelectPhone,
  onOpenSearch,
  onOpenNotifications,
  onOpenSupport,
  onOpenSecurity,
  unreadCount = 3,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(soundManager.isEnabled());

  const userNumbers = [
    { phone: '+237 699 757 821', label: 'Ligne Principale (Orange)', isPrimary: true },
    { phone: '+237 694 289 103', label: 'Ligne Professionnelle', isPrimary: false },
    { phone: '+237 671 442 089', label: 'Ligne Secondaire (MoMo)', isPrimary: false },
  ];

  // Mask display: +237 699 757 XXX
  const maskedDisplay = currentPhone.length >= 12 
    ? `${currentPhone.slice(0, 12)} XXX` 
    : currentPhone;

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundManager.setSoundEnabled(next);
    if (next) soundManager.playKeyClick();
  };

  return (
    <header className="px-4 pt-3 pb-2 bg-white sticky top-0 z-30 border-b border-neutral-100">
      {/* Top Bar matching screenshot */}
      <div className="flex items-center justify-between">
        {/* Left: Avatar + Phone number dropdown */}
        <div className="flex items-center gap-2">
          {/* User Avatar Circle */}
          <button
            onClick={() => {
              soundManager.playKeyClick();
              onOpenSecurity();
            }}
            className="w-10 h-10 rounded-full bg-neutral-300/80 border border-neutral-300 flex items-center justify-center text-neutral-600 hover:opacity-90 transition-opacity"
            aria-label="Mon profil & Sécurité"
            title="Mon profil & Sécurité"
          >
            <User className="w-6 h-6 text-neutral-500 fill-neutral-400" />
          </button>

          {/* Phone Number with Orange Chevron */}
          <div className="relative">
            <button
              onClick={() => {
                soundManager.playKeyClick();
                setDropdownOpen(!dropdownOpen);
              }}
              className="flex items-center gap-1.5 py-1 px-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-left"
            >
              <span className="text-xs font-bold font-mono tracking-tight text-neutral-900">
                {maskedDisplay}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-orange-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-60 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 border-b border-neutral-100 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Mes numéros associés
                </div>
                {userNumbers.map((item) => (
                  <button
                    key={item.phone}
                    onClick={() => {
                      soundManager.playKeyClick();
                      onSelectPhone(item.phone);
                      setDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-neutral-900 font-mono">{item.phone}</p>
                      <p className="text-[10px] text-neutral-500">{item.label}</p>
                    </div>
                    {currentPhone === item.phone && (
                      <Check className="w-4 h-4 text-orange-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Search, Chat, Notifications & Audio toggle */}
        <div className="flex items-center gap-1">
          {/* Sound toggle button */}
          <button
            onClick={toggleSound}
            className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors"
            title={soundOn ? 'Son activé' : 'Son coupé'}
            aria-label="Contrôle sonore"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-orange-500" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
          </button>

          {/* Search */}
          <button
            onClick={() => {
              soundManager.playKeyClick();
              onOpenSearch();
            }}
            className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors"
            title="Rechercher un service"
            aria-label="Recherche"
          >
            <Search className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {/* Chat / Support */}
          <button
            onClick={() => {
              soundManager.playKeyClick();
              onOpenSupport();
            }}
            className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors"
            title="Assistance Max it"
            aria-label="Messages"
          >
            <MessageSquare className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {/* Notifications Bell with Red Badge */}
          <button
            onClick={() => {
              soundManager.playKeyClick();
              onOpenNotifications();
            }}
            className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5 stroke-[2.2]" />
            {unreadCount > 0 && (
              <span className="absolute 1 top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
