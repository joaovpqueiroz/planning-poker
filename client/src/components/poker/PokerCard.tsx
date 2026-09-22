import React from 'react';

interface PokerCardProps {
  value?: string | null;
  isRevealed?: boolean;
  hasVoted?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  isMinVote?: boolean;
  isMaxVote?: boolean;
}

export const PokerCard: React.FC<PokerCardProps> = ({
  value,
  isRevealed = true,
  hasVoted = false,
  isSelected = false,
  disabled = false,
  size = 'md',
  onClick,
  isMinVote = false,
  isMaxVote = false,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-14 text-sm font-semibold rounded-md',
    md: 'w-14 h-20 text-lg font-bold rounded-lg',
    lg: 'w-16 h-24 text-xl font-bold rounded-xl',
  }[size];

  // If used inside the voting deck (always face up)
  if (value !== undefined && !hasVoted && isRevealed) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`relative ${sizeClasses} transition-all duration-200 select-none flex flex-col items-center justify-between p-1.5 cursor-pointer border ${
          isSelected
            ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white border-blue-400 shadow-lg shadow-indigo-500/40 -translate-y-3 scale-105 ring-2 ring-indigo-400'
            : disabled
            ? 'bg-gray-800/40 text-gray-500 border-gray-700/50 cursor-not-allowed opacity-50'
            : 'bg-gray-800/90 text-gray-200 border-gray-700 hover:border-indigo-500 hover:bg-gray-750 hover:-translate-y-2 hover:shadow-md hover:shadow-indigo-500/20'
        }`}
      >
        <span className="text-[10px] self-start leading-none opacity-60 font-mono">{value}</span>
        <span className="text-xl md:text-2xl tracking-tight leading-none my-auto">{value}</span>
        <span className="text-[10px] self-end leading-none opacity-60 font-mono rotate-180">{value}</span>
      </button>
    );
  }

  // If card is on the table (face down / face up)
  return (
    <div className={`relative ${sizeClasses} perspective-1000 select-none`}>
      <div
        className={`w-full h-full transition-transform duration-500 transform-style-3d relative ${
          isRevealed && hasVoted ? 'rotate-y-180' : ''
        }`}
      >
        {/* Card Back (Face Down) */}
        <div
          className={`absolute inset-0 w-full h-full backface-hidden rounded-lg flex items-center justify-center border shadow-md ${
            hasVoted
              ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border-indigo-500/60 shadow-indigo-500/20'
              : 'border-dashed border-gray-700 bg-gray-900/30'
          }`}
        >
          {hasVoted ? (
            <div className="w-full h-full p-1 flex items-center justify-center">
              <div className="w-full h-full rounded border border-indigo-500/30 flex items-center justify-center bg-indigo-950/40">
                <div className="w-3 h-3 rounded-full bg-indigo-500/80 animate-pulse" />
              </div>
            </div>
          ) : (
            <span className="text-gray-600 text-xs">...</span>
          )}
        </div>

        {/* Card Front (Face Up - Shown when revealed) */}
        <div
          className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-lg flex flex-col items-center justify-between p-1.5 border shadow-lg ${
            isMinVote
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/70 shadow-amber-500/20 ring-1 ring-amber-400'
              : isMaxVote
              ? 'bg-purple-950/60 text-purple-300 border-purple-500/70 shadow-purple-500/20 ring-1 ring-purple-400'
              : 'bg-slate-800 text-white border-slate-600'
          }`}
        >
          <span className="text-[10px] self-start leading-none opacity-60 font-mono">{value || '-'}</span>
          <span className="text-lg md:text-xl font-bold tracking-tight">{value || '-'}</span>
          <span className="text-[10px] self-end leading-none opacity-60 font-mono rotate-180">{value || '-'}</span>
        </div>
      </div>
    </div>
  );
};
