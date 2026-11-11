import { useEffect, useState } from "react";
import "./App.css";
import Totem from "./components/Totem";
import PainelFilas from "./components/PainelFilas";
import Atendimento from "./components/Atendimento";
import StatusSistema from "./components/StatusSistema";

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

type Status = {
  quantidade: number;
  capacidade: number;
  lotada: boolean;
};

function App() {
  const [categoria, setCategoria] = useState<Categoria>("normal");
  const [servico, setServico] = useState<Servico>("consulta");
  const [senhaGerada, setSenhaGerada] = useState<Senha | null>(null);
  const [erro, setErro] = useState("");
  const [filas, setFilas] = useState<Filas>({
    preferenciais: [],
    normais: [],
  });
  const [senhaAtendida, setSenhaAtendida] = useState<Senha | null>(null);
  const [status, setStatus] = useState<Status>({
    quantidade: 0,
    capacidade: 0,
    lotada:false,
  })

useEffect(() => {
  carregarFilas();
  carregarStatus();
}, []);

async function carregarStatus() {
  try {
    const resposta = await fetch("http://localhost:3000/api/status");

    const dados = await resposta.json();

    if(!resposta.ok) {
      throw new Error("Não foi possível carregar o status.");
    }

    setStatus(dados);
  } catch (erro) {
    if (erro instanceof Error) {
      setErro(erro.message);
    }
  }
}

  async function gerarSenha() {
    try {
      setErro("");
      const resposta = await fetch("http://localhost:3000/api/senhas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoria,
          servico,
        }),
      });

      const dados = await resposta.json();
      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível gerar a senha.");
      }

      setSenhaGerada(dados);
      await carregarFilas();
      await carregarStatus();
    } catch (erro) {
      if (erro instanceof Error) {
        setErro(erro.message);
      }
    }
  }

  async function carregarFilas() {
    try {
      const resposta = await fetch("http://localhost:3000/api/filas");
      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar as filas.");
      }
      setFilas(dados);
    } catch (erro) {
      if (erro instanceof Error) {
        setErro(erro.message);
      }
    }
  }

  async function chamarProxima() {
    try {
      setErro("");
      const resposta = await fetch(
        "http://localhost:3000/api/atendimento/proxima", {
          method:"POST",
        },
      );
      const dados = await resposta.json();
      if(!resposta.ok) {
        throw new Error (
          dados.erro || "Não foi possível chamar a próxima senha."
        );
      }

      setSenhaAtendida(dados);
      await carregarFilas();
      await carregarStatus();
      } catch (erro) {
        if (erro instanceof Error) {
          setErro(erro.message);
        }
      }
  }
  return (
    
<main className="app-shell">
  <header className="app-header">
    <div>
      <span className="sistema-label">PRJ.ED.13</span>
      <h1>Sistema de Atendimento</h1>
    </div>

    <span className="sistema-online">
      ● SISTEMA ONLINE
    </span>
  </header>

  <div className="dashboard-grid">
<Totem
  categoria={categoria}
  servico={servico}
  setCategoria={setCategoria}
  setServico={setServico}
  gerarSenha={gerarSenha}
  senhaGerada={senhaGerada}
/> 

<StatusSistema status={status} />

<PainelFilas filas={filas} />

<Atendimento
  senhaAtendida={senhaAtendida}
  chamarProxima={chamarProxima}
/>
  </div>

  {erro && (
    <p className="mensagem-erro">
      {erro}
    </p>
  )}
  
</main>
  );
}
export default App; 
