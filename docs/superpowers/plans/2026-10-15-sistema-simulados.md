# Implementação do Sistema Pessoal de Simulados

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um sistema monolítico pessoal em Next.js para criação, importação em lote, realização de simulados e conferência de acertos com gabarito comentado, utilizando PostgreSQL no Docker e Prisma ORM.

**Architecture:** Monólito fullstack Next.js com App Router e Server Actions. PostgreSQL em container Docker próprio (porta 5433). Prisma ORM para manipulação atômica de dados relacionais (Exam -> Question -> Option -> ExamAttempt -> UserAnswer). Tailwind CSS e Lucide Icons para interface responsiva e moderna.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, Prisma ORM, PostgreSQL 17 (Docker), Zod.

**Spec:** `docs/superpowers/specs/2026-10-15-sistema-simulados-design.md`

## Global Constraints

- Node.js version: v24.21.0 (obrigatório, usar `.nvmrc`).
- Banco de dados: PostgreSQL 17 via Docker na porta 5433.
- Sem sistema de login/autenticação.
- TypeScript estrito sem `any`.
- Validações de entrada com Zod.
- Transações atômicas para salvamento de simulados com questões.

## Review Focus

- Questão de múltipla escolha sem alternativa marcada como correta (deve ser bloqueada na validação).
- Importação de JSON malformado pelo usuário (deve exibir erro legível com dica de correção sem travar a interface).
- Simulado finalizado com questões em branco (deve registrar resposta nula e calcular acertos corretamente sem erros de divisão por zero).
- Questão do tipo Certo/Errado deve sempre conter exatamente duas opções padronizadas ("Certo" e "Errado").
- Exclusão em cascata: deletar um simulado deve limpar todas as questões, alternativas e tentativas associadas.

---

### Task 1: Configuração do Ambiente, Next.js e Docker Compose

