# Manual de estudo do sistema de atendimento

Este manual explica a implementação TypeScript do projeto PRJ.ED.13, desde os tipos de uma senha até a integração com a interface. A ideia central é guardar as senhas em arrays circulares e atender primeiro as preferenciais, preservando a ordem de entrada dentro de cada categoria.

Leia as seções na ordem e acompanhe os arquivos em `src/`. Os códigos apresentados são trechos explicativos; não é necessário copiá-los novamente para o projeto.

## 1. Organização e fluxo do programa

| Arquivo | Responsabilidade |
| --- | --- |
| `src/models/Senha.ts` | Define os dados e os tipos de uma senha. |
| `src/structures/FilaCircular.ts` | Implementa a estrutura de dados, sem conhecer regras de atendimento. |
| `src/services/SistemaAtendimento.ts` | Usa as filas para gerar senhas, aplicar prioridades e controlar o limite total. |
| `src/teste.ts` | Executa uma demonstração no terminal. |
| `tsconfig.json` | Configura a compilação do TypeScript. |
| `package.json` | Registra o projeto, as dependências e os comandos configurados. |
| `package-lock.json` | Registra as versões resolvidas das dependências. |
| `.gitignore` | Indica quais arquivos locais o Git deve ignorar. |

O fluxo de geração é:

```text
Totem → gerarSenha(categoria, servico)
      → verifica capacidade
      → gera código não repetido
      → insere na fila da categoria
      → atualiza quantidade e verifica alarme
      → devolve a senha para a interface
```

O fluxo de atendimento é:

```text
Atendente → atenderProxima()
          → existe preferencial? Retira a primeira preferencial
          → senão, tenta retirar a primeira normal
          → se retirou uma senha, diminui a quantidade total
          → devolve a senha ou undefined
```

## 2. Conceitos de TypeScript usados

| Sintaxe | Significado no projeto |
| --- | --- |
| `export` | Permite importar uma declaração em outro arquivo. |
| `import` | Traz uma classe ou outra declaração de outro módulo. |
| `import type` | Importa apenas tipos, que não precisam existir no JavaScript gerado. |
| `class` | Define atributos e métodos para criar objetos. |
| `new` | Cria uma instância e executa o construtor. |
| `constructor` | Inicializa e valida o objeto quando ele é criado. |
| `private` | Restringe o acesso ao membro na verificação do TypeScript. |
| `this` | Representa a instância atual da classe. |
| `readonly` | Impede reatribuir a propriedade pelo código TypeScript. |
| `T[]` | Array de elementos do tipo `T`. |
| `T \| undefined` | Valor do tipo `T` ou ausência de valor. |
| `void` | Indica que uma função não fornece um resultado útil ao chamador. |
| `return` | Encerra o método e, quando informado, devolve um valor. |
| `throw new Error(...)` | Interrompe o fluxo normal e sinaliza um erro. |
| `===` | Compara valores sem converter seus tipos. |
| `!` | Nega uma condição booleana. |
| `++` e `--` | Aumentam ou diminuem uma variável numérica em uma unidade. |

Tipos e interfaces ajudam durante a compilação. Eles não validam automaticamente valores recebidos em tempo de execução, como textos de um formulário. A integração precisa garantir que as opções da interface correspondam aos valores aceitos.

## 3. Os dados em Senha.ts

### Categoria e serviço

```ts
export type Categoria = "normal" | "preferencial";
export type Servico = "consulta" | "exame" | "agendamento";
```

Esses tipos usam uniões de valores literais. Uma variável `Categoria` deve receber exatamente `"normal"` ou `"preferencial"`. Por exemplo, `"urgente"` causa erro de tipo quando usado diretamente como categoria.

O serviço informa o que a pessoa deseja fazer. Ele não muda a prioridade: uma consulta normal aguarda qualquer exame preferencial que esteja na fila.

### A interface Senha

```ts
export interface Senha {
  readonly codigo: string;
  readonly categoria: Categoria;
  readonly servico: Servico;
}
```

A interface descreve a forma do objeto. Ela não gera códigos nem insere elementos nas filas.

`codigo` identifica a senha. `categoria` determina sua prioridade. `servico` identifica o atendimento solicitado. O modificador `readonly` evita atribuições como `senha.categoria = "preferencial"` em TypeScript depois da criação.

