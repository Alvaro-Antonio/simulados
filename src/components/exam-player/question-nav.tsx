'use client';

import { Check } from 'lucide-react';

interface QuestionNavProps {
  total: number;
  currentIndex: number;
  answeredQuestionIds: Set<string>;
  questionIds: string[];
  onSelect: (index: number) => void;
}

export function QuestionNav({
  total,
  currentIndex,
  answeredQuestionIds,
  questionIds,
  onSelect,
}: QuestionNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const qId = questionIds[i];
        const isAnswered = answeredQuestionIds.has(qId);
        const isCurrent = i === currentIndex;

        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl font-mono text-xs font-bold transition-all ${
              isCurrent
                ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-zinc-900 bg-indigo-600 text-white shadow-sm'
                : isAnswered
                ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:hover:bg-indigo-900'
                : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            <span>{i + 1}</span>
            {isAnswered && !isCurrent && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
