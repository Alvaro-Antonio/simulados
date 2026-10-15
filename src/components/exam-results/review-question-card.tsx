import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface ReviewQuestionCardProps {
  index: number;
  question: {
    id: string;
    statement: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
    explanation: string | null;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
      orderIndex: number;
    }[];
    selectedOptionId: string | null;
    isCorrect: boolean;
  };
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function ReviewQuestionCard({ index, question }: ReviewQuestionCardProps) {
  const isAnswered = question.selectedOptionId !== null;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-8">
      {/* Header com Status do Acerto */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold text-zinc-500">
            Questão #{index + 1}
          </span>
          <span className="text-xs text-zinc-400">
            ({question.type === 'TRUE_FALSE' ? 'Certo/Errado' : 'Múltipla Escolha'})
          </span>
        </div>

        {question.isCorrect ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Acertou</span>
          </span>
        ) : isAnswered ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="h-3.5 w-3.5" />
            <span>Errou</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Não respondida</span>
          </span>
        )}
      </div>

      {/* Enunciado */}
      <div className="mt-5">
        <p className="text-base font-semibold leading-relaxed text-zinc-900 dark:text-zinc-100">
          {question.statement}
        </p>
      </div>

      {/* Alternativas */}
      <div className="mt-6 space-y-2.5">
        {question.options.map((option, optIdx) => {
          const isUserChoice = question.selectedOptionId === option.id;
          const isCorrectAnswer = option.isCorrect;
          const letter = LETTERS[optIdx] || `${optIdx + 1}`;

          let cardStyle =
            'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300';
          let badgeText = null;

          if (isCorrectAnswer) {
            cardStyle =
              'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100';
            badgeText = isUserChoice ? 'Sua Resposta (Correta)' : 'Gabarito Correto';
          } else if (isUserChoice && !isCorrectAnswer) {
            cardStyle =
              'border-rose-500 bg-rose-50/70 text-rose-950 ring-1 ring-rose-500 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-100';
            badgeText = 'Sua Resposta (Incorreta)';
          }

          return (
            <div
              key={option.id}
              className={`flex items-center justify-between rounded-2xl border p-3.5 transition-all ${cardStyle}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                    isCorrectAnswer
                      ? 'bg-emerald-600 text-white'
                      : isUserChoice
                      ? 'bg-rose-600 text-white'
                      : 'border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  {question.type === 'TRUE_FALSE'
                    ? option.text === 'Certo'
                      ? 'C'
                      : 'E'
                    : letter}
                </span>
                <span className="text-sm font-medium leading-normal">
                  {option.text}
                </span>
              </div>

              {badgeText && (
                <span
                  className={`ml-2 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isCorrectAnswer
                      ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200'
                      : 'bg-rose-200 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200'
                  }`}
                >
                  {badgeText}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Justificativa / Comentário do Gabarito */}
      {question.explanation && (
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            <MessageSquare className="h-4 w-4" />
            <span>Comentário do Gabarito</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