**Files:**
- Create: `.nvmrc`
- Create: `docker-compose.yml`
- Create: `.env`
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`

**Interfaces:**
- Produces: Servidor Next.js configurado e container PostgreSQL rodando na porta 5433.

- [ ] **Step 1: Criar arquivo `.nvmrc` e `docker-compose.yml`**
  Configurar serviço postgres usando a imagem `postgres:17` mapeando porta `5433:5432`, credenciais `postgres:postgres`, database `simulados_db` e volume persistente.

- [ ] **Step 2: Inicializar projeto Next.js com TypeScript, Tailwind e App Router**
  Executar comando non-interactive de setup do Next.js no diretório atual com Node v24.21.0.

- [ ] **Step 3: Subir container Docker do PostgreSQL e verificar status**
  Executar `docker compose up -d` e verificar que o container está saudável e respondendo na porta 5433.

- [ ] **Step 4: Configurar `.env` com a DATABASE_URL**
  Definir `DATABASE_URL="postgresql://postgres:postgres@localhost:5433/simulados_db?schema=public"`.

- [ ] **Step 5: Commit**
  ```bash
  git add .nvmrc docker-compose.yml .env.example package.json ...
  git commit -m "chore: setup Next.js project and postgres docker-compose"
  ```

---

### Task 2: Modelagem de Dados, Prisma ORM e Seed

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Create: `prisma/seed.ts`
- Modify: `package.json` (adicionar script `prisma:seed`)

**Interfaces:**
- Produces: `prisma` client singleton exportado em `src/lib/prisma.ts`.
- Consumes: PostgreSQL via `DATABASE_URL`.

- [ ] **Step 1: Instalar dependências do Prisma**
  Instalar `prisma` como devDependency e `@prisma/client` como dependency.

- [ ] **Step 2: Definir schema do Prisma**
  Criar models `Exam`, `Question`, `Option`, `ExamAttempt`, `UserAnswer` e enum `QuestionType` (`MULTIPLE_CHOICE`, `TRUE_FALSE`) conforme especificação.

- [ ] **Step 3: Executar migração inicial do Prisma**
  Executar `npx prisma migrate dev --name init` para gerar as tabelas no PostgreSQL.

- [ ] **Step 4: Criar singleton do Prisma Client em `src/lib/prisma.ts`**
  Garantir instância única no ambiente de desenvolvimento do Next.js.

- [ ] **Step 5: Criar script de seed com simulado completo de exemplo**
  Inserir simulado com questões de múltipla escolha e estilo Cebraspe contendo enunciados, alternativas e explicações de gabarito. Executar `npx prisma db seed`.

- [ ] **Step 6: Commit**
  ```bash
  git add prisma/ src/lib/prisma.ts
  git commit -m "feat: setup prisma schema, migrations and initial seed"
  ```

---

### Task 3: Schemas Zod de Validação e Server Actions de Negócio

**Files:**
- Create: `src/lib/validations/exam.ts`
- Create: `src/app/actions/exam-actions.ts`
- Create: `src/lib/types.ts`

**Interfaces:**
- Produces:
  - `saveExamAction(data: ExamInput): Promise<{ success: boolean; examId?: string; error?: string }>`
  - `deleteExamAction(id: string): Promise<{ success: boolean; error?: string }>`
  - `submitExamAttemptAction(examId: string, answers: Record<string, string>): Promise<{ success: boolean; attemptId?: string; error?: string }>`
  - `parseBulkQuestions(rawText: string): { success: boolean; questions?: ParsedQuestion[]; error?: string }`

- [ ] **Step 1: Criar types e schemas Zod de validação em `src/lib/validations/exam.ts`**
  Validar título, tipo da questão, alternativas mínimas e presença obrigatória de exatamente 1 alternativa correta. Criar validador para formato JSON de importação em lote.

- [ ] **Step 2: Implementar Server Actions para CRUD de Simulado em `src/app/actions/exam-actions.ts`**
  Implementar `saveExamAction` utilizando `prisma.$transaction` para criar/atualizar questões e alternativas sem estados inconsistentes, e `deleteExamAction`.

- [ ] **Step 3: Implementar Server Action de Submissão e Cálculo de Acertos `submitExamAttemptAction`**
  Carregar as questões do simulado com as opções corretas, comparar cada resposta do usuário, calcular `totalScore`, criar `ExamAttempt` e `UserAnswer` no banco, e retornar o `attemptId`.

- [ ] **Step 4: Commit**
  ```bash
  git add src/lib/validations/ src/lib/types.ts src/app/actions/
  git commit -m "feat: add exam validation schemas and server actions"
  ```

---

### Task 4: Layout Global, Design System e Dashboard (`/`)

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/navbar.tsx`
- Create: `src/components/exam-card.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: Dashboard responsivo listando todos os simulados com métricas de desempenho e ações de criar, iniciar, editar e excluir.

- [ ] **Step 1: Configurar layout base e tipografia moderna**
  Atualizar `layout.tsx` com cabeçalho de navegação (`navbar.tsx`), suporte a tema visual limpo e moderno.

- [ ] **Step 2: Criar componente `ExamCard`**
  Exibir título, badge de categoria, total de questões, dados da última tentativa (acertos, percentual e data) e botões de ação ("Iniciar", "Editar", "Excluir").

- [ ] **Step 3: Montar página principal `src/app/page.tsx`**
  Buscar simulados com suas tentativas via Server Component, exibir painel de estatísticas gerais e grade de cards com estado de lista vazia amigável.

- [ ] **Step 4: Commit**
  ```bash
  git add src/app/layout.tsx src/app/page.tsx src/components/
  git commit -m "feat: implement main layout and exams dashboard"
  ```

---

### Task 5: Formulário de Criação/Edição e Importador em Lote

**Files:**
- Create: `src/components/exam-form/exam-form.tsx`
- Create: `src/components/exam-form/question-item.tsx`
- Create: `src/components/exam-form/bulk-import-modal.tsx`
- Create: `src/app/exams/new/page.tsx`
- Create: `src/app/exams/[id]/edit/page.tsx`

**Interfaces:**
- Produces: Interface completa para cadastro manual de questões e importação em lote com pré-visualização.

- [ ] **Step 1: Criar componente de edição de questão individual `QuestionItem`**
  Permitir alternar entre Múltipla Escolha e Certo/Errado, editar texto do enunciado, adicionar/remover alternativas, selecionar a correta e preencher a explicação da resposta.

- [ ] **Step 2: Criar componente de Importação em Lote `BulkImportModal`**
  Interface com área de texto, botão "Carregar Exemplo de Prompt para ChatGPT", validação em tempo real e botão para mesclar questões no formulário.

- [ ] **Step 3: Criar formulário principal `ExamForm`**
  Gerenciar estado do formulário, validações pré-envio, salvar via `saveExamAction` e redirecionar para a dashboard.

- [ ] **Step 4: Criar páginas `/exams/new` e `/exams/[id]/edit`**
  Integrar formulário em modo criação e modo edição carregando dados existentes do banco.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/exam-form/ src/app/exams/
  git commit -m "feat: add exam editor and bulk question importer"
  ```

