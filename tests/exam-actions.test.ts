import test from 'node:test';
import assert from 'node:assert/strict';
import {
  saveExamAction,
  submitExamAttemptAction,
  getAttemptResult,
  deleteExamAction,
} from '../src/app/actions/exam-actions';
import { prisma } from '../src/lib/prisma';

test('Integration: creates exam, executes attempt, calculates score and cleans up', async () => {
  // 1. Create an exam
  const examInput = {
    title: 'Simulado de Integração',
    category: 'Testes',
    description: 'Teste automatizado de ponta a ponta',
    questions: [
      {
        statement: 'Qual o valor da constante PI aproximado?',
        type: 'MULTIPLE_CHOICE' as const,
        explanation: 'PI é aproximadamente 3.14159...',
        orderIndex: 0,
        options: [
          { text: '3.14', isCorrect: true, orderIndex: 0 },
          { text: '2.71', isCorrect: false, orderIndex: 1 },
        ],
      },
      {
        statement: 'O sol gira em torno da Terra.',
        type: 'TRUE_FALSE' as const,
        explanation: 'O modelo aceito é o heliocêntrico.',
        orderIndex: 1,
        options: [
          { text: 'Certo', isCorrect: false, orderIndex: 0 },
          { text: 'Errado', isCorrect: true, orderIndex: 1 },
        ],
      },
    ],
  };

  const createRes = await saveExamAction(examInput);
  assert.equal(createRes.success, true);
  assert.ok(createRes.examId);
  const examId = createRes.examId;

  // 2. Fetch created exam to get generated option IDs
  const examDb = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: { include: { options: true } } },
  });
  assert.ok(examDb);
  assert.equal(examDb.questions.length, 2);

  const q1 = examDb.questions.find((q) => q.statement.includes('PI'))!;
  const q2 = examDb.questions.find((q) => q.statement.includes('sol'))!;

  const q1CorrectOpt = q1.options.find((o) => o.isCorrect)!;
  const q2IncorrectOpt = q2.options.find((o) => !o.isCorrect)!;

  // 3. Submit attempt: 1 correct answer (q1), 1 incorrect answer (q2) -> 1 of 2 = 50%
  const submitRes = await submitExamAttemptAction(examId, {
    [q1.id]: q1CorrectOpt.id,
    [q2.id]: q2IncorrectOpt.id,
  });
  assert.equal(submitRes.success, true);
  assert.ok(submitRes.attemptId);

  // 4. Verify result details
  const result = await getAttemptResult(submitRes.attemptId);
  assert.ok(result);
  assert.equal(result.totalScore, 1);
  assert.equal(result.totalQuestions, 2);
  assert.equal(result.percentage, 50);
  assert.equal(result.questions.length, 2);

  // Verify explanation is present
  const resQ1 = result.questions.find((q) => q.id === q1.id)!;
  assert.equal(resQ1.isCorrect, true);
  assert.equal(resQ1.explanation, 'PI é aproximadamente 3.14159...');

  const resQ2 = result.questions.find((q) => q.id === q2.id)!;
  assert.equal(resQ2.isCorrect, false);

  // 5. Clean up
  const deleteRes = await deleteExamAction(examId);
  assert.equal(deleteRes.success, true);

  const deletedExam = await prisma.exam.findUnique({ where: { id: examId } });
  assert.equal(deletedExam, null);
});

test('Integration: Question Bank - takes a subset of questions (e.g. 2 out of 4) and scores against the subset', async () => {
  const examInput = {
    title: 'Banco de 4 Questões',
    category: 'Matemática',
    description: 'Banco com várias questões para testar subconjuntos',
    questions: [
      {
        statement: 'Quanto é 1 + 1?',
        type: 'MULTIPLE_CHOICE' as const,
        explanation: '1+1=2',
        orderIndex: 0,
        options: [
          { text: '2', isCorrect: true, orderIndex: 0 },
          { text: '3', isCorrect: false, orderIndex: 1 },
        ],
      },
      {
        statement: 'Quanto é 2 + 2?',
        type: 'MULTIPLE_CHOICE' as const,
        explanation: '2+2=4',
        orderIndex: 1,
        options: [
          { text: '4', isCorrect: true, orderIndex: 0 },
          { text: '5', isCorrect: false, orderIndex: 1 },
        ],
      },
      {
        statement: 'Quanto é 3 + 3?',
        type: 'MULTIPLE_CHOICE' as const,
        explanation: '3+3=6',
        orderIndex: 2,
        options: [
          { text: '6', isCorrect: true, orderIndex: 0 },
          { text: '7', isCorrect: false, orderIndex: 1 },
        ],
      },
      {
        statement: 'Quanto é 4 + 4?',
        type: 'MULTIPLE_CHOICE' as const,
        explanation: '4+4=8',
        orderIndex: 3,
        options: [
          { text: '8', isCorrect: true, orderIndex: 0 },
          { text: '9', isCorrect: false, orderIndex: 1 },
        ],
      },
    ],
  };

  const createRes = await saveExamAction(examInput);
  assert.equal(createRes.success, true);
  const examId = createRes.examId!;

  // Import getExamForPlay dynamically to test option subset
  const { getExamForPlay } = await import('../src/app/actions/exam-actions');
  const playData = await getExamForPlay(examId, { limit: 2, shuffle: false });
  assert.ok(playData);
  assert.equal(playData.questions.length, 2, 'Should only return 2 questions out of 4');

  const selectedQIds = playData.questions.map((q) => q.id);

  // Fetch full details of these 2 questions to get correct option ids
  const examDb = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: { include: { options: true } } },
  });

  const answers: Record<string, string> = {};
  for (const qId of selectedQIds) {
    const fullQ = examDb!.questions.find((q) => q.id === qId)!;
    const correctOpt = fullQ.options.find((o) => o.isCorrect)!;
    answers[qId] = correctOpt.id;
  }

  // Submit attempt passing selectedQIds
  const submitRes = await submitExamAttemptAction(examId, answers, selectedQIds);
  assert.equal(submitRes.success, true);

  const result = await getAttemptResult(submitRes.attemptId!);
  assert.ok(result);
  assert.equal(result.totalQuestions, 2, 'Total questions evaluated must be 2, not 4');
  assert.equal(result.totalScore, 2, 'Score must be 2');
  assert.equal(result.percentage, 100, 'Percentage must be 100%');

  await deleteExamAction(examId);
});
