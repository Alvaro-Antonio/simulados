'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, GraduationCap } from 'lucide-react';
import { ExamSummaryItem, FolderSummary } from '@/lib/types';
import { ExamCard } from '@/components/exam-card';
import { FolderBar } from '@/components/folder-bar';

interface DashboardClientProps {
  initialExams: ExamSummaryItem[];
  folders: FolderSummary[];
}

export function DashboardClient({ initialExams, folders }: DashboardClientProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Filtra simulados de acordo com a pasta selecionada
  const filteredExams = selectedFolderId
    ? initialExams.filter((e) => e.folderId === selectedFolderId)
    : initialExams;

  // Separação: Simulados Fixados vs Normais
  const pinnedExams = filteredExams.filter((e) => e.isPinned);
  const regularExams = filteredExams.filter((e) => !e.isPinned);

  const selectedFolderName = selectedFolderId
    ? folders.find((f) => f.id === selectedFolderId)?.name
    : null;

  return (
    <div className="mt-8">
      {/* Barra de Pastas Organizadoras */}
      <FolderBar
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        totalExamsCount={initialExams.length}
      />

      {/* Título da Seção Atual */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {selectedFolderName ? `Pasta: ${selectedFolderName}` : 'Todos os Simulados'}
          </h2>
          {selectedFolderId && (
            <button
              onClick={() => setSelectedFolderId(null)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              (Limpar filtro)
            </button>
          )}
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {filteredExams.length} {filteredExams.length === 1 ? 'simulado' : 'simulados'}
        </span>
      </div>

      {filteredExams.length > 0 ? (
        <div className="space-y-8">
          {/* Seção de Fixados no Topo (se houver) */}
          {pinnedExams.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <span>⭐ Fixados no Topo</span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pinnedExams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            </div>
          )}

          {/* Simulados Regulares */}
          {regularExams.length > 0 && (
            <div>
              {pinnedExams.length > 0 && (
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <span>Outros Simulados</span>
                </div>
              )}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regularExams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {selectedFolderName
              ? `Nenhum simulado na pasta "${selectedFolderName}"`
              : 'Nenhum simulado cadastrado ainda'}
          </h3>
          <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            {selectedFolderName
              ? 'Edite um simulado existente para movê-lo para esta pasta ou crie um novo.'
              : 'Comece criando seu primeiro simulado com perguntas de múltipla escolha ou Certo/Errado.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link
              href="/exams/new"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Criar Simulado</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
