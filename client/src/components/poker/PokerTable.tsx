import React from 'react';
import { RoomState, RoundStats, User } from '../../types';
import { PokerCard } from './PokerCard';
import { Crown, Eye, Play, RotateCcw, Sparkles } from 'lucide-react';

interface PokerTableProps {
  room: RoomState;
  currentUser: User | null;
  stats: RoundStats | null;
  onReveal: () => void;
  onReset: () => void;
  onTransferFacilitator: (userId: string) => void;
}

export const PokerTable: React.FC<PokerTableProps> = ({
  room,
  currentUser,
  stats,
  onReveal,
  onReset,
  onTransferFacilitator,
}) => {
  const users = Object.values(room.users).filter((u) => u.connected);
  const players = users.filter((u) => u.role === 'player');
  const spectators = users.filter((u) => u.role === 'spectator');
  const votedCount = players.filter((u) => u.hasVoted).length;
  const allVoted = players.length > 0 && votedCount === players.length;

  const canControl = currentUser?.isFacilitator || room.allowAnyoneReveal;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center py-4">
      {/* Poker Table Surface */}
      <div className="w-full bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative flex flex-col items-center justify-center min-h-[340px] overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-radial from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Center Control / Status Area */}
        <div className="z-10 flex flex-col items-center text-center max-w-md">
          {!room.isRevealed ? (
            <>
              {/* Progress Count */}
              <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-4 py-1.5 rounded-full text-xs md:text-sm font-medium text-slate-300 mb-4 shadow-sm">
                <span
                  className={`w-2 h-2 rounded-full ${
                    allVoted ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'
                  }`}
                />
                <span>
                  {votedCount} de {players.length} {players.length === 1 ? 'votou' : 'votaram'}
                </span>
                {allVoted && <span className="text-emerald-400 font-semibold">(Todos votaram!)</span>}
              </div>

              {/* Reveal Button */}
              {canControl ? (
                <button
                  type="button"
                  onClick={onReveal}
                  disabled={votedCount === 0}
                  className={`px-6 py-3 rounded-xl font-bold text-sm md:text-base flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
                    votedCount === 0
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-500/25 hover:scale-105 active:scale-95'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Revelar Cartas
                </button>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-800/60 px-4 py-2 rounded-lg border border-slate-700/50">
                  Aguardando o facilitador revelar as cartas...
                </div>
              )}
            </>
          ) : (
            <>
              {/* Reset Round Control */}
              <div className="text-emerald-400 text-sm font-semibold mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Cartas Reveladas!
              </div>
              {canControl ? (
                <button
                  type="button"
                  onClick={onReset}
                  className="px-6 py-3 rounded-xl font-bold text-sm md:text-base flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Iniciar Nova Rodada
                </button>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-800/60 px-4 py-2 rounded-lg border border-slate-700/50">
                  Aguardando o facilitador iniciar nova rodada...
                </div>
              )}
            </>
          )}
        </div>

        {/* Players Seats Grid around the table */}
        <div className="w-full mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 items-center justify-center">
          {players.map((user) => {
            const isMin = room.isRevealed && stats?.minVotes?.value === user.vote;
            const isMax = room.isRevealed && stats?.maxVotes?.value === user.vote;
            const isCurrent = currentUser?.id === user.id;

            return (
              <div
                key={user.id}
                className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-slate-800/90 border-indigo-500/40 ring-1 ring-indigo-500/20'
                    : 'bg-slate-800/50 border-slate-700/50'
                }`}
              >
                {/* Facilitator Crown */}
                {user.isFacilitator && (
                  <div className="absolute -top-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                    <Crown className="w-2.5 h-2.5" /> Facilitador
                  </div>
                )}

                {/* Poker Card Display */}
                <div className="my-2">
                  <PokerCard
                    value={user.vote}
                    hasVoted={user.hasVoted}
                    isRevealed={room.isRevealed}
                    size="md"
                    isMinVote={isMin}
                    isMaxVote={isMax}
                  />
                </div>

                {/* Player Name and Avatar */}
                <div className="flex items-center gap-1.5 max-w-full">
                  <span className="text-base">{user.avatar}</span>
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[90px]" title={user.name}>
                    {user.name}
                  </span>
                  {isCurrent && <span className="text-[10px] text-indigo-400 font-bold">(você)</span>}
                </div>

                {/* Status Indicator */}
                <div className="mt-1 text-[10px]">
                  {user.hasVoted ? (
                    <span className="text-emerald-400 font-medium">✓ Votou</span>
                  ) : (
                    <span className="text-slate-500">Pensando...</span>
                  )}
                </div>

                {/* Facilitator Transfer Action for current facilitator */}
                {currentUser?.isFacilitator && !user.isFacilitator && (
                  <button
                    type="button"
                    onClick={() => onTransferFacilitator(user.id)}
                    className="mt-1.5 text-[10px] text-slate-400 hover:text-amber-400 transition-colors"
                    title="Transferir papel de facilitador"
                  >
                    Tornar facilitador
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Spectators Drawer / List */}
      {spectators.length > 0 && (
        <div className="w-full mt-4 flex items-center justify-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> Observadores:
          </span>
          {spectators.map((spec) => (
            <div
              key={spec.id}
              className="inline-flex items-center gap-1.5 bg-slate-800/40 border border-slate-700/50 px-2.5 py-1 rounded-full text-xs text-slate-300"
            >
              <span>{spec.avatar}</span>
              <span>{spec.name}</span>
              {currentUser?.id === spec.id && <span className="text-[10px] text-indigo-400">(você)</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
