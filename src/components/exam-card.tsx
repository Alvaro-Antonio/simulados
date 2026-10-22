'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  Edit,
  Trash2,
  HelpCircle,
  Award,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Settings2,
  Shuffle,
  X,
  Sparkles,
  Pin,
  GraduationCap,
  Code,
  Scale,
  Calculator,
  BookOpen,
  Stethoscope,
  Globe,
} from 'lucide-react';
import { ExamSummaryItem } from '@/lib/types';
import { deleteExamAction, togglePinExamAction } from '@/app/actions/exam-actions';

function renderExamIcon(icon?: string | null) {
  switch (icon) {
    case 'code':
      return <Code className="h-5 w-5" />;
    case 'scale':
      return <Scale className="h-5 w-5" />;
    case 'calculator':
      return <Calculator className="h-5 w-5" />;
    case 'book-open':
      return <BookOpen className="h-5 w-5" />;
    case 'stethoscope':
      return <Stethoscope className="h-5 w-5" />;
    case 'globe':
      return <Globe className="h-5 w-5" />;
    case 'award':
      return <Award className="h-5 w-5" />;
    case 'graduation-cap':
    default:
      return <GraduationCap className="h-5 w-5" />;
  }
}

interface ExamCardProps {
  exam: ExamSummaryItem;
}

export function ExamCard({ exam }: ExamCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estado para o modal de configuração de início
  const defaultCount = Math.min(10, Math.max(1, exam.questionCount));
  const [selectedCount, setSelectedCount] = useState<number>(defaultCount);
  const [shuffle, setShuffle] = useState(true);

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

  const handleStartExam = () => {
    const finalCount = Math.min(
      Math.max(1, selectedCount || exam.questionCount),
      exam.questionCount
    );
    router.push(
      `/exams/${exam.id}/play?limit=${finalCount}&shuffle=${shuffle}`
    );
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

  // Sugestões de quantidade baseadas no tamanho do banco
  const quickOptions = [5, 10, 20, 50].filter((n) => n < exam.questionCount);

  return (
    <>
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700">
        <div>
          {/* Header com Categoria e Ações */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                {exam.category || 'Geral'}
              </span>

              {exam.folderName && (
                <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  📁 {exam.folderName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  startTransition(async () => {
                    await togglePinExamAction(exam.id);
                  });
                }}
                title={exam.isPinned ? 'Desafixar do topo' : 'Fixar no topo'}
                disabled={isPending}
                className={`rounded-lg p-1.5 transition-colors ${
                  exam.isPinned
                    ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                    : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Pin className={`h-4 w-4 ${exam.isPinned ? 'fill-current rotate-45' : ''}`} />
              </button>

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

          {/* Título, Ícone e Descrição */}
          <div className="mt-3 flex items-start gap-3">
            {exam.imageUrl ? (
              <img
                src={exam.imageUrl}
                alt={exam.title}
                className="h-10 w-10 shrink-0 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                {renderExamIcon(exam.icon)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                  {exam.title}
                </h3>
                {exam.isPinned && (
                  <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    Fixado
                  </span>
                )}
              </div>
              {exam.description && (
                <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {exam.description}
                </p>
              )}
            </div>
          </div>

          {/* Metadados: Questões e Data */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-indigo-500" />
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Banco com {exam.questionCount}{' '}
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
            <div className="mb-4 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3.5 space-y-2 dark:border-zinc-800 dark:bg-zinc-800/40">
              {/* Linha 1: Última tentativa e seu percentual */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                  <Award className="h-4 w-4 text-indigo-500" />
                  <span>Último acerto:</span>
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

              {/* Linha 2: Quantidade de tentativas e Média geral do simulado */}
              <div className="flex items-center justify-between border-t border-zinc-200/60 pt-2 text-xs dark:border-zinc-700/60">
                <span className="text-zinc-500 dark:text-zinc-400">
                  {exam.attemptsCount}{' '}
                  {exam.attemptsCount === 1 ? 'tentativa' : 'tentativas'} realizada
                  {exam.attemptsCount === 1 ? '' : 's'}
                </span>
                {exam.averagePercentage !== null && (
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Média:{' '}
                    <strong className="text-indigo-600 dark:text-indigo-400">
                      {exam.averagePercentage}%
                    </strong>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <CheckCircle2 className="h-4 w-4" />
              <span>Ainda não realizado</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-98 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Iniciar Simulado</span>
            </button>

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

      {/* Modal de Configuração do Simulado (Banco de Questões) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Settings2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    Configurar Simulado
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Banco de {exam.questionCount} questões disponíveis
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowConfigModal(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {/* Quantidade de Questões */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Quantas questões você deseja responder?
                </label>

                {/* Chips rápidos */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {quickOptions.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedCount(num)}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                        selectedCount === num
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {num} questões
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSelectedCount(exam.questionCount)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      selectedCount === exam.questionCount
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    Todas ({exam.questionCount})
                  </button>
                </div>

                {/* Input Numérico Customizado */}
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-zinc-500">Ou digite:</span>
                  <input
                    type="number"
                    min={1}
                    max={exam.questionCount}
                    value={selectedCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setSelectedCount(Math.min(Math.max(1, val), exam.questionCount));
                      }
                    }}
                    className="w-24 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-center text-sm font-bold text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                  <span className="text-xs text-zinc-400">
                    (máx. {exam.questionCount})
                  </span>
                </div>
              </div>

              {/* Opção de Embaralhar */}
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                <label className="flex cursor-pointer items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Shuffle className="h-4 w-4 text-indigo-500" />
                    <div>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Embaralhar Questões
                      </span>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Sorteia questões aleatoriamente do banco
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={shuffle}
                    onChange={(e) => setShuffle(e.target.checked)}
                    className="h-4 w-4 rounded-md border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700"
                  />
                </label>
              </div>
            </div>

            {/* Ações */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleStartExam}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 active:scale-98"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Começar Simulado ({selectedCount} q.)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
