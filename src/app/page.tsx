import Link from 'next/link';
import {
  PlusCircle,
  BookOpen,
  CheckSquare2,
  Sparkles,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import { getExams } from '@/app/actions/exam-actions';
import { ExamCard } from '@/components/exam-card';

export default async function DashboardPage() {
  const exams = await getExams();

  const totalExams = exams.length;
  const totalQuestions = exams.reduce((acc, curr) => acc + curr.questionCount, 0);
  const totalCompleted = exams.filter((e) => e.latestAttempt !== null).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Top Banner de Boas-vindas e Métricas */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Painel de Simulados
          </h1>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Gerencie seus testes, treine com questões e revise seu desempenho com gabaritos explicados.
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

      {/* Cards de Métricas Rápidas */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {totalExams}
            </span>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Simulados Criados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {totalQuestions}
            </span>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Total de Questões
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckSquare2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {totalCompleted}
            </span>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Simulados Já Realizados
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
