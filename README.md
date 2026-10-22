# Sistema Pessoal de Simulados 📚📱

> 🤖 **Desenvolvimento com Agente de IA:**  
> Esta aplicação (Web Full-Stack e Aplicativo Mobile Flutter) foi concebida, arquitetada, desenvolvida e iterada com o suporte integral de um **Agente Autônomo de Inteligência Artificial** ([Antigravity](https://deepmind.google/)). Toda a estruturação de banco de dados, regras de negócio, suíte de testes e interfaces responsivas foram construídas em conjunto com o agente.

Sistema completo para criação, realização, acompanhamento estatístico e resolução de simulados para concursos, vestibulares e certificações profissionais (incluindo suporte nativo ao simulado preparatório de **OutSystems O11**).

O ecossistema é composto por:
1. **Aplicação Web**: Desenvolvida em **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM** e **PostgreSQL 17** em Docker.
2. **Aplicativo Mobile**: Desenvolvido em **Flutter 3.44+**, **Dart**, **SQLite** nativo (`sqflite`), **Provider/ChangeNotifier** e design **Material 3**.

---

## ✨ Principais Funcionalidades

### 📁 1. Organização em Pastas e Agrupamentos
- **Criação de Pastas Temáticas**: Organize seus simulados em pastas (ex: *"Concurso Professor Municipal"*, *"Certificação OutSystems"*, *"OAB"*, etc.).
- **Mover Simulados**: Alterne o destino de um simulado entre pastas ou mantenha-o solto na raiz.
- **Fixação no Topo (Pinning)**: Fixe pastas prioritárias ou simulados favoritos no topo do dashboard para acesso instantâneo.
- **Identidade Visual por Simulado**: Escolha um ícone e paleta temática exclusiva para cada simulado.

### 📊 2. Dashboard Inteligente e Métricas
- **Estatísticas Essenciais sem Poluição**: Visualize em cada card:
  - **Última Nota / Aproveitamento** com indicador de status (Excelente, Bom, Atenção).
  - **Tamanho do Banco de Questões**: Total de questões cadastradas.
  - **Total de Tentativas** e **Média Geral de Acertos**.
  - **Tempo de Duração**: Cronometragem e histórico de tempo gasto em cada tentativa.

### 🤖 3. Gerador e Importador de Questões com IA (ChatGPT / Gemini / Claude)
- **Gerador de Prompts Especializados**: Cria automaticamente o prompt ideal para a IA gerar questões inéditas, didáticas e fundamentadas:
  - Estilos suportados: Múltipla Escolha (4 ou 5 opções), Certo/Errado (Estilo Cebraspe) e Modo Misto.
  - Controle de quantidade: 5, 10, 15, 20 ou mais questões.
  - Suporte a **adição de novas questões** (`append`) a simulados já existentes.
- **Processamento Assíncrono em Segundo Plano**:
  - Ao clicar em *"Processar e Adicionar questões"*, o sistema valida estritamente a sintaxe do JSON.
  - Se válido, o modal fecha instantaneamente e a tarefa é processada em segundo plano com um **indicador visual animado na AppBar**.
  - Se inválido, o modal permanece aberto com o diagnóstico claro do erro para correção.
- **Sanitização Tolerante a Falhas de LLMs**:
  - Função nativa `fixInvalidBackslashes` que resolve escapes inválidos do Google Gemini (`\d`, `\s`, LaTeX `\alpha`, `\{`, caminhos `C:\`).
  - Tratamento automático para o aplicativo mobile do ChatGPT, que costuma copiar colchetes escapados (`\[` e `\]`), restaurando a conformidade com o padrão JSON (RFC 8259).

### 📝 4. Ambiente de Prova e Revisão Pedagógica
- **Sorteio e Banco de Questões**: Possibilidade de configurar o número de questões a responder (ex: resolver 20 de um banco de 100).
- **Cronômetro Interativo**: Medição precisa de tempo com funcionalidade de pausa e retomada.
- **Navegador Rápido de Questões**: Grade numérica para saltar diretamente para qualquer questão e visualizar pendências.
- **Gabarito Comentado e Revisão Detalhada**: Tela pós-prova destacando a resposta escolhida, a resposta correta e a justificativa técnica detalhada.

---

## 🛠️ Tecnologias Utilizadas

### Web (Next.js)
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Server Actions, React 19)
- **Linguagem**: TypeScript (Strict Mode)
- **Banco de Dados**: PostgreSQL 17 (via Docker na porta `5433`)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Estilização**: Tailwind CSS v4 & Lucide React
- **Validação**: Zod

### Mobile (Flutter)
- **Framework**: [Flutter 3.44+](https://flutter.dev/) (Channel Stable)
- **Linguagem**: Dart 3.12+ (Null-safety rigoroso)
- **Persistência**: SQLite nativo via `sqflite` com inicialização e migrações atômicas
- **Gerenciamento de Estado**: Provider & ChangeNotifier
- **Design System**: Material Design 3 com suporte a Light & Dark Mode

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js**: `v24.21.0` (gerenciado via [NVM](https://github.com/nvm-sh/nvm))
- **Docker**: Docker Engine ou Docker Desktop
- **Flutter**: Flutter SDK 3.44+ e Android SDK configurados

---

### Executando a Aplicação Web

1. **Subir o Banco de Dados PostgreSQL no Docker**:
   ```bash
   npm run db:up
   ```

2. **Ativar versão do Node e Instalar Dependências**:
   ```bash
   nvm use 24.21.0
   npm install
   ```

3. **Rodar Migrações do Prisma e Popular Dados (Seed)**:
   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

4. **Iniciar o Servidor Web**:
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000).

5. **Rodar Testes da Web**:
   ```bash
   npm test
   ```

---

### Executando o Aplicativo Mobile (Flutter)

1. **Acessar a pasta do app**:
   ```bash
   cd simulados_app
   ```

2. **Instalar dependências**:
   ```bash
   flutter pub get
   ```

3. **Executar no dispositivo ou emulador**:
   ```bash
   flutter run
   ```

4. **Rodar Testes do Flutter**:
   ```bash
   flutter test
   ```

---

## 📁 Estrutura de Diretórios

```text
simulados/
├── prisma/
│   ├── schema.prisma               # Modelagem do banco (Exam, Folder, Question, Option, Attempt)
│   ├── seed.ts                     # Script de seed inicial
│   └── seed-outsystems.ts          # Simulado OutSystems O11
├── src/
│   ├── app/
│   │   ├── actions/                # Server Actions (CRUD de simulados, pastas, tentativas)
│   │   ├── exams/                  # Telas de novo, edição, realização e resultados
│   │   └── page.tsx                # Dashboard principal web
│   ├── components/                 # Componentes React (Navbar, ExamCard, FolderBar, Timer)
│   └── lib/                        # Tipagens, validações Zod e singleton Prisma
├── simulados_app/                  # 📱 Aplicativo Mobile Flutter
│   ├── lib/
│   │   ├── data/                   # SQLite database, repositórios e seed
│   │   ├── domain/models/          # Modelos de domínio (Exam, Question, Folder, Attempt)
│   │   └── ui/                     # UI dividida por features (dashboard, exam_form, player, results)
│   └── test/                       # Testes de unidade e widgets do app
├── docs/                           # Documentação técnica detalhada
└── tests/                          # Testes de integração da aplicação Web
```

---

## 📄 Licença e Uso

Projeto desenvolvido para fins de estudos, autoavaliação e preparação técnica.
