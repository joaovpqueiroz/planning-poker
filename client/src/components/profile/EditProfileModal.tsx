import React, { useState } from 'react';
import { AVATAR_OPTIONS, Role, User } from '../../types';
import { X, UserCheck, Eye, Check } from 'lucide-react';

interface EditProfileModalProps {
  currentUser: User;
  onClose: () => void;
  onSave: (data: { name: string; avatar: string; role: Role }) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  currentUser,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [role, setRole] = useState<Role>(currentUser.role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      avatar,
      role,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{avatar}</span>
            <h3 className="text-base font-bold text-white">Editar Meu Perfil</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como seus colegas te conhecem"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Escolha seu Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAvatar(item)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
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
              Seu Papel na Sessão
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('player')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
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
                  Participa da estimativa escolhendo cartas.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('spectator')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
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
                  Acompanha a discussão sem votar.
                </span>
              </button>
            </div>
          </div>

          {/* Submit & Cancel */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
