export type Categoria = "normal" | "preferencial";

export type Servico = "consulta" | "exame" | "agendamento";

export interface Senha {
  readonly codigo: string;
  readonly categoria: Categoria;
  readonly servico: Servico;
}
