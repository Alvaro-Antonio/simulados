import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Home,
  TrendingUp,
} from 'lucide-react';

interface ScoreHeaderProps {
  examId: string;
  examTitle: string;
  totalScore: number;
  totalQuestions: number;
  percentage: number;
  finishedAt: Date | null;
}

export function ScoreHeader({
  examId,
  examTitle,
  totalScore,
  totalQuestions,
  percentage,
  finishedAt,
}: ScoreHeaderProps) {
  const incorrectCount = totalQuestions - totalScore;

  const getPerformanceFeedback = (pct: number) => {
    if (pct >= 80) {
      return {
        label: 'Excelente Aproveitamento!',
        subtext: 'Parabéns! Você demonstrou forte domínio sobre o conteúdo avaliado.',
        colorClass:
          'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
        badgeBg: 'bg-emerald-600 text-white',
      };
    }
    if (pct >= 60) {
      return {
        label: 'Bom Desempenho!',
        subtext: 'Você está no caminho certo! Revise as questões que errou para fixar os conceitos.',
        colorClass:
          'from-amber-500/10 via-amber-500/5 to-transparent border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300',
        badgeBg: 'bg-amber-600 text-white',
      };
    }
    return {
      label: 'Continue Praticando!',
      subtext: 'Aproveite o gabarito comentado abaixo para aprender com os erros e tente novamente.',
      colorClass:
        'from-rose-500/10 via-rose-500/5 to-transparent border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300',
      badgeBg: 'bg-rose-600 text-white',
    };
  };

  const feedback = getPerformanceFeedback(percentage);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-8">
      {/* Topo do Resultado */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Resultado do Simulado
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            {examTitle}
          </h1>
          {finishedAt && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Finalizado em {new Date(finishedAt).toLocaleString('pt-BR')}
            </p>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 shadow-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Home className="h-4 w-4" />
            <span>Início</span>
          </Link>

          <Link
            href={`/exams/${examId}/play`}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 active:scale-98"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Refazer Simulado</span>
          </Link>
        </div>
      </div>

      {/* Banner de Feedback com Percentual */}
      <div
        className={`mt-6 rounded-2xl border bg-gradient-to-r p-5 sm:p-6 ${feedback.colorClass}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black shadow-md ${feedback.badgeBg}`}
            >
              {percentage}%
            </div>
            <div>
              <h2 className="text-lg font-bold">{feedback.label}</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 sm:text-sm">
                {feedback.subtext}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Quantitativas */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {totalScore}
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Questões Corretas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {incorrectCount}
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Erros ou Em Branco
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {totalScore} / {totalQuestions}
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Total de Questões
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
