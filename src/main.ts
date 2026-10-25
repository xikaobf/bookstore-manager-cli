import { pool, testarConexao } from "./database/connection";
import { AutorController } from "./controllers/AutorController";

async function iniciar(): Promise<void> {
  try {
    await testarConexao();
    console.log("Conectado ao PostgreSQL com sucesso!");
    await new AutorController().iniciar();
  } catch (erro) {
    console.error("Falha ao iniciar a aplicação:", erro);
  } finally {
    await pool.end();
  }
}

iniciar();