Essa proteção importa porque o objeto retornado na geração e os objetos retornados na consulta são os mesmos armazenados nas filas. `readonly` é uma proteção de compilação, não um congelamento do objeto em JavaScript.

## 4. A estrutura em FilaCircular.ts

### Classe genérica

```ts
export class FilaCircular<T> {
```

`T` é um parâmetro de tipo. A estrutura funciona com `FilaCircular<string>` nos exemplos e com `FilaCircular<Senha>` no atendimento. Ela não precisa conhecer código, categoria ou serviço para inserir e retirar elementos.

### Atributos

| Atributo | Função |
| --- | --- |
| `elementos` | Array que guarda os elementos. O tipo permite posições sem elemento. |
| `inicio` | Índice do próximo elemento a ser retirado. |
| `fim` | Índice onde a próxima inserção será feita. |
| `quantidade` | Número de elementos atualmente na fila. |
| `capacidade` | Limite de elementos da fila. |

Os índices começam em zero, assim como os índices de um array JavaScript. Em uma fila de capacidade 3, os índices válidos são 0, 1 e 2.

O índice `fim` representa a próxima posição de inserção, não necessariamente a posição do último elemento presente.

### Construtor

```ts
if (!Number.isInteger(capacidade) || capacidade <= 0) {
  throw new Error("A capacidade deve ser um número inteiro positivo.");
}
```

`Number.isInteger()` verifica se o valor é inteiro. O operador `||` significa “ou”: se não for inteiro ou se for menor ou igual a zero, a criação é interrompida.

Depois da validação, o construtor guarda o limite e cria o array:

```ts
this.capacidade = capacidade;
this.elementos = new Array<T | undefined>(capacidade);
```

O array nasce com o comprimento configurado e posições ainda não preenchidas. A classe mantém esse comprimento porque só escreve em índices válidos; não usa `push()` ou `shift()` no array interno.

### Verificação de fila vazia e cheia

```ts
estaVazia(): boolean {
  return this.quantidade === 0;
}

estaCheia(): boolean {
  return this.quantidade === this.capacidade;
}
```

O contador é necessário porque `inicio` e `fim` podem ser iguais tanto na fila vazia quanto na cheia. A quantidade diferencia os dois estados.

### Inserção com enfileirar

```ts
enfileirar(elemento: T): void {
  if (this.estaCheia()) {
    throw new Error("A fila está cheia.");
  }

  this.elementos[this.fim] = elemento;
  this.fim = (this.fim + 1) % this.capacidade;
  this.quantidade++;
}
```

Primeiro o método impede a inserção em uma fila cheia. Depois escreve na próxima posição disponível, avança o índice e aumenta a quantidade. O retorno é `void` porque a operação não precisa devolver o elemento inserido.

O operador `%` calcula o resto da divisão. Com capacidade 3:

```text
(0 + 1) % 3 = 1
(1 + 1) % 3 = 2
(2 + 1) % 3 = 0
```

É essa volta ao índice zero que faz a fila ser circular. O array é linear na memória; a circularidade está na maneira como os índices são calculados.

### Retirada com desenfileirar

```ts
desenfileirar(): T | undefined {
  if (this.estaVazia()) {
    return undefined;
  }

  const elemento = this.elementos[this.inicio];
  this.elementos[this.inicio] = undefined;
  this.inicio = (this.inicio + 1) % this.capacidade;
  this.quantidade--;

  return elemento;
}
```

Se não houver elementos, retorna `undefined`. Caso contrário, guarda o primeiro elemento em uma variável, limpa a posição ocupada, avança o início e diminui a quantidade. Por fim, devolve o elemento guardado.

A limpeza não exclui a posição do array nem reduz seu comprimento. Ela remove a referência ao objeto naquela posição. Os outros elementos não são deslocados.

### Exemplo completo de circularidade

Na tabela, `—` representa uma posição sem elemento. A capacidade é 3.

| Operação | Array físico | Início | Fim | Quantidade | Ordem lógica |
| --- | --- | --- | --- | --- | --- |
| Criar | `[—, —, —]` | 0 | 0 | 0 | vazia |
| Inserir A | `[A, —, —]` | 0 | 1 | 1 | A |
| Inserir B | `[A, B, —]` | 0 | 2 | 2 | A, B |
| Inserir C | `[A, B, C]` | 0 | 0 | 3 | A, B, C |
| Retirar A | `[—, B, C]` | 1 | 0 | 2 | B, C |
| Inserir D | `[D, B, C]` | 1 | 1 | 3 | B, C, D |
| Retirar B | `[D, —, C]` | 2 | 1 | 2 | C, D |
| Retirar C | `[D, —, —]` | 0 | 1 | 1 | D |
| Retirar D | `[—, —, —]` | 1 | 1 | 0 | vazia |

