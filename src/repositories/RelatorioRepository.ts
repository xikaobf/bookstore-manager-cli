import { Pool } from "pg";
import { pool } from "../database/connection";
import {
  LivroDisponivel,
  LivroEmprestado,
  LivrosPorAutor,
  EmprestimosPorLivro,
  ClienteComEmprestimoAtivo,
  EmprestimoEmAtraso,
} from "../models/Relatorio";

const SQL_EMPRESTIMOS_POR_LIVRO = `
  SELECT l.id, l.titulo, COUNT(e.id)::int AS "totalEmprestimos"
  FROM livros l
  LEFT JOIN emprestimos e ON e.livro_id = l.id
  GROUP BY l.id, l.titulo
  ORDER BY "totalEmprestimos" DESC, l.titulo
`;

export class RelatorioRepository {
  constructor(private readonly db: Pool = pool) {}

  async livrosDisponiveis(): Promise<LivroDisponivel[]> {
    const resultado = await this.db.query<LivroDisponivel>(`
      SELECT l.id, l.titulo, a.nome AS autor,
             l.quantidade_disponivel AS "disponiveis",
             l.quantidade_total AS "total"
      FROM livros l
      INNER JOIN autores a ON a.id = l.autor_id
      WHERE l.quantidade_disponivel > 0
      ORDER BY l.titulo
    `);
    return resultado.rows;
  }

  async livrosEmprestados(): Promise<LivroEmprestado[]> {
    const resultado = await this.db.query<LivroEmprestado>(`
      SELECT l.id, l.titulo, a.nome AS autor,
             COUNT(e.id)::int AS "emprestimosAtivos"
      FROM livros l
      INNER JOIN autores a ON a.id = l.autor_id
      INNER JOIN emprestimos e ON e.livro_id = l.id
      WHERE e.data_devolucao IS NULL
      GROUP BY l.id, l.titulo, a.nome
      ORDER BY "emprestimosAtivos" DESC, l.titulo
    `);
    return resultado.rows;
  }

  async livrosPorAutor(): Promise<LivrosPorAutor[]> {
    const resultado = await this.db.query<LivrosPorAutor>(`
      SELECT a.id, a.nome AS autor,
             COUNT(l.id)::int AS "quantidadeTitulos",
             COALESCE(SUM(l.quantidade_total), 0)::int AS "totalExemplares"
      FROM autores a
      LEFT JOIN livros l ON l.autor_id = a.id
      GROUP BY a.id, a.nome
      ORDER BY "quantidadeTitulos" DESC, a.nome
    `);
    return resultado.rows;
  }

  async emprestimosPorLivro(): Promise<EmprestimosPorLivro[]> {
    const resultado = await this.db.query<EmprestimosPorLivro>(
      SQL_EMPRESTIMOS_POR_LIVRO
    );
    return resultado.rows;
  }

  async livrosMaisEmprestados(limite: number): Promise<EmprestimosPorLivro[]> {
    const resultado = await this.db.query<EmprestimosPorLivro>(
      `${SQL_EMPRESTIMOS_POR_LIVRO} LIMIT $1`,
      [limite]
    );
    return resultado.rows;
  }

  async clientesComEmprestimosAtivos(): Promise<ClienteComEmprestimoAtivo[]> {
    const resultado = await this.db.query<ClienteComEmprestimoAtivo>(`
      SELECT c.id, c.nome, c.email,
             COUNT(e.id)::int AS "emprestimosAtivos"
      FROM clientes c
      INNER JOIN emprestimos e ON e.cliente_id = c.id
      WHERE e.data_devolucao IS NULL
      GROUP BY c.id, c.nome, c.email
      ORDER BY "emprestimosAtivos" DESC, c.nome
    `);
    return resultado.rows;
  }

  async emprestimosEmAtraso(): Promise<EmprestimoEmAtraso[]> {
    const resultado = await this.db.query<EmprestimoEmAtraso>(`
      SELECT e.id,
             l.titulo AS livro,
             c.nome AS cliente,
             to_char(e.data_prevista_devolucao, 'DD/MM/YYYY') AS "dataPrevista",
             (CURRENT_DATE - e.data_prevista_devolucao)::int AS "diasAtraso"
      FROM emprestimos e
      INNER JOIN livros l ON l.id = e.livro_id
      INNER JOIN clientes c ON c.id = e.cliente_id
      WHERE e.data_devolucao IS NULL
        AND CURRENT_DATE > e.data_prevista_devolucao
      ORDER BY "diasAtraso" DESC
    `);
    return resultado.rows;
  }
}
