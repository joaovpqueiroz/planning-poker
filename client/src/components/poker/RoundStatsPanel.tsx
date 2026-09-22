import React from 'react';
import { RoundStats, Story } from '../../types';
import { CheckCircle2, TrendingUp, Users, Scale, MessageSquare } from 'lucide-react';

interface RoundStatsPanelProps {
  stats: RoundStats;
  currentStory?: Story;
  isFacilitator: boolean;
  onSaveEstimate: (storyId: string, estimate: string) => void;
}

export const RoundStatsPanel: React.FC<RoundStatsPanelProps> = ({
  stats,
  currentStory,
  isFacilitator,
  onSaveEstimate,
}) => {
  if (!stats || stats.totalVotes === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-center text-slate-400">
        Nenhum voto computado nesta rodada.
      </div>
    );
  }

  // Consensus value if applicable
  const consensusValue = stats.consensus ? Object.keys(stats.distribution)[0] : null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900/95 border border-slate-800/90 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-md mb-6 animate-fade-in">
      {/* Consensus Banner */}
      {stats.consensus && (
        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm md:text-base">
              🎉 Consenso Absoluto atingido! Todos votaram <strong>{consensusValue}</strong>.
            </span>
          </div>
          {currentStory && isFacilitator && consensusValue && (
            <button
              type="button"
              onClick={() => onSaveEstimate(currentStory.id, consensusValue)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              Aplicar à Tarefa
            </button>
          )}
        </div>
      )}

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Average */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
          <div className="text-slate-400 text-xs font-medium mb-1 flex items-center justify-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Média
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats.average !== null ? stats.average : '—'}
          </div>
        </div>

        {/* Median */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
          <div className="text-slate-400 text-xs font-medium mb-1 flex items-center justify-center gap-1">
            <Scale className="w-3.5 h-3.5 text-blue-400" /> Mediana
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats.median !== null ? stats.median : '—'}
          </div>
        </div>

        {/* Agreement Rate */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
          <div className="text-slate-400 text-xs font-medium mb-1 flex items-center justify-center gap-1">
            Concordância
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats.agreementRate}%
          </div>
        </div>

        {/* Total Votes */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
          <div className="text-slate-400 text-xs font-medium mb-1 flex items-center justify-center gap-1">
            <Users className="w-3.5 h-3.5 text-purple-400" /> Votos
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats.totalVotes}
          </div>
        </div>
      </div>

      {/* Min vs Max Divergence Helper */}
      {stats.minVotes && stats.maxVotes && (
        <div className="mb-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs md:text-sm">
          <div className="flex items-center gap-2 text-indigo-300">
            <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Ponto de discussão:</strong>{' '}
              <span className="text-amber-300 font-semibold">{stats.minVotes.users.join(', ')}</span> votou{' '}
              <span className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-mono font-bold">
                {stats.minVotes.value}
              </span>{' '}
              vs{' '}
              <span className="text-purple-300 font-semibold">{stats.maxVotes.users.join(', ')}</span> votou{' '}
              <span className="bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-300 font-mono font-bold">
                {stats.maxVotes.value}
              </span>
            </span>
          </div>
          <span className="text-slate-400 text-xs italic">Peça aos extremos para explicarem suas visões</span>
        </div>
      )}

      {/* Vote Distribution Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
        <span className="text-xs text-slate-400 font-medium mr-1">Distribuição:</span>
        {Object.entries(stats.distribution)
          .sort((a, b) => b[1] - a[1])
          .map(([card, count]) => {
            const pct = Math.round((count / stats.totalVotes) * 100);
            return (
              <div
                key={card}
                className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-xs"
              >
                <span className="font-bold text-white font-mono bg-slate-700/80 px-1.5 py-0.5 rounded">
                  {card}
                </span>
                <span className="text-slate-300">
                  {count} {count === 1 ? 'voto' : 'votos'}
                </span>
                <span className="text-slate-500 text-[10px]">({pct}%)</span>
              </div>
            );
          })}
      </div>

      {/* Fast Estimate Saving for Facilitator */}
      {currentStory && isFacilitator && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-400">
            Definir pontuação da tarefa <strong className="text-slate-200">{currentStory.title}</strong>:
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {stats.average !== null && (
              <button
                type="button"
                onClick={() => onSaveEstimate(currentStory.id, String(Math.round(stats.average!)))}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs rounded-lg border border-indigo-500/30 font-medium transition-colors"
              >
                Arredondar Média ({Math.round(stats.average)})
              </button>
            )}
            {stats.median !== null && (
              <button
                type="button"
                onClick={() => onSaveEstimate(currentStory.id, String(stats.median))}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs rounded-lg border border-blue-500/30 font-medium transition-colors"
              >
                Usar Mediana ({stats.median})
              </button>
            )}
            {Object.keys(stats.distribution).map((card) => (
              <button
                key={card}
                type="button"
                onClick={() => onSaveEstimate(currentStory.id, card)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 font-mono font-medium transition-colors"
              >
                {card}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
