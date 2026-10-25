import { AutorService } from "../services/AutorService";
import { MENU_AUTORES } from "../menus/menuAutores";
import { lerTexto, lerInteiro } from "../utils/entrada";
import { exibirErro } from "../utils/erros";

export class AutorController {
  constructor(private readonly servico: AutorService = new AutorService()) {}

  async iniciar(): Promise<void> {
    let voltar = false;
    while (!voltar) {
      console.log(MENU_AUTORES);
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

  private async cadastrar(): Promise<void> {
    const nome = lerTexto("Nome: ");
    const nacionalidade = lerTexto("Nacionalidade (opcional): ");
    const autor = await this.servico.cadastrar(nome, nacionalidade);
    console.log(`\nAutor cadastrado com ID ${autor.id}.`);
  }

  private async listar(): Promise<void> {
    const autores = await this.servico.listar();
    if (autores.length === 0) {
      console.log("\nNenhum autor cadastrado.");
      return;
    }
    console.table(
      autores.map((a) => ({
        ID: a.id,
        Nome: a.nome,
        Nacionalidade: a.nacionalidade ?? "-",
      }))
    );
  }

  private async consultar(): Promise<void> {
    const autor = await this.servico.buscarPorId(lerInteiro("ID do autor: "));
    console.table([
      { ID: autor.id, Nome: autor.nome, Nacionalidade: autor.nacionalidade ?? "-" },
    ]);
  }

  private async atualizar(): Promise<void> {
    const id = lerInteiro("ID do autor: ");
    const nome = lerTexto("Novo nome (Enter para manter): ");
    const nacionalidade = lerTexto("Nova nacionalidade (Enter para manter): ");
    await this.servico.atualizar(id, nome, nacionalidade);
    console.log("\nAutor atualizado com sucesso.");
  }

  private async remover(): Promise<void> {
    await this.servico.remover(lerInteiro("ID do autor: "));
    console.log("\nAutor removido com sucesso.");
  }
}