import { notFound } from 'next/navigation';
import { getExamForPlay } from '@/app/actions/exam-actions';
import { ExamPlayer } from '@/components/exam-player/exam-player';

interface PlayExamPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PlayExamPageProps) {
  const { id } = await params;
  const exam = await getExamForPlay(id);
  if (!exam) return { title: 'Simulado não encontrado' };
  return {
    title: `Realizando: ${exam.title} | Sistema de Simulados`,
  };
}

export default async function PlayExamPage({ params }: PlayExamPageProps) {
  const { id } = await params;
  const exam = await getExamForPlay(id);

  if (!exam) {
    notFound();
  }

  return <ExamPlayer exam={exam} />;
}
