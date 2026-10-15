import { notFound } from 'next/navigation';
import { getAttemptResult } from '@/app/actions/exam-actions';
import { ScoreHeader } from '@/components/exam-results/score-header';
import { ReviewQuestionCard } from '@/components/exam-results/review-question-card';

interface ResultsPageProps {
  params: Promise<{ id: string; attemptId: string }>;
}

export async function generateMetadata({ params }: ResultsPageProps) {
  const { attemptId } = await params;
  const result = await getAttemptResult(attemptId);
  if (!result) return { title: 'Resultado não encontrado' };
  return {
    title: `Resultado: ${result.examTitle} (${result.percentage}% de acerto) | Sistema de Simulados`,
  };
}

export default async function ExamResultsPage({ params }: ResultsPageProps) {
  const { id, attemptId } = await params;
  const result = await getAttemptResult(attemptId);

  if (!result || result.examId !== id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Placar Superior */}
      <ScoreHeader
        examId={result.examId}
        examTitle={result.examTitle}
        totalScore={result.totalScore}
        totalQuestions={result.totalQuestions}
        percentage={result.percentage}
        finishedAt={result.finishedAt}
      />

      {/* Seção de Revisão Questão a Questão */}
      <div className="mt-10">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Revisão Detalhada das Questões
          </h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {result.totalQuestions} questões analisadas
          </span>
        </div>

        <div className="mt-4 space-y-6">
          {result.questions.map((question, index) => (
            <ReviewQuestionCard
              key={question.id}
              index={index}
              question={question}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
