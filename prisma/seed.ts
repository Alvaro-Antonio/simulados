import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Populando banco de dados com simulado de exemplo...');

  // Limpa registros anteriores para permitir re-execução do seed
  await prisma.exam.deleteMany();

  const demoExam = await prisma.exam.create({
    data: {
      title: 'Simulado Modelo: Conhecimentos Gerais e Constitucional',
      category: 'Direito & Atualidades',
      description:
        'Simulado completo com questões de Múltipla Escolha e Certo/Errado (Cebraspe) com justificativas comentadas de gabarito.',
      questions: {
        create: [
          {
            statement:
              'De acordo com a Constituição Federal de 1988, qual das seguintes alternativas NÃO constitui um fundamento da República Federativa do Brasil?',
            type: QuestionType.MULTIPLE_CHOICE,
            explanation:
              'Art. 1º da CF/88: São fundamentos da República: a soberania, a cidadania, a dignidade da pessoa humana, os valores sociais do trabalho e da livre iniciativa, e o pluralismo político (mnemônico SO-CI-DI-VA-PLU). A erradicação da pobreza é um objetivo fundamental (Art. 3º, III), e não um fundamento.',
            orderIndex: 0,
            options: {
              create: [
                { text: 'A soberania', isCorrect: false, orderIndex: 0 },
                { text: 'A cidadania', isCorrect: false, orderIndex: 1 },
                { text: 'A erradicação da pobreza e da marginalização', isCorrect: true, orderIndex: 2 },
                { text: 'A dignidade da pessoa humana', isCorrect: false, orderIndex: 3 },
                { text: 'O pluralismo político', isCorrect: false, orderIndex: 4 },
              ],
            },
          },
          {
            statement:
              '(Cebraspe) Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos da Constituição.',
            type: QuestionType.TRUE_FALSE,
            explanation:
              'Correto. Trata-se da redação literal do parágrafo único do art. 1º da Constituição Federal de 1988, que consagra o princípio democrático e a soberania popular.',
            orderIndex: 1,
            options: {
              create: [
                { text: 'Certo', isCorrect: true, orderIndex: 0 },
                { text: 'Errado', isCorrect: false, orderIndex: 1 },
              ],
            },
          },
          {
            statement:
              'No âmbito da arquitetura de sistemas web modernos, qual é a principal vantagem de uma abordagem monolítica modular quando comparada a microserviços prematuros?',
            type: QuestionType.MULTIPLE_CHOICE,
            explanation:
              'Monólitos modulares simplificam enormemente o deploy, reduzem a complexidade de rede e orquestração, mantêm transações de banco de dados simples (ACID nativo) e aceleram a iteração de produto em estágios iniciais.',
            orderIndex: 2,
            options: {
              create: [
                { text: 'Menor latência distribuída e facilidade de deploy e transações atômicas locais', isCorrect: true, orderIndex: 0 },
                { text: 'Necessidade obrigatória de Kubernetes em múltiplos clusters', isCorrect: false, orderIndex: 1 },
                { text: 'Impossibilidade de utilizar banco de dados relacional', isCorrect: false, orderIndex: 2 },
                { text: 'Separação física obrigatória de repositórios para cada módulo', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            statement:
              '(Cebraspe) É livre a manifestação do pensamento, sendo expressamente permitido o anonimato em matérias jornalísticas e opinativas.',
            type: QuestionType.TRUE_FALSE,
            explanation:
              'Errado. O Art. 5º, inciso IV da CF/88 estabelece: "é livre a manifestação do pensamento, sendo VEDADO o anonimato".',
            orderIndex: 3,
            options: {
              create: [
                { text: 'Certo', isCorrect: false, orderIndex: 0 },
                { text: 'Errado', isCorrect: true, orderIndex: 1 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`Simulado de exemplo criado com sucesso! ID: ${demoExam.id}`);
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
