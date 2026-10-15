'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Play,
  Edit,
  Trash2,
  HelpCircle,
  Award,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { ExamSummaryItem } from '@/lib/types';
import { deleteExamAction } from '@/app/actions/exam-actions';

interface ExamCardProps {
  exam: ExamSummaryItem;
}

export function ExamCard({ exam }: ExamCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await deleteExamAction(exam.id);
      if (!res.success) {
        setErrorMsg(res.error || 'Erro ao excluir');
        setShowConfirm(false);
      }
    });
  };

  const latest = exam.latestAttempt;

  const getScoreBadgeClass = (percentage: number) => {
    if (percentage >= 70) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
    if (percentage >= 50) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    }
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800';
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700">
      <div>
        {/* Header com Categoria e Ações */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            {exam.category || 'Geral'}
          </span>

          <div className="flex items-center gap-1">
            <Link
              href={`/exams/${exam.id}/edit`}
              title="Editar simulado e questões"
              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <Edit className="h-4 w-4" />
            </Link>

            <button
              onClick={() => setShowConfirm(true)}
              title="Excluir simulado"
              disabled={isPending}
              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal/Alerta de Confirmação de Exclusão */}
        {showConfirm && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
            <p className="font-semibold">Excluir este simulado?</p>
            <p className="mt-0.5 text-rose-600 dark:text-rose-400">
              Todas as questões e o histórico de respostas serão removidos.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-500"
              >
                {isPending ? 'Excluindo...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="rounded-md bg-zinc-200 px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Título e Descrição */}
        <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {exam.title}
        </h3>

        {exam.description && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
            {exam.description}
          </p>
        )}

        {/* Metadados: Questões e Data */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-zinc-400" />
            <span>
              {exam.questionCount}{' '}
              {exam.questionCount === 1 ? 'questão' : 'questões'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <span>
              {new Date(exam.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Último Desempenho e Botão Iniciar */}
      <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        {latest ? (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/40">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-500" />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                Última tentativa:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-bold ${getScoreBadgeClass(
                  latest.percentage
                )}`}
              >
                {latest.percentage}%
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                ({latest.totalScore}/{latest.totalQuestions})
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
            <CheckCircle2 className="h-4 w-4" />
            <span>Ainda não realizado</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Link
            href={`/exams/${exam.id}/play`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-98 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Iniciar Simulado</span>
          </Link>

          {latest && (
            <Link
              href={`/exams/${exam.id}/results/${latest.id}`}
              className="rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              title="Revisar gabarito da última tentativa"
            >
              Revisar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
