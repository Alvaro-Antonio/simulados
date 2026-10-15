import { notFound } from 'next/navigation';
import { getExamForPlay } from '@/app/actions/exam-actions';
import { ExamPlayer } from '@/components/exam-player/exam-player';

interface PlayExamPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ limit?: string; shuffle?: string }>;
}

export async function generateMetadata({ params }: PlayExamPageProps) {
  const { id } = await params;
  const exam = await getExamForPlay(id);
  if (!exam) return { title: 'Simulado não encontrado' };
  return {
    title: `Realizando: ${exam.title} | Sistema de Simulados`,
  };
}

export default async function PlayExamPage({
  params,
  searchParams,
}: PlayExamPageProps) {
  const { id } = await params;
  const { limit: rawLimit, shuffle: rawShuffle } = await searchParams;
  const limit = rawLimit ? parseInt(rawLimit, 10) : undefined;
  const shuffle = rawShuffle === 'true';

  const exam = await getExamForPlay(id, {
    limit: limit && !isNaN(limit) ? limit : undefined,
    shuffle,
  });

  if (!exam) {
    notFound();
  }

  return <ExamPlayer exam={exam} />;
}
