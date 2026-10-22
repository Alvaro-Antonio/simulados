'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Sparkles,
  Save,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Folder,
} from 'lucide-react';
import { ExamInput, QuestionInput, ParsedBulkQuestion } from '@/lib/validations/exam';
import { saveExamAction } from '@/app/actions/exam-actions';
import { QuestionItem } from './question-item';
import { BulkImportModal } from './bulk-import-modal';

interface ExamFormProps {
  initialData?: Omit<ExamInput, 'questions'> & {
    id?: string;
    questions?: QuestionInput[];
  };
  availableFolders?: { id: string; name: string }[];
}

const PRESET_ICONS = [
  { id: 'graduation-cap', label: 'Concurso / Acadêmico' },
  { id: 'code', label: 'Tecnologia / TI' },
  { id: 'scale', label: 'Direito / Legislação' },
  { id: 'calculator', label: 'Exatas / Matemática' },
  { id: 'book-open', label: 'Educação / Didática' },
  { id: 'stethoscope', label: 'Saúde / Enfermagem' },
  { id: 'award', label: 'Certificação / Geral' },
  { id: 'globe', label: 'Línguas / Atualidades' },
];

export function ExamForm({ initialData, availableFolders = [] }: ExamFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [folderId, setFolderId] = useState<string>(initialData?.folderId || '');
  const [isPinned, setIsPinned] = useState<boolean>(initialData?.isPinned || false);
  const [icon, setIcon] = useState<string>(initialData?.icon || 'graduation-cap');
  const [imageUrl, setImageUrl] = useState<string>(initialData?.imageUrl || '');
  const [questions, setQuestions] = useState<QuestionInput[]>(
    initialData?.questions || [
      {
        statement: '',
        type: 'MULTIPLE_CHOICE',
        explanation: '',
        orderIndex: 0,
        options: [
          { text: '', isCorrect: true, orderIndex: 0 },
          { text: '', isCorrect: false, orderIndex: 1 },
          { text: '', isCorrect: false, orderIndex: 2 },
          { text: '', isCorrect: false, orderIndex: 3 },
        ],
      },
    ]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddQuestion = (type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' = 'MULTIPLE_CHOICE') => {
    const newQ: QuestionInput = {
      statement: '',
      type,
      explanation: '',
      orderIndex: questions.length,
      options:
        type === 'TRUE_FALSE'
          ? [
              { text: 'Certo', isCorrect: true, orderIndex: 0 },
              { text: 'Errado', isCorrect: false, orderIndex: 1 },
            ]
          : [
              { text: '', isCorrect: true, orderIndex: 0 },
              { text: '', isCorrect: false, orderIndex: 1 },
              { text: '', isCorrect: false, orderIndex: 2 },
              { text: '', isCorrect: false, orderIndex: 3 },
            ],
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (index: number, updated: QuestionInput) => {
    const copy = [...questions];
    copy[index] = updated;
    setQuestions(copy);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      setErrorMessage('O simulado deve conter pelo menos 1 questão.');
      return;
    }
    const filtered = questions.filter((_, i) => i !== index);
    setQuestions(filtered.map((q, idx) => ({ ...q, orderIndex: idx })));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...questions];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    setQuestions(copy.map((q, idx) => ({ ...q, orderIndex: idx })));
  };

  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1) return;
    const copy = [...questions];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    setQuestions(copy.map((q, idx) => ({ ...q, orderIndex: idx })));
  };

  const handleBulkImport = (imported: ParsedBulkQuestion[]) => {
    const formatted: QuestionInput[] = imported.map((item, idx) => ({
      statement: item.statement,
      type: item.type,
      explanation: item.explanation ?? '',
      orderIndex: questions.length + idx,
      options: item.options.map((opt, optIdx) => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
        orderIndex: optIdx,
      })),
    }));

    // Se a única questão existente for vazia, substitui
    if (
      questions.length === 1 &&
      !questions[0].statement.trim() &&
      questions[0].options.every((o) => !o.text.trim())
    ) {
      setQuestions(formatted);
    } else {
      setQuestions([...questions, ...formatted]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validações rápidas de frontend
    if (!title.trim()) {
      setErrorMessage('Por favor, informe um título para o simulado.');
      return;
    }

    if (questions.length === 0) {
      setErrorMessage('Adicione ao menos uma questão ao simulado.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.statement.trim()) {
        setErrorMessage(`A questão #${i + 1} está com o enunciado em branco.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          setErrorMessage(
            `A questão #${i + 1} possui alternativas com texto em branco.`
          );
          return;
        }
      }
      const correctCount = q.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        setErrorMessage(
          `A questão #${i + 1} deve ter exatamente 1 alternativa correta selecionada.`
        );
        return;
      }
    }

    startTransition(async () => {
      const payload: ExamInput = {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        folderId: folderId.trim() || null,
        isPinned,
        icon: icon || null,
        imageUrl: imageUrl.trim() || null,
        questions: questions.map((q, i) => ({
          ...q,
          orderIndex: i,
          explanation: q.explanation?.trim() || null,
          options: q.options.map((opt, optIndex) => ({
            ...opt,
            orderIndex: optIndex,
          })),
        })),
      };

      const res = await saveExamAction(payload, initialData?.id);
      if (!res.success) {
        setErrorMessage(res.error || 'Erro ao salvar simulado.');
      } else {
        router.push('/');
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-zinc-200 p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {initialData?.id ? 'Editar Simulado' : 'Novo Simulado'}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Configure as informações gerais, pasta, ícone e questões do simulado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/60 px-4 py-2.5 text-xs font-semibold text-indigo-700 shadow-xs transition-all hover:bg-indigo-100/60 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              <Sparkles className="h-4 w-4" />
              <span>Importar em Lote (JSON / IA)</span>
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isPending ? 'Salvando...' : 'Salvar Simulado'}</span>
            </button>
          </div>
        </div>

        {/* Mensagem de Erro Geral */}
        {errorMessage && (
          <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Informações Gerais */}
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Informações Gerais & Organização
            </h2>
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4 w-4 rounded-md border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700"
              />
              <span>Fixar no topo</span>
            </label>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Título do Simulado *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Concurso Professor Municipal - Prova 1"
                required
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Categoria / Matéria
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Pedagogia, Didática, TI"
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Pasta Organizadora & Ícone */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Pasta Organizadora
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-500"
              >
                <option value="">Sem pasta (Raiz / Geral)</option>
                {availableFolders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Ícone Representativo
              </label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {PRESET_ICONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                      icon === item.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              URL da Imagem Personalizada (Opcional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem-simulado.png"
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-500"
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Descrição / Observações (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Questões focadas no edital municipal para professor..."
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-500"
            />
          </div>
        </section>

        {/* Lista de Questões */}
        <section className="mt-8 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Questões ({questions.length})
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddQuestion('MULTIPLE_CHOICE')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Múltipla Escolha</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddQuestion('TRUE_FALSE')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Certo / Errado</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, index) => (
              <QuestionItem
                key={index}
                question={q}
                index={index}
                totalQuestions={questions.length}
                onChange={(updated) => handleUpdateQuestion(index, updated)}
                onDelete={() => handleDeleteQuestion(index)}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
              />
            ))}
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={() => handleAddQuestion('MULTIPLE_CHOICE')}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-3 text-xs font-semibold text-zinc-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400 dark:hover:border-indigo-600 dark:hover:text-indigo-400"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Mais Uma Questão</span>
            </button>
          </div>
        </section>
      </form>

      <BulkImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImport={handleBulkImport}
      />
    </>
  );
}
