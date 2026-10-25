export interface ILivro {
  id?: number;
  titulo: string;
  anoPublicacao: number | null;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  autorId: number;
  autorNome?: string;
}

export class Livro implements ILivro {
  constructor(
    public readonly titulo: string,
    public readonly anoPublicacao: number | null,
    public readonly quantidadeTotal: number,
    public readonly quantidadeDisponivel: number,
    public readonly autorId: number,
    public readonly id?: number,
    public readonly autorNome?: string
  ) {}
}