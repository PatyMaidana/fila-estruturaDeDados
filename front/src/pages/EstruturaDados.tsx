import { Link } from "react-router-dom";
import "./EstruturaDados.css";

function EstruturaDados() {
  return (
    <main className="estrutura-page">
      <header className="estrutura-header">
        <nav className="estrutura-nav">
          <Link to="/">Sistema</Link>
          <Link to="/estrutura-dados">Estrutura de Dados</Link>
        </nav>
        <span>PRJ.ED.13</span>
        <h1>Fila Circular</h1>

        <p>
          Entenda como a estrutura de dados utilizada no sistema organiza e
          atende as senhas.
        </p>
      </header>

      <section>
        <h2>1. O problema</h2>

        <p>
          Nosso sistema precisa armazenar senhas de atendimento, respeitando a
          ordem em que foram geradas e dando prioridade para atendimentos
          preferenciais.
        </p>
      </section>

      <section>
        <h2>2. O que é uma fila?</h2>

        <p>
          Uma fila é uma estrutura de dados baseada na regra FIFO: First In,
          First Out.
        </p>

        <div className="fila-exemplo">
          <span>N1</span>
          <span>N2</span>
          <span>N3</span>
        </div>

        <p>N1 entrou primeiro, portanto será atendido primeiro.</p>
      </section>

      <section>
        <h2>3. Por que uma fila circular?</h2>

        <p>
          Em vez de deslocar todos os elementos quando uma senha é removida,
          utilizamos índices que percorrem o array de forma circular.
        </p>

        <div className="fila-circular-demo">
          <div className="array-indices">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
          </div>

          <div className="array-visual">
            <div className="array-celula">N4</div>

            <div className="array-celula vazia">vazio</div>

            <div className="array-celula inicio">N2</div>

            <div className="array-celula">N3</div>
          </div>

          <div className="array-marcadores">
            <span className="marcador-fim">↑ fim</span>

            <span className="marcador-inicio">↑ início</span>
          </div>

          <div className="ordem-logica">
            <span>Ordem lógica da fila:</span>

            <strong>N2 → N3 → N4</strong>
          </div>
        </div>
      </section>

      <section>
        <h2>4. Estrutura interna</h2>

        <p>Nossa fila circular controla quatro informações principais.</p>

        <ul className="estrutura-lista">
          <li>
            <strong>elementos:</strong> array onde as senhas são armazenadas.
          </li>

          <li>
            <strong>inicio:</strong> posição da próxima senha a ser removida.
          </li>

          <li>
            <strong>fim:</strong> posição onde a próxima senha será inserida.
          </li>

          <li>
            <strong>quantidade:</strong> quantidade atual de elementos.
          </li>
        </ul>
      </section>
      <section>
        <h2>5. Aritmética modular</h2>

        <p>
          O comportamento circular acontece utilizando o operador de resto da
          divisão.
        </p>

        <div className="modulo-bloco">
          <code>fim = (fim + 1) % capacidade</code>
        </div>

        <p>Com uma capacidade igual a 4, os índices percorrem o array assim:</p>

        <div className="ciclo-indices">
          <div className="indice-ciclo">0</div>
          <span>→</span>

          <div className="indice-ciclo">1</div>
          <span>→</span>

          <div className="indice-ciclo">2</div>
          <span>→</span>

          <div className="indice-ciclo">3</div>
          <span>→</span>

          <div className="indice-ciclo retorno">0</div>
        </div>

        <div className="modulo-exemplo">
          <p>
            Quando <strong>fim = 3</strong>:
          </p>

          <code>(3 + 1) % 4 = 0</code>

          <p>O índice volta para o início do array.</p>
        </div>
      </section>

      <section>
        <h2>6. Inserção e remoção</h2>

        <p>
          A fila circular possui duas operações principais: inserir no fim e
          remover do início.
        </p>

        <div className="operacoes-grid">
          <div className="operacao-card">
            <span className="operacao-label">ENQUEUE</span>

            <h3>Inserção</h3>

            <div className="operacao-array">
              <div>N1</div>
              <div>N2</div>
              <div className="destino">N3</div>
              <div className="vazio">vazio</div>
            </div>

            <p>
              A nova senha entra na posição indicada por <strong>fim</strong>.
            </p>

            <pre>
              {`elementos[fim] = elemento;

fim = (fim + 1) % capacidade;

quantidade++;`}
            </pre>
          </div>

          <div className="operacao-card">
            <span className="operacao-label">DEQUEUE</span>

            <h3>Remoção</h3>

            <div className="operacao-array">
              <div className="removido">N1</div>
              <div className="inicio-novo">N2</div>
              <div>N3</div>
              <div className="vazio">vazio</div>
            </div>

            <p>
              A senha localizada em <strong>inicio</strong> é removida.
            </p>

            <pre>
              {`const elemento = elementos[inicio];

inicio = (inicio + 1) % capacidade;

quantidade--;`}
            </pre>
          </div>
        </div>

        <div className="complexidade-bloco">
          <strong>Por que isso é eficiente?</strong>

          <p>
            Nenhum elemento precisa ser deslocado dentro do array. Apenas os
            índices são atualizados.
          </p>

          <code>enqueue O(1) • dequeue O(1)</code>
        </div>
      </section>

      <section>
        <h2>7. Regra de prioridade</h2>

        <p>
          O sistema utiliza duas filas circulares independentes: uma para
          atendimentos preferenciais e outra para atendimentos normais.
        </p>

        <div className="prioridade-grid">
          <div className="prioridade-card">
            <span className="prioridade-label">Fila preferencial</span>

            <div className="prioridade-fila">
              <span>P1</span>
              <span>→</span>
              <span>P2</span>
              <span>→</span>
              <span>P3</span>
            </div>
          </div>

          <div className="prioridade-card">
            <span className="prioridade-label">Fila normal</span>

            <div className="prioridade-fila">
              <span>N1</span>
              <span>→</span>
              <span>N2</span>
              <span>→</span>
              <span>N3</span>
            </div>
          </div>
        </div>

        <div className="prioridade-regra">
          <strong>Regra de atendimento</strong>

          <p>
            Sempre que houver uma senha preferencial aguardando, ela será
            atendida antes de qualquer senha normal.
          </p>
        </div>

        <pre>
          {`if (!filaPreferencial.estaVazia()) {
  senha = filaPreferencial.desenfileirar();
} else {
  senha = filaNormal.desenfileirar();
}`}
        </pre>

        <div className="ordem-exemplo">
          <div>
            <span>Ordem de geração</span>
            <strong>N1 → P1 → N2 → P2 → N3</strong>
          </div>

          <div>
            <span>Ordem de atendimento</span>
            <strong>P1 → P2 → N1 → N2 → N3</strong>
          </div>
        </div>
      </section>

      <section>
        <h2>8. Capacidade e alarme</h2>

        <p>
          O sistema possui uma capacidade máxima configurada na inicialização.
          Essa capacidade considera o total de senhas aguardando nas filas
          preferencial e normal.
        </p>

        <div className="capacidade-grid">
          <div className="capacidade-card">
            <span>Capacidade máxima</span>
            <strong>10</strong>
          </div>

          <div className="capacidade-card">
            <span>Senhas na fila</span>
            <strong>7</strong>
          </div>

          <div className="capacidade-card">
            <span>Espaços disponíveis</span>
            <strong>3</strong>
          </div>
        </div>

        <div className="capacidade-barra">
          <div className="capacidade-preenchimento" />
        </div>

        <div className="capacidade-explicacao">
          <p>
            Quando a quantidade total de senhas atinge a capacidade máxima,
            novas inserções são bloqueadas.
          </p>
        </div>

        <pre>
          {`if (quantidade >= capacidade) {
  throw new Error("Capacidade máxima atingida");
}`}
        </pre>

        <div className="alarme-demo">
          <span className="alarme-icone">⚠</span>

          <div>
            <strong>CAPACIDADE MÁXIMA ATINGIDA</strong>

            <p>
              O sistema aciona um alarme quando a quantidade total de senhas
              aguardando atinge a capacidade máxima configurada.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>9. Aplicação no projeto</h2>

        <p>No nosso sistema, a responsabilidade é dividida em duas partes.</p>

        <pre>
          {`SistemaAtendimento
        ↓
decide qual fila utilizar
        ↓
FilaCircular
        ↓
controla inserção e remoção`}
        </pre>

        <p>
          O SistemaAtendimento controla a prioridade entre as filas, enquanto a
          FilaCircular garante a ordem FIFO dentro de cada categoria.
        </p>
      </section>
    </main>
  );
}

export default EstruturaDados;