Observe a inserção de D: embora esteja no índice zero, ele será atendido depois de B e C. A ordem da fila começa em `inicio`, não necessariamente no índice zero do array.

### Consulta com listar

```ts
listar(): T[] {
  const resultado: T[] = [];

  for (let i = 0; i < this.quantidade; i++) {
    const indice = (this.inicio + i) % this.capacidade;
    const elemento = this.elementos[indice];

    if (elemento !== undefined) {
      resultado.push(elemento);
    }
  }

  return resultado;
}
```

O laço começa em `i = 0` e percorre apenas a quantidade de elementos presentes. Cada índice é calculado a partir de `inicio`, respeitando a volta ao começo do array.

A verificação de `undefined` permite adicionar apenas elementos definidos. No uso deste projeto, uma senha nunca é `undefined`; esse valor representa ausência de elemento. Se a classe genérica fosse usada para guardar o próprio valor `undefined`, a listagem não o incluiria.

`push()` é usado apenas no novo array `resultado`. A estrutura circular interna permanece com o mesmo comprimento. Alterar a organização do array retornado não reorganiza a fila, embora os objetos contidos nele continuem sendo referências aos objetos originais.

## 5. As regras em SistemaAtendimento.ts

### Imports

```ts
import { FilaCircular } from "../structures/FilaCircular.js";
import type { Categoria, Senha, Servico } from "../models/Senha.js";
```

`../` significa subir uma pasta a partir do arquivo atual. A classe é importada como valor porque precisamos criar objetos com `new`. Categoria, Senha e Servico são importados como tipos.

A extensão `.js` corresponde ao arquivo após a compilação. Com `module: "nodenext"` e `type: "module"`, o TypeScript encontra o `.ts` durante a análise e preserva o caminho adequado para executar o JavaScript gerado.

### Atributos e construtor

| Atributo | Responsabilidade |
| --- | --- |
| `filaPreferencial` | Guarda apenas as senhas preferenciais. |
| `filaNormal` | Guarda apenas as senhas normais. |
| `codigosGerados` | Registra os códigos já usados nesta instância. |
| `aoAtingirLimite` | Guarda a função que será executada quando a última vaga for ocupada. |
| `capacidade` | Limite total de senhas aguardando. |
| `quantidade` | Soma dos elementos das duas filas. |

O construtor valida o limite, guarda a função de alarme e cria as duas filas. A validação também existe na classe da fila porque ela pode ser usada independentemente do atendimento.

Cada fila recebe a capacidade total para permitir qualquer distribuição de categorias. Se o limite for 5, pode haver cinco preferenciais, cinco normais ou uma mistura cuja soma seja cinco. Os arrays têm, juntos, espaço para dez posições, mas a lógica permite apenas cinco senhas aguardando.

A capacidade total compartilhada e as duas filas são decisões desta implementação para cumprir o enunciado.

### A função de alarme

```ts
constructor(capacidade: number, aoAtingirLimite: () => void = () => {})
```

O tipo `() => void` descreve uma função sem parâmetros e sem resultado útil. Uma função recebida para ser executada depois também é chamada de callback.

Na versão atual, `= () => {}` fornece uma função vazia quando o segundo argumento é omitido. Para apresentar um aviso de verdade, a criação precisa fornecer uma função, como faz o teste:

```ts
const sistema = new SistemaAtendimento(2, () => {
  console.log("ALARME: capacidade máxima atingida!");
});
```

Guardar a função no construtor não executa o aviso. Ele só acontece quando `this.aoAtingirLimite()` é chamado após uma inserção preencher o sistema.

A função fornecida pela interface deve cuidar de apresentar o aviso sem lançar erros. Ela é chamada depois que a senha já foi inserida; se lançar um erro, a inserção continuará feita, mas `gerarSenha()` não chegará ao seu retorno normal.

### Geração e verificação de capacidade

```ts
gerarSenha(categoria: Categoria, servico: Servico): Senha
```

