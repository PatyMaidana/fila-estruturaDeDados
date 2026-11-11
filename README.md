# Sistema de Atendimento por Senhas - PRJ.ED.13

Projeto acadêmico de Estrutura de Dados em TypeScript: sistema web para gerar, visualizar e atender senhas com prioridade para atendimento preferencial. Utiliza filas circulares implementadas com arrays e aritmética modular.

O repositório contém a lógica de atendimento, uma API Express e uma interface React com Vite.

## Regras do sistema

- Categorias: `normal` e `preferencial`.
- Serviços: `consulta`, `exame` e `agendamento`.
- Códigos aleatórios não sequenciais, com verificação de repetição na instância do sistema.
- Preferenciais sempre são chamadas antes das normais que ainda aguardam.
- Dentro de cada categoria, vale a ordem de geração: primeiro a entrar, primeiro a sair (FIFO).
- O serviço não altera a prioridade.
- A capacidade é total e compartilhada. Com limite 10, quatro preferenciais e seis normais ocupam todas as vagas.
- Novas senhas são bloqueadas quando o sistema está cheio.
- Uma inserção que ocupa a última vaga chama a função de alarme. Liberar uma vaga e preenchê-la novamente dispara outro aviso.

A capacidade inicial do servidor é **10**, definida em `src/server.ts`. A interface também permite alterar o limite durante a execução; essa funcionalidade estende a exigência de configuração inicial do enunciado.

## Arquitetura e tecnologias

| Parte | Responsabilidade |
| --- | --- |
| TypeScript e `FilaCircular<T>` | Array circular, índices, contador e redimensionamento |
| `SistemaAtendimento` | Prioridade, geração de códigos, capacidade compartilhada e callback de alarme |
| Node.js e Express | API HTTP com uma instância compartilhada pelas requisições |
| React e React Router | Totem, filas, atendimento, status e página explicativa |
| Vite | Desenvolvimento e build da interface |
| `tsx` e `concurrently` | Reinicialização do servidor e execução conjunta no desenvolvimento |

```text
Interface React (localhost:5173)
              |
          HTTP / JSON
              |
API Express (localhost:3000)
              |
     SistemaAtendimento
              |
     +--------+--------+
     |                 |
FilaCircular       FilaCircular
preferencial          normal
```

As filas ficam em memória no servidor. Recarregar o navegador não apaga as senhas. Reiniciar o servidor, inclusive por uma alteração de código no modo watch, descarta o estado. Não há banco de dados.

## Estrutura de dados

`FilaCircular<T>` controla um array, o índice da próxima retirada (`inicio`), o índice da próxima inserção (`fim`), a quantidade ocupada e a capacidade.

```ts
this.fim = (this.fim + 1) % this.capacidade;
this.inicio = (this.inicio + 1) % this.capacidade;
```

O operador de resto permite voltar à posição zero depois da última posição. Inserções e retiradas não deslocam os outros elementos. A listagem usa `(inicio + i) % capacidade` para percorrer a ordem lógica.

Há um array por categoria, cada um com espaço para a capacidade configurada. O contador global impede que a soma das duas filas ultrapasse o limite compartilhado. Essa organização é uma decisão de implementação: o enunciado não detalha a distribuição do limite entre categorias.

O redimensionamento cria outro array, copia os elementos em ordem FIFO, redefine `inicio` para zero e calcula `fim` como `quantidade % novaCapacidade`. A redução abaixo da quantidade aguardando é bloqueada.

| Operação | Custo de tempo |
| --- | --- |
| Inserir ou retirar na fila circular | O(1) |
| Verificar se a fila está vazia ou cheia | O(1) |
| Atender a próxima senha | O(1) |
| Listar uma fila | O(n), pelos elementos nela presentes |
| Copiar os elementos no redimensionamento | O(n), além da criação do novo array |

A geração completa envolve sorteio e consulta ao `Set`, podendo repetir o sorteio em caso de colisão. Os dois arrays usam espaço proporcional à capacidade. O conjunto de códigos cresce com o histórico de senhas geradas.

## Organização dos arquivos

```text
src/
  models/Senha.ts                 # Tipos de categoria, serviço e senha
  structures/FilaCircular.ts       # Array circular e redimensionamento
  services/SistemaAtendimento.ts   # Prioridade, códigos, ocupação e alarme
  server.ts                       # API HTTP e instância compartilhada
  teste.ts                        # Demonstração manual no terminal
front/
  src/
    components/                   # Totem, PainelFilas, Atendimento, StatusSistema
    pages/Sistema.tsx             # Integração com a API
    pages/EstruturaDados.tsx      # Explicação visual da estrutura de dados
    App.tsx                       # Rotas da interface
    main.tsx                      # Entrada do React
  package.json                    # Dependências e comandos da interface
  vite.config.ts                  # Configuração do Vite
package.json                      # Dependências e comandos do servidor/projeto
package-lock.json                 # Versões resolvidas das dependências
tsconfig.json                     # Compilação de src/ para dist/
MANUAL.md                         # Material de estudo da implementação inicial
LICENSE                           # Texto de licença do repositório
```

`dist/` contém o servidor e a lógica compilados. `front/dist/` contém a interface compilada. Dependências e saídas de compilação estão no `.gitignore`.

## Instalação e execução local

Use Node.js 24 e npm, ambiente adotado no desenvolvimento. Execute a partir da raiz do repositório:

