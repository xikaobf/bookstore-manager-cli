import { LivroService, DadosAtualizacaoLivro } from "../services/LivroService";
import { Livro } from "../models/Livro";
import { MENU_LIVROS } from "../menus/menuLivros";
import { lerTexto, lerInteiro } from "../utils/entrada";
import { exibirErro } from "../utils/erros";

export class LivroController {
  constructor(private readonly servico: LivroService = new LivroService()) {}

  async iniciar(): Promise<void> {
    let voltar = false;
    while (!voltar) {
      console.log(MENU_LIVROS);
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

  private formatar(livro: Livro) {
    return {
      ID: livro.id,
      Título: livro.titulo,
      Autor: livro.autorNome,
      Ano: livro.anoPublicacao ?? "-",
      Total: livro.quantidadeTotal,
      Disponível: livro.quantidadeDisponivel,
    };
  }

  private async cadastrar(): Promise<void> {
    const titulo = lerTexto("Título: ");
    const anoTexto = lerTexto("Ano de publicação (opcional): ");
    const quantidade = lerInteiro("Quantidade de exemplares: ");
    const autorId = lerInteiro("ID do autor (veja em Autores → Listar): ");
    const ano = anoTexto ? Number(anoTexto) : null;

    const livro = await this.servico.cadastrar(titulo, ano, quantidade, autorId);
    console.log(`\nLivro cadastrado com ID ${livro.id}.`);
  }

  private async listar(): Promise<void> {
    const livros = await this.servico.listar();
    if (livros.length === 0) {
      console.log("\nNenhum livro cadastrado.");
      return;
    }
    console.table(livros.map((livro) => this.formatar(livro)));
  }

  private async consultar(): Promise<void> {
    const livro = await this.servico.buscarPorId(lerInteiro("ID do livro: "));
    console.table([this.formatar(livro)]);
  }

  private async atualizar(): Promise<void> {
    const id = lerInteiro("ID do livro: ");
    const titulo = lerTexto("Novo título (Enter para manter): ");
    const anoTexto = lerTexto("Novo ano (Enter para manter): ");
    const quantidadeTexto = lerTexto("Nova quantidade total (Enter para manter): ");

    const dados: DadosAtualizacaoLivro = {
      titulo: titulo || undefined,
      anoPublicacao: anoTexto ? Number(anoTexto) : undefined,
      quantidadeTotal: quantidadeTexto ? Number(quantidadeTexto) : undefined,
    };
    await this.servico.atualizar(id, dados);
    console.log("\nLivro atualizado com sucesso.");
  }

  private async remover(): Promise<void> {
    await this.servico.remover(lerInteiro("ID do livro: "));
    console.log("\nLivro removido com sucesso.");
  }
}