import React, { useState } from 'react';
import { Story } from '../../types';
import { Plus, ExternalLink, Check, Copy, ListTodo, ChevronDown, ChevronUp, Play } from 'lucide-react';

interface StoryManagerProps {
  stories: Story[];
  currentStoryId: string | null;
  isFacilitator: boolean;
  onAddStory: (title: string, description?: string, link?: string) => void;
  onSelectStory: (storyId: string) => void;
}

export const StoryManager: React.FC<StoryManagerProps> = ({
  stories,
  currentStoryId,
  isFacilitator,
  onAddStory,
  onSelectStory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');

  const currentStory = stories.find((s) => s.id === currentStoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddStory(title, description, link);
    setTitle('');
    setDescription('');
    setLink('');
    setIsAdding(false);
  };

  const handleExportSummary = () => {
    if (stories.length === 0) return;

    let text = '### Resumo da Sessão de Planning Poker\n\n';
    text += '| História / Tarefa | Estimativa (Pontos) | Link |\n';
    text += '| :--- | :--- | :--- |\n';

    for (const story of stories) {
      const estimate = story.finalEstimate ? `${story.finalEstimate} pts` : 'Não estimada';
      const linkText = story.link ? `[Ver no Jira](${story.link})` : '-';
      text += `| ${story.title} | ${estimate} | ${linkText} |\n`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      {/* Active Story Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                Em Votação
              </span>
              {currentStory?.finalEstimate && (
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Estimativa: {currentStory.finalEstimate} pts
                </span>
              )}
            </div>

            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
              {currentStory ? currentStory.title : 'Nenhuma história selecionada'}
            </h2>

            {currentStory?.description && (
              <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl line-clamp-2">
                {currentStory.description}
              </p>
            )}

            {currentStory?.link && (
              <a
                href={currentStory.link.startsWith('http') ? currentStory.link : `https://${currentStory.link}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-2 font-medium"
              >
                <span>Ver item original</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Quick Backlog Toggle / Controls */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ListTodo className="w-3.5 h-3.5 text-indigo-400" />
              <span>Backlog da Sessão ({stories.length})</span>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Backlog Drawer */}
        {isOpen && (
          <div className="mt-4 pt-4 border-t border-slate-800/90 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Fila de Histórias
              </span>
              <div className="flex items-center gap-2">
                {stories.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportSummary}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                    title="Copiar tabela em Markdown para o Jira"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Exportar Markdown'}</span>
                  </button>
                )}
                {isFacilitator && !isAdding && (
                  <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar História
                  </button>
                )}
              </div>
            </div>

            {/* Add Story Inline Form */}
            {isAdding && (
              <form onSubmit={handleSubmit} className="mb-4 bg-slate-800/70 p-3 rounded-xl border border-slate-700">
                <div className="mb-2">
                  <input
                    type="text"
                    required
                    placeholder="Título da história ou Tarefa (ex: PROJ-102 - Autenticação OAuth)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Descrição rápida / Critérios (opcional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Link do Jira / Issue URL (opcional)"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    Salvar História
                  </button>
                </div>
              </form>
            )}

            {/* Stories List */}
            {stories.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500">
                Nenhuma história adicionada ainda.{' '}
                {isFacilitator && 'Clique em "Adicionar História" para listar as tarefas da sprint!'}
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {stories.map((story) => {
                  const isCurrent = story.id === currentStoryId;

                  return (
                    <div
                      key={story.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                        isCurrent
                          ? 'bg-indigo-950/40 border-indigo-500/40'
                          : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isCurrent
                              ? 'bg-indigo-400 animate-pulse'
                              : story.finalEstimate
                              ? 'bg-emerald-400'
                              : 'bg-slate-600'
                          }`}
                        />
                        <span className={`font-medium truncate ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                          {story.title}
                        </span>
                        {story.finalEstimate && (
                          <span className="shrink-0 font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[10px]">
                            {story.finalEstimate} pts
                          </span>
                        )}
                      </div>

                      {isFacilitator && !isCurrent && (
                        <button
                          type="button"
                          onClick={() => onSelectStory(story.id)}
                          className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-indigo-400 bg-slate-800 hover:bg-slate-750 px-2 py-1 rounded-lg border border-slate-700 transition-colors"
                        >
                          <Play className="w-3 h-3" /> Votar esta
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
