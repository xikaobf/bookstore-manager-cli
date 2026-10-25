import { MENU_PRINCIPAL } from "../menus/menuPrincipal";
import { AutorController } from "./AutorController";
import { LivroController } from "./LivroController";
import { lerTexto } from "../utils/entrada";
import { exibirErro } from "../utils/erros";
import { ClienteController } from "./ClienteController";

export class MenuPrincipalController {
    constructor(
    private readonly autorController: AutorController = new AutorController(),
    private readonly livroController: LivroController = new LivroController(),
    private readonly clienteController: ClienteController = new ClienteController()
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
      case "2": await this.livroController.iniciar(); break;
      case "3": await this.clienteController.iniciar(); break;
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