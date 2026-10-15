# Especificação de Design: Sistema Pessoal de Simulados

**Data:** 15 de Outubro de 2026  
**Status:** Aprovado  
**Objetivo:** Sistema web monolítico em Next.js para gerenciamento e realização de simulados de estudo pessoal, com cálculo automático de acertos, revisão de gabarito comentado, sem autenticação, e persistência em banco de dados PostgreSQL via Docker.

---

## 1. Arquitetura Geral

- **Framework**: Next.js 15+ (App Router, Server Actions, React 19).
- **Linguagem**: TypeScript com tipagem estrita.
- **Banco de Dados**: PostgreSQL 17 rodando em container Docker dedicado.
- **ORM**: Prisma ORM para modelagem, migrações e client tipado.
- **Estilização**: Tailwind CSS com componentes modernos e responsivos.
- **Ícones**: Lucide React.
- **Ambiente de Execução**: Node.js v24.21.0 (gerenciado via NVM).

---

## 2. Infraestrutura Docker

Arquivo `docker-compose.yml` na raiz do projeto:
- Imagem: `postgres:17` (já existente localmente).
- Porta: Host `5433` -> Container `5432`.
- Banco: `simulados_db`.
- Usuário / Senha: `postgres` / `postgres`.
- Volume: `postgres_simulados_data` para persistência dos dados.
- URL de Conexão no `.env`:
  `DATABASE_URL="postgresql://postgres:postgres@localhost:5433/simulados_db?schema=public"`

---

## 3. Modelo de Dados (Prisma Schema)

### Entidades

1. **Exam (Simulado)**:
   - `id`: UUID (chave primária).
   - `title`: String (obrigatório).
   - `description`: String (opcional).
   - `category`: String (opcional, ex: "Direito", "TI", "Geral").
   - `createdAt`, `updatedAt`: Timestamps.
   - Relações: `questions` (1:N), `attempts` (1:N).

2. **Question (Questão)**:
   - `id`: UUID (chave primária).
   - `examId`: UUID (chave estrangeira para Exam com `onDelete: Cascade`).
   - `type`: Enum `MULTIPLE_CHOICE` | `TRUE_FALSE`.
   - `statement`: String (enunciado).
   - `explanation`: String (justificativa/comentário pedagógico do gabarito).
   - `orderIndex`: Inteiro (ordenação sequencial).
   - Relações: `options` (1:N), `answers` (1:N).

3. **Option (Alternativa)**:
   - `id`: UUID (chave primária).
   - `questionId`: UUID (chave estrangeira para Question com `onDelete: Cascade`).
   - `text`: String (texto da opção).
   - `isCorrect`: Boolean (indica se é a alternativa correta).
   - `orderIndex`: Inteiro.

4. **ExamAttempt (Tentativa / Resolução)**:
   - `id`: UUID (chave primária).
   - `examId`: UUID (chave estrangeira para Exam).
   - `startedAt`: Timestamp.
   - `finishedAt`: Timestamp (opcional).
   - `totalScore`: Inteiro (total de acertos).
   - `totalQuestions`: Inteiro (total de questões respondidas/avaliadas).
   - Relações: `answers` (1:N).

5. **UserAnswer (Resposta Fornecida)**:
   - `id`: UUID (chave primária).
   - `attemptId`: UUID (chave estrangeira para ExamAttempt com `onDelete: Cascade`).
   - `questionId`: UUID (chave estrangeira para Question).
   - `selectedOptionId`: UUID (chave estrangeira opcional para Option).
   - `isCorrect`: Boolean (calculado no momento da submissão).

---

## 4. Telas e Fluxos de Usuário

### 4.1. Dashboard / Listagem (`/`)
- Listagem dos simulados cadastrados em cartões informativos:
  - Título, Categoria, Quantidade de questões.
  - Histórico de tentativas: data da última realização, pontuação e porcentagem de acertos.
