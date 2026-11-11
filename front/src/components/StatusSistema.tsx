import "./StatusSistema.css";

type Status = {
  quantidade: number;
  capacidade: number;
  lotada: boolean;
};

type Props = {
  status: Status;
};
function StatusSistema({ status }: Props) {
  const percentual =
    status.capacidade > 0
      ? (status.quantidade / status.capacidade) * 100
      : 0;

  return (
    <section className="painel painel-status">
      <div className="status-cabecalho">
        <span className="status-codigo">SYS-STATUS</span>
        <h2>Status do sistema</h2>
      </div>

      <div className="status-indicador">
        <span
          className={`status-led ${
            status.lotada ? "status-led-alerta" : ""
          }`}
        />

        <span>
          {status.lotada
            ? "CAPACIDADE MÁXIMA"
            : "SISTEMA DISPONÍVEL"}
        </span>
      </div>

      <div className="status-capacidade">
        <div className="status-numeros">
          <span>Ocupação</span>

          <strong>
            {status.quantidade} / {status.capacidade}
          </strong>
        </div>

        <div className="status-barra">
          <div
            className={`status-progresso ${
              status.lotada ? "status-progresso-alerta" : ""
            }`}
            style={{
              width: `${percentual}%`,
            }}
          />
        </div>

        <span className="status-percentual">
          {Math.round(percentual)}%
        </span>
      </div>

      {status.lotada && (
        <div className="status-alerta">
          <strong>⚠ ALARME</strong>

          <p>
            Limite da fila circular atingido.
          </p>
        </div>
      )}
    </section>
  );
}

export default StatusSistema;