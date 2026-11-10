export class FilaCircular<T> {
  private elementos: (T | undefined)[];
  private inicio: number = 0;
  private fim: number = 0;
  private quantidade: number = 0;
  private capacidade: number;

  constructor(capacidade: number) {
    if (!Number.isInteger(capacidade) || capacidade <= 0) {
      throw new Error("A capacidade deve ser um número inteiro positivo.");
    }

    this.capacidade = capacidade;
    this.elementos = new Array<T | undefined>(capacidade);
  }
  //verifica se a fila está vazia, retornando true se a quantidade de elementos for igual a zero e false caso contrário
  estaVazia(): boolean {
    return this.quantidade === 0;
  }
  //verifica se a fila está cheia, retornando true se a quantidade de elementos for igual à capacidade máxima e false caso contrário
  estaCheia(): boolean {
    return this.quantidade === this.capacidade;
  }
  //adiciona um elemento ao final da fila, atualizando o índice de fim e a quantidade de elementos. Se a fila estiver cheia, lança um erro
  enfileirar(elemento: T): void {
    if (this.estaCheia()) {
      throw new Error("A fila está cheia.");
    }

    this.elementos[this.fim] = elemento;
    this.fim = (this.fim + 1) % this.capacidade;
    this.quantidade++;
  }
  //retira e devolve o elemento do início da fila, atualizando o índice de início e a quantidade de elementos
  desenfileirar(): T | undefined {
    if (this.estaVazia()) {
      return undefined;
    }
    const elemento = this.elementos[this.inicio];

    this.elementos[this.inicio] = undefined;
    //o %this.capacidade faz que ao atingir esse numero o resultado volte a 0 isso é uma caracteristica da fila circular
    this.inicio = (this.inicio + 1) % this.capacidade;
    this.quantidade--;

    return elemento;
  }
  //retorna um array com os elementos da fila, percorrendo a fila circular a partir do índice de início e utilizando o operador módulo para lidar com a circularidade
  listar(): T[] {
    const resultado: T[] = [];

    for (let i = 0; i < this.quantidade; i++) {
      const indice = (this.inicio + i) % this.capacidade;
      const elemento = this.elementos[indice];

      if (elemento !== undefined) {
        resultado.push(elemento);
      }
    }

    return resultado;
  }
}
