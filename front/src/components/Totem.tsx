import "./Totem.css";

type Categoria = "normal" | "preferencial";
type Servico = "consulta" | "exame" | "agendamento";

type Senha = {
  codigo: string;
  categoria: Categoria;
  servico: Servico;
};

type Props = {
  categoria: Categoria;
  servico: Servico;
  setCategoria: (categoria: Categoria) => void;
  setServico: (servico: Servico) => void;
  gerarSenha: () => void;
  senhaGerada: Senha | null;
};

function Totem({
  categoria,
  servico,
  setCategoria,
  setServico,
  gerarSenha,
  senhaGerada,
}: Props) {
  return (
<section className="painel painel-totem">
  <div className="painel-cabecalho">
    <span className="painel-codigo">TOTEM-01</span>
    <h2>Gerar senha</h2>
    <p>Selecione a categoria e o serviço desejado.</p>
  </div>

  <div className="grupo-opcoes">
    <span className="grupo-label">Categoria</span>

    <div className="opcoes-grid">
      <button
        type="button"
        className={categoria === "normal" ? "opcao ativa" : "opcao"}
        onClick={() => setCategoria("normal")}
      >
        Normal
      </button>

      <button
        type="button"
        className={categoria === "preferencial" ? "opcao ativa" : "opcao"}
        onClick={() => setCategoria("preferencial")}
      >
        Preferencial
      </button>
    </div>
  </div>

  <div className="grupo-opcoes">
    <span className="grupo-label">Serviço</span>

    <div className="opcoes-grid opcoes-servico">
      <button
        type="button"
        className={servico === "consulta" ? "opcao ativa" : "opcao"}
        onClick={() => setServico("consulta")}
      >
        Consulta
      </button>

      <button
        type="button"
        className={servico === "exame" ? "opcao ativa" : "opcao"}
        onClick={() => setServico("exame")}
      >
        Exame
      </button>

      <button
        type="button"
        className={servico === "agendamento" ? "opcao ativa" : "opcao"}
        onClick={() => setServico("agendamento")}
      >
        Agendamento
      </button>
    </div>
  </div>

  <div className="selecao-resumo">
    <span>Seleção atual</span>
    <strong>
      {categoria} / {servico}
    </strong>
  </div>

  <button
    type="button"
    className="botao-gerar"
    onClick={gerarSenha}
  >
    Gerar senha
  </button>

  {senhaGerada && (
    <div className="ticket-senha">
      <span className="ticket-label">Senha gerada</span>

      <strong className="ticket-codigo">
        {senhaGerada.codigo}
      </strong>

      <span className="ticket-detalhe">
        {senhaGerada.categoria} / {senhaGerada.servico}
      </span>
    </div>
  )}
</section>
  );
}

export default Totem;
