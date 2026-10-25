import { Pool } from "pg";
import { pool } from "../database/connection";
import { Cliente } from "../models/Cliente";

interface ClienteRow {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
}

export class ClienteRepository {
  constructor(private readonly db: Pool = pool) {}

  private paraModelo(row: ClienteRow): Cliente {
    return new Cliente(row.nome, row.email, row.telefone, row.id);
  }

  async inserir(cliente: Cliente): Promise<Cliente> {
    const resultado = await this.db.query<ClienteRow>(
      "INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *",
      [cliente.nome, cliente.email, cliente.telefone]
    );
    return this.paraModelo(resultado.rows[0]);
  }

  async listar(): Promise<Cliente[]> {
    const resultado = await this.db.query<ClienteRow>(
      "SELECT * FROM clientes ORDER BY id"
    );
    return resultado.rows.map((row) => this.paraModelo(row));
  }

  async buscarPorId(id: number): Promise<Cliente | null> {
    const resultado = await this.db.query<ClienteRow>(
      "SELECT * FROM clientes WHERE id = $1",
      [id]
    );
    return resultado.rows[0] ? this.paraModelo(resultado.rows[0]) : null;
  }

  async buscarPorEmail(email: string): Promise<Cliente | null> {
    const resultado = await this.db.query<ClienteRow>(
      "SELECT * FROM clientes WHERE LOWER(email) = LOWER($1)",
      [email]
    );
    return resultado.rows[0] ? this.paraModelo(resultado.rows[0]) : null;
  }

  async atualizar(id: number, cliente: Cliente): Promise<Cliente> {
    const resultado = await this.db.query<ClienteRow>(
      "UPDATE clientes SET nome = $1, email = $2, telefone = $3 WHERE id = $4 RETURNING *",
      [cliente.nome, cliente.email, cliente.telefone, id]
    );
    return this.paraModelo(resultado.rows[0]);
  }

  async remover(id: number): Promise<void> {
    await this.db.query("DELETE FROM clientes WHERE id = $1", [id]);
  }

  async possuiEmprestimos(id: number): Promise<boolean> {
    const resultado = await this.db.query(
      "SELECT 1 FROM emprestimos WHERE cliente_id = $1 LIMIT 1",
      [id]
    );
    return resultado.rows.length > 0;
  }
}