Os parâmetros informam a categoria e o serviço. O retorno é o objeto `Senha` criado.

Antes de gerar o código, o método verifica o contador global:

```ts
if (this.quantidade === this.capacidade) {
  throw new Error("Capacidade máxima atingida. Aguarde um atendimento.");
}
```

Isso bloqueia uma nova senha mesmo quando ainda há posições livres no array de uma categoria. O limite é do sistema inteiro, não um limite independente para cada categoria.

### Código aleatório e Set

```ts
do {
  codigo = crypto.randomUUID().slice(0, 8).toUpperCase();
} while (this.codigosGerados.has(codigo));
```

`crypto.randomUUID()` gera um identificador aleatório. `slice(0, 8)` seleciona os primeiros oito caracteres e `toUpperCase()` coloca as letras em maiúsculas. Um exemplo de resultado é `F0B4BB3D`.

Como usamos apenas um trecho do identificador, um código pode se repetir. O `Set<string>` evita aceitar uma repetição: `has(codigo)` verifica se ele já existe e `add(codigo)` o registra. O `do...while` executa pelo menos uma vez e repete enquanto encontrar um código já usado.

Os códigos permanecem registrados mesmo após o atendimento. A proteção contra repetição vale durante a existência daquela instância; não há registro persistente entre reinicializações. O código não determina a ordem de atendimento: a posição na fila faz isso.

No Node.js 24 usado no projeto, `crypto` está disponível globalmente. Ao integrar diretamente no navegador, a geração exige suporte a `crypto.randomUUID()` em contexto seguro, como HTTPS ou localhost.

### Criação e inserção da senha

```ts
const senha: Senha = {
  codigo,
  categoria,
  servico,
};
```

Essa é a forma abreviada de escrever propriedades com o mesmo nome da variável: `codigo` equivale a `codigo: codigo`.

Depois, um `if` escolhe a fila preferencial quando a categoria é `"preferencial"`; caso contrário, escolhe a normal. A chamada usa os tipos já definidos para aceitar as duas categorias válidas.

Ao concluir a inserção, o método registra o código, incrementa a quantidade total e verifica o limite. Se o limite foi atingido, executa o alarme. Por fim, devolve o objeto criado.

Há uma diferença entre os dois controles: inserir a última senha permitida dispara o alarme; tentar inserir outra depois disso lança o erro de capacidade. A tentativa bloqueada não dispara novamente o callback na implementação atual.

### Atendimento da próxima senha

```ts
if (!this.filaPreferencial.estaVazia()) {
  senha = this.filaPreferencial.desenfileirar();
} else {
  senha = this.filaNormal.desenfileirar();
}
```

Se existir uma preferencial aguardando, a primeira dela será retirada. A fila normal só é consultada quando a preferencial está vazia. Se ambas estiverem vazias, o resultado será `undefined`.

O contador total diminui apenas se uma senha foi retirada. Neste projeto, atender significa retirar da fila de espera; não há etapa separada de conclusão do atendimento.

Considere a geração nesta ordem:

```text
N1 normal → P1 preferencial → N2 normal → P2 preferencial
```

Sem novas inserções entre as chamadas, a ordem de atendimento será:

```text
P1 → P2 → N1 → N2
```

Os rótulos acima servem só para explicar a ordem; os códigos reais são aleatórios. Preferenciais geradas depois também passam à frente das normais que ainda aguardam, pois o enunciado exige prioridade absoluta.

### Consultas do sistema

`consultarFilas()` chama `listar()` em cada fila e devolve um objeto com duas propriedades: `preferenciais` e `normais`. Nenhuma senha é retirada.

`consultarQuantidade()` devolve o total aguardando. `consultarCapacidade()` devolve o limite inicial. Esses métodos permitem exibir a ocupação sem alterar diretamente os atributos privados.

## 6. O programa de demonstração em teste.ts

O arquivo atual cria um sistema de capacidade 2 e fornece um alarme que escreve no terminal. Em seguida:

1. Gera uma normal e uma preferencial. A segunda ocupa a última vaga e dispara o alarme.
2. Tenta gerar uma terceira senha dentro de um `try`.
3. A capacidade cheia provoca um erro, recebido pelo `catch`.
4. `erro instanceof Error` verifica se o valor recebido possui o formato esperado para acessar `message`.
5. Se for outro tipo de valor lançado, `throw erro` o propaga em vez de ocultá-lo.
6. Exibe quantidade e filas, mostrando que a tentativa bloqueada não criou outra senha.
7. Atende a preferencial, liberando uma vaga.
8. Gera uma normal de agendamento, preenche novamente o limite e dispara outro alarme.

