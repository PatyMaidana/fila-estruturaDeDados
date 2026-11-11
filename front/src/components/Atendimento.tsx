import "./Atendimento.css";

type Categoria = "normal" | "preferencial";
type Servico = "consulta" | "exame" | "agendamento";

type Senha = {
  codigo: string;
  categoria: Categoria;
  servico: Servico;
};

type Props = {
  senhaAtendida: Senha | null;
  chamarProxima: () => void;
};

function Atendimento({
  senhaAtendida,
  chamarProxima,
}: Props) {
  return (
<section className="painel painel-atendimento">
  <div className="atendimento-cabecalho">
    <span className="atendimento-codigo">SERVICE-DESK</span>
    <h2>Atendimento</h2>
  </div>

  {senhaAtendida ? (
    <div className="senha-atendimento">
      <span className="senha-atendimento-label">
        Senha em atendimento
      </span>

      <strong className="senha-atendimento-codigo">
        {senhaAtendida.codigo}
      </strong>

      <span className="senha-atendimento-detalhe">
        {senhaAtendida.categoria} / {senhaAtendida.servico}
      </span>
    </div>
  ) : (
    <div className="atendimento-vazio">
      <span>Nenhuma senha chamada.</span>
    </div>
  )}

  <button
    type="button"
    className="botao-atender"
    onClick={chamarProxima}
  >
    Chamar próxima senha
  </button>
</section>
  );
}

export default Atendimento;