import React from 'react';
import { DeckType, PRESET_DECKS, RoomState, User } from '../../types';
import { X, Crown, Layers, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  room: RoomState;
  currentUser: User | null;
  onClose: () => void;
  onUpdateSettings: (settings: { deckType?: DeckType; allowAnyoneReveal?: boolean }) => void;
  onTransferFacilitator: (targetUserId: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  room,
  currentUser,
  onClose,
  onUpdateSettings,
  onTransferFacilitator,
}) => {
  const isFacilitator = currentUser?.isFacilitator;

  const deckOptions: { type: DeckType; label: string; preview: string }[] = [
    {
      type: 'scrum',
      label: 'Scrum Adaptado (Padrão)',
      preview: PRESET_DECKS.scrum.slice(0, 8).join(', ') + '...',
    },
    {
      type: 'fibonacci',
      label: 'Fibonacci Clássico',
      preview: PRESET_DECKS.fibonacci.slice(0, 8).join(', ') + '...',
    },
    {
      type: 'tshirt',
      label: 'T-Shirt Sizes',
      preview: PRESET_DECKS.tshirt.join(', '),
    },
    {
      type: 'powers-of-2',
      label: 'Potências de 2',
      preview: PRESET_DECKS['powers-of-2'].slice(0, 7).join(', ') + '...',
    },
  ];

  const connectedUsers = Object.values(room.users).filter((u) => u.connected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Configurações da Sala</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 py-4">
          {/* Deck Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Sistema de Pontuação (Deck)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {deckOptions.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  disabled={!isFacilitator}
                  onClick={() => onUpdateSettings({ deckType: opt.type })}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    room.deckType === opt.type
                      ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:text-slate-200'
                  } ${!isFacilitator ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono truncate">{opt.preview}</span>
                </button>
              ))}
            </div>
            {!isFacilitator && (
              <span className="text-[11px] text-slate-500 mt-1.5 block">
                * Apenas o facilitador pode alterar o baralho da sala.
              </span>
            )}
          </div>

          {/* Permissions / Anyone Reveal Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Regras da Rodada
            </label>
            <div className="flex items-center justify-between p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Permitir que qualquer membro revele as cartas
                </span>
                <span className="text-[11px] text-slate-400">
                  Se desativado, apenas o facilitador tem o botão de revelação e reinício.
                </span>
              </div>
              <input
                type="checkbox"
                disabled={!isFacilitator}
                checked={room.allowAnyoneReveal}
                onChange={(e) => onUpdateSettings({ allowAnyoneReveal: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
              />
            </div>
          </div>

          {/* Facilitator Transfer */}
          {isFacilitator && connectedUsers.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Transferir Papel de Facilitador
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {connectedUsers
                  .filter((u) => u.id !== currentUser?.id)
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span>{user.avatar}</span>
                        <span className="text-slate-200 font-medium">{user.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onTransferFacilitator(user.id);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Crown className="w-3 h-3" /> Passar Bastão
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
