import { pool, testarConexao } from "./database/connection";
import { MenuPrincipalController } from "./controllers/MenuPrincipalController";

async function iniciar(): Promise<void> {
  try {
    await testarConexao();
    console.log("Conectado ao PostgreSQL com sucesso!");
    await new MenuPrincipalController().iniciar();
  } catch (erro) {
    console.error("Falha ao iniciar a aplicação:", erro);
  } finally {
    await pool.end();
  }
}

iniciar();