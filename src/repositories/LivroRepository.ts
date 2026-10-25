import { Pool } from "pg";
import { pool } from "../database/connection";
import { Livro } from "../models/Livro";

interface LivroRow {
  id: number;
  titulo: string;
  ano_publicacao: number | null;
  quantidade_total: number;
  quantidade_disponivel: number;
  autor_id: number;
  autor_nome: string;
}

const SELECT_LIVROS = `
  SELECT l.id, l.titulo, l.ano_publicacao, l.quantidade_total,
         l.quantidade_disponivel, l.autor_id, a.nome AS autor_nome
  FROM livros l
  INNER JOIN autores a ON a.id = l.autor_id
`;

export class LivroRepository {
  constructor(private readonly db: Pool = pool) {}

  private paraModelo(row: LivroRow): Livro {
    return new Livro(
      row.titulo,
      row.ano_publicacao,
      row.quantidade_total,
      row.quantidade_disponivel,
      row.autor_id,
      row.id,
      row.autor_nome
    );
  }

  async inserir(livro: Livro): Promise<Livro> {
    const resultado = await this.db.query<{ id: number }>(
      `INSERT INTO livros (titulo, ano_publicacao, quantidade_total, quantidade_disponivel, autor_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        livro.titulo,
        livro.anoPublicacao,
        livro.quantidadeTotal,
        livro.quantidadeDisponivel,
        livro.autorId,
      ]
    );
    return (await this.buscarPorId(resultado.rows[0].id)) as Livro;
  }

  async listar(): Promise<Livro[]> {
    const resultado = await this.db.query<LivroRow>(
      `${SELECT_LIVROS} ORDER BY l.id`
    );
    return resultado.rows.map((row) => this.paraModelo(row));
  }

  async buscarPorId(id: number): Promise<Livro | null> {
    const resultado = await this.db.query<LivroRow>(
      `${SELECT_LIVROS} WHERE l.id = $1`,
      [id]
    );
    return resultado.rows[0] ? this.paraModelo(resultado.rows[0]) : null;
  }

  async buscarPorTituloEAutor(titulo: string, autorId: number): Promise<Livro | null> {
    const resultado = await this.db.query<LivroRow>(
      `${SELECT_LIVROS} WHERE LOWER(l.titulo) = LOWER($1) AND l.autor_id = $2`,
      [titulo, autorId]
    );
    return resultado.rows[0] ? this.paraModelo(resultado.rows[0]) : null;
  }

  async atualizar(id: number, livro: Livro): Promise<Livro> {
    await this.db.query(
      `UPDATE livros
       SET titulo = $1, ano_publicacao = $2, quantidade_total = $3, quantidade_disponivel = $4
       WHERE id = $5`,
      [
        livro.titulo,
        livro.anoPublicacao,
        livro.quantidadeTotal,
        livro.quantidadeDisponivel,
        id,
      ]
    );
    return (await this.buscarPorId(id)) as Livro;
  }

  async remover(id: number): Promise<void> {
    await this.db.query("DELETE FROM livros WHERE id = $1", [id]);
  }

  async possuiEmprestimos(id: number): Promise<boolean> {
    const resultado = await this.db.query(
      "SELECT 1 FROM emprestimos WHERE livro_id = $1 LIMIT 1",
      [id]
    );
    return resultado.rows.length > 0;
  }
}
