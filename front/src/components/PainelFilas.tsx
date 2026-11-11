import "./PainelFilas.css";

type Categoria = "normal" | "preferencial";
type Servico = "consulta" | "exame" | "agendamento";

type Senha = {
  codigo: string;
  categoria: Categoria;
  servico: Servico;
};

type Filas = {
  preferenciais: Senha[];
  normais: Senha[];
};

type Props = {
  filas: Filas;
};

function PainelFilas({ filas }: Props) {
  return (
<section className="painel painel-filas">
  <div className="filas-cabecalho">
    <span className="filas-codigo">QUEUE-MONITOR</span>
    <h2>Filas de atendimento</h2>
  </div>

  <div className="filas-grid">
    <div className="fila-bloco">
      <div className="fila-titulo">
        <span>Preferencial</span>
        <strong>{filas.preferenciais.length}</strong>
      </div>

      {filas.preferenciais.length === 0 ? (
        <p className="fila-vazia">Nenhuma senha.</p>
      ) : (
        <ul className="fila-lista">
          {filas.preferenciais.map((senha, index) => (
            <li
              key={senha.codigo}
              className={index === 0 ? "fila-item primeiro" : "fila-item"}
            >
              <span className="fila-posicao">
                {String(index + 1).padStart(2, "0")}
              </span>

              <strong>{senha.codigo}</strong>

              <span>{senha.servico}</span>
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className="fila-bloco">
      <div className="fila-titulo">
        <span>Normal</span>
        <strong>{filas.normais.length}</strong>
      </div>

      {filas.normais.length === 0 ? (
        <p className="fila-vazia">Nenhuma senha.</p>
      ) : (
        <ul className="fila-lista">
          {filas.normais.map((senha, index) => (
            <li
              key={senha.codigo}
              className={index === 0 ? "fila-item primeiro" : "fila-item"}
            >
              <span className="fila-posicao">
                {String(index + 1).padStart(2, "0")}
              </span>

              <strong>{senha.codigo}</strong>

              <span>{senha.servico}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
</section>
  );
}

export default PainelFilas;