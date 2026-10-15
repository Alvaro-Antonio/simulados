import { z } from 'zod';

export const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'O texto da alternativa não pode ficar vazio.'),
  isCorrect: z.boolean().default(false),
  orderIndex: z.number().int().default(0),
});

export const questionSchema = z
  .object({
    id: z.string().optional(),
    statement: z.string().min(3, 'O enunciado deve ter pelo menos 3 caracteres.'),
    type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE']).default('MULTIPLE_CHOICE'),
    explanation: z.string().optional().nullable(),
    orderIndex: z.number().int().default(0),
    options: z.array(optionSchema),
  })
  .superRefine((val, ctx) => {
    const correctCount = val.options.filter((opt) => opt.isCorrect).length;

    if (val.type === 'MULTIPLE_CHOICE') {
      if (val.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Questões de múltipla escolha devem ter no mínimo 2 alternativas.',
          path: ['options'],
        });
      }
      if (correctCount !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Você deve marcar exatamente 1 alternativa correta.',
          path: ['options'],
        });
      }
    } else if (val.type === 'TRUE_FALSE') {
      if (val.options.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Questões de Certo/Errado devem ter exatamente 2 opções.',
          path: ['options'],
        });
      }
      if (correctCount !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Você deve selecionar se o gabarito é Certo ou Errado.',
          path: ['options'],
        });
      }
    }
  });

export const examSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'O título do simulado deve ter pelo menos 3 caracteres.'),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  questions: z.array(questionSchema).min(1, 'O simulado deve conter pelo menos 1 questão.'),
});

export type ExamInput = z.infer<typeof examSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type OptionInput = z.infer<typeof optionSchema>;

export interface ParsedBulkQuestion {
  statement: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  explanation?: string | null;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}

/**
 * Faz o parse e sanitização de texto em lote (JSON) colado pelo usuário.
 * Remove blocos de código markdown (```json ... ```) se existirem.
 */
export function parseBulkQuestions(rawText: string): {
  success: boolean;
  questions?: ParsedBulkQuestion[];
  error?: string;
} {
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) {
      return {
        success: false,
        error: 'O formato esperado é uma lista (array) de questões.',
      };
    }

    const bulkItemSchema = z.object({
      statement: z.string().min(3, 'Enunciado muito curto.'),
      type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE']).optional().default('MULTIPLE_CHOICE'),
      explanation: z.string().optional().nullable(),
      options: z
        .array(
          z.object({
            text: z.string().min(1, 'Texto da alternativa obrigatório.'),
            isCorrect: z.boolean().default(false),
          })
        )
        .min(2, 'Cada questão deve ter pelo menos 2 alternativas.'),
    });

    const validated: ParsedBulkQuestion[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      const result = bulkItemSchema.safeParse(item);
      if (!result.success) {
        return {
          success: false,
          error: `Erro na questão #${i + 1}: ${result.error.issues[0]?.message || 'Formato inválido'}`,
        };
      }

      const q = result.data;
      const correctCount = q.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        return {
          success: false,
          error: `Questão #${i + 1} ("${q.statement.slice(0, 30)}..."): deve ter exatamente 1 alternativa com isCorrect: true. Encontrado: ${correctCount}.`,
        };
      }

      validated.push({
        statement: q.statement,
        type: q.type,
        explanation: q.explanation ?? null,
        options: q.options,
      });
    }

    return {
      success: true,
      questions: validated,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar JSON';
    return {
      success: false,
      error: `JSON mal formatado: ${message}`,
    };
  }
}

/**
 * Calcula pontuação e percentual de acertos comparando respostas com o gabarito.
 */
export function calculateScore(
  questions: {
    id: string;
    options: { id: string; isCorrect: boolean }[];
  }[],
  userAnswers: Record<string, string> // questionId -> selectedOptionId
): {
  score: number;
  total: number;
  percentage: number;
  answersDetail: {
    questionId: string;
    selectedOptionId: string | null;
    isCorrect: boolean;
  }[];
} {
  let score = 0;
  const total = questions.length;
  const answersDetail: {
    questionId: string;
    selectedOptionId: string | null;
    isCorrect: boolean;
  }[] = [];

  for (const q of questions) {
    const selectedOptionId = userAnswers[q.id] || null;
    let isCorrect = false;

    if (selectedOptionId) {
      const option = q.options.find((opt) => opt.id === selectedOptionId);
      if (option && option.isCorrect) {
        isCorrect = true;
        score += 1;
      }
    }

    answersDetail.push({
      questionId: q.id,
      selectedOptionId,
      isCorrect,
    });
  }

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return {
    score,
    total,
    percentage,
    answersDetail,
  };
}
