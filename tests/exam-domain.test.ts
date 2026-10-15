import test from 'node:test';
import assert from 'node:assert/strict';
import {
  examSchema,
  parseBulkQuestions,
  calculateScore,
} from '../src/lib/validations/exam';

test('validates valid exam with multiple-choice and true-false questions', () => {
  const validData = {
    title: 'Simulado de Teste',
    category: 'TI',
    description: 'Descrição de teste',
    questions: [
      {
        statement: 'Quanto é 2 + 2?',
        type: 'MULTIPLE_CHOICE' as const,
        explanation: '2 + 2 é 4 pela aritmética básica',
        orderIndex: 0,
        options: [
          { text: '3', isCorrect: false, orderIndex: 0 },
          { text: '4', isCorrect: true, orderIndex: 1 },
          { text: '5', isCorrect: false, orderIndex: 2 },
        ],
      },
      {
        statement: 'A Terra é plana.',
        type: 'TRUE_FALSE' as const,
        explanation: 'A Terra é um esferoide oblato',
        orderIndex: 1,
        options: [
          { text: 'Certo', isCorrect: false, orderIndex: 0 },
          { text: 'Errado', isCorrect: true, orderIndex: 1 },
        ],
      },
    ],
  };

  const parsed = examSchema.safeParse(validData);
  assert.equal(parsed.success, true);
});

test('rejects question without exactly one correct option', () => {
  const invalidData = {
    title: 'Simulado Inválido',
    questions: [
      {
        statement: 'Questão sem resposta correta?',
        type: 'MULTIPLE_CHOICE' as const,
        orderIndex: 0,
        options: [
          { text: 'A', isCorrect: false, orderIndex: 0 },
          { text: 'B', isCorrect: false, orderIndex: 1 },
        ],
      },
    ],
  };

  const parsed = examSchema.safeParse(invalidData);
  assert.equal(parsed.success, false);
});

test('parses bulk questions JSON correctly, even with markdown codeblocks', () => {
  const jsonWithMarkdown = `\`\`\`json
  [
    {
      "statement": "Qual a capital do Brasil?",
      "type": "MULTIPLE_CHOICE",
      "explanation": "Brasília foi inaugurada em 1960",
      "options": [
        { "text": "Rio de Janeiro", "isCorrect": false },
        { "text": "Brasília", "isCorrect": true },
        { "text": "São Paulo", "isCorrect": false }
      ]
    }
  ]
  \`\`\``;

  const result = parseBulkQuestions(jsonWithMarkdown);
  assert.equal(result.success, true);
  assert.equal(result.questions?.length, 1);
  assert.equal(result.questions?.[0].statement, 'Qual a capital do Brasil?');
});

test('calculates score accurately and handles unanswered questions', () => {
  const questions = [
    {
      id: 'q1',
      options: [
        { id: 'opt1', isCorrect: true },
        { id: 'opt2', isCorrect: false },
      ],
    },
    {
      id: 'q2',
      options: [
        { id: 'opt3', isCorrect: false },
        { id: 'opt4', isCorrect: true },
      ],
    },
  ];

  // User answered q1 correctly, q2 left blank
  const userAnswers = {
    q1: 'opt1',
  };

  const { score, total, percentage } = calculateScore(questions, userAnswers);
  assert.equal(score, 1);
  assert.equal(total, 2);
  assert.equal(percentage, 50);
});
