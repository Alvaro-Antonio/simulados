import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

interface RawOption {
  text: string;
  isCorrect: boolean;
}

interface RawQuestion {
  statement: string;
  type: QuestionType;
  explanation: string;
  options: RawOption[];
}

const questionsData: RawQuestion[] = [
  // --- 1. Aggregates (Questões 1 a 6) ---
  {
    statement:
      'Em uma tela de listagem de pedidos, um desenvolvedor cria um Aggregate para buscar pedidos juntamente com o cliente associado. No entanto, alguns pedidos ainda não possuem cliente atribuído. Qual tipo de Join no Aggregate deve ser utilizado para que todos os pedidos continuem sendo exibidos, mesmo sem cliente?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O join "With or Without" equivale a um LEFT OUTER JOIN no SQL, garantindo que todos os registros da entidade primária (Order) sejam retornados, preenchendo os atributos da entidade secundária (Customer) com valores padrão (nulos/vazios) caso não haja correspondência.',
    options: [
      { text: 'Only With (Inner Join)', isCorrect: false },
      { text: 'With or Without (Left Outer Join)', isCorrect: true },
      { text: 'With (Full Outer Join)', isCorrect: false },
      { text: 'Sem join, usando dois Aggregates independentes com For Each', isCorrect: false },
    ],
  },
  {
    statement:
      'Ao aplicar uma função de agregação como "Count" em um Aggregate, o otimizador de plataforma do OutSystems ignora a ordenação e os atributos que não fazem parte do agrupamento ou da contagem.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Quando um Aggregate possui uma agregação (como Count, Sum ou Group By), o compilador do OutSystems gera uma consulta SQL otimizada contendo apenas as colunas agrupadas e calculadas, descartando cláusulas de ordenação que não afetem o resultado agregado.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Um desenvolvedor precisa exibir em tela a contagem total de registros de uma tabela paginada com Max Records = 10. Qual propriedade deve ser utilizada para exibir o número total de itens existentes no banco de dados?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A propriedade GetOrders.Count retorna o total absoluto de registros que satisfazem os filtros no banco de dados, independentemente do Max Records definido. Já GetOrders.List.Length retorna apenas a quantidade de registros carregados em memória na página atual (no máximo 10).',
    options: [
      { text: 'GetOrders.List.Length', isCorrect: false },
      { text: 'GetOrders.Count', isCorrect: true },
      { text: 'GetOrders.TotalRows', isCorrect: false },
      { text: 'Length(GetOrders.List)', isCorrect: false },
    ],
  },
  {
    statement:
      'Um filtro de Aggregate que utiliza uma Client Variable diretamente em sua cláusula de filtro é executado exclusivamente no lado do cliente (browser), sem enviar requisições ao servidor.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Os Aggregates em Reactive Web Apps são sempre executados no servidor de banco de dados. O valor da Client Variable é enviado como parâmetro na chamada ao servidor para compor a query SQL.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Em um Aggregate, qual é a melhor prática recomendada pela OutSystems para filtrar registros textuais permitindo buscas parciais sem perda crítica de performance?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A função Like com curinga ao final (ex: Customer.Name like SearchText + "%") permite que o banco de dados utilize índices B-Tree existentes. O uso de curinga no início ("%" + SearchText + "%") força uma varredura completa da tabela (Full Table Scan), prejudicando o desempenho em tabelas volumosas.',
    options: [
      { text: 'Customer.Name like "%" + SearchKeyword + "%"', isCorrect: false },
      { text: 'Index(Customer.Name, SearchKeyword) > -1', isCorrect: false },
      { text: 'Customer.Name like SearchKeyword + "%", quando o caso de uso permitir busca por prefixo', isCorrect: true },
      { text: 'ToLower(Customer.Name) = ToLower(SearchKeyword)', isCorrect: false },
    ],
  },
  {
    statement:
      'Se um Aggregate tiver atributos em sua entidade que nunca são lidos ou vinculados a widgets na tela, o compilador da plataforma automaticamente exclui esses atributos do SELECT da consulta SQL gerada.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. O otimizador de consultas do OutSystems realiza análise de dependência de código e projeta apenas os atributos explicitamente utilizados na tela, variáveis ou expressões, reduzindo o tráfego de dados e o consumo de memória.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },

  // --- 2. Bootstrap de dados do Excel (Questões 7 a 11) ---
  {
    statement:
      'Ao utilizar o recurso nativo do Service Studio para criar uma Entidade a partir de uma planilha Excel, quais elementos são gerados automaticamente pela plataforma?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A plataforma cria a Entidade com atributos mapeados pelas colunas do Excel, o arquivo Excel na aba Data/Resources, uma Server Action com a lógica de carga (leitura com Excel To Record List) e um Timer configurado para disparar na publicação (Schedule: When Published).',
    options: [
      { text: 'Apenas a Entidade e uma tela CRUD com Scaffold', isCorrect: false },
      { text: 'A Entidade, o Resource do arquivo Excel, uma Server Action de Bootstrap e um Timer programado para "When Published"', isCorrect: true },
      { text: 'Uma Client Action, uma Server Action e uma API REST de upload', isCorrect: false },
      { text: 'A Entidade e um Processo BPT de importação contínua', isCorrect: false },
    ],
  },
  {
    statement:
      'A Server Action de Bootstrap gerada automaticamente pelo OutSystems sempre sobrescreve todos os registros existentes no banco de dados a cada nova publicação do módulo.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. A ação gerada verifica inicialmente se a entidade está vazia (ex: Aggregate com IsEmpty). Se houver registros, a execução é abortada imediatamente para evitar duplicação ou perda de dados.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Se uma planilha Excel utilizada no Bootstrap contiver uma coluna com valores vazios em uma linha e essa coluna estiver mapeada para um atributo não mandatório do tipo Inteiro, qual valor será gravado no banco de dados?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'No OutSystems, atributos de tipos primitivos numéricos possuem valores padrão. Para o tipo Integer, o valor default quando não há preenchimento é 0 (zero), pois tipos primitivos na plataforma não assumem representação de NULL no modelo de domínio.',
    options: [
      { text: 'NULL do banco de dados', isCorrect: false },
      { text: 'O valor padrão 0 (zero)', isCorrect: true },
      { text: 'A importação falhará gerando Database Exception', isCorrect: false },
      { text: 'O registro inteiro da linha é descartado silenciosamente', isCorrect: false },
    ],
  },
  {
    statement:
      'Para atualizar os dados de uma entidade já populada via Bootstrap com uma nova versão da planilha Excel contendo novos registros, basta substituir o arquivo no Service Studio e publicar novamente sem alterar a lógica.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Como a Server Action de Bootstrap possui uma verificação inicial que encerra a execução se a tabela não estiver vazia, a publicação não importará os novos dados a menos que a lógica seja modificada ou a verificação de tabela vazia seja removida/ajustada.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Qual ferramenta do ecossistema OutSystems permite ao administrador monitorar o status de execução, histórico e erros de um Timer de Bootstrap de dados?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O Service Center é o console administrativo do OutSystems onde é possível verificar logs de timers (Environment Management > Monitoring > Timers), disparar execuções manuais e alterar agendamentos.',
    options: [
      { text: 'LifeTime', isCorrect: false },
      { text: 'Service Center', isCorrect: true },
      { text: 'App Feedback', isCorrect: false },
      { text: 'Service Studio Debugger', isCorrect: false },
    ],
  },

  // --- 3. Botões e links (Questões 12 a 17) ---
  {
    statement:
      'Em uma tela Reactive Web, qual é a diferença fundamental no comportamento entre definir a propriedade "On Click" de um Botão como uma Screen Action versus como uma Navigation (tela de destino)?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Definir como Navigation redireciona o usuário diretamente para outra tela sem disparar lógica intermediária no cliente. Ao vincular a uma Client Action, o desenvolvedor pode executar validações, chamadas de lógica ou manipulação de estado antes de decidir redirecionar ou permanecer na tela.',
    options: [
      { text: 'Navigation recarrega todo o navegador, enquanto Screen Action mantém a sessão', isCorrect: false },
      { text: 'Navigation executa uma transação de banco de dados antes da transição', isCorrect: false },
      { text: 'Navigation realiza a transição imediata para a tela de destino sem executar lógica local prévia, enquanto a Client Action permite executar fluxos de lógica antes de redirecionar', isCorrect: true },
      { text: 'Não há diferença prática, pois ambos compilam para a mesma instrução JavaScript', isCorrect: false },
    ],
  },
  {
    statement:
      'Um botão com a propriedade "Built-in Validations" definida como "Yes" impede a execução da Client Action associada caso algum campo obrigatório do formulário esteja inválido.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. O "Built-in Validations = Yes" avalia os widgets de entrada e define as propriedades "Form.Valid" e "Input.Valid" como falso, mas a Client Action ainda é disparada normalmente. Cabe ao desenvolvedor verificar a condição "If Form.Valid" no início da ação.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Qual propriedade de um Link em uma aplicação Reactive Web deve ser configurada para que o clique abra uma página externa em uma nova aba do navegador?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Na propriedade "Target" do Link ou da Destination externa, seleciona-se "_blank" para que o navegador renderize a página em uma nova aba ou janela.',
    options: [
      { text: 'Method = External', isCorrect: false },
      { text: 'Target = "_blank"', isCorrect: true },
      { text: 'OpenType = NewSession', isCorrect: false },
      { text: 'WindowMode = PopUp', isCorrect: false },
    ],
  },
  {
    statement:
      'Em Reactive Web Apps, é possível desabilitar visual e funcionalmente um botão atribuindo à sua propriedade "Enabled" uma expressão booleana.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. A propriedade "Enabled" aceita expressões booleanas. Quando avaliada como False, o botão ganha o atributo disabled no DOM e não dispara seu evento On Click.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Um desenvolvedor deseja disparar o download de um relatório em PDF gerado no servidor após o clique em um botão. Qual elemento de fluxo deve ser utilizado no final da Client Action para enviar o arquivo ao navegador?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O nó de fluxo "Download" é o elemento específico no OutSystems utilizado para transferir arquivos binários para o dispositivo do usuário a partir de uma ação.',
    options: [
      { text: 'Destination para uma URL externa', isCorrect: false },
      { text: 'Nó Download com o conteúdo binário e nome do arquivo', isCorrect: true },
      { text: 'Message do tipo Info com o binário serializado', isCorrect: false },
      { text: 'End com propriedade ExportFile = True', isCorrect: false },
    ],
  },
  {
    statement:
      'Ao utilizar o widget Link com texto e ícone dentro de uma célula de tabela, o evento On Click propaga automaticamente para o evento On Row Click da tabela, a menos que o bubbling seja cancelado explicitamente.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. No modelo de eventos web padrão adotado pelas Reactive Web Apps, eventos de clique em elementos internos de uma linha se propagam (bubble up) para os manipuladores de clique da linha ou tabela caso não haja controle de propagação.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },

  // --- 4. Ciclo de vidas de telas (Questões 18 a 23) ---
  {
    statement:
      'Em uma tela Reactive Web, qual evento do ciclo de vida é disparado antes de qualquer renderização visual e é ideal para inicializar variáveis locais simples que não dependem do DOM?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O evento "On Initialize" ocorre antes da tela ser renderizada e antes dos Aggregates com "Fetch At Start" retornarem. É ideal para configurar variáveis e parâmetros que não dependem de manipulação do DOM nem de dados assíncronos.',
    options: [
      { text: 'On Ready', isCorrect: false },
      { text: 'On Initialize', isCorrect: true },
      { text: 'On Render', isCorrect: false },
      { text: 'On After Fetch', isCorrect: false },
    ],
  },
  {
    statement:
      'O evento "On Render" de uma tela é executado exclusivamente uma única vez durante todo o ciclo de permanência do usuário naquela tela.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. O "On Render" é disparado logo após o primeiro desenho da tela e é reexecutado sempre que ocorrem alterações em dados ou variáveis vinculadas aos componentes da tela que provoquem re-renderização visual.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Para inicializar uma biblioteca JavaScript externa que precisa manipular diretamente um elemento do DOM identificado por seu ElementId, qual evento de ciclo de vida deve ser utilizado?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O evento "On Ready" é executado quando o DOM da tela ou bloco está totalmente carregado e pronto para interação. É o momento seguro para invocar scripts que acessem elementos visuais pelo id.',
    options: [
      { text: 'On Initialize', isCorrect: false },
      { text: 'On Ready', isCorrect: true },
      { text: 'On Destroy', isCorrect: false },
      { text: 'On Parameters Changed', isCorrect: false },
    ],
  },
  {
    statement:
      'O evento "On Destroy" é adequado para registrar logs no banco de dados e persistir transações críticas de negócios através de Server Actions com segurança.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. O "On Destroy" é executado no descarregamento da tela/bloco e serve primariamente para limpeza de ouvintes de eventos (listeners) e liberação de recursos do browser. Executar lógicas assíncronas de servidor complexas no On Destroy pode ser interrompido pela transição de tela.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Quando o valor de um Input Parameter de um Web Block é alterado pela tela pai, qual evento é disparado no bloco para permitir que ele recalcule dados ou atualize seus Aggregates?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O evento "On Parameters Changed" é disparado em um Block sempre que a tela ou bloco pai fornece um novo valor para um de seus parâmetros de entrada.',
    options: [
      { text: 'On Ready', isCorrect: false },
      { text: 'On Parameters Changed', isCorrect: true },
      { text: 'On Refresh', isCorrect: false },
      { text: 'On Data Changed', isCorrect: false },
    ],
  },
  {
    statement:
      'Aggregates configurados com "Fetch = At Start" bloqueiam a renderização inicial da tela até que o banco de dados responda à consulta.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Em Reactive Web, os dados são buscados de forma assíncrona. A tela é renderizada imediatamente com valores default ou estados de carregamento (placeholders), e os widgets são reativos quando a consulta é concluída.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },

  // --- 5. Client e Server Actions (Questões 24 a 29) ---
  {
    statement:
      'Sobre a execução de Server Actions invocadas a partir de Client Actions em Reactive Web Apps, qual das afirmações reflete com maior precisão o comportamento da plataforma?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A invocação de uma Server Action a partir de uma Client Action gera uma requisição de rede segura (REST/JSON) ao backend. O navegador aguarda a resposta assíncrona para prosseguir no fluxo de lógica.',
    options: [
      { text: 'A Server Action é compilada para WebAssembly e roda no dispositivo do cliente', isCorrect: false },
      { text: 'A chamada gera uma requisição HTTP assíncrona ao servidor, serializando os parâmetros de entrada e desserializando os parâmetros de saída', isCorrect: true },
      { text: 'Parâmetros do tipo Record ou List não podem ser passados para Server Actions', isCorrect: false },
      { text: 'Todas as Server Actions chamadas em uma mesma Client Action rodam em paralelo automaticamente', isCorrect: false },
    ],
  },
  {
    statement:
      'Uma Client Action marcada com a propriedade "Function = Yes" pode invocar diretamente uma Server Action dentro de seu fluxo de lógica.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Funções no OutSystems devem ser síncronas e imediatas para uso em expressões inline. Como a chamada a uma Server Action exige comunicação de rede assíncrona, a plataforma não permite invocar Server Actions dentro de ações configuradas como Function.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Qual das opções representa uma boa prática arquitetural ao desenhar a interação entre Client Actions e Server Actions para evitar degradação de desempenho em conexões móveis?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Realizar múltiplas chamadas consecutivas de servidor ("chatty interface") causa alta latência. A melhor prática é encapsular toda a lógica necessária em uma única Server Action com os dados consolidados, realizando apenas uma viagem de ida e volta ao servidor (Round Trip).',
    options: [
      { text: 'Fazer várias chamadas a Server Actions pequenas dentro de um loop For Each no cliente', isCorrect: false },
      { text: 'Agrupar as operações necessárias em uma única Server Action composta para reduzir o número de requisições de rede (Round Trips)', isCorrect: true },
      { text: 'Substituir todas as Server Actions por Client Actions manipulando variáveis globais', isCorrect: false },
      { text: 'Desativar o timeout de rede das Client Actions nas propriedades do módulo', isCorrect: false },
    ],
  },
  {
    statement:
      'Uma Server Action pública em um módulo Producer pode ser invocada diretamente por uma Client Action em um módulo Consumer de outro aplicativo, desde que a dependência seja adicionada.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Desde que a Server Action esteja marcada como "Public = Yes" no produtor e referenciada pelo consumidor via Manage Dependencies, ela pode ser invocada por Client Actions.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'O que acontece com os dados trafegados entre o cliente e o servidor quando uma Server Action retorna uma lista com atributos não utilizados pelo cliente?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Diferente dos Aggregates (onde o otimizador remove colunas não utilizadas do SELECT), em Server Actions a estrutura completa definida nos Output Parameters é serializada e enviada pela rede, tornando crucial modelar estruturas específicas para evitar payload excessivo.',
    options: [
      { text: 'O otimizador da plataforma remove automaticamente os campos não utilizados da resposta JSON', isCorrect: false },
      { text: 'Todos os atributos da estrutura retornada são transmitidos pela rede integralmente, consumindo banda desnecessária', isCorrect: true },
      { text: 'O navegador rejeita a resposta por falta de correspondência de schema', isCorrect: false },
      { text: 'A Server Action falha em tempo de execução com erro de serialização', isCorrect: false },
    ],
  },
  {
    statement:
      'Em uma Server Action, se ocorrer uma Database Exception e houver um manipulador específico de exceção configurado com "Abort Transaction = Yes", todas as alterações feitas no banco de dados durante essa transação são revertidas (rollback).',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. A propriedade "Abort Transaction = Yes" instrui a plataforma a executar um ROLLBACK da transação de banco de dados atual, desfazendo inserções, atualizações ou exclusões pendentes.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },

  // --- 6. Client Variables (Questões 30 a 34) ---
  {
    statement:
      'Quais tipos de dados podem ser armazenados em uma Client Variable em aplicações Reactive Web do OutSystems?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'As Client Variables suportam exclusivamente tipos de dados básicos primitivos (Text, Integer, Boolean, DateTime, Date, Time, Decimal, Currency, PhoneNumber, Email, BinaryData). Elas NÃO suportam Records, Lists, BinaryData complexo nem identificadores de entidades compostas.',
    options: [
      { text: 'Qualquer tipo de dado, incluindo Records e Lists complexas', isCorrect: false },
      { text: 'Apenas tipos básicos primitivos como Text, Integer, Boolean, Date e Currency', isCorrect: true },
      { text: 'Apenas tipos chave primária de Entidades', isCorrect: false },
      { text: 'Apenas variáveis do tipo Text serializadas em base64', isCorrect: false },
    ],
  },
  {
    statement:
      'Client Variables são adequadas para armazenar segredos, tokens de autenticação privados e dados confidenciais do usuário porque são criptografadas com chave assimétrica pelo servidor.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Client Variables são persistidas em armazenamento local do navegador (local storage/session) e não oferecem garantia de sigilo contra inspeção no lado do cliente. Nunca devem ser usadas para dados sensíveis ou decisões críticas de segurança.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Quando o valor de uma Client Variable é modificado em uma tela, qual é o impacto nas outras telas da mesma aplicação Reactive?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O valor de uma Client Variable é compartilhado no contexto da aplicação no mesmo navegador. Se uma tela subsequente ou componente ler a variável, ela refletirá o novo valor atribuído.',
    options: [
      { text: 'O valor só é visível na tela em que foi alterado e desaparece na navegação', isCorrect: false },
      { text: 'O novo valor fica imediatamente disponível para todas as telas e componentes da mesma aplicação no navegador', isCorrect: true },
      { text: 'A alteração sincroniza automaticamente com as sessões de outros usuários conectados', isCorrect: false },
      { text: 'É necessário chamar uma Server Action para propagar a variável entre telas', isCorrect: false },
    ],
  },
  {
    statement:
      'O valor de uma Client Variable é preservado mesmo se o usuário fechar completamente o navegador e reabrir a aplicação, mantendo seu valor padrão inicial.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Em Reactive Web Apps, as Client Variables são armazenadas no LocalStorage do navegador, persistindo entre sessões de navegação, a menos que sejam limpas programaticamente ou pelos dados do browser.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'O que acontece se uma Client Variable for acessada diretamente dentro de uma Server Action?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Client Variables não existem no escopo do servidor. Tentar acessá-las diretamente dentro de uma Server Action gera um erro de compilação no Service Studio; seus valores devem ser passados explicitamente como Input Parameters.',
    options: [
      { text: 'O servidor lê o valor via cookie transparente em tempo de execução', isCorrect: false },
      { text: 'Gera erro de compilação, pois Client Variables pertencem ao escopo do cliente e não podem ser lidas diretamente no servidor', isCorrect: true },
      { text: 'O valor é retornado sempre como string vazia', isCorrect: false },
      { text: 'O servidor dispara um evento síncrono para consultar o browser', isCorrect: false },
    ],
  },

  // --- 7. Dependências modulares (Questões 35 a 40) ---
  {
    statement:
      'Na arquitetura recomendada pela OutSystems (Architecture Canvas), qual é a regra fundamental de dependências entre módulos de uma mesma camada ou de camadas diferentes?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A regra geral estabelece que módulos de camadas superiores podem consumir módulos de camadas inferiores (Upward Dependencies são proibidas), dependências circulares entre módulos devem ser evitadas, e dependências laterais no Core devem ser minimizadas ou desacopladas.',
    options: [
      { text: 'Módulos da camada Core podem consumir livremente módulos da camada End-User', isCorrect: false },
      { text: 'Dependências devem seguir fluxo descendente (camadas superiores consumindo inferiores), evitando dependências circulares e dependências para cima', isCorrect: true },
      { text: 'Módulos Foundation devem sempre consumir módulos Core para obter regras de negócio', isCorrect: false },
      { text: 'Não há restrição arquitetural em módulos do mesmo ambiente de desenvolvimento', isCorrect: false },
    ],
  },
  {
    statement:
      'Ao alterar a assinatura de uma Server Action pública adicionando um novo Input Parameter obrigatório sem valor default em um módulo Producer, os módulos Consumers continuam funcionando sem necessidade de atualização.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Trata-se de uma "Breaking Change". Os módulos consumidores ficarão com dependências desatualizadas (outdated/incompatíveis) e apresentarão erros de compilação até que sejam abertos, atualizados no Manage Dependencies e repubilcados.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Qual ferramenta visual do Service Studio permite ao desenvolvedor inspecionar e adicionar elementos públicos disponibilizados por outros módulos?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A janela "Manage Dependencies" (acessada pelo atalho Ctrl+Q ou botão na barra de ferramentas) permite selecionar produtores, visualizar elementos públicos (entidades, actions, blocos, etc.) e incluí-los como referências.',
    options: [
      { text: 'Service Center Console', isCorrect: false },
      { text: 'Manage Dependencies (Ctrl+Q)', isCorrect: true },
      { text: 'LifeTime Deployment Manager', isCorrect: false },
      { text: 'Module Configuration Tab', isCorrect: false },
    ],
  },
  {
    statement:
      'Uma Entidade pública definida com a propriedade "Expose Read Only = Yes" impede que módulos consumidores criem, atualizem ou excluam registros diretamente através das Entity Actions automáticas (Create, Update, Delete).',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. A boa prática de isolamento de dados no OutSystems recomenda "Expose Read Only = Yes" para que o módulo dono da entidade centralize e governe a integridade dos dados por meio de Server Actions públicas de validação e escrita.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Quando um módulo possui dependências desatualizadas mas sem conflito de assinaturas (apenas nova versão publicada pelo produtor), qual indicador visual aparece na barra de status do Service Studio?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O Service Studio exibe um ícone de aviso de dependências desatualizadas (triângulo amarelo/azul informativo) permitindo que o desenvolvedor clique em "Refresh" para sincronizar com a versão mais recente.',
    options: [
      { text: 'Erro crítico de compilação vermelho bloqueando a publicação', isCorrect: false },
      { text: 'Aviso de dependência desatualizada informando que uma nova versão do produtor está disponível', isCorrect: true },
      { text: 'O módulo produtor é bloqueado para edição até que o consumidor seja deletado', isCorrect: false },
      { text: 'O Service Studio remove a referência automaticamente', isCorrect: false },
    ],
  },
  {
    statement:
      'Criar uma dependência cíclica entre dois módulos Core (Módulo A consumindo Módulo B, e Módulo B consumindo Módulo A) não causa impacto em deploys automatizados no LifeTime.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Dependências circulares causam complexidade de build, bloqueios em cascata, dificuldade de deploy independente e violam as diretrizes fundamentais da Arquitetura OutSystems.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },

  // --- 8. Entidades e Entidades Estáticas (Questões 41 a 47) ---
  {
    statement:
      'Qual é a principal diferença de comportamento e utilização entre uma Entidade regular e uma Entidade Estática (Static Entity) no OutSystems?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Static Entities funcionam como enumerações ricas no banco de dados. Seus registros são fixos em tempo de design (Records com identificadores nomeados utilizáveis diretamente no código), sofrem cache em memória e não possuem Entity Actions de criação/edição em runtime.',
    options: [
      { text: 'Static Entities armazenam dados temporários que são excluídos no final da sessão do usuário', isCorrect: false },
      { text: 'Static Entities definem valores constantes conhecidos em tempo de design (equivalentes a Enums), com cache em memória e sem Entity Actions de escrita em tempo de execução', isCorrect: true },
      { text: 'Entidades normais rodam apenas na memória do navegador e Static Entities rodam no servidor', isCorrect: false },
      { text: 'Static Entities não criam tabelas no banco de dados relacional', isCorrect: false },
    ],
  },
  {
    statement:
      'Os registros de uma Entidade Estática podem ser criados dinamicamente em tempo de execução utilizando a Server Action CreateOrUpdateStaticEntity.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Entidades Estáticas são somente-leitura em tempo de execução. Novos registros só podem ser adicionados no Service Studio em tempo de desenvolvimento.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Ao criar uma Entidade com um identificador do tipo Integer e marcar a propriedade "Autonumber = Yes", como a chave primária é gerada?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A geração da chave é delegada ao mecanismo de auto-incremento do banco de dados relacional (Identity no SQL Server ou Sequence no Oracle/Postgres) no momento em que a Entity Action Create é disparada.',
    options: [
      { text: 'O Service Studio calcula o próximo número aleatório no cliente', isCorrect: false },
      { text: 'O banco de dados gera o identificador incremental sequencial automaticamente durante a inserção', isCorrect: true },
      { text: 'O desenvolvedor deve passar o valor na propriedade Id do registro', isCorrect: false },
      { text: 'É gerado um UUID em formato numérico hash de 64 bits', isCorrect: false },
    ],
  },
  {
    statement:
      'Uma Entidade pode ter sua chave primária configurada com tipo de dados Text, permitindo chaves de negócio naturais como códigos de país ISO ou CPFs.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. O identificador de uma Entidade no OutSystems pode ser de tipos primitivos como Integer, Long Integer ou Text. Quando configurado como Text, o AutoNumber é desabilitado.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Qual atributo especial é obrigatório em toda Entidade Estática criada no OutSystems para identificar o registro de forma legível por humanos?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Toda Static Entity possui por padrão os atributos obrigatórios Id, Label (descrição textual para exibição), Order (ordenação) e Is_Active (sinalizador se o item está ativo para uso). O Label é o atributo exibido em dropdowns.',
    options: [
      { text: 'Code e Description', isCorrect: false },
      { text: 'Id, Label, Order e Is_Active', isCorrect: true },
      { text: 'Name e Value apenas', isCorrect: false },
      { text: 'Identifier e DisplayText', isCorrect: false },
    ],
  },
  {
    statement:
      'Ao alterar o tipo de dados de um atributo existente de Text para Date em uma Entidade com dados populados, o 1-Click Publish converte automaticamente todos os textos para datas válidas sem risco de falha.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Se houver registros na tabela com formatos incompatíveis com Date, o comando DDL de alteração do banco de dados falhará no 1-Click Publish gerando erro de banco de dados.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Se uma Entidade possui um atributo marcado com a propriedade "Is Mandatory = Yes", o que acontece se tentarmos salvar um registro passando valor nulo/vazio na Server Action de Create?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O banco de dados aplica a restrição NOT NULL na coluna correspondente. Se o valor for enviado em desacordo com as regras de preenchimento, uma Database Exception é lançada em tempo de execução.',
    options: [
      { text: 'A plataforma preenche automaticamente com um valor aleatório', isCorrect: false },
      { text: 'O banco de dados rejeita a inserção e uma Database Exception é gerada', isCorrect: true },
      { text: 'A gravação ocorre normalmente e a coluna é salva com valor NULL', isCorrect: false },
      { text: 'O registro é gravado em uma tabela de quarentena', isCorrect: false },
    ],
  },

  // --- 9. Eventos de blocos (Questões 48 a 53) ---
  {
    statement:
      'Como um Web Block comunica uma ação ou alteração de estado para a tela ou bloco pai que o hospeda?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'No OutSystems, a comunicação de filho para pai ocorre exclusivamente via Eventos. O bloco dispara um Evento (Trigger Event) com parâmetros opcionais, e a tela pai implementa um Event Handler (Client Action) para reagir ao evento.',
    options: [
      { text: 'Escrevendo em uma variável local da tela pai diretamente por referência', isCorrect: false },
      { text: 'Disparando um Evento com o nó Trigger Event e configurando um Event Handler na tela pai', isCorrect: true },
      { text: 'Invocando uma Server Action que notifica a tela pai via push notification', isCorrect: false },
      { text: 'Alterando o valor de um Input Parameter do próprio bloco', isCorrect: false },
    ],
  },
  {
    statement:
      'A tela pai pode invocar diretamente uma Client Action interna de um Web Block para solicitar que ele execute uma operação.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. O encapsulamento de Web Blocks no OutSystems é unidirecional: pais passam dados aos filhos via Input Parameters e filhos notificam pais via Eventos. Pais não chamam ações internas de blocos diretamente.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Se um Evento em um Web Block tiver sua propriedade "Mandatory" definida como "Yes", o que acontece na tela que consome esse bloco se ela não definir um Event Handler?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O compilador do Service Studio acusa um erro de validação (TrueChange), impedindo a publicação até que a tela que instancia o bloco configure um manipulador para o evento mandatório.',
    options: [
      { text: 'O evento é ignorado silenciosamente em tempo de execução', isCorrect: false },
      { text: 'O Service Studio gera um erro de validação (TrueChange) impedindo a publicação do módulo', isCorrect: true },
      { text: 'O navegador exibe uma mensagem de alerta ao usuário quando o evento é disparado', isCorrect: false },
      { text: 'A tela pai é recarregada automaticamente', isCorrect: false },
    ],
  },
  {
    statement:
      'Eventos de blocos suportam a passagem de parâmetros de múltiplos tipos, incluindo Records e Lists.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Os Eventos definidos em Web Blocks podem conter parâmetros de entrada que transportam dados simples ou estruturas complexas (Records/Lists) para o manipulador da tela pai.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Qual é o comportamento do DOM quando um Web Block é reutilizado várias vezes na mesma tela dentro de uma lista?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Cada item da lista instancia uma cópia independente do bloco, com seu próprio estado isolado de variáveis locais, ciclo de vida e renderização.',
    options: [
      { text: 'Todas as instâncias compartilham as mesmas variáveis locais em memória', isCorrect: false },
      { text: 'Cada instância mantém seu próprio estado isolado de variáveis locais e ciclo de vida independente', isCorrect: true },
      { text: 'Apenas a primeira instância é renderizada no navegador por motivos de performance', isCorrect: false },
      { text: 'Os eventos de todas as instâncias são unificados em um único payload', isCorrect: false },
    ],
  },
  {
    statement:
      'Ao alterar um Input Parameter passado para um Web Block a partir da tela pai, o bloco reexecuta automaticamente seu evento On Initialize.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. O evento On Initialize só roda quando o bloco é instanciado pela primeira vez. Mudanças subsequentes em parâmetros de entrada disparam o evento On Parameters Changed.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },

  // --- 10. Fluxo de lógica (Questões 54 a 58) ---
  {
    statement:
      'Em um fluxo de lógica, qual é a principal diferença entre a execução de um nó "If" e um nó "Switch"?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O nó If avalia uma única expressão booleana com exatamente dois ramos (True e False). O nó Switch avalia múltiplos ramos condicionais sequencialmente e executa o primeiro cuja condição for verdadeira (ou o ramo Otherwise se nenhum for atendido).',
    options: [
      { text: 'O nó Switch executa todos os ramos verdadeiros simultaneamente em threads paralelas', isCorrect: false },
      { text: 'O nó If possui duas saídas booleanas, enquanto o Switch avalia múltiplas condições na ordem definida e executa a primeira verdadeira (ou Otherwise)', isCorrect: true },
      { text: 'O nó Switch só pode ser utilizado em Server Actions e nunca em Client Actions', isCorrect: false },
      { text: 'O nó If requer sempre tratamento de exceções dedicado', isCorrect: false },
    ],
  },
  {
    statement:
      'Dentro de um loop "For Each", é considerada uma boa prática da plataforma invocar Aggregates ou Server Actions a cada iteração para buscar dados complementares de cada item.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Esta é a clássica antiprática "N+1 Queries". Invocar consultas ou ações de servidor dentro de um loop gera dezenas de viagens de rede ou queries repetitivas, degradando o desempenho. A melhor prática é buscar todos os dados de forma consolidada antes do loop com um Join ou IN filter.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Qual propriedade do elemento "List" permite iterar sobre seus elementos em um loop For Each sem consumir ou alterar a lista original?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O elemento For Each itera sobre o atributo Current da lista (ex: MyList.Current), avançando o ponteiro de iteração até o final da lista sem remover itens da coleção.',
    options: [
      { text: 'MyList.CurrentRowNumber', isCorrect: false },
      { text: 'MyList.Current', isCorrect: true },
      { text: 'MyList.Next()', isCorrect: false },
      { text: 'MyList.Value', isCorrect: false },
    ],
  },
  {
    statement:
      'Em uma Client Action, o nó "Destination" permite transferir a execução diretamente para uma Server Action sem recarregar a tela.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. O nó Destination serve exclusivamente para navegação de telas (redirecionar para outra Screen ou URL externa). Chamadas a Server Actions são feitas utilizando o elemento Run Server Action.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'O que acontece quando uma ação chega a um nó "End" que possui parâmetros de saída não atribuídos explicitamente por um nó Assign?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'No OutSystems, todos os parâmetros e variáveis são inicializados com os valores padrão de seus respectivos tipos (0 para numéricos, "" para texto, False para booleanos, #1900-01-01# para data, etc.).',
    options: [
      { text: 'Ocorre uma NullPointer Exception em tempo de execução', isCorrect: false },
      { text: 'Os parâmetros retornam com o valor padrão (default) de seus respectivos tipos de dados', isCorrect: true },
      { text: 'O compilador gera erro e impede a publicação', isCorrect: false },
      { text: 'A execução fica em loop aguardando atribuição', isCorrect: false },
    ],
  },

  // --- 11. Obtenção de dados em telas (Questões 59 a 64) ---
  {
    statement:
      'Qual é a diferença fundamental entre configurar uma fonte de dados de tela (Aggregate ou Data Action) com "Fetch = At Start" versus "Fetch = Only On Demand"?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      '"At Start" inicia a busca de dados automaticamente assim que a tela carrega. "Only On Demand" não executa na inicialização e só busca dados quando explicitamente invocado por um nó "Refresh Data" em uma Client Action.',
    options: [
      { text: '"At Start" roda no servidor e "Only On Demand" roda no navegador do cliente', isCorrect: false },
      { text: '"At Start" dispara automaticamente no carregamento da tela, enquanto "Only On Demand" só é executado quando acionado explicitamente por um nó Refresh Data', isCorrect: true },
      { text: '"Only On Demand" armazena os dados em disco e "At Start" em memória volátil', isCorrect: false },
      { text: '"At Start" só aceita filtros constantes e não aceita variáveis', isCorrect: false },
    ],
  },
  {
    statement:
      'Uma Data Action é utilizada quando a busca de dados de tela requer chamadas a serviços externos (REST/SOAP), lógica complexa prévia ou múltiplos Aggregates agregados em uma única resposta.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Enquanto Aggregates são otimizados para consultas diretas ao banco de dados em uma única entidade/join, Data Actions permitem fluxos de lógica completos no servidor retornando estruturas personalizadas para a tela.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Quando dois Aggregates independentes em uma tela estão configurados como "Fetch = At Start", como a plataforma executa essas requisições?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A plataforma otimiza o carregamento disparando as requisições de dados em paralelo ao servidor, sem que uma consulta precise esperar a conclusão da outra para ser iniciada.',
    options: [
      { text: 'Em sequência estrita, em ordem alfabética dos nomes dos Aggregates', isCorrect: false },
      { text: 'De forma assíncrona e em paralelo, otimizando o tempo total de carregamento da tela', isCorrect: true },
      { text: 'Mesclando os dois em uma única query SQL com UNION ALL automático', isCorrect: false },
      { text: 'Apenas o primeiro roda; o segundo é adiado até a interação do usuário', isCorrect: false },
    ],
  },
  {
    statement:
      'O nó "Refresh Data" em uma Client Action pode ser utilizado para reexecutar tanto Aggregates de tela quanto Data Actions.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. O nó Refresh Data é a instrução padrão para solicitar nova busca de dados ao servidor tanto para Screen Aggregates quanto para Data Actions.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Se um Aggregate depende de uma variável local cujo valor é preenchido no evento On Ready, qual é a melhor abordagem para evitar que o Aggregate execute com valor vazio na inicialização?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Configurar o Aggregate como "Fetch = Only On Demand" impede a execução prematura com dados inválidos. Em seguida, no fluxo do On Ready, após definir o valor da variável, invoca-se o nó Refresh Data.',
    options: [
      { text: 'Deixar "At Start" e adicionar um timer de atraso no Aggregate', isCorrect: false },
      { text: 'Definir o Aggregate com "Fetch = Only On Demand" e executar um "Refresh Data" explicitamente no On Ready após calcular o valor', isCorrect: true },
      { text: 'Alterar a variável local para uma Client Variable global', isCorrect: false },
      { text: 'Desativar o Aggregate e usar SQL Raw direto', isCorrect: false },
    ],
  },
  {
    statement:
      'O evento "On After Fetch" de um Aggregate ou Data Action é executado no servidor imediatamente após a consulta ao banco de dados ser finalizada.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. O "On After Fetch" é uma Client Action executada no dispositivo do usuário (browser) assim que os dados retornam do servidor, sendo ideal para atualizar estados da interface ou disparar lógicas reativas.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },

  // --- 12. Paginação e ordenação (Questões 65 a 70) ---
  {
    statement:
      'Em uma tabela paginada com paginação do lado do servidor (Server-side Pagination), quais propriedades do Aggregate controlam respectivamente o início do lote de dados e o tamanho da página?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A propriedade "Start Index" indica o deslocamento (offset) do primeiro registro a ser lido, e "Max Records" define a quantidade máxima de itens retornados naquela consulta.',
    options: [
      { text: 'PageNumber e PageSize', isCorrect: false },
      { text: 'Start Index e Max Records', isCorrect: true },
      { text: 'OffsetRows e LimitRows', isCorrect: false },
      { text: 'FirstRecord e LastRecord', isCorrect: false },
    ],
  },
  {
    statement:
      'Para que a ordenação dinâmica funcione ao clicar no cabeçalho de uma coluna de tabela, o Aggregate deve possuir uma Dynamic Sort configurada que receba o atributo de ordenação selecionado.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. A ordenação dinâmica do Aggregate precisa receber a variável que armazena a coluna e direção (ex: "Customer.Name ASC"), atualizada no evento On Sort do cabeçalho da tabela.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Quando o usuário está na página 4 de uma tabela e executa uma nova pesquisa textual com um filtro de busca, qual é a melhor prática recomendada para o "Start Index"?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Ao aplicar um novo filtro de pesquisa, o número de resultados totais pode ser menor que a página atual. É mandatória a redefinição de Start Index = 0 para exibir a primeira página de resultados e evitar páginas em branco.',
    options: [
      { text: 'Manter o Start Index inalterado para preservar a posição do scroll', isCorrect: false },
      { text: 'Resetar o Start Index para 0 para exibir o início dos novos resultados filtrados', isCorrect: true },
      { text: 'Multiplicar o Start Index pelo Max Records', isCorrect: false },
      { text: 'Incrementar o Start Index em 1', isCorrect: false },
    ],
  },
  {
    statement:
      'O widget de Paginação (Pagination) calcula automaticamente a quantidade total de páginas dividindo a propriedade Length da lista pelo Max Records.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. O cálculo do total de páginas requer o "Total Count" (total de registros de todo o banco obtido via Aggregate.Count). Se usasse Length da lista, o widget pensaria que só existe uma página, pois a lista só contém os itens da página atual.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Qual fórmula representa o cálculo correto do Start Index para a página de número N (sendo N iniciado em 1) com tamanho de página P?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Para a página 1: (1 - 1) * P = 0. Para a página 2: (2 - 1) * P = P. Portanto, a fórmula correta é (PáginaAtual - 1) * MaxRecords.',
    options: [
      { text: 'Start Index = N * P', isCorrect: false },
      { text: 'Start Index = (N - 1) * P', isCorrect: true },
      { text: 'Start Index = N + P', isCorrect: false },
      { text: 'Start Index = (N * P) - 1', isCorrect: false },
    ],
  },
  {
    statement:
      'Em tabelas com ordenação dinâmica em Aggregates, passar strings de ordenação construídas por concatenação sem validação de nomes de atributos é uma boa prática e não oferece riscos.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. O uso de Dynamic Sort com entradas não sanitizadas ou não controladas pode levar a erros de execução de query SQL ou comportamentos imprevistos. Deve-se usar referências seguras de atributos da entidade.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },

  // --- 13. Relação entre dados (Questões 71 a 76) ---
  {
    statement:
      'Para implementar um relacionamento de 1 para Muitos (1:N) entre as entidades Cliente e Pedido, onde cada pedido pertence a um cliente, qual é a modelagem correta?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'No modelo relacional do OutSystems, o lado "Muitos" (Order) armazena a chave estrangeira apontando para a chave primária do lado "Um" (CustomerId do tipo Customer Identifier na entidade Order).',
    options: [
      { text: 'Criar uma lista de Order Identifier dentro da entidade Customer', isCorrect: false },
      { text: 'Criar um atributo CustomerId do tipo Customer Identifier dentro da entidade Order', isCorrect: true },
      { text: 'Criar obrigatoriamente uma terceira entidade de junção com duas chaves estrangeiras', isCorrect: false },
      { text: 'Definir Customer e Order com a mesma chave primária', isCorrect: false },
    ],
  },
  {
    statement:
      'A regra de exclusão (Delete Rule) configurada como "Protect" em uma chave estrangeira impede a exclusão do registro pai se existirem registros filhos relacionados.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. A regra "Protect" atua como integridade referencial estrita (RESTRICT), lançando uma Database Exception caso se tente excluir o registro pai enquanto existirem registros dependentes associados.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Qual regra de exclusão (Delete Rule) deve ser utilizada para que, ao excluir um Usuário, todos os seus dados secundários de Perfil (relacionamento 1:1 de extensão) sejam excluídos automaticamente em cascata?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A Delete Rule "Delete" (Cascade Delete) instrui o banco de dados a remover automaticamente todos os registros filhos dependentes quando o registro pai principal for deletado.',
    options: [
      { text: 'Protect', isCorrect: false },
      { text: 'Ignore', isCorrect: false },
      { text: 'Delete', isCorrect: true },
      { text: 'Set Null', isCorrect: false },
    ],
  },
  {
    statement:
      'Para modelar um relacionamento Muitos para Muitos (N:N) entre Estudantes e Cursos, cria-se uma terceira entidade intermediária contendo duas chaves estrangeiras (StudentId e CourseId).',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Relacionamentos N:N no modelo relacional requerem uma entidade associativa (junction table) que armazene os pares de identificadores de ambas as entidades.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'O que acontece quando a Delete Rule de uma chave estrangeira é configurada como "Ignore"?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A opção "Ignore" desativa a criação de restrições de Foreign Key no banco de dados para aquela relação. O registro pai pode ser deletado deixando registros filhos órfãos com referências a IDs inexistentes.',
    options: [
      { text: 'O banco de dados define automaticamente o campo como zero', isCorrect: false },
      { text: 'A exclusão do pai é permitida sem verificar dependentes, podendo gerar registros órfãos', isCorrect: true },
      { text: 'A chave estrangeira é excluída do modelo de dados', isCorrect: false },
      { text: 'O usuário recebe um aviso popup no navegador', isCorrect: false },
    ],
  },
  {
    statement:
      'Um relacionamento 1 para 1 (1:1) é modelado definindo a chave primária da entidade de extensão com o mesmo tipo identificador da entidade principal.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Em uma relação 1:1 (como User e UserProfileExtension), a chave primária da tabela de extensão tem o tipo de dados "User Identifier" e não é autonumber, compartilhando a mesma chave.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },

  // --- 14. Segurança baseada em roles (Questões 77 a 82) ---
  {
    statement:
      'Ao desmarcar a role "Anonymous" e marcar apenas a role "Registered" nas propriedades de uma Screen, qual é o efeito prático?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Qualquer usuário não autenticado que tentar acessar a tela é bloqueado pela verificação de segurança da plataforma e redirecionado automaticamente para a tela de Login.',
    options: [
      { text: 'A tela fica acessível para qualquer pessoa na internet', isCorrect: false },
      { text: 'Apenas usuários autenticados têm permissão de acesso; usuários anônimos são redirecionados para a tela de login', isCorrect: true },
      { text: 'A tela fica restrita apenas aos administradores do Service Center', isCorrect: false },
      { text: 'A tela é oculta do menu mas continua acessível via URL direta por anônimos', isCorrect: false },
    ],
  },
  {
    statement:
      'Ocultar um botão de exclusão na interface visual utilizando a função CheckAdminRole() é suficiente para garantir a segurança da operação contra usuários maliciosos.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Ocultar o botão na UI é apenas segurança cosmética de interface. Usuários com ferramentas de desenvolvedor do navegador podem manipular requisições. A validação de role com CheckRole DEVE obrigatoriamente ser revalidada no início da Server Action no backend.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Qual função nativa gerada pelo OutSystems deve ser usada no início de uma Server Action para validar se o usuário conectado possui a role personalizada "Manager"?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Para cada role personalizada criada no módulo (ex: Manager), o OutSystems gera funções utilitárias no escopo de lógica: CheckManagerRole(UserId), GrantManagerRole(UserId) e RevokeManagerRole(UserId). Passando GetUserId() no Check, valida-se o usuário atual.',
    options: [
      { text: 'VerifyRole("Manager")', isCorrect: false },
      { text: 'CheckManagerRole(GetUserId())', isCorrect: true },
      { text: 'HasRole(Manager)', isCorrect: false },
      { text: 'User.Role == "Manager"', isCorrect: false },
    ],
  },
  {
    statement:
      'A atribuição da role "Registered" a um usuário ocorre automaticamente assim que ele efetua login bem-sucedido na aplicação.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. A role Registered é atribuída em tempo de execução pelo subsistema de autenticação a todo usuário que possua uma sessão autenticada válida.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'O que acontece quando um usuário autenticado tenta navegar para uma tela para a qual não possui a Role necessária?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A plataforma interrompe a navegação e lança uma "Security Exception". No manipulador global de exceções (OnException), essa exceção redireciona o usuário para uma tela informativa de "Invalid Permissions" (Acesso Negado).',
    options: [
      { text: 'O navegador exibe uma tela branca em branco sem erros', isCorrect: false },
      { text: 'Uma Security Exception é disparada e tratada pelo Exception Handler, redirecionando para a tela de permissões inválidas', isCorrect: true },
      { text: 'A conta do usuário é bloqueada imediatamente no Service Center', isCorrect: false },
      { text: 'A tela é exibida sem os dados do banco', isCorrect: false },
    ],
  },
  {
    statement:
      'Criar uma Role com a propriedade "Public = Yes" permite que outros módulos da mesma infraestrutura atribuam e verifiquem essa role em suas próprias lógicas.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Roles públicas podem ser referenciadas por módulos consumidores via Manage Dependencies para reaproveitamento consistente de permissões em toda a arquitetura.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },

  // --- 15. Solução de problemas e implicações (Questões 83 a 86) ---
  {
    statement:
      'Durante uma sessão de depuração (Debug) no Service Studio, qual é o impacto de marcar um breakpoint em uma Server Action compartilhada em um ambiente compartilhado de desenvolvimento?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Se o debugger estiver capturando requisições de todos os usuários (Debugger > Test in Public Area), requisições de outros desenvolvedores que acionarem a mesma Server Action ficarão retidas no breakpoint. A boa prática é filtrar o debug para o próprio usuário de teste.',
    options: [
      { text: 'Apenas a própria sessão é afetada, pois o Service Studio cria um banco de dados temporário isolado', isCorrect: false },
      { text: 'Pode pausar requisições de outros desenvolvedores e usuários caso o filtro de usuário do Debugger não esteja configurado para a própria conta', isCorrect: true },
      { text: 'O servidor de banco de dados entra em modo de manutenção e rejeita novas conexões', isCorrect: false },
      { text: 'O módulo é despublicado automaticamente após 5 minutos de inatividade', isCorrect: false },
    ],
  },
  {
    statement:
      'No Service Center, a aba "Monitoring > Errors" registra os detalhes de pilha de execução (Stack Trace) e mensagens de erro não tratadas que ocorreram na aplicação.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. O log de erros do Service Center armazena o histórico completo com módulo, tenant, usuário, horário, mensagem descritiva e Stack Trace das exceções para diagnóstico.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Qual ferramenta do Service Studio exibe avisos de melhoria de qualidade de código (Warnings), como variáveis não utilizadas, queries não otimizadas e violações de boas práticas?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A aba TrueChange no painel inferior do Service Studio compila o código continuamente e exibe a lista de Errors (vermelhos) que impedem publicação e Warnings (amarelos) que indicam melhorias e riscos de performance.',
    options: [
      { text: 'Service Center Dashboard', isCorrect: false },
      { text: 'Aba TrueChange', isCorrect: true },
      { text: 'App Feedback', isCorrect: false },
      { text: 'Compare and Merge Tool', isCorrect: false },
    ],
  },
  {
    statement:
      'Erros de JavaScript e falhas de renderização de widgets no navegador do cliente são registrados automaticamente nos logs de Database Exceptions do Service Center.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Erros locais de JavaScript no cliente ficam nos consoles dos navegadores (F12) ou na aba de Logs de Mobile/Reactive no Service Center, e não na categoria de Database Exceptions.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },

  // --- 16. Tratamento de exceções usando blocos (Questões 87 a 91) ---
  {
    statement:
      'Em um fluxo de lógica com múltiplos manipuladores de exceção (Exception Handlers), qual é a regra de precedência quando uma exceção é disparada?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A plataforma busca o manipulador mais específico para o tipo de erro ocorrido (ex: Database Exception). Se não houver manipulador específico, a exceção é capturada pelo manipulador genérico "All Exceptions".',
    options: [
      { text: 'O primeiro handler desenhado na tela sempre executa, independente do tipo de erro', isCorrect: false },
      { text: 'O manipulador mais específico para o tipo da exceção é executado; se não existir, executa o handler "All Exceptions"', isCorrect: true },
      { text: 'Todos os handlers conectados são executados em paralelo', isCorrect: false },
      { text: 'O handler All Exceptions roda primeiro e depois repassa para o específico', isCorrect: false },
    ],
  },
  {
    statement:
      'Quando uma exceção é tratada por um Exception Handler com a propriedade "Abort Transaction = No", as alterações feitas no banco de dados até o momento do erro são confirmadas (commit).',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Se "Abort Transaction" for "No", a transação não sofre rollback forçado pelo handler. Se o fluxo subsequente concluir com sucesso, as operações anteriores podem ser persistidas.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Para interromper propositalmente um fluxo de negócios quando uma regra é violada (ex: "Saldo Insuficiente") e exibir mensagem ao usuário, qual elemento deve ser utilizado?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O elemento "Raise Exception" configurado com uma User Exception personalizada (ex: SaldoInsuficienteException) interrompe a execução normal e desvia o fluxo para o manipulador correspondente.',
    options: [
      { text: 'Nó Breakpoint', isCorrect: false },
      { text: 'Nó Raise Exception com uma User Exception personalizada', isCorrect: true },
      { text: 'Nó End com valor de retorno falso', isCorrect: false },
      { text: 'Nó Destination para a tela inicial', isCorrect: false },
    ],
  },
  {
    statement:
      'Uma User Exception criada em um módulo de lógica de negócio Core pode ser marcada como pública e capturada por handlers específicos em módulos da camada End-User.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. User Exceptions podem ser configuradas com "Public = Yes", permitindo que módulos consumidores criem manipuladores dedicados para tratar cada tipo de erro de negócio.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Em uma Client Action, se uma exceção ocorrer e não houver nenhum Exception Handler no fluxo da ação nem na Screen, onde a exceção é finalmente capturada?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A exceção sobe na pilha de execução até ser capturada pelo fluxo global "OnException" do módulo (localizado no Common flow), que exibe a mensagem de erro padrão da aplicação.',
    options: [
      { text: 'O navegador trava e fecha a aba do usuário', isCorrect: false },
      { text: 'No manipulador global "OnException" do módulo, que trata erros não capturados', isCorrect: true },
      { text: 'No banco de dados através de um trigger de auditoria', isCorrect: false },
      { text: 'A requisição é reiniciada automaticamente em loop infinito', isCorrect: false },
    ],
  },

  // --- 17. Validações de formulário (Questões 92 a 96) ---
  {
    statement:
      'Em uma tela com um formulário de cadastro, como o desenvolvedor verifica programaticamente se todos os campos vinculados ao formulário passaram nas validações automáticas (tipos e campos obrigatórios)?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A propriedade booleana Form.Valid é avaliada como True apenas se todos os widgets de entrada associados ao formulário estiverem com suas respectivas propriedades Valid == True.',
    options: [
      { text: 'Testando se cada Input.Text != "" individualmente', isCorrect: false },
      { text: 'Verificando a propriedade FormName.Valid através de um nó If', isCorrect: true },
      { text: 'Invocando a Server Action ValidateForm(FormName)', isCorrect: false },
      { text: 'Consultando a variável de sessão Session.FormIsValid', isCorrect: false },
    ],
  },
  {
    statement:
      'Ao definir "Input_Email.Valid = False" e "Input_Email.ValidationMessage = \'E-mail inválido\'", o widget Input associado exibe visualmente a borda vermelha e a mensagem de erro configurada.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Em Reactive Web Apps, modificar a propriedade Valid de um widget de entrada para False faz com que a plataforma aplique as classes CSS de erro e renderize a ValidationMessage abaixo do campo.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Qual das opções descreve a melhor prática recomendada para validação de dados em formulários de negócio críticos?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Validações no cliente proporcionam feedback imediato e boa experiência de usuário (UX). No entanto, validações de integridade, formatos e regras de negócio no servidor são indispensáveis para garantir a segurança dos dados.',
    options: [
      { text: 'Validar apenas no cliente para economizar processamento do servidor', isCorrect: false },
      { text: 'Realizar validações imediatas na Client Action para feedback rápido ao usuário E validar novamente os dados na Server Action para garantir a segurança e integridade', isCorrect: true },
      { text: 'Confiar exclusivamente em validações visuais com JavaScript externo', isCorrect: false },
      { text: 'Nunca usar Built-in Validations do OutSystems', isCorrect: false },
    ],
  },
  {
    statement:
      'Se um formulário possui "Form.Valid = False", a chamada a uma Server Action dentro da Client Action é bloqueada automaticamente pelo compilador.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. O compilador não bloqueia chamadas a Server Actions. Se o desenvolvedor não colocar a verificação "If Form.Valid" antes de chamar a Server Action, os dados inválidos serão enviados para o servidor.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Para resetar o estado de validação de um formulário e limpar todas as mensagens de erro exibidas ao usuário, qual é o procedimento correto?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Atribuir Form.Valid = True e redefinir a propriedade Valid de cada widget de entrada para True (ou limpar os campos da variável vinculada ao formulário) restaura o estado limpo dos campos.',
    options: [
      { text: 'Recarregar todo o navegador com JavaScript window.location.reload()', isCorrect: false },
      { text: 'Atribuir True às propriedades Valid dos widgets de entrada e do formulário (ou redefinir a variável fonte do formulário)', isCorrect: true },
      { text: 'Excluir o formulário do DOM e recriá-lo via script', isCorrect: false },
      { text: 'Desinstalar o módulo e publicar novamente', isCorrect: false },
    ],
  },

  // --- 18. Widgets de entrada e exibição (Questões 97 a 100) ---
  {
    statement:
      'Qual widget é o mais indicado no OutSystems para exibir uma lista de opções onde o usuário deve selecionar exatamente uma única opção entre poucas opções visíveis na tela (ex: 2 ou 3 opções)?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O widget Radio Group (contendo Radio Buttons) é o componente recomendado de UX para seleção única entre um número reduzido de alternativas visíveis simultaneamente. Para muitas opções, o Dropdown é mais indicado.',
    options: [
      { text: 'Checkbox Group', isCorrect: false },
      { text: 'Radio Group com Radio Buttons', isCorrect: true },
      { text: 'Input do tipo Text com máscara', isCorrect: false },
      { text: 'Switch Button múltiplo', isCorrect: false },
    ],
  },
  {
    statement:
      'Em um widget Dropdown em Reactive Web, a propriedade "Options" deve ser vinculada a uma lista e as propriedades "Options Value" e "Options Text" definem respectivamente o identificador armazenado e o texto visível.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. O Dropdown recebe a lista fonte em "Options", a expressão do valor persistido na variável em "Options Value" e a expressão que o usuário enxerga em "Options Text".',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Qual widget de layout é utilizado para agrupar outros widgets, aplicar classes CSS de estilo e definir estruturas responsivas em colunas no OutSystems?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O Container (que renderiza uma tag <div> no HTML) é o bloco estrutural básico do OutSystems para agrupamento, formatação, visibilidade condicional e aplicação de classes de estilo e grid.',
    options: [
      { text: 'Expression', isCorrect: false },
      { text: 'Container', isCorrect: true },
      { text: 'Label', isCorrect: false },
      { text: 'Placeholder', isCorrect: false },
    ],
  },
  {
    statement:
      'O widget Expression com a propriedade "Escape Content = No" renderiza código HTML fornecido diretamente no DOM sem sanitização contra ataques de Cross-Site Scripting (XSS).',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Quando "Escape Content" é definido como "No", a plataforma não escapa caracteres como < e >, permitindo a injeção de HTML/scripts. Isso exige extrema cautela e sanitização prévia para evitar vulnerabilidades de segurança (XSS).',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
];

async function seedOutSystems() {
  console.log(`Iniciando importação do Banco de Questões OutSystems O11 (${questionsData.length} questões)...`);

  // Verifica se o simulado já existe para atualizar ou criar novo
  const existingExam = await prisma.exam.findFirst({
    where: {
      title: 'Certificação OutSystems Associate Developer O11 - Banco Avançado',
    },
  });

  if (existingExam) {
    console.log(`Simulado existente encontrado (ID: ${existingExam.id}). Atualizando questões...`);
    await prisma.exam.delete({ where: { id: existingExam.id } });
  }

  const createdExam = await prisma.exam.create({
    data: {
      title: 'Certificação OutSystems Associate Developer O11 - Banco Avançado',
      category: 'OutSystems O11',
      description:
        'Banco completo com 100 questões avançadas de Múltipla Escolha e Certo/Errado baseadas na certificação OutSystems Associate Reactive Developer O11, contendo pegadinhas clássicas de prova e gabarito comentado.',
      questions: {
        create: questionsData.map((q, qIdx) => ({
          statement: q.statement,
          type: q.type,
          explanation: q.explanation,
          orderIndex: qIdx,
          options: {
            create: q.options.map((opt, optIdx) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
              orderIndex: optIdx,
            })),
          },
        })),
      },
    },
  });

  console.log(`✅ Banco de Questões OutSystems O11 importado com sucesso!`);
  console.log(`ID: ${createdExam.id}`);
  console.log(`Total de Questões cadastradas: ${questionsData.length}`);
}

seedOutSystems()
  .catch((e) => {
    console.error('Erro ao popular banco OutSystems:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
