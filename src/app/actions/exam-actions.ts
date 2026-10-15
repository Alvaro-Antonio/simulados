'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
  examSchema,
  ExamInput,
  calculateScore,
} from '@/lib/validations/exam';
import { AttemptResultDetail, ExamSummaryItem } from '@/lib/types';
import { QuestionType } from '@prisma/client';

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Permite execução fora de requisições HTTP (ex: testes automatizados de integração)
  }
}

/**
 * Obtém todos os simulados cadastrados com resumo da última tentativa.
 */
export async function getExams(): Promise<ExamSummaryItem[]> {
  const exams = await prisma.exam.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { questions: true },
      },
      attempts: {
        orderBy: { startedAt: 'desc' },
        take: 1,
        select: {
          id: true,
          totalScore: true,
          totalQuestions: true,
          finishedAt: true,
        },
      },
    },
  });

  return exams.map((exam) => {
    const latest = exam.attempts[0];
    const latestAttempt = latest
      ? {
          id: latest.id,
          totalScore: latest.totalScore,
          totalQuestions: latest.totalQuestions,
          percentage:
            latest.totalQuestions > 0
              ? Math.round((latest.totalScore / latest.totalQuestions) * 100)
              : 0,
          finishedAt: latest.finishedAt,
        }
      : null;

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      category: exam.category,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
      questionCount: exam._count.questions,
      latestAttempt,
    };
  });
}

/**
 * Obtém simulado completo com gabarito para tela de edição.
 */
export async function getExamForEdit(id: string) {
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
        include: {
          options: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
    },
  });

  return exam;
}

/**
 * Obtém dados para realização do simulado (omitindo isCorrect das opções para segurança).
 */
export async function getExamForPlay(id: string) {
  const exam = await prisma.exam.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      questions: {
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          statement: true,
          type: true,
          orderIndex: true,
          options: {
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              text: true,
              orderIndex: true,
            },
          },
        },
      },
    },
  });

  return exam;
}

/**
 * Cria ou atualiza um simulado atomicamente.
 */
export async function saveExamAction(
  data: ExamInput,
  examId?: string
): Promise<{ success: boolean; examId?: string; error?: string }> {
  try {
    const validated = examSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || 'Dados inválidos.',
      };
    }

    const { title, description, category, questions } = validated.data;

    const result = await prisma.$transaction(async (tx) => {
      let targetId = examId;

      if (targetId) {
        // Modo Edição: atualiza dados básicos e recria questões e opções
        await tx.exam.update({
          where: { id: targetId },
          data: {
            title,
            description,
            category,
          },
        });

        // Deleta questões anteriores em cascata para recriar com os novos dados
        await tx.question.deleteMany({
          where: { examId: targetId },
        });
      } else {
        // Modo Criação
        const newExam = await tx.exam.create({
          data: {
            title,
            description,
            category,
          },
        });
        targetId = newExam.id;
      }

      // Insere questões e alternativas ordenadas
      for (let qIndex = 0; qIndex < questions.length; qIndex++) {
        const q = questions[qIndex];
        await tx.question.create({
          data: {
            examId: targetId,
            statement: q.statement,
            type: q.type as QuestionType,
            explanation: q.explanation ?? null,
            orderIndex: qIndex,
            options: {
              create: q.options.map((opt, optIndex) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
                orderIndex: optIndex,
              })),
            },
          },
        });
      }

      return targetId;
    });

    safeRevalidatePath('/');
    safeRevalidatePath(`/exams/${result}/edit`);
    safeRevalidatePath(`/exams/${result}/play`);

    return { success: true, examId: result };
  } catch (error: unknown) {
    console.error('Erro ao salvar simulado:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao salvar simulado.',
    };
  }
}

/**
 * Exclui um simulado e todos os seus relacionamentos.
 */
export async function deleteExamAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.exam.delete({
      where: { id },
    });

    safeRevalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao excluir simulado:', error);
    return {
      success: false,
      error: 'Não foi possível excluir o simulado.',
    };
  }
}

/**
 * Submete as respostas do usuário, calcula a pontuação e persiste a tentativa.
 */
export async function submitExamAttemptAction(
  examId: string,
  answers: Record<string, string> // questionId -> selectedOptionId
): Promise<{ success: boolean; attemptId?: string; error?: string }> {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: true,
          },
        },
      },
    });

    if (!exam || exam.questions.length === 0) {
      return { success: false, error: 'Simulado não encontrado ou sem questões.' };
    }

    const { score, total, answersDetail } = calculateScore(exam.questions, answers);

    const attempt = await prisma.$transaction(async (tx) => {
      const createdAttempt = await tx.examAttempt.create({
        data: {
          examId,
          totalScore: score,
          totalQuestions: total,
          finishedAt: new Date(),
        },
      });

      for (const item of answersDetail) {
        await tx.userAnswer.create({
          data: {
            attemptId: createdAttempt.id,
            questionId: item.questionId,
            selectedOptionId: item.selectedOptionId,
            isCorrect: item.isCorrect,
          },
        });
      }

      return createdAttempt;
    });

    safeRevalidatePath('/');
    safeRevalidatePath(`/exams/${examId}/results/${attempt.id}`);

    return { success: true, attemptId: attempt.id };
  } catch (error: unknown) {
    console.error('Erro ao submeter tentativa:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao processar respostas.',
    };
  }
}

/**
 * Obtém o resultado consolidado e revisão detalhada com gabarito comentado.
 */
export async function getAttemptResult(
  attemptId: string
): Promise<AttemptResultDetail | null> {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        select: {
          title: true,
        },
      },
      answers: {
        include: {
          question: {
            include: {
              options: {
                orderBy: { orderIndex: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  if (!attempt) return null;

  // Ordena as respostas de acordo com a ordem original das questões
  const sortedAnswers = attempt.answers.sort(
    (a, b) => a.question.orderIndex - b.question.orderIndex
  );

  const percentage =
    attempt.totalQuestions > 0
      ? Math.round((attempt.totalScore / attempt.totalQuestions) * 100)
      : 0;

  return {
    attemptId: attempt.id,
    examId: attempt.examId,
    examTitle: attempt.exam.title,
    totalScore: attempt.totalScore,
    totalQuestions: attempt.totalQuestions,
    percentage,
    finishedAt: attempt.finishedAt,
    questions: sortedAnswers.map((ans) => ({
      id: ans.question.id,
      statement: ans.question.statement,
      type: ans.question.type,
      explanation: ans.question.explanation,
      orderIndex: ans.question.orderIndex,
      selectedOptionId: ans.selectedOptionId,
      isCorrect: ans.isCorrect,
      options: ans.question.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect,
        orderIndex: opt.orderIndex,
      })),
    })),
  };
}
