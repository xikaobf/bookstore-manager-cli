export interface IAutor {
  id?: number;
  nome: string;
  nacionalidade: string | null;
}

export class Autor implements IAutor {
  constructor(
    public readonly nome: string,
    public readonly nacionalidade: string | null = null,
    public readonly id?: number
  ) {}
}