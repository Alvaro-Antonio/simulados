'use client';

import { useEffect, useState } from 'react';
import { Timer, Pause, Play } from 'lucide-react';

interface ExamTimerProps {
  seconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  className?: string;
}

/**
 * Formata segundos no formato MM:SS ou HH:MM:SS
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Formata segundos por extenso (ex: "14 min 32 s" ou "1 h 12 min")
 */
export function formatTimeVerbose(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}min ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}min ${seconds}s`;
  }
  return `${seconds}s`;
}

export function ExamTimer({
  seconds,
  isPaused,
  onTogglePause,
  className = '',
}: ExamTimerProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 shadow-xs transition-all ${
        isPaused
          ? 'border-amber-300 bg-amber-50/90 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
          : 'border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
      } ${className}`}
      role="timer"
      aria-label="Cronômetro do simulado"
      aria-live="polite"
    >
      {/* Indicador pulsante */}
      <span className="relative flex h-2 w-2">
        {isPaused ? (
          <span className="h-2 w-2 rounded-full bg-amber-500" />
        ) : (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </>
        )}
      </span>

      <Timer className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />

      {/* Dígitos com fonte tabular monoespaçada */}
      <span className="font-mono text-xs font-bold tracking-wider">
        {formatTime(seconds)}
      </span>

      {isPaused && (
        <span className="rounded-md bg-amber-200/70 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 dark:bg-amber-900/70 dark:text-amber-200">
          Pausado
        </span>
      )}

      {/* Botão de Pausar / Retomar */}
      <button
        type="button"
        onClick={onTogglePause}
        className={`ml-1 rounded-lg p-1 transition-colors ${
          isPaused
            ? 'bg-amber-200/80 text-amber-900 hover:bg-amber-300 dark:bg-amber-900/60 dark:text-amber-100 dark:hover:bg-amber-800'
            : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
        }`}
        title={isPaused ? 'Retomar cronômetro' : 'Pausar cronômetro'}
        aria-label={isPaused ? 'Retomar cronômetro' : 'Pausar cronômetro'}
      >
        {isPaused ? (
          <Play className="h-3 w-3 fill-current" />
        ) : (
          <Pause className="h-3 w-3 fill-current" />
        )}
      </button>
    </div>
  );
}
