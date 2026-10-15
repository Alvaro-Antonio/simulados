'use client';

import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { QuestionInput, OptionInput } from '@/lib/validations/exam';

interface QuestionItemProps {
  question: QuestionInput;
  index: number;
  totalQuestions: number;
  onChange: (updated: QuestionInput) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function QuestionItem({
  question,
  index,
  totalQuestions,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: QuestionItemProps) {
  const handleTypeChange = (newType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE') => {
    if (newType === question.type) return;

    if (newType === 'TRUE_FALSE') {
      onChange({
        ...question,
        type: 'TRUE_FALSE',
        options: [
          { text: 'Certo', isCorrect: true, orderIndex: 0 },
          { text: 'Errado', isCorrect: false, orderIndex: 1 },
        ],
      });
    } else {
      onChange({
        ...question,
        type: 'MULTIPLE_CHOICE',
        options: [
          { text: 'Opção 1', isCorrect: true, orderIndex: 0 },
          { text: 'Opção 2', isCorrect: false, orderIndex: 1 },
          { text: 'Opção 3', isCorrect: false, orderIndex: 2 },
          { text: 'Opção 4', isCorrect: false, orderIndex: 3 },
        ],
      });
    }
  };

  const handleSetCorrectOption = (optIndex: number) => {
    const updatedOptions = question.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === optIndex,
    }));
    onChange({ ...question, options: updatedOptions });
  };

  const handleOptionTextChange = (optIndex: number, text: string) => {
    const updatedOptions = question.options.map((opt, i) =>
      i === optIndex ? { ...opt, text } : opt
    );
    onChange({ ...question, options: updatedOptions });
  };

  const handleAddOption = () => {
    if (question.options.length >= 6) return;
    onChange({
      ...question,
      options: [
        ...question.options,
        {
          text: '',
          isCorrect: false,
          orderIndex: question.options.length,
        },
      ],
    });
  };

  const handleRemoveOption = (optIndex: number) => {
    if (question.options.length <= 2) return;
    const filtered = question.options.filter((_, i) => i !== optIndex);
    // Se removeu a correta, marca a primeira como correta para não quebrar validação
    const hasCorrect = filtered.some((o) => o.isCorrect);
    if (!hasCorrect && filtered.length > 0) {
      filtered[0].isCorrect = true;
    }
    onChange({
      ...question,
      options: filtered.map((o, idx) => ({ ...o, orderIndex: idx })),
    });
  };

  return (
    <div className="relative rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-6">
      {/* Top Bar da Questão */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 font-mono text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
            #{index + 1}
          </span>

          {/* Toggle de Tipo de Questão */}
          <div className="flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => handleTypeChange('MULTIPLE_CHOICE')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                question.type === 'MULTIPLE_CHOICE'
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              Múltipla Escolha
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('TRUE_FALSE')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                question.type === 'TRUE_FALSE'
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              Certo / Errado (Cebraspe)
            </button>
          </div>
        </div>

        {/* Controles: Subir, Descer, Excluir */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            title="Mover para cima"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={index === totalQuestions - 1}
            onClick={onMoveDown}
            title="Mover para baixo"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Excluir questão"
            className="ml-1 rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Enunciado */}
      <div className="mt-4">
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Enunciado da Questão
        </label>
        <textarea
          rows={3}
          value={question.statement}
          onChange={(e) => onChange({ ...question, statement: e.target.value })}
          placeholder="Escreva ou cole o enunciado da questão..."
          className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-500"
        />
      </div>

      {/* Alternativas */}
      <div className="mt-5">
        <div className="flex items-center justify-between pb-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Alternativas (clique no círculo para marcar o Gabarito Correto)
          </label>
          {question.type === 'MULTIPLE_CHOICE' && question.options.length < 6 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Adicionar Alternativa</span>
            </button>
          )}
        </div>

        {question.type === 'TRUE_FALSE' ? (
          // Interface Certo / Errado
          <div className="grid grid-cols-2 gap-3 pt-1">
            {question.options.map((opt, i) => {
              const isSelected = opt.isCorrect;
              return (
                <button
                  key={opt.text}
                  type="button"
                  onClick={() => handleSetCorrectOption(i)}
                  className={`flex items-center justify-between rounded-xl border p-3.5 text-sm font-semibold transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300'
                  }`}
                >
                  <span>{opt.text}</span>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-zinc-300 bg-transparent'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 fill-current" />}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          // Interface Múltipla Escolha
          <div className="space-y-2.5 pt-1">
            {question.options.map((opt, i) => {
              const letter = LETTERS[i] || `${i + 1}`;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 rounded-xl border p-2 transition-all ${
                    opt.isCorrect
                      ? 'border-emerald-400 bg-emerald-50/40 dark:border-emerald-800/80 dark:bg-emerald-950/20'
                      : 'border-zinc-200 bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-950/40'
                  }`}
                >
                  {/* Botão de marcar gabarito */}
                  <button
                    type="button"
                    onClick={() => handleSetCorrectOption(i)}
                    title={
                      opt.isCorrect
                        ? 'Gabarito correto selecionado'
                        : 'Clique para definir como alternativa correta'
                    }
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-all ${
                      opt.isCorrect
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border border-zinc-300 bg-white text-zinc-600 hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    {letter}
                  </button>

                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionTextChange(i, e.target.value)}
                    placeholder={`Texto da alternativa ${letter}...`}
                    className="flex-1 bg-transparent px-2 text-sm text-zinc-900 focus:outline-hidden dark:text-zinc-100"
                  />

                  {question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(i)}
                      title="Remover alternativa"
                      className="rounded-lg p-1 text-zinc-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Justificativa / Comentário */}
      <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
          <span>Justificativa / Comentário do Gabarito (Opcional, exibido na revisão)</span>
        </label>
        <textarea
          rows={2}
          value={question.explanation || ''}
          onChange={(e) =>
            onChange({ ...question, explanation: e.target.value || null })
          }
          placeholder="Ex: Art. 5º da CF/88 ou explicação de por que a alternativa está correta..."
          className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-xs text-zinc-800 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:focus:border-indigo-500"
        />
      </div>
    </div>
  );
}
