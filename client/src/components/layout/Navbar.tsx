import React, { useState } from 'react';
import { RoomState, User } from '../../types';
import { Share2, Volume2, VolumeX, Settings, Check, Sparkles } from 'lucide-react';
import { setSoundMuted, getSoundMuted } from '../../utils/audio';

interface NavbarProps {
  room: RoomState;
  currentUser: User | null;
  isConnected: boolean;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  room,
  currentUser,
  isConnected,
  onOpenSettings,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(getSoundMuted());

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSound = () => {
    const next = !isMuted;
    setSoundMuted(next);
    setIsMuted(next);
  };

  const connectedUsersCount = Object.values(room.users).filter((u) => u.connected).length;

  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Room Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black text-sm">
              ♠
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                Planning Poker
              </h1>
              <span className="text-[10px] text-slate-400 font-medium">Equipe Ágil</span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Room Name & ID */}
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-semibold text-slate-200 truncate max-w-[150px] md:max-w-[220px]">
              {room.name}
            </span>
            <span className="bg-slate-800 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
              #{room.id}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Connection status */}
          <div
            className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800"
            title={isConnected ? 'Conectado ao servidor em tempo real' : 'Reconectando...'}
          >
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'}`}
            />
            <span className="hidden md:inline">{connectedUsersCount} online</span>
          </div>

          {/* Copy Invite Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer"
            title="Copiar link para convidar colegas de equipe"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Convidar'}</span>
          </button>

          {/* Mute Sound Button */}
          <button
            type="button"
            onClick={toggleSound}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
            title={isMuted ? 'Ativar efeitos sonoros' : 'Desativar efeitos sonoros'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Room Settings Modal Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
            title="Configurações da Sala"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Current User Pill */}
          {currentUser && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <span className="text-lg">{currentUser.avatar}</span>
              <span className="text-xs font-semibold text-slate-200 hidden lg:inline max-w-[100px] truncate">
                {currentUser.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
