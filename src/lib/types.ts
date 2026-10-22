import { QuestionType } from '@prisma/client';

export interface OptionDTO {
  id?: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuestionDTO {
  id?: string;
  statement: string;
  type: QuestionType;
  explanation?: string | null;
  orderIndex: number;
  options: OptionDTO[];
}

export interface FolderDTO {
  id?: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  isPinned?: boolean;
}

export interface FolderSummary {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  examCount: number;
}

export interface ExamDTO {
  id?: string;
  title: string;
  description?: string | null;
  category?: string | null;
  folderId?: string | null;
  isPinned?: boolean;
  icon?: string | null;
  imageUrl?: string | null;
  questions: QuestionDTO[];
}

export interface ExamSummaryItem {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  folderId: string | null;
  folderName: string | null;
  isPinned: boolean;
  icon: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  questionCount: number;
  attemptsCount: number;
  averagePercentage: number | null;
  latestAttempt: {
    id: string;
    totalScore: number;
    totalQuestions: number;
    percentage: number;
    finishedAt: Date | null;
  } | null;
}

export interface AttemptResultDetail {
  attemptId: string;
  examId: string;
  examTitle: string;
  totalScore: number;
  totalQuestions: number;
  percentage: number;
  finishedAt: Date | null;
  durationSeconds?: number;
  questions: {
    id: string;
    statement: string;
    type: QuestionType;
    explanation: string | null;
    orderIndex: number;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
      orderIndex: number;
    }[];
    selectedOptionId: string | null;
    isCorrect: boolean;
  }[];
}