```powershell
npm.cmd install
npm.cmd install --prefix front
npm.cmd run dev
```

O comando `dev` inicia o servidor e a interface juntos. Acesse:

- Interface: `http://localhost:5173/`
- Página de estudo: `http://localhost:5173/estrutura-dados`
- API: `http://localhost:3000/`

Para encerrar, pressione `Ctrl+C`. Também é possível executar em terminais separados:

```powershell
# Terminal 1: servidor
npm.cmd run dev:back
```

```powershell
# Terminal 2: interface
npm.cmd run dev:front
```

A interface usa endereços fixos com `http://localhost:3000` nas chamadas. O CORS do servidor permite a origem `http://localhost:5173`. Se o Vite escolher outra porta porque a 5173 está ocupada, libere essa porta ou ajuste as configurações necessárias.

O sufixo `.cmd` evita os scripts `.ps1` bloqueados em algumas configurações do PowerShell. Em outros terminais, pode-se usar `npm` e `npx`.

## Compilação e verificação

```powershell
# Verificar tipos do servidor e da lógica sem gerar arquivos
npx.cmd tsc --noEmit

# Compilar servidor e lógica em dist/
npm.cmd run build

# Executar demonstração manual
node dist/teste.js

# Verificar tipos e compilar interface em front/dist/
npm.cmd run build --prefix front
```

Após o build da raiz, `npm.cmd start` executa `dist/server.js`. Esse comando inicia somente a API: o servidor Express atual não serve os arquivos da interface. O build da raiz também compila somente `src/`; o frontend possui seu próprio comando de build.

`src/teste.ts` demonstra capacidade, erro de lotação, atendimento e novo disparo do alarme. É uma demonstração manual com mensagens no terminal. Não há script `npm test` nem uma suíte automatizada configurada.

## Uso da interface

1. No totem, selecione categoria e serviço e clique em **Gerar senha**.
2. Confira o código emitido e as listas de preferenciais e normais.
3. Clique em **Chamar próxima senha** para retirar a próxima pessoa da fila de espera.
4. Acompanhe quantidade, capacidade e percentual de ocupação no status.
5. Use `+` e `-` para alterar o limite, respeitando a quantidade aguardando.
6. Ao lotar, a interface apresenta um aviso e tenta emitir um alarme sonoro. A reprodução depende do suporte e das permissões de áudio do navegador.

As filas e o status são consultados ao abrir a página e após ações realizadas nela. Não há WebSocket ou consulta periódica; outra janela pode precisar recarregar para mostrar mudanças feitas por um cliente diferente.

## API HTTP

Base: `http://localhost:3000`. Corpos de requisição usam JSON com o cabeçalho `Content-Type: application/json`.

| Método | Rota | Entrada | Resposta de sucesso |
| --- | --- | --- | --- |
| GET | `/` | Sem corpo | Mensagem de funcionamento |
| POST | `/api/senhas` | `categoria` e `servico` | 201; senha gerada |
| GET | `/api/filas` | Sem corpo | 200; listas `preferenciais` e `normais` |
| POST | `/api/atendimento/proxima` | Sem corpo | 200; senha retirada |
| GET | `/api/status` | Sem corpo | 200; `quantidade`, `capacidade` e `lotada` |
| PATCH | `/api/configuracao/capacidade` | `capacidade` | 200; quantidade e capacidade atuais |

Exemplo de corpo para gerar senha:

```json
{
  "categoria": "preferencial",
  "servico": "exame"
}
```

Exemplo de alteração de capacidade:

```json
{
  "capacidade": 15
}
```

Geração com sistema cheio e redução abaixo da ocupação retornam 400 com `{ "erro": "mensagem" }`. Atendimento sem senhas retorna 404. Os tipos TypeScript não validam o JSON recebido automaticamente; há pendências de validação descritas adiante.

## Métodos da lógica

| Classe | Método | Função |
| --- | --- | --- |
| `FilaCircular<T>` | `estaVazia()` / `estaCheia()` | Consultar estado da fila |
| `FilaCircular<T>` | `enfileirar(elemento)` | Inserir no fim ou lançar erro se cheia |
| `FilaCircular<T>` | `desenfileirar()` | Retirar o primeiro ou retornar `undefined` |
| `FilaCircular<T>` | `listar()` | Obter elementos em ordem sem removê-los |
| `FilaCircular<T>` | `alterarCapacidade(novaCapacidade)` | Copiar para outro array preservando a ordem |
| `SistemaAtendimento` | `gerarSenha(categoria, servico)` | Gerar e inserir na categoria correspondente |
| `SistemaAtendimento` | `atenderProxima()` | Atender preferencial primeiro; retornar `undefined` se vazio |
| `SistemaAtendimento` | `consultarFilas()` | Obter as duas listas |
| `SistemaAtendimento` | `consultarQuantidade()` / `consultarCapacidade()` | Consultar ocupação e limite total |
| `SistemaAtendimento` | `alterarCapacidade(novaCapacidade)` | Redimensionar as duas filas e atualizar o limite global |

Os códigos usam os primeiros oito caracteres de `crypto.randomUUID()`, convertidos para maiúsculas. O `Set` impede aceitar códigos já registrados naquela instância, inclusive de senhas atendidas. O código identifica a senha; a posição na fila determina a ordem.

O callback do construtor continua opcional na lógica. O servidor fornece uma função que escreve no console. O aviso visual e sonoro do frontend é acionado separadamente ao observar `status.lotada`.
