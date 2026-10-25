export type SituacaoEmprestimo = "ativo" | "devolvido" | "em atraso";

export class Emprestimo {
  constructor(
    public readonly livroId: number,
    public readonly clienteId: number,
    public readonly dataPrevistaDevolucao: string, // formato AAAA-MM-DD
    public readonly id?: number
  ) {}
}

// Dados completos para consulta (junção de empréstimo, livro e cliente)
export interface EmprestimoDetalhado {
  id: number;
  livroId: number;
  livroTitulo: string;
  clienteId: number;
  clienteNome: string;
  dataEmprestimo: string; // DD/MM/AAAA
  dataPrevista: string; // DD/MM/AAAA
  dataDevolucao: string | null; // DD/MM/AAAA
  situacao: SituacaoEmprestimo;
  diasAtraso: number;
}