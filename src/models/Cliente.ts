export interface ICliente {
  id?: number;
  nome: string;
  email: string;
  telefone: string | null;
}

export class Cliente implements ICliente {
  constructor(
    public readonly nome: string,
    public readonly email: string,
    public readonly telefone: string | null = null,
    public readonly id?: number
  ) {}
}