'use client';

import { useState, useTransition } from 'react';
import { Folder, FolderPlus, Pin, Trash2, X } from 'lucide-react';
import { FolderSummary } from '@/lib/types';
import {
  saveFolderAction,
  deleteFolderAction,
  togglePinFolderAction,
} from '@/app/actions/exam-actions';

interface FolderBarProps {
  folders: FolderSummary[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  totalExamsCount: number;
}

export function FolderBar({
  folders,
  selectedFolderId,
  onSelectFolder,
  totalExamsCount,
}: FolderBarProps) {
  const [isPending, startTransition] = useTransition();
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderError, setFolderError] = useState<string | null>(null);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setFolderError('Digite um nome para a pasta.');
      return;
    }
    setFolderError(null);
    startTransition(async () => {
      const res = await saveFolderAction({ name: folderName.trim() });
      if (!res.success) {
        setFolderError(res.error || 'Erro ao criar pasta');
      } else {
        setFolderName('');
        setShowNewFolderModal(false);
      }
    });
  };

  const handleDeleteFolder = (id: string, name: string) => {
    if (confirm(`Deseja excluir a pasta "${name}"? Os simulados não serão apagados, apenas desvinculados.`)) {
      startTransition(async () => {
        await deleteFolderAction(id);
        if (selectedFolderId === id) {
          onSelectFolder(null);
        }
      });
    }
  };

  const handleTogglePinFolder = (id: string) => {
    startTransition(async () => {
      await togglePinFolderAction(id);
    });
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Pastas Organizadoras
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowNewFolderModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <FolderPlus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Nova Pasta</span>
          </button>
        </div>

        {/* Chips de seleção de pasta */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Todas as pastas */}
          <button
            type="button"
            onClick={() => onSelectFolder(null)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              selectedFolderId === null
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            Todos os Simulados ({totalExamsCount})
          </button>

          {/* Pastas cadastradas */}
          {folders.map((folder) => {
            const isSelected = selectedFolderId === folder.id;
            return (
              <div
                key={folder.id}
                className={`group inline-flex items-center gap-1 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-200'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectFolder(folder.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"
                >
                  <span>📁</span>
                  <span>{folder.name}</span>
                  <span className="rounded-full bg-zinc-200/80 px-1.5 py-0.2 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {folder.examCount}
                  </span>
                  {folder.isPinned && (
                    <Pin className="h-3 w-3 text-amber-500 fill-current rotate-45" />
                  )}
                </button>

                {/* Ações da pasta ao passar o mouse ou selecionada */}
                <div className="flex items-center pr-2 gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleTogglePinFolder(folder.id)}
                    title={folder.isPinned ? 'Desafixar do topo' : 'Fixar pasta no topo'}
                    disabled={isPending}
                    className="p-1 text-zinc-400 hover:text-amber-500"
                  >
                    <Pin className={`h-3 w-3 ${folder.isPinned ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteFolder(folder.id, folder.name)}
                    title="Excluir pasta"
                    disabled={isPending}
                    className="p-1 text-zinc-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Criar Pasta */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Criar Nova Pasta
                </h3>
              </div>
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="mt-4">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nome da Pasta *
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Ex: Concurso Professor Municipal"
                required
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-500"
              />

              {folderError && (
                <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{folderError}</p>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  disabled={isPending}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isPending ? 'Criando...' : 'Criar Pasta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
