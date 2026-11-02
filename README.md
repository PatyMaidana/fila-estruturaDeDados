# Sistema de Atendimento por Senhas — PRJ.ED.13

Projeto acadêmico de Estrutura de Dados desenvolvido em TypeScript. Implementa a lógica de geração e atendimento de senhas utilizando filas circulares com arrays e aritmética modular.

## Objetivo

O enunciado propõe um sistema web com simulação de totem de geração de senhas, visualização das filas e atendimento. Este código contém a lógica de dados e de atendimento; a interface será desenvolvida separadamente por outro integrante da equipe.

## Regras do sistema

- As senhas possuem códigos não sequenciais.
- As categorias disponíveis são `normal` e `preferencial`.
- Os serviços disponíveis são `consulta`, `exame` e `agendamento`.
- Toda senha preferencial aguardando é atendida antes de qualquer senha normal.
- Dentro de cada categoria, o atendimento segue a ordem de geração: primeiro a entrar, primeiro a sair (FIFO).
- O serviço identifica o atendimento solicitado e não altera a prioridade.
- A capacidade é definida na criação do sistema e deve ser um número inteiro positivo.
- Novas senhas são bloqueadas quando a capacidade é atingida.
- A função de alarme é chamada quando uma inserção ocupa a última vaga. Após um atendimento liberar espaço, preencher novamente o sistema dispara outro aviso.

## Estrutura de dados

A classe `FilaCircular<T>` utiliza um array de tamanho fixo, índices de início e fim e um contador de elementos. A inserção ocorre no fim e a retirada ocorre no início, sem deslocar os demais elementos do array.

Os índices avançam com aritmética modular:

```ts
this.fim = (this.fim + 1) % this.capacidade;
this.inicio = (this.inicio + 1) % this.capacidade;
```

O resto da divisão permite retornar à posição zero depois da última posição do array, reutilizando espaços liberados.

O sistema utiliza duas filas circulares, uma para cada categoria. O limite de atendimento é **total e compartilhado**: com capacidade 5, por exemplo, duas senhas preferenciais e três normais ocupam todas as vagas. Cada array possui espaço para a capacidade configurada, mas a classe `SistemaAtendimento` limita a soma dos elementos nas duas filas.

Essa organização é uma escolha de implementação para atender à prioridade exigida, pois o enunciado não detalha como distribuir a capacidade entre categorias.

As operações de inserção e retirada da fila circular têm custo O(1). A listagem tem custo O(n), considerando os elementos presentes na fila. A geração de códigos inclui uma verificação de repetição e pode precisar gerar outro código em caso de colisão.

## Organização dos arquivos

```text
src/
├── models/
│   └── Senha.ts                 # Tipos de categoria, serviço e interface da senha
├── structures/
│   └── FilaCircular.ts          # Implementação genérica da fila circular
├── services/
│   └── SistemaAtendimento.ts    # Prioridades, geração, capacidade e alarme
└── teste.ts                    # Demonstração de execução no terminal
package.json
tsconfig.json
README.md
```

Os arquivos JavaScript compilados são gerados na pasta `dist/`.

## Preparação e execução

Utilize Node.js 24, ambiente usado durante o desenvolvimento, e npm.

Na pasta do projeto, instale as dependências:

```powershell
npm.cmd install
```

Verifique os tipos sem gerar arquivos:

```powershell
npx.cmd tsc --noEmit
```

Compile o projeto e execute a demonstração:

```powershell
npx.cmd tsc
node dist/teste.js
```

Os comandos usam `.cmd` para permitir a execução no PowerShell quando scripts `.ps1` estão bloqueados. Em outros terminais, também é possível usar `npm` e `npx`.

O arquivo `teste.ts` contém uma demonstração manual. O script `npm test` ainda não está configurado para executar testes.

## Exemplo de uso

```ts
import { SistemaAtendimento } from "./services/SistemaAtendimento.js";

const sistema = new SistemaAtendimento(2, () => {
  console.log("ALARME: capacidade máxima atingida!");
});

const normal = sistema.gerarSenha("normal", "consulta");
const preferencial = sistema.gerarSenha("preferencial", "exame");
// A segunda inserção dispara o alarme.

console.log(sistema.consultarFilas());
console.log(sistema.consultarQuantidade()); // 2
console.log(sistema.consultarCapacidade()); // 2

console.log(sistema.atenderProxima() === preferencial); // true
console.log(sistema.atenderProxima() === normal); // true
console.log(sistema.atenderProxima()); // undefined
```

Na configuração atual, a função de alarme é opcional no construtor. Para cumprir o requisito de aviso, forneça essa função ao criar o sistema. A interface poderá utilizá-la para apresentar uma mensagem ou emitir um som.

## Métodos disponíveis

### FilaCircular<T>

| Método | Comportamento |
| --- | --- |
| `estaVazia()` | Informa se a fila está vazia. |
| `estaCheia()` | Informa se a fila está cheia. |
| `enfileirar(elemento)` | Insere no fim; lança um erro se não houver espaço. |
| `desenfileirar()` | Retira o primeiro elemento ou retorna `undefined` se estiver vazia. |
| `listar()` | Retorna uma lista em ordem de atendimento sem remover elementos. |

### SistemaAtendimento

| Método | Comportamento |
| --- | --- |
| `gerarSenha(categoria, servico)` | Gera e insere uma senha; lança um erro se o sistema estiver cheio. |
| `atenderProxima()` | Retira a próxima preferencial ou, na ausência dela, a próxima normal. Retorna `undefined` se não houver senhas. |
| `consultarFilas()` | Retorna um objeto com as listas `preferenciais` e `normais`. |
| `consultarQuantidade()` | Retorna o total de senhas aguardando. |
| `consultarCapacidade()` | Retorna o limite total configurado. |

Os códigos são formados pelos primeiros oito caracteres de `crypto.randomUUID()`, convertidos para maiúsculas. Um `Set` registra os códigos gerados e impede sua reutilização durante a existência daquela instância do sistema.

## Integração com a interface

- O totem chama `gerarSenha()` e apresenta a senha retornada.
- A visualização consulta `consultarFilas()`.
- A tela de atendimento chama `atenderProxima()` e apresenta a senha retornada.
- A interface trata os erros de capacidade com `try...catch` e fornece a função de alarme ao construtor.
- Para uma demonstração com três seções ou abas em uma única página, todas devem compartilhar a mesma instância de `SistemaAtendimento`.

Os dados permanecem em memória. Reiniciar a aplicação ou recarregar a página que mantém a instância descarta as filas. Este código não inclui servidor, banco de dados ou sincronização entre dispositivos.
