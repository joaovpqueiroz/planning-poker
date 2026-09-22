import React, { useState } from 'react';
import { AVATAR_OPTIONS, Role } from '../../types';
import { ArrowRight, Eye, UserCheck } from 'lucide-react';

interface LobbyModalProps {
  roomName: string;
  onJoin: (data: { name: string; avatar: string; role: Role }) => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({ roomName, onJoin }) => {
  const [name, setName] = useState(() => localStorage.getItem('poker_username') || '');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('poker_avatar') || AVATAR_OPTIONS[0]);
  const [role, setRole] = useState<Role>(
    () => (localStorage.getItem('poker_role') as Role) || 'player'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    localStorage.setItem('poker_username', name.trim());
    localStorage.setItem('poker_avatar', avatar);
    localStorage.setItem('poker_role', role);

    onJoin({ name: name.trim(), avatar, role });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center text-2xl mb-3 shadow-inner">
            🃏
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Entrar na Sessão</h2>
          <p className="text-xs text-slate-400 mt-1">
            Você foi convidado para a sala <strong className="text-slate-200">{roomName}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Seu Nome ou Apelido
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Ana Silva, Carlos Dev..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Avatar picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Escolha seu Avatar
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
              {AVATAR_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAvatar(item)}
                  className={`h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                    avatar === item
                      ? 'bg-indigo-600/30 border-2 border-indigo-500 scale-105 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-800/80 border border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Papel na Reunião
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('player')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  role === 'player'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Votante</span>
                </div>
                <span className="text-[11px] opacity-70">
                  Participa ativamente escolhendo cartas de estimativa.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('spectator')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  role === 'spectator'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Observador</span>
                </div>
                <span className="text-[11px] opacity-70">
                  Acompanha a votação e estimativas sem votar.
                </span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim()}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              !name.trim()
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-500/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <span>Entrar no Planning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
