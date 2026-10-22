import { getFolders } from '@/app/actions/exam-actions';
import { ExamForm } from '@/components/exam-form/exam-form';

export const metadata = {
  title: 'Criar Novo Simulado | Sistema de Simulados',
};

export default async function NewExamPage() {
  const folders = await getFolders();
  return <ExamForm availableFolders={folders} />;
}
