import { Pool } from "pg";
import { pool } from "../database/connection";
import {
  Emprestimo,
  EmprestimoDetalhado,
  SituacaoEmprestimo,
} from "../models/Emprestimo";

interface EmprestimoRow {
  id: number;
  livro_id: number;
  livro_titulo: string;
  cliente_id: number;
  cliente_nome: string;
  data_emprestimo: string;
  data_prevista: string;
  data_devolucao: string | null;
  situacao: SituacaoEmprestimo;
  dias_atraso: number;
}

const SELECT_EMPRESTIMOS = `
  SELECT e.id,
         e.livro_id,
         l.titulo AS livro_titulo,
         e.cliente_id,
         c.nome AS cliente_nome,
         to_char(e.data_emprestimo, 'DD/MM/YYYY') AS data_emprestimo,
         to_char(e.data_prevista_devolucao, 'DD/MM/YYYY') AS data_prevista,
         to_char(e.data_devolucao, 'DD/MM/YYYY') AS data_devolucao,
         CASE
           WHEN e.data_devolucao IS NOT NULL THEN 'devolvido'
           WHEN CURRENT_DATE > e.data_prevista_devolucao THEN 'em atraso'
           ELSE 'ativo'
         END AS situacao,
         CASE
           WHEN e.data_devolucao IS NOT NULL
             THEN GREATEST(e.data_devolucao - e.data_prevista_devolucao, 0)
           WHEN CURRENT_DATE > e.data_prevista_devolucao
             THEN CURRENT_DATE - e.data_prevista_devolucao
           ELSE 0
         END AS dias_atraso
  FROM emprestimos e
  INNER JOIN livros l ON l.id = e.livro_id
  INNER JOIN clientes c ON c.id = e.cliente_id
`;

export class EmprestimoRepository {
  constructor(private readonly db: Pool = pool) {}

  private paraModelo(row: EmprestimoRow): EmprestimoDetalhado {
    return {
      id: row.id,
      livroId: row.livro_id,
      livroTitulo: row.livro_titulo,
      clienteId: row.cliente_id,
      clienteNome: row.cliente_nome,
      dataEmprestimo: row.data_emprestimo,
      dataPrevista: row.data_prevista,
      dataDevolucao: row.data_devolucao,
      situacao: row.situacao,
      diasAtraso: Number(row.dias_atraso),
    };
  }

  // Registra o empréstimo e baixa o estoque na mesma transação.
  // Retorna o id criado, ou null se o livro ficou sem exemplares.
  async registrar(emprestimo: Emprestimo): Promise<number | null> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      const baixa = await client.query(
        `UPDATE livros
         SET quantidade_disponivel = quantidade_disponivel - 1
         WHERE id = $1 AND quantidade_disponivel > 0`,
        [emprestimo.livroId]
      );
      if (baixa.rowCount === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      const insercao = await client.query<{ id: number }>(
        `INSERT INTO emprestimos (livro_id, cliente_id, data_prevista_devolucao)
         VALUES ($1, $2, $3) RETURNING id`,
        [emprestimo.livroId, emprestimo.clienteId, emprestimo.dataPrevistaDevolucao]
      );

      await client.query("COMMIT");
      return insercao.rows[0].id;
    } catch (erro) {
      await client.query("ROLLBACK");
      throw erro;
    } finally {
      client.release();
    }
  }

  // Marca a devolução e devolve o exemplar ao estoque na mesma transação.
  // Retorna false se o empréstimo não existe ou já foi devolvido.
  async registrarDevolucao(id: number): Promise<boolean> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      const devolucao = await client.query<{ livro_id: number }>(
        `UPDATE emprestimos
         SET data_devolucao = CURRENT_DATE
         WHERE id = $1 AND data_devolucao IS NULL
         RETURNING livro_id`,
        [id]
      );
      if (devolucao.rowCount === 0) {
        await client.query("ROLLBACK");
        return false;
      }

      await client.query(
        `UPDATE livros
         SET quantidade_disponivel = quantidade_disponivel + 1
         WHERE id = $1`,
        [devolucao.rows[0].livro_id]
      );

      await client.query("COMMIT");
      return true;
    } catch (erro) {
      await client.query("ROLLBACK");
      throw erro;
    } finally {
      client.release();
    }
  }

  async buscarPorId(id: number): Promise<EmprestimoDetalhado | null> {
    const resultado = await this.db.query<EmprestimoRow>(
      `${SELECT_EMPRESTIMOS} WHERE e.id = $1`,
      [id]
    );
    return resultado.rows[0] ? this.paraModelo(resultado.rows[0]) : null;
  }

  async listar(situacao?: SituacaoEmprestimo): Promise<EmprestimoDetalhado[]> {
    if (!situacao) {
      const todos = await this.db.query<EmprestimoRow>(
        `${SELECT_EMPRESTIMOS} ORDER BY e.id`
      );
      return todos.rows.map((row) => this.paraModelo(row));
    }

    const filtrados = await this.db.query<EmprestimoRow>(
      `SELECT * FROM (${SELECT_EMPRESTIMOS}) AS emp
       WHERE emp.situacao = $1
       ORDER BY emp.id`,
      [situacao]
    );
    return filtrados.rows.map((row) => this.paraModelo(row));
  }
}