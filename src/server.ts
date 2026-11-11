import express from "express";
import cors from "cors";
import { SistemaAtendimento } from "./services/SistemaAtendimento.js";

const app = express();
const porta = 3000;
const sistema = new SistemaAtendimento(10, () => {
  console.log("ALARME: capacidade máxima atingida");
});

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);



app.use(express.json());
app.post("/api/senhas", (req, res) => {
  const { categoria, servico } = req.body;

  try {
    const senha = sistema.gerarSenha(categoria, servico);

    res.status(201).json(senha);
  } catch (erro) {
    if (erro instanceof Error) {
      res.status(400).json({
        erro: erro.message,
      });
      return;
    }
    res.status(500).json({
      erro: "Erro interno do servidor.",
    });
  }
});

app.get("/api/filas", (_req, res) => {
  const filas = sistema.consultarFilas();
  res.json(filas);
});

app.post("/api/atendimento/proxima", (_req, res) => {
  const senha = sistema.atenderProxima();

  if (!senha) {
    res.status(404).json({
      erro: "Não há senhas aguardando atendimento.",
    });
    return;
  }
  res.json(senha);
});

app.get("/api/status", (_req, res) => {
  res.json({
    quantidade: sistema.consultarQuantidade(),
    capacidade: sistema.consultarCapacidade(),
    lotada: sistema.consultarQuantidade() === sistema.consultarCapacidade(),
  });
});

app.patch("/api/configuracao/capacidade", (req, res) => {
  const { capacidade } = req.body;

  try {
    sistema.alterarCapacidade(capacidade);

    res.json({
      quantidade: sistema.consultarQuantidade(),
      capacidade: sistema.consultarCapacidade(),
    });
  } catch (erro) {
    if (erro instanceof Error) {
      res.status(400).json({
        erro: erro.message,
      });
      return;
    }

    res.status(500).json({
      erro: "Erro interno do servidor.",
    });
  }
});

app.get("/", (_req, res) => {
  res.json({
    mensagem: "Sistema de atendimento funcionando",
  });
});

app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});
