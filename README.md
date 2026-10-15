# Sistema Pessoal de Simulados 📚

Sistema web moderno e monolítico construído com **Next.js (App Router)** e **Prisma ORM**, integrado a um banco de dados **PostgreSQL** rodando em container Docker. Desenvolvido para uso pessoal e estudos, sem necessidade de login.

---

## ✨ Principais Funcionalidades

- **Sem necessidade de Login**: Acesso imediato para focar 100% no estudo.
- **Dois Formatos de Questão Suportados**:
  - **Múltipla Escolha**: 4 a 5 alternativas com exatamente 1 correta.
  - **Certo / Errado (Estilo Cebraspe)**: Botões dedicados para julgamento rápido.
- **Gabarito Comentado**: Campo para justificativa e embasamento teórico de cada questão, exibido na tela de revisão pós-prova.
- **Importação Rápida em Lote (IA / ChatGPT)**:
  - Botão para copiar um **Prompt Modelo** pronto para colar no ChatGPT ou outra IA.
  - Validador em tempo real de JSON, aceitando código markdown colado diretamente (` ```json ... ``` `).
- **Ambiente de Prova Interativo**:
  - Barra de progresso dinâmica em tempo real.
  - Navegador rápido de questões (grade numérica) para saltar entre questões e ver pendências.
  - Modal de confirmação inteligente alertando caso haja questões sem resposta marcada.
- **Cálculo de Acertos & Revisão Detalhada**:
  - Placar geral com percentual de aproveitamento, total de acertos e erros.
  - Revisão questão a questão destacando:
    - Sua resposta em verde (se acertou) ou vermelho (se errou).
    - Alternativa correta destacada.
    - Comentário/justificativa pedagógica do gabarito.
- **Histórico**: Acompanhamento do último resultado de cada simulado no painel inicial.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Server Actions, React 19)
- **Linguagem**: TypeScript (Strict Mode)
- **Banco de Dados**: PostgreSQL 17 (via Docker na porta `5433`)
- **ORM**: [Prisma ORM](https://www.prisma.io/) (com migrações atômicas e client tipado)
- **Estilização**: Tailwind CSS v4
- **Ícones**: Lucide React
- **Validação**: Zod

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos

- **Node.js**: Versão `v24.21.0` (recomendado gerenciar via [NVM](https://github.com/nvm-sh/nvm))
- **Docker**: Docker Engine ou Docker Desktop

### 2. Subir o Banco de Dados PostgreSQL no Docker

O banco roda na porta `5433` mapeada para o host (evitando conflito com outros serviços postgres na porta padrão 5432):

```bash
# Iniciar o container PostgreSQL
npm run db:up

# Ou usando docker compose se preferir:
docker compose up -d
```

### 3. Configurar Node e Instalar Dependências

```bash
# Ativar versão correta do Node
nvm use 24.21.0

# Instalar dependências
npm install
```

### 4. Executar Migrações e Popular Simulado Inicial (Seed)

```bash
# Cria as tabelas no PostgreSQL
npx prisma migrate dev

# Popula um simulado modelo completo (Múltipla Escolha e Cebraspe com gabaritos comentados)
npm run db:seed
```

### 5. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🧪 Testes Automatizados

O projeto possui suíte de testes de unidade e integração cobrindo regras de validação, cálculos de pontuação, persistência atômica e exclusão em cascata:

```bash
npm test
```

---

## 📁 Estrutura de Diretórios

```text
simulados/
├── prisma/
│   ├── schema.prisma         # Modelagem relacional do banco de dados
│   ├── seed.ts               # Script para popular dados de demonstração
│   └── migrations/           # Histórico de migrações SQL
├── src/
│   ├── app/
│   │   ├── actions/          # Server Actions (CRUD, submissão de respostas, cálculos)
│   │   ├── exams/
│   │   │   ├── new/          # Criação de simulado
│   │   │   ├── [id]/edit/    # Edição de simulado existente
│   │   │   ├── [id]/play/    # Interface de realização da prova
│   │   │   └── [id]/results/ # Tela de placar de acertos e gabarito comentado
│   │   ├── layout.tsx        # Layout raiz com Navbar e tipografia
│   │   └── page.tsx          # Painel principal (dashboard)
│   ├── components/
│   │   ├── navbar.tsx        # Barra de navegação
│   │   ├── exam-card.tsx     # Cartão de simulado com ações e última pontuação
│   │   ├── exam-form/        # Formulário interativo e modal de importação em lote
│   │   ├── exam-player/      # Execução da prova e navegador de questões
│   │   └── exam-results/     # Placar e revisão comentada questão a questão
│   └── lib/
│       ├── prisma.ts         # Singleton do Prisma Client
│       ├── types.ts          # Tipos e DTOs TypeScript
│       └── validations/      # Schemas Zod e funções puras de pontuação
├── docker-compose.yml        # Configuração do PostgreSQL 17
├── .nvmrc                    # Versão obrigatória do Node (24.21.0)
└── tests/                    # Suíte de testes de integração e domínio
```

---

## 💡 Dica: Gerando Questões com ChatGPT

Ao criar ou editar um simulado, clique no botão **"Importar em Lote (JSON / IA)"**.  
Você pode clicar em **"Copiar Prompt para ChatGPT"** para gerar dezenas de questões formatadas automaticamente com justificativas prontas para colar no sistema.
