import React, { useState } from 'react';
import { AVATAR_OPTIONS, DeckType, PRESET_DECKS } from '../../types';
import { Sparkles, ArrowRight, ShieldCheck, Zap, BarChart3, Users } from 'lucide-react';

interface CreateRoomLandingProps {
  onCreateRoom: (data: { roomName: string; userName: string; avatar: string; deckType: DeckType }) => void;
  onJoinByCode: (code: string) => void;
}

export const CreateRoomLanding: React.FC<CreateRoomLandingProps> = ({
  onCreateRoom,
  onJoinByCode,
}) => {
  const [roomName, setRoomName] = useState('Planning Sprint');
  const [userName, setUserName] = useState(() => localStorage.getItem('poker_username') || '');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('poker_avatar') || AVATAR_OPTIONS[0]);
  const [deckType, setDeckType] = useState<DeckType>('scrum');
  const [joinCode, setJoinCode] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    localStorage.setItem('poker_username', userName.trim());
    localStorage.setItem('poker_avatar', avatar);

    onCreateRoom({
      roomName: roomName.trim() || 'Planning Poker',
      userName: userName.trim(),
      avatar,
      deckType,
    });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    onJoinByCode(joinCode.trim().toLowerCase());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

      {/* Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">
            ♠
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-white tracking-tight leading-none">
              Planning Poker
            </h1>
            <span className="text-xs text-indigo-400 font-medium">Equipes Ágeis</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto w-full my-auto py-10 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Estimativas rápidas, simples e sem atrito
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Estime tarefas com seu time em tempo real
          </h2>
          <p className="text-sm md:text-base text-slate-400 mt-3">
            Crie uma sala instantânea, compartilhe o link com a equipe e façam votações de story points com cartas 3D e cálculo de consenso.
          </p>
        </div>

        {/* Dual Card Section: Create vs Join */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Create Room Form (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <span>Criar Nova Sessão</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Configure sua sala de planning e convide a equipe com um único clique.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nome da Sessão / Sprint
                  </label>
                  <input
                    type="text"
                    required
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Ex: Sprint 42 Planning"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Seu Nome ou Apelido
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ex: Alex Dev, Carol PO..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Avatar options */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Seu Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setAvatar(item)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
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

              {/* Deck selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Baralho de Pontuação
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['scrum', 'fibonacci', 'tshirt', 'powers-of-2'] as DeckType[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDeckType(d)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        deckType === d
                          ? 'bg-indigo-950/40 border-indigo-500 text-white'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-xs capitalize">{d}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                        {PRESET_DECKS[d as keyof typeof PRESET_DECKS]?.slice(0, 4).join(', ')}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!userName.trim()}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg mt-4 ${
                  !userName.trim()
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-500/25 cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                <span>Criar Sala e Iniciar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Join by Code (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Entrar com Código</h3>
              <p className="text-xs text-slate-400 mb-6">
                Recebeu um código de 6 dígitos de um colega? Insira-o abaixo.
              </p>

              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Código da Sala
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 7k9m2x"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-center tracking-widest font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    !joinCode.trim()
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 hover:border-indigo-500 cursor-pointer'
                  }`}
                >
                  <span>Acessar Sala</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Quick Benefits list */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>WebSockets em tempo real sem atraso</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Votos 100% ocultos até a revelação</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <BarChart3 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Média, mediana e destaque de divergências</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full py-4 text-center text-xs text-slate-500 border-t border-slate-800/60 relative z-10">
        Planning Poker para Times Ágeis &bull; Sincronização em Tempo Real &bull; Pronto para uso interno
      </footer>
    </div>
  );
};
