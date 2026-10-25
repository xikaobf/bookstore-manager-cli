import { RegraNegocioError } from "./erros";

export function converterParaIso(dataBr: string): string {
  const partes = dataBr.trim().split("/");
  const mensagem = "Data inválida. Use o formato DD/MM/AAAA.";
  if (partes.length !== 3 || partes[2].length !== 4) {
    throw new RegraNegocioError(mensagem);
  }

  const [dia, mes, ano] = partes.map(Number);
  const data = new Date(ano, mes - 1, dia);
  const dataReal =
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia;
  if (!dataReal) {
    throw new RegraNegocioError(mensagem);
  }

  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export function dataAtualIso(): string {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${hoje.getFullYear()}-${mes}-${dia}`;
}