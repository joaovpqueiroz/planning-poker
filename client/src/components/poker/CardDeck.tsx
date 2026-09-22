import React from 'react';
import { DeckType, PRESET_DECKS } from '../../types';
import { PokerCard } from './PokerCard';

interface CardDeckProps {
  deckType: DeckType;
  customDeck?: string[];
  selectedVote: string | null;
  isRevealed: boolean;
  isSpectator: boolean;
  onSelectVote: (card: string) => void;
}

export const CardDeck: React.FC<CardDeckProps> = ({
  deckType,
  customDeck,
  selectedVote,
  isRevealed,
  isSpectator,
  onSelectVote,
}) => {
  const cards: string[] =
    deckType === 'custom' && customDeck?.length
      ? customDeck
      : (PRESET_DECKS as Record<string, string[]>)[deckType] || PRESET_DECKS.scrum;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-950/80 backdrop-blur-md border-t border-slate-800/80 p-3 md:p-4 shadow-2xl">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {isSpectator ? (
          <div className="text-center py-2 text-slate-400 text-sm flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Você está assistindo como <strong>Observador</strong>. Apenas votantes escolhem cartas.
          </div>
        ) : isRevealed ? (
          <div className="text-center py-2 text-slate-400 text-sm flex items-center gap-2">
            <span>Rodada encerrada. Aguarde o início da próxima votação para escolher sua carta.</span>
          </div>
        ) : (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2.5 flex items-center gap-2">
              <span>Escolha sua estimativa</span>
              {selectedVote && (
                <span className="text-indigo-400 lowercase font-normal">(clique na mesma carta para cancelar)</span>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 md:gap-3 overflow-x-auto max-w-full pb-1 px-2 scrollbar-none">
              {cards.map((card) => (
                <PokerCard
                  key={card}
                  value={card}
                  isSelected={selectedVote === card}
                  disabled={isRevealed}
                  size="md"
                  onClick={() => onSelectVote(card)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
