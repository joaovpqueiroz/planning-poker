import React, { useState } from 'react';
import { Story } from '../../types';
import {
  Plus,
  ExternalLink,
  Check,
  Copy,
  ListTodo,
  ChevronDown,
  ChevronUp,
  Play,
  Edit2,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';

interface StoryManagerProps {
  stories: Story[];
  currentStoryId: string | null;
  isFacilitator: boolean;
  onAddStory: (title: string, description?: string, link?: string) => void;
  onSelectStory: (storyId: string) => void;
  onUpdateStory: (storyId: string, updates: { title?: string; description?: string; link?: string }) => void;
  onDeleteStory: (storyId: string) => void;
}

export const StoryManager: React.FC<StoryManagerProps> = ({
  stories,
  currentStoryId,
  isFacilitator,
  onAddStory,
  onSelectStory,
  onUpdateStory,
  onDeleteStory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  // New story form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');

  // Edit story state
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLink, setEditLink] = useState('');

  // Delete confirmation state
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);

  const currentStory = stories.find((s) => s.id === currentStoryId);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddStory(title, description, link);
    setTitle('');
    setDescription('');
    setLink('');
    setIsAdding(false);
  };

  const startEditing = (story: Story) => {
    setEditingStory(story);
    setEditTitle(story.title);
    setEditDescription(story.description || '');
    setEditLink(story.link || '');
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory || !editTitle.trim()) return;
    onUpdateStory(editingStory.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      link: editLink.trim(),
    });
    setEditingStory(null);
  };

  const confirmDelete = () => {
    if (!storyToDelete) return;
    onDeleteStory(storyToDelete.id);
    setStoryToDelete(null);
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl backdrop-blur-sm relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                Em Votação
              </span>
              {currentStory?.finalEstimate && (
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Estimativa: {currentStory.finalEstimate} pts
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight truncate">
                {currentStory ? currentStory.title : 'Nenhuma história selecionada'}
              </h2>

              {/* Fast Edit/Delete for Active Story */}
              {currentStory && isFacilitator && (
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={() => startEditing(currentStory)}
                    className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Editar esta história"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoryToDelete(currentStory)}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Excluir esta história"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

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
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
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
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
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
              <form onSubmit={handleAddSubmit} className="mb-4 bg-slate-800/70 p-3.5 rounded-xl border border-slate-700 animate-fade-in">
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
                    className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
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
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
                      <div className="flex items-center gap-2 truncate pr-2 flex-1 min-w-0">
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
                        {story.link && (
                          <a
                            href={story.link.startsWith('http') ? story.link : `https://${story.link}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-indigo-400 shrink-0"
                            title="Abrir no Jira"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isFacilitator && !isCurrent && (
                          <button
                            type="button"
                            onClick={() => onSelectStory(story.id)}
                            className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-indigo-400 bg-slate-800 hover:bg-slate-750 px-2 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer mr-1"
                            title="Colocar em votação agora"
                          >
                            <Play className="w-3 h-3" /> Votar
                          </button>
                        )}

                        {isFacilitator && (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(story)}
                              className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Editar história"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setStoryToDelete(story)}
                              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Excluir história"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Story Modal */}
      {editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Editar História / Tarefa</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStory(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Título da Tarefa
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Ex: PROJ-102 - Autenticação OAuth"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Descrição / Critérios de Aceite
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descreva brevemente o escopo ou requisitos"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Link do Jira ou Issue URL
                </label>
                <input
                  type="text"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  placeholder="Ex: https://jira.seu-time.com/browse/PROJ-102"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!editTitle.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {storyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Excluir História?</h3>
                <p className="text-xs text-slate-400">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 mb-5 font-medium truncate">
              {storyToDelete.title}
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStoryToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