---

### Task 6: Fluxo de Realização do Simulado (`/exams/[id]/play`)

**Files:**
- Create: `src/components/exam-player/exam-player.tsx`
- Create: `src/components/exam-player/question-nav.tsx`
- Create: `src/app/exams/[id]/play/page.tsx`

**Interfaces:**
- Produces: Interface de prova interativa com navegação, seleção de alternativas e submissão com cálculo de acertos.

- [ ] **Step 1: Criar navegação rápida entre questões `QuestionNav`**
  Grade de botões numéricos com status visual (respondida, atual, em branco).

- [ ] **Step 2: Criar componente interativo `ExamPlayer`**
  Gerenciar estado das respostas selecionadas, navegação Próxima/Anterior, seleção de alternativa e modal de confirmação ao clicar em "Finalizar Simulado".

- [ ] **Step 3: Conectar submissão ao `submitExamAttemptAction`**
  Enviar respostas, aguardar resultado e redirecionar para `/exams/[id]/results/[attemptId]`.

- [ ] **Step 4: Montar página `/exams/[id]/play/page.tsx`**
  Carregar simulado e questões via Server Component garantindo que o gabarito não seja exposto no HTML do player.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/exam-player/ src/app/exams/[id]/play/
  git commit -m "feat: implement interactive exam player and submission flow"
  ```

---

### Task 7: Tela de Resultados, Estatísticas e Gabarito Comentado (`/exams/[id]/results/[attemptId]`)

**Files:**
- Create: `src/components/exam-results/score-header.tsx`
- Create: `src/components/exam-results/review-question-card.tsx`
- Create: `src/app/exams/[id]/results/[attemptId]/page.tsx`

**Interfaces:**
- Produces: Tela de resultado com percentual de acerto, resumo quantitativo e revisão comentada questão a questão.

- [ ] **Step 1: Criar cabeçalho de pontuação `ScoreHeader`**
  Apresentar porcentagem de acertos, total de acertos/erros, tempo de realização e badge de classificação de desempenho.

- [ ] **Step 2: Criar card de revisão de questão `ReviewQuestionCard`**
  Exibir enunciado, alternativa escolhida pelo usuário, alternativa correta (verde), alternativa incorreta (vermelho) e card destacado com o comentário/justificativa do gabarito.

- [ ] **Step 3: Montar página `/exams/[id]/results/[attemptId]/page.tsx`**
  Buscar tentativa e respostas do banco e renderizar a revisão completa com botões "Refazer Simulado" e "Voltar ao Início".

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/exam-results/ src/app/exams/[id]/results/
  git commit -m "feat: implement score results and reviewed answer explanation"
  ```

---

### Task 8: Verificação Ponta a Ponta, Build e Testes Manuais

**Files:**
- Modify: `README.md`

**Interfaces:**
- Produces: Aplicação 100% funcional, build verificado e documentação de uso e comandos Docker.

- [ ] **Step 1: Executar `npm run build`**
  Validar ausência de erros de compilação TypeScript e ESLint.

- [ ] **Step 2: Testar o ciclo completo do usuário via navegador/ferramentas**
  - Carregar o simulado seed inicial.
  - Criar um novo simulado manual com 1 questão múltipla escolha e 1 Certo/Errado.
  - Testar importador JSON em lote.
  - Responder ao simulado com acertos e erros intencionais.
  - Validar pontuação exata na tela de resultados e visualização das justificativas.

- [ ] **Step 3: Documentar execução no `README.md`**
  Adicionar instruções passo a passo para subir o docker, rodar migrações e iniciar a aplicação.

- [ ] **Step 4: Commit final**
  ```bash
  git add README.md
  git commit -m "docs: add instructions and complete exam simulator implementation"
  ```
