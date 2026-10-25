import { MENU_PRINCIPAL } from "../menus/menuPrincipal";
import { AutorController } from "./AutorController";
import { lerTexto } from "../utils/entrada";
import { exibirErro } from "../utils/erros";

export class MenuPrincipalController {
  constructor(
    private readonly autorController: AutorController = new AutorController()
  ) {}

  async iniciar(): Promise<void> {
    let encerrar = false;
    while (!encerrar) {
      console.log(MENU_PRINCIPAL);
      const opcao = lerTexto("Escolha uma opção: ");
      try {
        encerrar = await this.tratarOpcao(opcao);
      } catch (erro) {
        exibirErro(erro);
      }
    }
    console.log("\nAplicação encerrada.");
  }

  private async tratarOpcao(opcao: string): Promise<boolean> {
    switch (opcao) {
      case "1": await this.autorController.iniciar(); break;
      case "2":
      case "3":
      case "4":
      case "5":
        console.log("\nMódulo ainda não disponível.");
        break;
      case "0": return true;
      default: console.log("Opção inválida.");
    }
    return false;
  }
}