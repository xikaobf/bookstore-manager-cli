import { Pool } from "pg";
import { pool } from "../database/connection";
import { Autor } from "../models/Autor";

interface AutorRow {
  id: number;
  nome: string;
  nacionalidade: string | null;
}

export class AutorRepository {
  constructor(private readonly db: Pool = pool) {}

  private paraModelo(row: AutorRow): Autor {
    return new Autor(row.nome, row.nacionalidade, row.id);
  }

  async inserir(autor: Autor): Promise<Autor> {
    const resultado = await this.db.query<AutorRow>(
      "INSERT INTO autores (nome, nacionalidade) VALUES ($1, $2) RETURNING *",
      [autor.nome, autor.nacionalidade]
    );
    return this.paraModelo(resultado.rows[0]);
  }

  async listar(): Promise<Autor[]> {
    const resultado = await this.db.query<AutorRow>(
      "SELECT * FROM autores ORDER BY id"
    );
    return resultado.rows.map((row) => this.paraModelo(row));
  }

  async buscarPorId(id: number): Promise<Autor | null> {
    const resultado = await this.db.query<AutorRow>(
      "SELECT * FROM autores WHERE id = $1",
      [id]
    );
    return resultado.rows[0] ? this.paraModelo(resultado.rows[0]) : null;
  }

  async buscarPorNome(nome: string): Promise<Autor | null> {
    const resultado = await this.db.query<AutorRow>(
      "SELECT * FROM autores WHERE LOWER(nome) = LOWER($1)",
      [nome]
    );
    return resultado.rows[0] ? this.paraModelo(resultado.rows[0]) : null;
  }

  async atualizar(id: number, autor: Autor): Promise<Autor> {
    const resultado = await this.db.query<AutorRow>(
      "UPDATE autores SET nome = $1, nacionalidade = $2 WHERE id = $3 RETURNING *",
      [autor.nome, autor.nacionalidade, id]
    );
    return this.paraModelo(resultado.rows[0]);
  }

  async remover(id: number): Promise<void> {
    await this.db.query("DELETE FROM autores WHERE id = $1", [id]);
  }

  async possuiLivros(id: number): Promise<boolean> {
    const resultado = await this.db.query(
      "SELECT 1 FROM livros WHERE autor_id = $1 LIMIT 1",
      [id]
    );
    return resultado.rows.length > 0;
  }
}