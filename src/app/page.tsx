import Link from 'next/link';
import {
  PlusCircle,
  BookOpen,
  CheckSquare2,
  HelpCircle,
  GraduationCap,
  TrendingUp,
  Award,
  Layers,
} from 'lucide-react';
import { getExams } from '@/app/actions/exam-actions';
import { ExamCard } from '@/components/exam-card';

export const revalidate = 0;

export default async function DashboardPage() {
  const exams = await getExams();

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
            Gerencie seus testes, treine com questões e acompanhe sua evolução com métricas detalhadas.
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

      {/* Grid de Simulados ou Estado Vazio */}
      <section className="mt-10">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Seus Simulados
          </h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {totalExams} disponíveis
          </span>
        </div>

        {exams.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Nenhum simulado cadastrado ainda
            </h3>
            <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              Comece criando seu primeiro simulado com perguntas de múltipla escolha ou Certo/Errado para testar seus conhecimentos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link
                href="/exams/new"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Criar Primeiro Simulado</span>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
