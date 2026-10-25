import "dotenv/config";
import fs from "fs";
import path from "path";
import { Client } from "pg";
import { pool } from "./connection";

const CAMINHO_SCHEMA = path.resolve(process.cwd(), "src", "database", "schema.sql");

async function criarBancoSeNecessario(): Promise<void> {
  const nomeBanco = process.env.DB_NAME;
  if (!nomeBanco) {
    throw new Error("A variável DB_NAME não foi definida no arquivo .env.");
  }

  // Conecta no banco administrativo "postgres" só para verificar/criar o banco da aplicação
  const cliente = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "postgres",
  });

  await cliente.connect();
  try {
    const existente = await cliente.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [nomeBanco]
    );
    if (existente.rowCount === 0) {
      const nomeSeguro = nomeBanco.replace(/"/g, '""');
      await cliente.query(`CREATE DATABASE "${nomeSeguro}"`);
      console.log(`Banco de dados "${nomeBanco}" criado.`);
    }
  } finally {
    await cliente.end();
  }
}

async function criarTabelas(): Promise<void> {
  const script = fs.readFileSync(CAMINHO_SCHEMA, "utf-8");
  await pool.query(script);
}

export async function inicializarBanco(): Promise<void> {
  await criarBancoSeNecessario();
  await criarTabelas();
}