'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  Send,
  LayoutGrid,
  Timer,
  Play,
} from 'lucide-react';
import { submitExamAttemptAction } from '@/app/actions/exam-actions';
import { QuestionNav } from './question-nav';
import { ExamTimer, formatTimeVerbose } from './exam-timer';

interface ExamPlayerProps {
  exam: {
    id: string;
    title: string;
    category: string | null;
    description: string | null;
    totalBankQuestions?: number;
    questions: {
      id: string;
      statement: string;
      type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
      orderIndex: number;
      options: {
        id: string;
        text: string;
        orderIndex: number;
      }[];
    }[];
  };
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function ExamPlayer({ exam }: ExamPlayerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNavDrawer, setShowNavDrawer] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados do Cronômetro
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  useEffect(() => {
    if (isTimerPaused) return;

    const intervalId = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isTimerPaused]);

  const totalQuestions = exam.questions.length;
  const currentQuestion = exam.questions[currentIndex];
  const questionIds = exam.questions.map((q) => q.id);
  const answeredQuestionIds = new Set(Object.keys(answers));
  const answeredCount = answeredQuestionIds.size;
  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleClearAnswer = (questionId: string) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const handleFinishExam = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await submitExamAttemptAction(
        exam.id,
        answers,
        questionIds,
        elapsedSeconds
      );
      if (!res.success || !res.attemptId) {
        setErrorMsg(res.error || 'Erro ao processar respostas.');
      } else {
        router.push(`/exams/${exam.id}/results/${res.attemptId}`);
      }
    });
  };

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-zinc-500">Este simulado não possui questões cadastradas.</p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Voltar ao Início
        </Link>
      </div>
    );
  }

  const selectedOptionId = answers[currentQuestion.id] || null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* Top Bar: Voltar, Título, Progresso e Botão de Finalizar */}
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-xl border border-zinc-200 p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            title="Voltar ao início"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {exam.category || 'Simulado'}
              </span>
              {exam.totalBankQuestions && exam.totalBankQuestions > totalQuestions && (
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {totalQuestions} de {exam.totalBankQuestions} do banco
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {exam.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Cronômetro */}
          <ExamTimer
            seconds={elapsedSeconds}
            isPaused={isTimerPaused}
            onTogglePause={() => setIsTimerPaused(!isTimerPaused)}
          />

          {/* Botão de Grade de Questões */}
          <button
            type="button"
            onClick={() => setShowNavDrawer(!showNavDrawer)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>
              {answeredCount}/{totalQuestions}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 active:scale-98"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Finalizar</span>
          </button>
        </div>
      </div>

      {/* Banner de Simulado Pausado */}
      {isTimerPaused && (
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-amber-300 bg-amber-50/90 p-3.5 text-xs text-amber-900 shadow-xs dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />
            <span>
              <strong>Cronômetro pausado.</strong> O tempo de prova está congelado para descanso ou pausa.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsTimerPaused(false)}
            className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 font-semibold text-white transition-colors hover:bg-amber-500"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Retomar Simulado</span>
          </button>
        </div>
      )}

      {/* Barra de Progresso Visual */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pb-1.5">
          <span>
            Questão <strong className="text-zinc-900 dark:text-zinc-100">{currentIndex + 1}</strong> de{' '}
            {totalQuestions}
          </span>
          <span>{progressPercent}% respondido</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Grade de Navegação Rápida (Expansível) */}
      {showNavDrawer && (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Navegar para a Questão:
            </span>
            <span className="text-xs text-zinc-400">
              Clique em um número para pular direto
            </span>
          </div>
          <QuestionNav
            total={totalQuestions}
            currentIndex={currentIndex}
            answeredQuestionIds={answeredQuestionIds}
            questionIds={questionIds}
            onSelect={(idx) => {
              setCurrentIndex(idx);
              setShowNavDrawer(false);
            }}
          />
        </div>
      )}

      {/* Card da Questão Atual */}
      <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-8">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-mono text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
              Questão #{currentIndex + 1}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {currentQuestion.type === 'TRUE_FALSE'
                ? 'Certo / Errado'
                : 'Múltipla Escolha'}
            </span>
          </div>

          {selectedOptionId && (
            <button
              type="button"
              onClick={() => handleClearAnswer(currentQuestion.id)}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Limpar resposta</span>
            </button>
          )}
        </div>

        {/* Enunciado */}
        <div className="mt-6">
          <p className="text-base font-medium leading-relaxed text-zinc-900 dark:text-zinc-100 sm:text-lg">
            {currentQuestion.statement}
          </p>
        </div>

        {/* Alternativas */}
        <div className="mt-8 space-y-3">
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = selectedOptionId === option.id;
            const letter = LETTERS[optIdx] || `${optIdx + 1}`;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-100 ring-1 ring-indigo-500'
                    : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    {currentQuestion.type === 'TRUE_FALSE'
                      ? option.text === 'Certo'
                        ? 'C'
                        : 'E'
                      : letter}
                  </span>
                  <span className="text-sm font-medium leading-normal">
                    {option.text}
                  </span>
                </div>

                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Rodapé do Card com Navegação Anterior / Próxima */}
        <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 shadow-xs transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Anterior</span>
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-98 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              <span>Próxima</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 active:scale-98"
            >
              <Send className="h-4 w-4" />
              <span>Revisar e Finalizar</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Finalização */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Deseja finalizar o simulado?
            </h3>

            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Você respondeu <strong>{answeredCount}</strong> de{' '}
              <strong>{totalQuestions}</strong> questões.
            </p>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
              <Timer className="h-4 w-4 shrink-0 text-indigo-500" />
              <span>
                Tempo decorrido:{' '}
                <strong className="font-mono text-zinc-900 dark:text-zinc-100">
                  {formatTimeVerbose(elapsedSeconds)}
                </strong>
              </span>
            </div>

            {answeredCount < totalQuestions && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  Atenção: restam {totalQuestions - answeredCount} questão(ões) sem
                  resposta marcada.
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 text-xs text-rose-600">{errorMsg}</div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isPending}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Voltar à Prova
              </button>
              <button
                type="button"
                onClick={handleFinishExam}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 disabled:opacity-50"
              >
                {isPending ? 'Calculando acertos...' : 'Confirmar e Ver Resultado'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
