import { notFound } from 'next/navigation';
import { getExamForEdit } from '@/app/actions/exam-actions';
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
  const exam = await getExamForEdit(id);

  if (!exam) {
    notFound();
  }

  const initialData = {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    category: exam.category,
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

  return <ExamForm initialData={initialData} />;
}