Esse arquivo é uma demonstração manual, baseada na leitura das mensagens do terminal. Ele não é uma suíte que verifica automaticamente todos os casos. Nos testes anteriores também foram exercitadas a ordem FIFO, a circularidade, a consulta e a retirada de fila vazia.

## 7. Compilação e arquivos de configuração

### Execução no terminal

Na pasta do projeto:

```powershell
npm.cmd install
npx.cmd tsc --noEmit
npx.cmd tsc
node dist/teste.js
```

`npm.cmd install` instala as dependências. `tsc --noEmit` procura erros sem gerar arquivos. `tsc` compila de `src/` para `dist/`. Por fim, `node` executa o JavaScript gerado. Após mudar um arquivo `.ts`, compile novamente antes de executar o `.js`.

No PowerShell deste ambiente, usar `.cmd` evita chamar os scripts `.ps1` bloqueados pela política de execução. Isso não exige mudar essa política.

### package.json e package-lock.json

`type: "module"` define o uso de módulos ES nos arquivos JavaScript do pacote. `typescript` aparece em `devDependencies` porque é uma ferramenta de desenvolvimento usada na compilação.

O campo `main: "index.js"` é um metadado atual do pacote; ele não muda o comando de execução da demonstração, que é `node dist/teste.js`. O script `test` ainda contém a mensagem padrão do npm, portanto `npm test` não executa os testes do projeto.

O `package-lock.json` registra as versões resolvidas das dependências e deve acompanhar o projeto no Git.

### Opções do tsconfig.json

| Opção atual | Efeito |
| --- | --- |
| `rootDir: "./src"` | Define a raiz dos arquivos-fonte para organizar a saída. |
| `outDir: "./dist"` | Define onde ficam os arquivos gerados. |
| `module: "nodenext"` | Usa regras de módulos compatíveis com o Node.js e o tipo do pacote. |
| `target: "esnext"` | Gera JavaScript voltado a recursos recentes; não adiciona compatibilidade automaticamente a ambientes antigos. |
| `types: []` | Não inclui automaticamente pacotes de tipos globais de `@types`. |
| `sourceMap: true` | Gera mapas para relacionar o JavaScript ao TypeScript durante a depuração. |
| `declaration: true` | Gera arquivos `.d.ts` com as declarações de tipos. |
| `declarationMap: true` | Gera mapas que relacionam as declarações aos arquivos-fonte. |
| `strict: true` | Ativa verificações mais rigorosas de tipos. |
| `noUncheckedIndexedAccess: true` | Considera que acessar uma posição de array pode resultar em `undefined`. |
| `exactOptionalPropertyTypes: true` | Diferencia uma propriedade opcional ausente de uma propriedade explicitamente definida como `undefined`. |
| `verbatimModuleSyntax: true` | Preserva a sintaxe de imports e exports de valores e remove imports marcados como tipos. |
| `isolatedModules: true` | Verifica restrições para compilação dos arquivos individualmente. |
| `noUncheckedSideEffectImports: true` | Verifica imports feitos apenas para executar efeitos, como `import "./arquivo.js"`. |
| `moduleDetection: "force"` | Trata os arquivos como módulos. |
| `skipLibCheck: true` | Pula a verificação interna dos arquivos de declaração. |
| `jsx: "react-jsx"` | Configura a transformação de JSX caso ele seja usado; o código atual não usa JSX. |
| `include` | Seleciona os arquivos TypeScript dentro de `src/`. |
| `exclude` | Exclui `node_modules/` e `dist/` da busca inicial de arquivos. |

`include` e `exclude` ficam fora de `compilerOptions`. As opções precedidas por `//` são comentários e não estão ativas.

### .gitignore

`node_modules/` contém dependências que podem ser reinstaladas. `dist/` e `*.tsbuildinfo` são saídas de compilação. Logs, arquivos `.env` e arquivos do sistema operacional também são ignorados. A regra `!.env.example` permite versionar um eventual modelo de configuração sem incluir valores locais.

## 8. Integração para quem fará a interface