- Ações:
  - **Iniciar Simulado**: abre o fluxo de resolução (`/exams/[id]/play`).
  - **Editar**: permite adicionar/modificar questões (`/exams/[id]/edit`).
  - **Excluir**: remove o simulado com confirmação.
  - **Novo Simulado**: botão em destaque para criar (`/exams/new`).

### 4.2. Criação e Edição de Simulado (`/exams/new` e `/exams/[id]/edit`)
- Campos gerais: Título, Descrição, Categoria.
- Alternância entre dois modos de inserção:
  1. **Modo Visual (Interativo)**:
     - Adição manual de questões uma a uma.
     - Seleção de tipo: Múltipla Escolha (4-5 opções) ou Certo/Errado (geração automática de 2 botões).
     - Marcação da alternativa correta com radio button.
     - Campo de justificativa/explicação do gabarito.
  2. **Modo Importação em Lote (JSON / Prompt)**:
     - Editor de texto com validador de sintaxe.
     - Botão "Carregar Exemplo de Prompt" pronto para copiar e colar em IAs como ChatGPT gerando o JSON de questões.
     - Botão "Validar e Preencher", convertendo o lote diretamente em questões da prova.

### 4.3. Realização do Simulado (`/exams/[id]/play`)
- Interface limpa e focada no estudo:
  - Cabeçalho com título do simulado, progresso atual ("Questão X de Y") e barra de progresso visual.
  - Enunciado claro com tipografia legível.
  - Alternativas com estados interativos (selecionado, foco, hover).
  - Navegador rápido de questões (grade com números para pular direto para qualquer questão e ver quais já foram marcadas).
  - Botão "Finalizar Simulado" com modal de confirmação indicando se há questões pendentes.

### 4.4. Resultado e Revisão Comentada (`/exams/[id]/results/[attemptId]`)
- **Placar Geral de Desempenho**:
  - Destaque para porcentagem de acerto (ex: "85% de Aproveitamento").
  - Métricas: Total de Questões, Acertos, Erros e Tempo gasto (se aplicável).
  - Indicador visual (verde para >= 70%, amarelo para 50-69%, vermelho para < 50%).
- **Revisão Detalhada Questão a Questão**:
  - Exibição de cada questão respondida.
  - Indicação clara:
    - Alternativa que o usuário marcou.
    - Alternativa correta destacada em verde.
    - Se errou, a opção marcada fica destacada em vermelho.
  - Bloco de **Justificativa / Comentário da Resposta** exibido com destaque didático.
- **Ações Finais**:
  - "Refazer Simulado" (inicia nova tentativa limpa).
  - "Voltar ao Início".

---

## 5. Regras de Negócio e Validações

1. **Validação de Questão**:
   - Para `MULTIPLE_CHOICE`: mínimo de 2 alternativas, máximo recomendado de 5; exatamente 1 deve ser marcada como correta.
   - Para `TRUE_FALSE`: opções "Certo" e "Errado", exatamente 1 correta.
2. **Cálculo de Pontuação**:
   - `totalScore` = soma das respostas onde `isCorrect == true`.
   - Porcentagem calculada como `(totalScore / totalQuestions) * 100`.
3. **Persistência Segura**:
   - Transação atômica (`prisma.$transaction`) ao salvar simulados com questões e alternativas, impedindo dados órfãos.

---

## 6. Estratégia de Verificação e Testes

1. Subir container Docker com `docker compose up -d` e verificar saúde da conexão.
2. Rodar migrações Prisma (`npx prisma migrate dev`).
3. Executar seed com simulado completo de demonstração.
4. Executar `npm run build` garantindo zero erros de tipagem TypeScript.
5. Testar ponta a ponta:
   - Acesso à dashboard e visualização do simulado seed.
   - Criação de novo simulado via modo visual e via importador JSON.
   - Execução completa do simulado marcando respostas certas e erradas.
   - Validação da precisão da pontuação e conferência da exibição dos comentários explicativos.
