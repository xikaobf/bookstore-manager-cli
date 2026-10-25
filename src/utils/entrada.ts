import readlineSync from "readline-sync";

export function lerTexto(pergunta: string): string {
  return readlineSync.question(pergunta).trim();
}

export function lerInteiro(pergunta: string): number {
  return Number(lerTexto(pergunta));
}