import { pool, testarConexao } from "./database/connection";
import { inicializarBanco } from "./database/inicializarBanco";
import { MenuPrincipalController } from "./controllers/MenuPrincipalController";

async function iniciar(): Promise<void> {
  try {
    await inicializarBanco();
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