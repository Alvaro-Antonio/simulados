import { QuestionType } from '@prisma/client';

export interface RawOption {
  text: string;
  isCorrect: boolean;
}

export interface RawQuestion {
  statement: string;
  type: QuestionType;
  explanation: string;
  options: RawOption[];
}

export const extraQuestionsData: RawQuestion[] = [
  // --- 101 a 104: Aggregates Avançados ---
  {
    statement:
      'Em uma tela de dashboard, um desenvolvedor aplica as funções Group By no atributo ProductCategory e Count no identificador ProductId dentro de um Aggregate. Ao tentar vincular uma expressão da tela ao atributo ProductName da entidade Product, o Service Studio exibe um erro de compilação. Qual é a causa técnica desse erro?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Quando qualquer operação de agregação ou agrupamento (Group By, Count, Sum, etc.) é introduzida em um Aggregate, o resultado passa a expor unicamente os atributos agrupados e as colunas calculadas. Todos os outros atributos originais da entidade (como ProductName) deixam de estar disponíveis no Record resultante da query SQL.',
    options: [
      { text: 'O desenvolvedor esqueceu de marcar o atributo ProductName como público no módulo Core.', isCorrect: false },
      { text: 'Ao aplicar agrupamento ou agregação em um Aggregate, apenas os atributos agrupados e as colunas calculadas passam a existir no resultado.', isCorrect: true },
      { text: 'O Aggregate requer um índice composto pré-existente no banco de dados para liberar atributos não agrupados.', isCorrect: false },
      { text: 'O widget Expression só aceita valores numéricos quando a entidade possui a função Count ativa.', isCorrect: false },
    ],
  },
  {
    statement:
      'O uso de funções de manipulação de texto como Substr() ou Index() diretamente dentro da cláusula de filtro de um Aggregate impede o uso de índices B-Tree padrão no banco de dados, resultando em varredura completa da tabela (Full Table Scan).',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. A aplicação de funções escalares (como Substr ou Index) sobre colunas de tabelas na cláusula WHERE inviabiliza o aproveitamento direto de índices existentes sobre a coluna original no SGBD, forçando a leitura linha a linha da tabela.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Durante a iteração de uma lista de registros retornada por um Aggregate dentro de um For Each em uma Server Action, qual propriedade indica precisamente a posição (índice baseado em zero) do elemento atualmente processado no ciclo?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A propriedade List.CurrentRowNumber fornece o índice baseado em zero da linha atualmente percorrida no For Each. Já List.Current aponta para os valores do registro corrente e List.Length expressa a quantidade total de itens na lista.',
    options: [
      { text: 'GetUsers.List.Current.Id', isCorrect: false },
      { text: 'GetUsers.List.CurrentIndex', isCorrect: false },
      { text: 'GetUsers.List.CurrentRowNumber', isCorrect: true },
      { text: 'GetUsers.List.RowPosition', isCorrect: false },
    ],
  },
  {
    statement:
      'Se um Aggregate for executado dentro de uma Server Action interna e apenas 3 dos seus 20 atributos forem utilizados nas etapas subsequentes da lógica, o compilador da plataforma otimiza a consulta SQL gerada, projetando apenas esses 3 atributos.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. O mecanismo de compilação da plataforma analisa a árvore de uso dos dados em todo o escopo da Server Action e restringe a projeção do SELECT no banco apenas aos atributos efetivamente consumidos.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },

  // --- 105 a 107: Bootstrap de Dados do Excel e Timers ---
  {
    statement:
      'Ao executar um Timer de Bootstrap de dados que processa uma planilha de 80.000 linhas, o processo é abortado repentinamente sem concluir a carga completa. Ao analisar o Service Center, verifica-se uma mensagem de Timeout. Qual é a causa e a arquitetura recomendada para solucionar este problema?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Por padrão, os Timers do OutSystems possuem um tempo limite de execução (geralmente 20 minutos). Para importações massivas, a boa prática é processar em lotes (chunks) controlados por limite de tempo, salvando o progresso (ex: última linha lida) e disparando o próprio Timer novamente via ação WakeTimer antes de atingir o timeout.',
    options: [
      { text: 'O limite físico de linhas do Excel no OutSystems é 65.536; deve-se obrigatoriamente converter o arquivo para CSV.', isCorrect: false },
      { text: 'O Timer atingiu seu tempo limite de execução (timeout padrão de 20 minutos); deve-se implementar processamento em lotes com persistência de estado e auto-reativação via WakeTimer.', isCorrect: true },
      { text: 'O Service Center encerrou o processo porque Timers não possuem permissão de escrita em entidades normais.', isCorrect: false },
      { text: 'A ação Excel To Record List bloqueia o banco de dados; deve-se substituir por chamadas assíncronas de API REST.', isCorrect: false },
    ],
  },
  {
    statement:
      'Caso ocorra uma exceção não tratada dentro de um Timer de Bootstrap durante a iteração de um lote de 500 registros, todas as inserções realizadas anteriormente em iterações que executaram a ação CommitTransaction permanecem gravadas com sucesso no banco de dados.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. A execução da ação CommitTransaction efetiva definitivamente as transações pendentes no banco de dados. Um erro subsequente não tratado provocará rollback apenas das operações executadas após o último ponto de commit.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Durante a importação de uma planilha Excel com a ação nativa Excel To Record List, uma coluna de data contém células sem preenchimento. Qual valor o OutSystems atribui ao atributo de data no Record resultante?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'No OutSystems, datas nulas ou vazias recebem o valor padrão NullDate(), que equivale tecnicamente ao valor 1900-01-01 00:00:00.',
    options: [
      { text: 'Dispara imediatamente uma exceção do tipo InvalidArgumentException.', isCorrect: false },
      { text: 'Grava o valor NULL nativo do banco de dados relacional.', isCorrect: false },
      { text: 'Atribui o valor correspondente a NullDate() (1900-01-01).', isCorrect: true },
      { text: 'Atribui a data e hora do momento da importação (CurrDateTime()).', isCorrect: false },
    ],
  },

  // --- 108 a 111: Ciclo de Vida de Telas e Blocos ---
  {
    statement:
      'Considere uma Tela que contém um Bloco reutilizável. O Bloco possui um parâmetro de entrada cujo valor depende do resultado de um Aggregate configurado com "Fetch = At start" na Tela. Qual é a sequência cronológica correta de eventos de ciclo de vida durante o carregamento inicial?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Primeiro são executados os On Initialize (da Tela e do Bloco). Em seguida, os elementos visuais são montados, disparando On Ready (do Bloco e da Tela). Quando o Aggregate conclui a busca no servidor, o valor do parâmetro é fornecido ao Bloco, disparando então o evento On Parameters Changed do Bloco.',
    options: [
      { text: 'On Ready (Tela) -> On Initialize (Bloco) -> On Parameters Changed (Bloco) -> On Ready (Bloco)', isCorrect: false },
      { text: 'On Initialize (Tela) e On Initialize (Bloco) -> On Ready (Bloco) e On Ready (Tela) -> On Parameters Changed (Bloco, quando os dados do Aggregate chegarem)', isCorrect: true },
      { text: 'On Parameters Changed (Bloco) -> On Initialize (Tela) -> On Ready (Tela) -> On After Fetch (Aggregate)', isCorrect: false },
      { text: 'O evento On Parameters Changed nunca é disparado na carga inicial, apenas em cliques do usuário.', isCorrect: false },
    ],
  },
  {
    statement:
      'É uma boa prática manipular o DOM de um elemento visual via JavaScript diretamente no manipulador do evento On Initialize de uma Tela.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. No evento On Initialize, a renderização da interface e a árvore do DOM ainda não foram construídas. Qualquer tentativa de localizar ou manipular elementos por ID nesse momento resultará em erro (elemento nulo ou inexistente). Essa manipulação deve ser feita no On Ready.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Um desenvolvedor adiciona um event listener global em window via JavaScript customizado dentro do On Ready de um Bloco. Para evitar vazamento de memória (memory leaks) e comportamentos inesperados ao navegar entre telas, onde o listener deve ser obrigatoriamente removido?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O manipulador do evento On Destroy do Bloco é o local obrigatório e apropriado para desalocar recursos, cancelar timers de JavaScript e remover event listeners globais criados na janela ou no documento.',
    options: [
      { text: 'No evento On Parameters Changed.', isCorrect: false },
      { text: 'No evento On After Fetch do Aggregate principal.', isCorrect: false },
      { text: 'No evento On Destroy do Bloco.', isCorrect: true },
      { text: 'O navegador desaloca automaticamente todos os listeners de window ao destruir o Bloco.', isCorrect: false },
    ],
  },
  {
    statement:
      'Ao alterar o valor de uma variável local na Tela que está vinculada como Input Parameter de um Bloco, o evento On Parameters Changed do Bloco é disparado automaticamente se o novo valor for diferente do anterior.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. O mecanismo de reatividade do OutSystems monitora as entradas dos Blocos. Quando o valor atribuído a um Input Parameter é alterado e difere do valor anterior, o evento On Parameters Changed é invocado.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },

  // --- 112 a 115: Client e Server Actions ---
  {
    statement:
      'Em uma aplicação reativa, uma Client Action invoca uma Server Action passando uma lista de 5.000 itens complexos como parâmetro de entrada apenas para validar um único campo de texto. Qual é o principal impacto técnico dessa abordagem?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Em Reactive Apps, a comunicação entre o navegador e o servidor ocorre via requisições HTTP REST com payload serializado em JSON. A passagem de grandes estruturas de dados aumenta substancialmente a latência de rede, o consumo de banda e o processamento de serialização/deserialização.',
    options: [
      { text: 'Causa um deadlock permanente nas conexões do banco de dados do servidor.', isCorrect: false },
      { text: 'Eleva desnecessariamente a latência e o consumo de dados devido à serialização e transferência via rede de um payload JSON de grande porte.', isCorrect: true },
      { text: 'A plataforma aborta imediatamente a compilação, pois listas não podem ser passadas para Server Actions.', isCorrect: false },
      { text: 'Nenhum impacto, pois a plataforma passa os parâmetros entre cliente e servidor por referência de memória compartilhada.', isCorrect: false },
    ],
  },
  {
    statement:
      'A função integrada GetUserId() pode ser utilizada tanto em Client Actions quanto em Server Actions, retornando em ambas o identificador do usuário autenticado na sessão atual.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. A função GetUserId() é suportada no escopo cliente e servidor em aplicações Reactive, retornando o ID do usuário atualmente autenticado (ou NullIdentifier() para usuários anônimos).',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Uma Client Action precisa gravar dados em quatro entidades distintas chamando quatro Server Actions independentes sequencialmente. Qual refatoração é recomendada pela OutSystems para otimizar desempenho e integridade?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Chamar quatro Server Actions a partir do cliente gera quatro roundtrips HTTP distintos, aumentando a latência e deixando o sistema vulnerável a falhas parciais (falha no 3º roundtrip deixa os dois primeiros gravados sem rollback conjunto). Criar uma única Server Action orquestradora no servidor reduz as requisições a um único roundtrip e executa todas as gravações na mesma transação.',
    options: [
      { text: 'Substituir as quatro Server Actions por chamadas paralelas com JavaScript assíncrono (Promise.all).', isCorrect: false },
      { text: 'Encapsular as quatro gravações em uma única Server Action no servidor, reduzindo roundtrips HTTP e garantindo controle transacional unificado.', isCorrect: true },
      { text: 'Executar cada Server Action dentro de um loop For Each na Client Action.', isCorrect: false },
      { text: 'Converter as entidades em Static Entities para permitir gravação direta no cliente.', isCorrect: false },
    ],
  },
  {
    statement:
      'Cada invocação de uma Server Action a partir de uma Client Action é executada em uma transação de banco de dados isolada no servidor, sendo feito o commit automático ao final da execução da ação.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Cada chamada de Server Action vinda do cliente constitui uma requisição HTTP independente. O servidor abre uma transação para a requisição e, caso finalize sem exceções não tratadas, efetua o commit automático ao término.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },

  // --- 116 a 118: Client Variables ---
  {
    statement:
      'Em aplicações Reactive Web Apps, onde os valores das Client Variables ficam fisicamente armazenados no cliente e qual restrição de segurança é mandatória?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Em Reactive Web, as Client Variables são salvas no armazenamento local do navegador (Local Storage). Como qualquer usuário pode inspecionar e alterar esses dados via DevTools, informações sensíveis (chaves secretas, senhas, papéis administrativos ou dados confidenciais) nunca devem ser gravadas nelas.',
    options: [
      { text: 'Ficam criptografadas em memória protegida de hardware, sendo seguras para armazenamento de senhas.', isCorrect: false },
      { text: 'Ficam no Local Storage do navegador; por serem vulneráveis à inspeção e manipulação pelo usuário, nunca devem armazenar dados sensíveis ou de autorização crítica.', isCorrect: true },
      { text: 'Ficam armazenadas na sessão de cache do IIS/Nginx do servidor de frontend.', isCorrect: false },
      { text: 'Ficam em cookies com a flag HttpOnly habilitada por padrão pelo Service Studio.', isCorrect: false },
    ],
  },
  {
    statement:
      'Uma Client Variable configurada em uma aplicação Reactive Web compartilha seu valor de forma sincronizada e persistente entre abas abertas no mesmo navegador do usuário.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Como as Client Variables utilizam o Local Storage do browser (com escopo delimitado pela origem e pelo aplicativo), as abas do mesmo navegador e mesma aplicação acessam e atualizam o mesmo repositório de valores.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Quando o usuário realiza logout na aplicação por meio da Server Action nativa User_Logout, qual é o comportamento padrão das Client Variables?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Ao invocar o User_Logout, a sessão no servidor é terminada e as Client Variables da aplicação são automaticamente resetadas para seus valores padrão (Default Values), evitando que o próximo usuário veja dados do usuário anterior.',
    options: [
      { text: 'Permanecem intactas com os últimos valores preenchidos no Local Storage indefinidamente.', isCorrect: false },
      { text: 'Todas as Client Variables são resetadas para seus respectivos valores padrão (Default Value).', isCorrect: true },
      { text: 'O navegador limpa todo o cache e histórico de navegação forçando o fechamento da aba.', isCorrect: false },
      { text: 'As variáveis numéricas tornam-se nulas e as textuais viram "LOGGED_OUT".', isCorrect: false },
    ],
  },

  // --- 119 a 122: Dependências Modulares e Arquitetura ---
  {
    statement:
      'De acordo com a Architecture Canvas (framework 4-Layer) da OutSystems, qual tipo de dependência entre módulos representa uma violação direta de boas práticas arquiteturais?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Dependências ascendentes (Upward References) — como um módulo da camada Foundation consumindo um elemento da camada Core ou End-User — e dependências circulares diretas ou indiretas entre módulos violam gravemente os princípios da Architecture Canvas.',
    options: [
      { text: 'Um módulo End-User consumindo uma Server Action pública de um módulo Core.', isCorrect: false },
      { text: 'Um módulo Core consumindo uma biblioteca reutilizável da camada Foundation.', isCorrect: false },
      { text: 'Um módulo da camada Foundation consumindo uma Entidade de negócio de um módulo da camada Core (Upward Reference).', isCorrect: true },
      { text: 'Dois módulos End-User consumindo o mesmo tema visual da camada Foundation.', isCorrect: false },
    ],
  },
  {
    statement:
      'Ao alterar a assinatura de uma Server Action pública adicionando um novo parâmetro de entrada obrigatório (Mandatory = Yes), os módulos consumidores que não forem atualizados continuarão funcionando em produção sem apresentar falhas.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Adicionar um parâmetro obrigatório quebra a compatibilidade binária e lógica da assinatura pública (Breaking Change). Os módulos consumidores que não forem atualizados falharão em tempo de execução ao tentar invocar a ação desatualizada.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'No Service Studio, ao abrir a janela "Manage Dependencies", um desenvolvedor nota que uma dependência está sinalizada com um ícone de exclamação vermelho. O que esse alerta indica?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O ícone vermelho de dependência incompatível (Incompatible Dependency) significa que o módulo produtor sofreu alterações de assinatura ou elementos foram removidos/renomeados, tornando a dependência quebrada até que seja atualizada e o código ajustado.',
    options: [
      { text: 'O módulo produtor está em manutenção temporária no LifeTime.', isCorrect: false },
      { text: 'Existe uma quebra de compatibilidade (Incompatible Dependency) decorrente de alterações de assinatura ou exclusão de elementos no módulo produtor.', isCorrect: true },
      { text: 'O desenvolvedor não possui permissões de leitura no módulo consumidor.', isCorrect: false },
      { text: 'O módulo atingiu o limite de licenças da Software Unit (SU).', isCorrect: false },
    ],
  },
  {
    statement:
      'Quando uma Entidade possui a propriedade "Expose Read Only = Yes", outros módulos consumidores continuam habilitados a executar as Entity Actions Create, Update e Delete diretamente.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Com "Expose Read Only = Yes", a plataforma oculta e bloqueia as Entity Actions de modificação (Create, Update, Delete) para todos os módulos consumidores, permitindo apenas operações de leitura (Get e Aggregates). Para alterar dados, o módulo produtor deve fornecer Server Actions públicas específicas.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },

  // --- 123 a 126: Entidades, Entidades Estáticas e Índices ---
  {
    statement:
      'Em uma Static Entity com a coluna "Is_Active", o desenvolvedor altera o registro "Pendente" para Is_Active = False. Qual é o efeito prático dessa alteração?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Desativar um registro em uma Static Entity não remove o registro do banco de dados nem quebra chaves estrangeiras existentes; o registro continua existindo, porém pode ser filtrado ou omitido em novas seleções de formulários.',
    options: [
      { text: 'O registro é excluído fisicamente e todas as chaves estrangeiras associadas recebem NullIdentifier().', isCorrect: false },
      { text: 'O registro permanece na tabela mantendo a integridade referencial dos dados históricos, mas pode ser desconsiderado em novas operações da aplicação.', isCorrect: true },
      { text: 'O Service Studio gera um erro de integridade referencial que impede a publicação do módulo.', isCorrect: false },
      { text: 'O identificador do registro é resetado para zero em todas as tabelas filhas.', isCorrect: false },
    ],
  },
  {
    statement:
      'A plataforma OutSystems remove imediatamente as colunas físicas da tabela no banco de dados corporativo assim que o desenvolvedor exclui um atributo de uma Entidade no Service Studio e clica no botão 1-Click Publish.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. Por razões de segurança e prevenção contra perda acidental de dados legados, o compilador da plataforma não exclui fisicamente colunas nem tabelas no banco de dados. O atributo é removido do modelo lógico no Service Studio, mas a coluna permanece no SGBD.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },
  {
    statement:
      'Qual é o impacto direto da criação de múltiplos Índices (Indexes) em uma Entidade com alto volume de gravações e atualizações contínuas?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Embora índices acelerem consultas de leitura (SELECT), cada operação de escrita (INSERT, UPDATE, DELETE) exige que o SGBD atualize a estrutura de todas as árvores de índices correspondentes, aumentando o tempo e o custo de transação de escrita.',
    options: [
      { text: 'As operações de leitura ficam mais lentas e as de escrita mais rápidas.', isCorrect: false },
      { text: 'Acelera as operações de leitura que utilizam esses atributos, porém reduz a performance das operações de escrita (Create e Update) devido à sobrecarga de manutenção dos índices.', isCorrect: true },
      { text: 'Desabilita o mecanismo de cache automático da plataforma para a Entidade.', isCorrect: false },
      { text: 'Exige que todos os atributos indexados sejam obrigatoriamente do tipo Text.', isCorrect: false },
    ],
  },
  {
    statement:
      'Static Entities geram identificadores automáticos baseados em GUIDs não textuais que mudam a cada ambiente da esteira (Dev, Test, Prod), impedindo seu uso em regras de negócio constantes.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. As Static Entities no OutSystems são criadas com identificadores estáveis (frequentemente representados por constantes ou identificadores do tipo Text ou Integer definidos no design) que mantêm exatamente a mesma chave entre diferentes ambientes de publicação.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },

  // --- 127 a 130: Eventos de Blocos ---
  {
    statement:
      'Um Bloco filho está contido dentro de um Bloco intermediário, que por sua vez está instanciado em uma Tela. O Bloco filho precisa enviar um dado para a Tela principal. Como a comunicação entre os componentes deve ser modelada?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Blocos em OutSystems não possuem "Event Bubbling" automático. O Bloco filho deve disparar seu Evento com o parâmetro; o Bloco intermediário captura esse evento em seu Handler e, por sua vez, dispara seu próprio Evento para que a Tela principal possa capturá-lo.',
    options: [
      { text: 'O Bloco filho utiliza a função global BroadcastEvent() que entrega a mensagem diretamente à Tela sem passar pelo intermediário.', isCorrect: false },
      { text: 'O Bloco filho dispara um Evento tratado pelo Bloco intermediário, e este dispara seu próprio Evento com o dado repassado para a Tela principal.', isCorrect: true },
      { text: 'O Bloco filho deve gravar o dado em uma Static Entity para que a Tela o consulte via Aggregate.', isCorrect: false },
      { text: 'Blocos aninhados não suportam envio de eventos para elementos externos.', isCorrect: false },
    ],
  },
  {
    statement:
      'O manipulador (Handler) de um Evento de Bloco definido em uma Tela é implementado por meio de uma Client Action da própria Tela.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Quando um Bloco define um Evento, a Tela que o consome mapeia esse evento para uma Client Action local (Handler), que recebe os parâmetros fornecidos pelo Bloco e executa a lógica desejada na interface.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Um desenvolvedor cria um componente modal de confirmação dentro de um Bloco reutilizável. Ao clicar no botão "Confirmar", qual mecanismo o Bloco deve empregar para notificar a Tela consumidora e fechar o modal?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A boa prática de encapsulamento exige que o Bloco dispare um Evento (ex: Confirmed) com os parâmetros necessários. A Tela consumidora captura o evento no seu Handler e atualiza as variáveis de controle de visibilidade da UI.',
    options: [
      { text: 'Alterar diretamente uma variável local da Tela consumidora usando uma expressão JavaScript.', isCorrect: false },
      { text: 'Disparar um Evento do Bloco para que a Tela consumidora execute o fluxo correspondente no seu Handler.', isCorrect: true },
      { text: 'Executar um Destination para redirecionar para a própria tela atual.', isCorrect: false },
      { text: 'Chamar a Server Action User_GetUnifiedLoginInfo.', isCorrect: false },
    ],
  },
  {
    statement:
      'É possível disparar um Evento de um Bloco de dentro do manipulador do evento On Destroy do próprio Bloco para notificar a Tela de que o componente foi desmontado.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Errado. O manipulador de evento On Destroy não permite o disparo de Eventos de Bloco, pois o componente já se encontra no processo de destruição e desconexão do ciclo de vida da interface.',
    options: [
      { text: 'Certo', isCorrect: false },
      { text: 'Errado', isCorrect: true },
    ],
  },

  // --- 131 a 134: Obtenção de Dados em Telas ---
  {
    statement:
      'Em uma tela de edição complexa, há uma seção expansível (Accordion) secundária que raramente é consultada pelos usuários, contendo uma tabela pesada. Qual configuração de Aggregate deve ser adotada para otimizar a velocidade de carregamento inicial da página?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Definir a propriedade Fetch = Only on demand faz com que o Aggregate não seja disparado na carga inicial da tela. Os dados só são requisitados ao servidor quando o usuário interagir e abrir o Accordion, disparando a ação Refresh Data apenas no momento oportuno.',
    options: [
      { text: 'Configurar o Aggregate com "Fetch = At start" e Max Records = 10.000.', isCorrect: false },
      { text: 'Configurar o Aggregate com "Fetch = Only on demand" e dispará-lo através da ação Refresh Data quando o usuário abrir o Accordion.', isCorrect: true },
      { text: 'Converter a seção em um Bloco e deixar todos os Aggregates como At start.', isCorrect: false },
      { text: 'Substituir o Aggregate por uma Client Variable carregada no On Initialize da Tela.', isCorrect: false },
    ],
  },
  {
    statement:
      'Quando uma Tela possui dois Aggregates e uma Data Action, todos configurados com "Fetch = At start", a plataforma executa as requisições em paralelo no servidor durante o carregamento inicial da tela.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Em Reactive Web Apps, as fontes de dados com "Fetch = At start" disparam chamadas assíncronas em paralelo em direção ao servidor para minimizar o tempo de carregamento global da tela.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Um desenvolvedor adiciona uma lógica no evento On Initialize de uma Tela tentando ler o valor de GetCustomerById.List.Current.Customer.Name de um Aggregate com "Fetch = At start". O que ocorrerá na execução da página?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O evento On Initialize ocorre antes do disparo e retorno das chamadas assíncronas de busca de dados no servidor. Portanto, na execução do On Initialize, o Aggregate ainda não retornou registros, resultando no valor padrão (vazio/nulo) para a expressão.',
    options: [
      { text: 'O On Initialize aguarda o término do Aggregate automaticamente antes de rodar.', isCorrect: false },
      { text: 'A lista do Aggregate estará vazia (ou com valor padrão), pois os dados do servidor ainda não foram obtidos no momento em que o On Initialize é executado.', isCorrect: true },
      { text: 'A plataforma gera uma exceção de compilação bloqueando a publicação.', isCorrect: false },
      { text: 'O valor da Client Variable correspondente será automaticamente injetado.', isCorrect: false },
    ],
  },
  {
    statement:
      'O nó Refresh Data em uma Client Action pode ser utilizado para recarregar tanto Aggregates de tela quanto Data Actions.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. O elemento Refresh Data suporta a seleção de Aggregates e Data Actions locais da Tela/Bloco, solicitando uma nova busca atualizada de dados no servidor.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },

  // --- 135 a 138: Paginação e Ordenação ---
  {
    statement:
      'Um usuário está na página 8 de uma tabela de pedidos e digita um termo no campo de busca que retorna apenas 3 registros no total. Se a lógica da tela não resetar o StartIndex para 0, qual será o resultado visual para o usuário?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Se o usuário estava na página 8 (ex: StartIndex = 70 com Max Records = 10) e a busca retorna apenas 3 itens no total, a consulta buscará registros a partir do índice 70. Como existem apenas 3 registros, a tabela aparecerá vazia com a mensagem de Empty State, mesmo existindo correspondências válidas.',
    options: [
      { text: 'A tabela exibe automaticamente os 3 registros na página 1 ajustando o StartIndex por conta própria.', isCorrect: false },
      { text: 'A tabela aparecerá vazia, pois o StartIndex permaneceu maior que o número total de registros retornados pela nova pesquisa.', isCorrect: true },
      { text: 'O navegador exibirá uma tela de erro 500 do servidor.', isCorrect: false },
      { text: 'O widget Pagination dispara uma exceção do tipo IndexOutOfRangeException.', isCorrect: false },
    ],
  },
  {
    statement:
      'Em uma tabela paginada com ordenação dinâmica, a propriedade Dynamic Sort do Aggregate aceita uma expressão de texto como "Customer.Name DESC" para ordenar as linhas consultadas no banco de dados.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. O Dynamic Sort permite passar uma expressão de texto contendo a entidade, atributo e a direção (ASC ou DESC), sendo traduzido de forma segura para a cláusula ORDER BY da consulta SQL.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Ao utilizar o widget Pagination em conjunto com uma Table, quais propriedades mínimas são essenciais para manter a sincronização correta da paginação?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'O widget Pagination requer StartIndex (índice inicial da página atual), MaxRecords (limite de linhas por página) e TotalCount (contagem total de registros retornada pela propriedade .Count do Aggregate) e um manipulador de evento On Navigate para atualizar a variável de StartIndex.',
    options: [
      { text: 'RowNumber, LineCount e TotalPages.', isCorrect: false },
      { text: 'StartIndex, MaxRecords, TotalCount e um manipulador no evento On Navigate.', isCorrect: true },
      { text: 'Apenas a lista retornada pelo Aggregate (GetOrders.List).', isCorrect: false },
      { text: 'CurrentPage, LimitPerPage e PageSize.', isCorrect: false },
    ],
  },
  {
    statement:
      'Para implementar paginação infinita (Infinite Scroll) em telas móveis e reativas, deve-se vincular a busca de mais registros ao evento On Scroll Ending do widget de lista.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. O evento On Scroll Ending é disparado quando o usuário atinge o final da visualização da lista, momento propício para incrementar a quantidade de registros e carregar o próximo lote de dados.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },

  // --- 139 a 141: Relação entre Dados e Delete Rules ---
  {
    statement:
      'Em um modelo de dados, a Entidade OrderItem possui uma chave estrangeira para ProductId com a propriedade "Delete Rule" configurada como "Protect". O que acontece quando uma Server Action executa a ação DeleteProduct para um produto que possui itens de pedido associados?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Com Delete Rule = "Protect", o banco de dados e a plataforma impedem a exclusão do registro pai enquanto houver filhos vinculados, abortando a transação e disparando uma DatabaseException.',
    options: [
      { text: 'O produto é excluído e todos os OrderItems associados são excluídos em cascata.', isCorrect: false },
      { text: 'O produto é excluído e a coluna ProductId nos OrderItems associados é preenchida com NullIdentifier().', isCorrect: false },
      { text: 'A operação falha, abortando a exclusão e disparando uma DatabaseException por violação de integridade referencial protegida.', isCorrect: true },
      { text: 'A operação ignora os registros filhos e marca o produto como inativo.', isCorrect: false },
    ],
  },
  {
    statement:
      'Para criar uma relação 1 para 1 (One-to-One) entre duas Entidades (ex: User e UserProfile), o tipo de dados do atributo identificador da entidade UserProfile deve ser configurado como User Identifier.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Definir o identificador (Primary Key) da entidade secundária como o tipo Identifier da entidade primária estabelece uma relação rigorosa de 1 para 1 no modelo de dados do OutSystems.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Qual é o risco de configurar a Delete Rule de uma chave estrangeira como "Ignore" em um banco de dados relacional?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A regra "Ignore" remove o registro pai sem verificar nem atualizar os registros filhos, criando registros órfãos que apontam para uma chave inexistente, comprometendo a integridade referencial.',
    options: [
      { text: 'Impede que o registro pai seja atualizado.', isCorrect: false },
      { text: 'Gera registros órfãos nas entidades dependentes que referenciam chaves de registros que já não existem no banco de dados.', isCorrect: true },
      { text: 'Força a exclusão imediata de todas as tabelas do catálogo do módulo.', isCorrect: false },
      { text: 'Obriga a execução manual de reindexação do banco após cada exclusão.', isCorrect: false },
    ],
  },

  // --- 142 a 145: Segurança e Roles ---
  {
    statement:
      'Um desenvolvedor adiciona uma validação de Role em uma Client Action para exibir ou ocultar um botão de exclusão de dados confidenciais. No entanto, a Server Action invocada pela exclusão não verifica a Role do usuário. Qual é o problema de segurança dessa implementação?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'A validação em Client Actions atende puramente à experiência do usuário (UX), pois todo código cliente pode ser contornado ou inspecionado. A Server Action no backend é a única autoridade real de segurança e deve obrigatoriamente validar as permissões (ex: CheckRole) antes de executar operações restritas.',
    options: [
      { text: 'Não há problema, pois o Service Studio bloqueia requisições HTTP do cliente automaticamente caso o botão esteja oculto.', isCorrect: false },
      { text: 'A segurança no cliente é meramente cosmética; um usuário mal-intencionado pode disparar a chamada de rede diretamente ao endpoint da Server Action sem passar pela validação visual.', isCorrect: true },
      { text: 'O Service Center desativa a aplicação por violação de protocolo de rede.', isCorrect: false },
      { text: 'A Client Action não compila quando contém validações de Role.', isCorrect: false },
    ],
  },
  {
    statement:
      'A função Check<Role>Role (ex: CheckUserManagerRole) executada diretamente em uma Client Action faz uma requisição ao servidor para verificar se o usuário possui a referida permissão.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Em Reactive Web Apps, as Roles do usuário residem na sessão do servidor. A execução de uma ação de checagem de Role no cliente realiza uma chamada remota transparente para validar as permissões.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Ao criar uma nova Tela em um módulo Reactive Web, quais Roles vêm marcadas por padrão nas propriedades de segurança da Tela?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Por padrão, novas Telas criadas no OutSystems recebem a Role "Registered" marcada, garantindo que apenas usuários autenticados tenham acesso inicial à tela.',
    options: [
      { text: 'Nenhuma Role (acesso anônimo público irrestrito).', isCorrect: false },
      { text: 'Apenas a Role "Registered" (exige que o usuário esteja autenticado).', isCorrect: true },
      { text: 'Apenas a Role "Administrator".', isCorrect: false },
      { text: 'Todas as Roles existentes no módulo.', isCorrect: false },
    ],
  },
  {
    statement:
      'Se uma Tela possuir todas as Roles desmarcadas nas suas propriedades, ela se torna acessível por qualquer usuário sem necessidade de autenticação (acesso anônimo).',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. Se nem a Role Registered nem nenhuma Role customizada estiver marcada, a Tela é tratada como pública, permitindo que usuários anônimos a visualizem.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },

  // --- 146 a 148: Tratamento de Exceções e Transações ---
  {
    statement:
      'Em uma Server Action que executa várias operações no banco de dados, ocorre um erro inesperado que é capturado por um manipulador All Exceptions configurado com "Abort Transaction = No". Qual é a consequência nas operações anteriores ao erro?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Quando "Abort Transaction = No", a plataforma não realiza o rollback automático da transação atual. As operações de banco de dados executadas com sucesso antes do ponto de exceção serão confirmadas (commit) ao término do fluxo.',
    options: [
      { text: 'Todas as operações sofrem rollback obrigatório independentemente da configuração.', isCorrect: false },
      { text: 'As operações no banco de dados executadas antes do disparo da exceção não sofrem rollback e serão confirmadas se o fluxo terminar sem novas exceções.', isCorrect: true },
      { text: 'O banco de dados trava a tabela inteira até que o servidor IIS seja reiniciado.', isCorrect: false },
      { text: 'A exceção é reencaminhada automaticamente para a tela do usuário.', isCorrect: false },
    ],
  },
  {
    statement:
      'Se um nó Raise Exception for executado dentro de uma Server Action, o fluxo normal é interrompido imediatamente e o controle é transferido para o Exception Handler compatível mais próximo na cadeia de chamadas.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. O elemento Raise Exception encerra a execução lógica normal do fluxo e propaga a exceção informada para o manipulador correspondente mais próximo no escopo.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
  {
    statement:
      'Uma Server Action itera 100 registros com um For Each. No 40º registro ocorre um erro de banco de dados (DatabaseException). Não há nenhum Exception Handler na ação. Qual é o estado final dos 39 registros gravados anteriormente?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Quando uma exceção não é tratada localmente por nenhum manipulador dentro da Server Action, a transação é abortada e todas as operações de escrita realizadas durante a execução daquela requisição sofrem rollback integral no banco de dados.',
    options: [
      { text: 'Os 39 registros continuam gravados no banco de dados com commit parcial.', isCorrect: false },
      { text: 'Todos os 39 registros sofrem rollback integral e nenhuma gravação daquela Server Action permanece no banco.', isCorrect: true },
      { text: 'Apenas o 40º registro é ignorado e os 60 restantes são processados.', isCorrect: false },
      { text: 'Os registros anteriores são convertidos em rascunhos temporários.', isCorrect: false },
    ],
  },

  // --- 149 a 150: Validações de Formulários e Widgets ---
  {
    statement:
      'Ao clicar em um botão com a propriedade "Built-in Validations = Yes" dentro de um Form, quais validações a plataforma OutSystems realiza automaticamente antes de iniciar a execução da Client Action?',
    type: QuestionType.MULTIPLE_CHOICE,
    explanation:
      'Com Built-in Validations = Yes, a plataforma verifica se os campos marcados como Mandatory possuem valor preenchido e se os dados informados são compatíveis com os tipos de dados dos inputs (ex: números válidos, datas válidas). Caso haja violação, define os atributos .Valid como False e exibe as mensagens padrão sem executar a lógica principal do desenvolvedor.',
    options: [
      { text: 'Validação de regras de negócio em chamadas REST externas e verificação de duplicidade de CPF/CNPJ no banco.', isCorrect: false },
      { text: 'Preenchimento de campos obrigatórios (Mandatory) e conformidade dos tipos de dados básicos de cada input.', isCorrect: true },
      { text: 'Verificação de integridade referencial de chaves estrangeiras no banco de dados.', isCorrect: false },
      { text: 'Validação de autenticidade do certificado SSL e do token de sessão.', isCorrect: false },
    ],
  },
  {
    statement:
      'Ao atribuir programaticamente Input_Email.Valid = False e uma mensagem em Input_Email.ValidationMessage dentro de uma Client Action, a propriedade Form.Valid é automaticamente recalculada pela plataforma como False.',
    type: QuestionType.TRUE_FALSE,
    explanation:
      'Certo. A propriedade Form.Valid é reativa e derivada: se qualquer widget de entrada contido no formulário tiver sua propriedade .Valid alterada para False, Form.Valid assume automaticamente o valor False.',
    options: [
      { text: 'Certo', isCorrect: true },
      { text: 'Errado', isCorrect: false },
    ],
  },
];
