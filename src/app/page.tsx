import Link from 'next/link';
import {
  PlusCircle,
  BookOpen,
  CheckSquare2,
  TrendingUp,
  Award,
} from 'lucide-react';
import { getExams, getFolders } from '@/app/actions/exam-actions';
import { DashboardClient } from '@/components/dashboard-client';

export const revalidate = 0;

export default async function DashboardPage() {
  const [exams, folders] = await Promise.all([
    getExams(),
    getFolders(),
  ]);

  const totalExams = exams.length;
  const totalQuestions = exams.reduce((acc, curr) => acc + curr.questionCount, 0);
  const totalAttempts = exams.reduce((acc, curr) => acc + curr.attemptsCount, 0);

  // Calcula a média ponderada de acertos de todas as tentativas
  const examsWithAttempts = exams.filter(
    (e) => e.attemptsCount > 0 && e.averagePercentage !== null
  );
  const globalAverage =
    totalAttempts > 0 && examsWithAttempts.length > 0
      ? Math.round(
          examsWithAttempts.reduce(
            (acc, curr) => acc + (curr.averagePercentage ?? 0) * curr.attemptsCount,
            0
          ) / totalAttempts
        )
      : null;

  // Encontra a tentativa mais recente de todos os simulados
  const allLatestAttempts = exams
    .map((e) => e.latestAttempt)
    .filter((a): a is NonNullable<typeof a> => a !== null)
    .sort(
      (a, b) =>
        new Date(b.finishedAt ?? 0).getTime() - new Date(a.finishedAt ?? 0).getTime()
    );
  const newestAttempt = allLatestAttempts[0] ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Top Banner de Boas-vindas e Métricas */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Painel de Simulados
          </h1>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Gerencie seus testes, organize em pastas, fixe no topo e acompanhe sua evolução.
          </p>
        </div>

        <Link
          href="/exams/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 active:scale-98"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Novo Simulado</span>
        </Link>
      </div>

      {/* Cards de Métricas: Simulados, Tentativas, Média e Último Acerto */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Simulados Criados & Total de Questões */}
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {totalExams}
            </span>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Simulados ({totalQuestions} q.)
            </p>
          </div>
        </div>

        {/* Card 2: Total de Tentativas Realizadas */}
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
            <CheckSquare2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {totalAttempts}
            </span>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Tentativas Realizadas
            </p>
          </div>
        </div>

        {/* Card 3: Média Geral das Tentativas */}
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {globalAverage !== null ? `${globalAverage}%` : '—'}
            </span>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Média Geral de Acertos
            </p>
          </div>
        </div>

        {/* Card 4: Porcentagem de Acerto da Última Tentativa */}
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {newestAttempt ? `${newestAttempt.percentage}%` : '—'}
              </span>
              {newestAttempt && (
                <span className="text-[11px] font-medium text-zinc-400">
                  ({newestAttempt.totalScore}/{newestAttempt.totalQuestions})
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Último Acerto
            </p>
          </div>
        </div>
      </div>

      {/* Navegação de Pastas e Lista de Simulados */}
      <DashboardClient initialExams={exams} folders={folders} />
    </div>
  );
}
