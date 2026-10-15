'use client';

import { useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { parseBulkQuestions, ParsedBulkQuestion } from '@/lib/validations/exam';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questions: ParsedBulkQuestion[]) => void;
}

const CHATGPT_PROMPT_TEMPLATE = `Atue como um elaborador de questões para concursos e vestibulares.
Gere uma lista de questões no formato JSON EXATO abaixo, sem texto adicional antes ou depois:

[
  {
    "statement": "Enunciado claro da questão",
    "type": "MULTIPLE_CHOICE",
    "explanation": "Comentário detalhado justificando porque a alternativa correta está certa e as outras erradas.",
    "options": [
      { "text": "Alternativa A", "isCorrect": false },
      { "text": "Alternativa B (Correta)", "isCorrect": true },
      { "text": "Alternativa C", "isCorrect": false },
      { "text": "Alternativa D", "isCorrect": false }
    ]
  },
  {
    "statement": "(Cebraspe) A afirmação a ser julgada pelo estudante.",
    "type": "TRUE_FALSE",
    "explanation": "Explicação detalhada da fundamentação legal ou teórica.",
    "options": [
      { "text": "Certo", "isCorrect": true },
      { "text": "Errado", "isCorrect": false }
    ]
  }
]`;

const SAMPLE_JSON = `[
  {
    "statement": "Qual princípio constitucional garante que a lei não prejudicará o direito adquirido, o ato jurídico perfeito e a coisa julgada?",
    "type": "MULTIPLE_CHOICE",
    "explanation": "Art. 5º, XXXVI da CF/88: A lei não prejudicará o direito adquirido, o ato jurídico perfeito e a coisa julgada (Princípio da Segurança Jurídica).",
    "options": [
      { "text": "Princípio da Legalidade", "isCorrect": false },
      { "text": "Princípio da Segurança Jurídica", "isCorrect": true },
      { "text": "Princípio da Publicidade", "isCorrect": false },
      { "text": "Princípio da Eficiência", "isCorrect": false }
    ]
  },
  {
    "statement": "(Cebraspe) A República Federativa do Brasil rege-se nas suas relações internacionais pelo princípio da prevalência dos direitos humanos.",
    "type": "TRUE_FALSE",
    "explanation": "Correto. O Art. 4º, II da CF/88 expressamente consagra a prevalência dos direitos humanos como princípio das relações internacionais.",
    "options": [
      { "text": "Certo", "isCorrect": true },
      { "text": "Errado", "isCorrect": false }
    ]
  }
]`;

export function BulkImportModal({
  isOpen,
  onClose,
  onImport,
}: BulkImportModalProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(CHATGPT_PROMPT_TEMPLATE);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      // Falha silenciosa de clipboard
    }
  };

  const handleInsertSample = () => {
    setText(SAMPLE_JSON);
    setError(null);
  };

  const handleProcessImport = () => {
    if (!text.trim()) {
      setError('Por favor, cole o JSON das questões.');
      return;
    }

    const result = parseBulkQuestions(text);
    if (!result.success || !result.questions) {
      setError(result.error || 'Erro ao processar formato.');
      return;
    }

    onImport(result.questions);
    setText('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Importação Rápida em Lote
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Cole questões em JSON geradas pelo ChatGPT ou de bancos de provas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-wrap items-center gap-2 pb-4">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {copiedPrompt ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Prompt Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar Prompt para ChatGPT</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleInsertSample}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100/50 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Inserir Exemplo de Teste</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              rows={12}
              placeholder="Cole aqui o JSON gerado ou com bloco ```json ... ```"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 font-mono text-xs text-zinc-800 transition-all focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleProcessImport}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
          >
            <Check className="h-4 w-4" />
            <span>Processar e Adicionar Questões</span>
          </button>
        </div>
      </div>
    </div>
  );
}
