import { notFound } from 'next/navigation';
import { getExamForEdit, getFolders } from '@/app/actions/exam-actions';
import { ExamForm } from '@/components/exam-form/exam-form';
import { QuestionInput } from '@/lib/validations/exam';

interface EditExamPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Editar Simulado | Sistema de Simulados',
};

export default async function EditExamPage({ params }: EditExamPageProps) {
  const { id } = await params;
  const [exam, folders] = await Promise.all([
    getExamForEdit(id),
    getFolders(),
  ]);

  if (!exam) {
    notFound();
  }

  const initialData = {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    category: exam.category,
    folderId: exam.folderId,
    isPinned: exam.isPinned,
    icon: exam.icon,
    imageUrl: exam.imageUrl,
    questions: exam.questions.map((q): QuestionInput => ({
      id: q.id,
      statement: q.statement,
      type: q.type,
      explanation: q.explanation ?? '',
      orderIndex: q.orderIndex,
      options: q.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect,
        orderIndex: opt.orderIndex,
      })),
    })),
  };

  return <ExamForm initialData={initialData} availableFolders={folders} />;
}