Uma demonstração pode ter três seções na mesma aplicação: Totem, Filas e Atendimento. Crie uma única instância de `SistemaAtendimento` e compartilhe-a entre essas seções.

| Ação da pessoa usuária | Método a chamar | Como usar o resultado |
| --- | --- | --- |
| Gerar uma senha | `gerarSenha(categoria, servico)` | Mostrar código, categoria e serviço; tratar erro se estiver cheio. |
| Ver as filas | `consultarFilas()` | Renderizar as listas de preferenciais e normais. |
| Chamar a próxima pessoa | `atenderProxima()` | Mostrar a senha chamada ou informar que não há ninguém aguardando. |
| Consultar ocupação | `consultarQuantidade()` e `consultarCapacidade()` | Mostrar, por exemplo, “2 de 5 vagas ocupadas”. |

Depois de gerar ou atender uma senha, consulte novamente o estado e atualize a tela. A classe não atualiza o HTML automaticamente. A função de alarme deve ser fornecida na criação para apresentar o aviso visual ou sonoro.

O código trabalha em memória. Recarregar a página que mantém a instância perde o estado. Criar instâncias em páginas independentes produz filas independentes; não há sincronização entre dispositivos neste projeto.

## 9. Custo das operações e pontos para a apresentação

| Operação | Custo de tempo |
| --- | --- |
| Verificar fila vazia ou cheia | O(1) |
| Inserir ou retirar na fila circular | O(1) |
| Listar uma fila | O(n), sendo n a quantidade nela |
| Atender a próxima senha no sistema | O(1) |
| Consultar quantidade ou capacidade | O(1) |
| Consultar as duas filas | O(p + n), pelas quantidades preferenciais e normais |

O(1) indica uma quantidade de passos que não cresce com o número de pessoas aguardando. O(n) indica que é preciso percorrer os elementos para produzir a lista. A geração de senha também envolve sorteio e verificação de código; em caso de colisão, o sorteio se repete.

Com capacidade C, os dois arrays usam espaço proporcional a C. O conjunto de códigos cresce conforme a quantidade de senhas geradas ao longo da execução, pois códigos atendidos não são apagados.

Para explicar ao professor, pratiquem responder:

1. Por que usar `%`? Para manter os índices dentro do array e reutilizar posições liberadas.
2. Por que contar elementos? Porque início e fim iguais podem significar fila vazia ou cheia.
3. Por que duas filas? Para aplicar a prioridade sem perder o FIFO dentro de cada categoria.
4. Por que não ordenar pelos códigos? Porque são identificadores aleatórios; a fila registra a ordem de entrada.
5. Por que o limite é compartilhado? Para representar uma capacidade única configurada na inicialização, conforme a decisão adotada para o enunciado.
6. Quando o alarme dispara? Depois de uma inserção ocupar a última vaga, inclusive se o sistema voltar a ficar cheio após um atendimento.
7. O que acontece sem senhas? O atendimento retorna `undefined` e não altera a quantidade.
8. O que acontece ao tentar gerar com o sistema cheio? Um erro é lançado antes de criar e inserir outra senha.

## 10. Exercícios de estudo

Façam os exercícios em uma cópia do programa de teste ou alterem temporariamente `src/teste.ts`. Compilem novamente a cada alteração.

| Exercício | Resultado esperado |
| --- | --- |
| Criar `FilaCircular<string>(1)`, inserir A, retirar A e inserir B | A posição zero é reutilizada; a próxima retirada devolve B. |
| Criar fila de capacidade 3, inserir A, B e C, retirar A e inserir D | A listagem será B, C, D. |
| Criar o sistema e chamar `atenderProxima()` imediatamente | Retorna `undefined`; quantidade permanece zero. |
| Gerar normal, preferencial, normal, preferencial e atender quatro vezes | Saem as duas preferenciais em sua ordem e depois as duas normais em sua ordem. |
| Criar capacidade 2 e tentar gerar três senhas | A terceira é bloqueada e a quantidade continua em 2. |
| Preencher, atender uma pessoa e preencher novamente | O alarme é chamado uma vez em cada preenchimento do limite. |
| Criar capacidade zero, negativa ou fracionária | O construtor lança um erro. |
| Listar as filas duas vezes sem atender ninguém | A quantidade e a ordem permanecem iguais. |

Para conferir a compreensão, acompanhem no papel os valores de `inicio`, `fim` e `quantidade` a cada operação, antes de comparar com a execução.
