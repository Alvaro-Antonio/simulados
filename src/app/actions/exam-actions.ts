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
export async function getExams(folderId?: string): Promise<ExamSummaryItem[]> {
  const whereClause = folderId !== undefined ? { folderId } : {};

  const exams = await prisma.exam.findMany({
    where: whereClause,
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      folder: {
        select: {
          name: true,
        },
      },
      _count: {
        select: { questions: true },
      },
      attempts: {
        orderBy: { startedAt: 'desc' },
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
    const attempts = exam.attempts;
    const attemptsCount = attempts.length;

    let averagePercentage: number | null = null;
    if (attemptsCount > 0) {
      const sumPercentages = attempts.reduce((sum, att) => {
        const pct =
          att.totalQuestions > 0
            ? (att.totalScore / att.totalQuestions) * 100
            : 0;
        return sum + pct;
      }, 0);
      averagePercentage = Math.round(sumPercentages / attemptsCount);
    }

    const latest = attempts[0];
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
      folderId: exam.folderId,
      folderName: exam.folder?.name ?? null,
      isPinned: exam.isPinned,
      icon: exam.icon,
      imageUrl: exam.imageUrl,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
      questionCount: exam._count.questions,
      attemptsCount,
      averagePercentage,
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
 * Embaralha um array usando o algoritmo Fisher-Yates.
 */
function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Obtém dados para realização do simulado (omitindo isCorrect das opções para segurança).
 * Permite limitar a quantidade de questões do banco e embaralhar opcionalmente.
 */
export async function getExamForPlay(
  id: string,
  options?: { limit?: number; shuffle?: boolean }
) {
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

  if (!exam) return null;

  let selectedQuestions = [...exam.questions];

  if (options?.shuffle) {
    selectedQuestions = shuffleArray(selectedQuestions);
  }

  if (options?.limit && options.limit > 0 && options.limit < selectedQuestions.length) {
    selectedQuestions = selectedQuestions.slice(0, options.limit);
  }

  selectedQuestions = selectedQuestions.map((q, idx) => ({
    ...q,
    orderIndex: idx,
  }));

  return {
    ...exam,
    totalBankQuestions: exam.questions.length,
    questions: selectedQuestions,
  };
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

    const { title, description, category, folderId, isPinned, icon, imageUrl, questions } = validated.data;

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
            folderId: folderId ?? null,
            isPinned: isPinned ?? false,
            icon: icon ?? null,
            imageUrl: imageUrl ?? null,
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
            folderId: folderId ?? null,
            isPinned: isPinned ?? false,
            icon: icon ?? null,
            imageUrl: imageUrl ?? null,
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
  answers: Record<string, string>, // questionId -> selectedOptionId
  questionIds?: string[],
  durationSeconds?: number
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

    let questionsToEvaluate = exam.questions;
    if (questionIds && questionIds.length > 0) {
      questionsToEvaluate = questionIds
        .map((id) => exam.questions.find((q) => q.id === id))
        .filter((q): q is (typeof exam.questions)[number] => q !== undefined);
    }

    const { score, total, answersDetail } = calculateScore(questionsToEvaluate, answers);

    const attempt = await prisma.$transaction(async (tx) => {
      const finishedAt = new Date();
      const startedAt =
        typeof durationSeconds === 'number' && durationSeconds >= 0
          ? new Date(finishedAt.getTime() - durationSeconds * 1000)
          : new Date();

      const createdAttempt = await tx.examAttempt.create({
        data: {
          examId,
          totalScore: score,
          totalQuestions: total,
          startedAt,
          finishedAt,
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

  let durationSeconds: number | undefined;
  if (attempt.finishedAt && attempt.startedAt) {
    durationSeconds = Math.max(
      0,
      Math.round(
        (attempt.finishedAt.getTime() - attempt.startedAt.getTime()) / 1000
      )
    );
  }

  return {
    attemptId: attempt.id,
    examId: attempt.examId,
    examTitle: attempt.exam.title,
    totalScore: attempt.totalScore,
    totalQuestions: attempt.totalQuestions,
    percentage,
    finishedAt: attempt.finishedAt,
    durationSeconds,
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

/**
 * Pastas: Listar todas as pastas com contagem de simulados
 */
export async function getFolders() {
  const folders = await prisma.folder.findMany({
    orderBy: [
      { isPinned: 'desc' },
      { name: 'asc' },
    ],
    include: {
      _count: {
        select: { exams: true },
      },
    },
  });

  return folders.map((f) => ({
    id: f.id,
    name: f.name,
    color: f.color,
    icon: f.icon,
    isPinned: f.isPinned,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
    examCount: f._count.exams,
  }));
}

/**
 * Pastas: Criar ou editar pasta
 */
export async function saveFolderAction(data: {
  id?: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  isPinned?: boolean;
}) {
  try {
    if (!data.name || data.name.trim().length < 2) {
      return { success: false, error: 'O nome da pasta deve ter pelo menos 2 caracteres.' };
    }

    if (data.id) {
      const updated = await prisma.folder.update({
        where: { id: data.id },
        data: {
          name: data.name.trim(),
          color: data.color ?? null,
          icon: data.icon ?? null,
          isPinned: data.isPinned ?? false,
        },
      });
      safeRevalidatePath('/');
      return { success: true, folder: updated };
    } else {
      const created = await prisma.folder.create({
        data: {
          name: data.name.trim(),
          color: data.color ?? null,
          icon: data.icon ?? null,
          isPinned: data.isPinned ?? false,
        },
      });
      safeRevalidatePath('/');
      return { success: true, folder: created };
    }
  } catch (error: unknown) {
    console.error('Erro ao salvar pasta:', error);
    return { success: false, error: 'Erro ao salvar a pasta no banco de dados.' };
  }
}

/**
 * Pastas: Excluir pasta (os simulados pertencentes passam a ter folderId null)
 */
export async function deleteFolderAction(folderId: string) {
  try {
    await prisma.folder.delete({
      where: { id: folderId },
    });
    safeRevalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao excluir pasta:', error);
    return { success: false, error: 'Não foi possível excluir a pasta.' };
  }
}

/**
 * Alterna estado de fixado de um simulado no topo
 */
export async function togglePinExamAction(examId: string) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { isPinned: true },
    });
    if (!exam) return { success: false, error: 'Simulado não encontrado' };

    const updated = await prisma.exam.update({
      where: { id: examId },
      data: { isPinned: !exam.isPinned },
    });
    safeRevalidatePath('/');
    return { success: true, isPinned: updated.isPinned };
  } catch (error: unknown) {
    console.error('Erro ao fixar/desafixar simulado:', error);
    return { success: false, error: 'Erro ao alterar fixação do simulado.' };
  }
}

/**
 * Alterna estado de fixado de uma pasta no topo
 */
export async function togglePinFolderAction(folderId: string) {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      select: { isPinned: true },
    });
    if (!folder) return { success: false, error: 'Pasta não encontrada' };

    const updated = await prisma.folder.update({
      where: { id: folderId },
      data: { isPinned: !folder.isPinned },
    });
    safeRevalidatePath('/');
    return { success: true, isPinned: updated.isPinned };
  } catch (error: unknown) {
    console.error('Erro ao fixar/desafixar pasta:', error);
    return { success: false, error: 'Erro ao alterar fixação da pasta.' };
  }
}

/**
 * Move um simulado para dentro de uma pasta (ou remove da pasta)
 */
export async function moveExamToFolderAction(examId: string, folderId: string | null) {
  try {
    await prisma.exam.update({
      where: { id: examId },
      data: { folderId },
    });
    safeRevalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao mover simulado para pasta:', error);
    return { success: false, error: 'Erro ao mover simulado.' };
  }
}

