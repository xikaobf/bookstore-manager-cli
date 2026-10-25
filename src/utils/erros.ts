export class RegraNegocioError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "RegraNegocioError";
  }
}

export function exibirErro(erro: unknown): void {
  if (erro instanceof RegraNegocioError) {
    console.log(`\n⚠ ${erro.message}`);
  } else {
    console.error("\n✖ Erro inesperado ao processar a operação.");
    console.error(erro instanceof Error ? erro.message : erro);
  }
}