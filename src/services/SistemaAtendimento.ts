import { FilaCircular } from "../structures/FilaCircular.js";
import type { Categoria, Senha, Servico } from "../models/Senha.js";

export class SistemaAtendimento {
  private filaPreferencial: FilaCircular<Senha>;
  private filaNormal: FilaCircular<Senha>;
  private codigosGerados = new Set<string>();
  private aoAtingirLimite: () => void;

  private capacidade: number;
  private quantidade: number = 0;
  //metodo construtor inicializa a capacidade máxima do sistema de atendimento e cria duas filas circulares separadas para senhas preferenciais e normais, além de um conjunto para rastrear os códigos gerados
  constructor(capacidade: number, aoAtingirLimite: () => void = () => {}) {
    if (!Number.isInteger(capacidade) || capacidade <= 0) {
      throw new Error("A capacidade deve ser um número inteiro positivo.");
    }

    this.capacidade = capacidade;
    this.aoAtingirLimite = aoAtingirLimite;

    this.filaPreferencial = new FilaCircular<Senha>(capacidade);
    this.filaNormal = new FilaCircular<Senha>(capacidade);
  }
  //metodo gerarSenha gera uma nova senha com um código único, categoria e serviço especificados. Ele verifica se a capacidade máxima foi atingida, gera um código aleatório e garante que não haja duplicatas. A senha é então adicionada à fila apropriada (preferencial ou normal) e o código é registrado para evitar duplicatas futuras.
  gerarSenha(categoria: Categoria, servico: Servico): Senha {
    if (this.quantidade === this.capacidade) {
      throw new Error("Capacidade máxima atingida. Aguarde um atendimento.");
    }

    let codigo: string;

    do {
      codigo = crypto.randomUUID().slice(0, 8).toUpperCase();
    } while (this.codigosGerados.has(codigo));

    const senha: Senha = {
      codigo,
      categoria,
      servico,
    };

    if (categoria === "preferencial") {
      this.filaPreferencial.enfileirar(senha);
    } else {
      this.filaNormal.enfileirar(senha);
    }

    this.codigosGerados.add(codigo);
    this.quantidade++;

    if (this.quantidade === this.capacidade) {
      this.aoAtingirLimite();
    }

    return senha;
  }
  //metodo atenderProxima verifica se há senhas na fila preferencial e, se houver, retira a próxima senha dessa fila. Caso contrário, ele retira a próxima senha da fila normal. Se uma senha for atendida, a quantidade de senhas no sistema é decrementada. O método retorna a senha atendida ou undefined se não houver senhas disponíveis.
  atenderProxima(): Senha | undefined {
    let senha: Senha | undefined;

    if (!this.filaPreferencial.estaVazia()) {
      senha = this.filaPreferencial.desenfileirar();
    } else {
      senha = this.filaNormal.desenfileirar();
    }

    if (senha !== undefined) {
      this.quantidade--;
    }

    return senha;
  }
  //metodo consultarFilas retorna um objeto contendo as senhas atualmente presentes nas filas preferencial e normal, utilizando o método listar das filas circulares para obter os elementos.
  consultarFilas(): {
    preferenciais: Senha[];
    normais: Senha[];
  } {
    return {
      preferenciais: this.filaPreferencial.listar(),
      normais: this.filaNormal.listar(),
    };
  }

  consultarQuantidade(): number {
    return this.quantidade;
  }

  consultarCapacidade(): number {
    return this.capacidade;
  }

  alterarCapacidade(novaCapacidade: number): void {
    if(novaCapacidade <= 0) {
      throw new Error ("A capacidade deve ser maior que zero.");
    }

    if (novaCapacidade < this.quantidade){
      throw new Error (" A capacidade não pode ser menor que a quantidade atual de senhas.",
      );
    }

    this.filaPreferencial.alterarCapacidade(novaCapacidade);
    this.filaNormal.alterarCapacidade(novaCapacidade)
    this.capacidade = novaCapacidade;
  }

}
