import { ClienteService } from "../services/ClienteService";
import { Cliente } from "../models/Cliente";
import { MENU_CLIENTES } from "../menus/menuClientes";
import { lerTexto, lerInteiro } from "../utils/entrada";
import { exibirErro } from "../utils/erros";

export class ClienteController {
  constructor(private readonly servico: ClienteService = new ClienteService()) {}

  async iniciar(): Promise<void> {
    let voltar = false;
    while (!voltar) {
      console.log(MENU_CLIENTES);
      const opcao = lerTexto("Escolha uma opção: ");
      try {
        voltar = await this.tratarOpcao(opcao);
      } catch (erro) {
        exibirErro(erro);
      }
    }
  }

  private async tratarOpcao(opcao: string): Promise<boolean> {
    switch (opcao) {
      case "1": await this.cadastrar(); break;
      case "2": await this.listar(); break;
      case "3": await this.consultar(); break;
      case "4": await this.atualizar(); break;
      case "5": await this.remover(); break;
      case "0": return true;
      default: console.log("Opção inválida.");
    }
    return false;
  }

  private formatar(cliente: Cliente) {
    return {
      ID: cliente.id,
      Nome: cliente.nome,
      Email: cliente.email,
      Telefone: cliente.telefone ?? "-",
    };
  }

  private async cadastrar(): Promise<void> {
    const nome = lerTexto("Nome: ");
    const email = lerTexto("E-mail: ");
    const telefone = lerTexto("Telefone (opcional): ");
    const cliente = await this.servico.cadastrar(nome, email, telefone);
    console.log(`\nCliente cadastrado com ID ${cliente.id}.`);
  }

  private async listar(): Promise<void> {
    const clientes = await this.servico.listar();
    if (clientes.length === 0) {
      console.log("\nNenhum cliente cadastrado.");
      return;
    }
    console.table(clientes.map((cliente) => this.formatar(cliente)));
  }

  private async consultar(): Promise<void> {
    const cliente = await this.servico.buscarPorId(lerInteiro("ID do cliente: "));
    console.table([this.formatar(cliente)]);
  }

  private async atualizar(): Promise<void> {
    const id = lerInteiro("ID do cliente: ");
    const nome = lerTexto("Novo nome (Enter para manter): ");
    const email = lerTexto("Novo e-mail (Enter para manter): ");
    const telefone = lerTexto("Novo telefone (Enter para manter): ");
    await this.servico.atualizar(id, nome, email, telefone);
    console.log("\nCliente atualizado com sucesso.");
  }

  private async remover(): Promise<void> {
    await this.servico.remover(lerInteiro("ID do cliente: "));
    console.log("\nCliente removido com sucesso.");
  }
}
