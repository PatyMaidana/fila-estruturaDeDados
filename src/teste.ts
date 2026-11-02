import { SistemaAtendimento } from "./services/SistemaAtendimento.js";

const sistema = new SistemaAtendimento(2, () => {
  console.log("ALARME: capacidade máxima atingida!");
});

sistema.gerarSenha("normal", "consulta");
sistema.gerarSenha("preferencial", "exame");

try {
  sistema.gerarSenha("normal", "agendamento");
} catch (erro) {
  if (erro instanceof Error) {
    console.log("Inserção bloqueada:", erro.message);
  } else {
    throw erro;
  }
}

console.log("Quantidade após tentativa:", sistema.consultarQuantidade());
console.log("Filas:", sistema.consultarFilas());

sistema.atenderProxima();

const novaSenha = sistema.gerarSenha("normal", "agendamento");

console.log("Nova senha gerada:", novaSenha);
console.log("Quantidade final:", sistema.consultarQuantidade());
