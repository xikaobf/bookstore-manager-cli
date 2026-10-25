import { pool, testarConexao } from "./database/connection";

async function iniciar(): Promise<void> {
  try {
    await testarConexao();
    console.log("Conectado ao PostgreSQL com sucesso!");
  } catch (erro) {
    console.error("Falha ao conectar no banco:", erro);
  } finally {
    await pool.end();
  }
}

iniciar();