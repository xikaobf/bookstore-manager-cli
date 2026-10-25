import { RelatorioService } from "../services/RelatorioService";
import { MENU_RELATORIOS } from "../menus/menuRelatorios";
import { lerTexto } from "../utils/entrada";
import { exibirErro } from "../utils/erros";

export class RelatorioController {
  constructor(
    private readonly servico: RelatorioService = new RelatorioService()
  ) {}

  async iniciar(): Promise<void> {
    let voltar = false;
    while (!voltar) {
      console.log(MENU_RELATORIOS);
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
      case "1": await this.livrosDisponiveis(); break;
      case "2": await this.livrosEmprestados(); break;
      case "3": await this.livrosPorAutor(); break;
      case "4": await this.emprestimosPorLivro(); break;
      case "5": await this.clientesComEmprestimosAtivos(); break;
      case "6": await this.emprestimosEmAtraso(); break;
      case "7": await this.livrosMaisEmprestados(); break;
      case "0": return true;
      default: console.log("Opção inválida.");
    }
    return false;
  }

  private exibirTabela(linhas: object[], mensagemVazia: string): void {
    if (linhas.length === 0) {
      console.log(`\n${mensagemVazia}`);
      return;
    }
    console.table(linhas);
  }

  private async livrosDisponiveis(): Promise<void> {
    const dados = await this.servico.livrosDisponiveis();
    this.exibirTabela(
      dados.map((d) => ({
        ID: d.id,
        Título: d.titulo,
        Autor: d.autor,
        Disponíveis: d.disponiveis,
        Total: d.total,
      })),
      "Nenhum livro disponível no momento."
    );
  }

  private async livrosEmprestados(): Promise<void> {
    const dados = await this.servico.livrosEmprestados();
    this.exibirTabela(
      dados.map((d) => ({
        ID: d.id,
        Título: d.titulo,
        Autor: d.autor,
        "Empréstimos ativos": d.emprestimosAtivos,
      })),
      "Nenhum livro emprestado no momento."
    );
  }

  private async livrosPorAutor(): Promise<void> {
    const dados = await this.servico.livrosPorAutor();
    this.exibirTabela(
      dados.map((d) => ({
        Autor: d.autor,
        "Títulos cadastrados": d.quantidadeTitulos,
        "Total de exemplares": d.totalExemplares,
      })),
      "Nenhum autor cadastrado."
    );
  }

  private async emprestimosPorLivro(): Promise<void> {
    const dados = await this.servico.emprestimosPorLivro();
    this.exibirTabela(
      dados.map((d) => ({
        ID: d.id,
        Título: d.titulo,
        "Total de empréstimos": d.totalEmprestimos,
      })),
      "Nenhum livro cadastrado."
    );
  }

  private async clientesComEmprestimosAtivos(): Promise<void> {
    const dados = await this.servico.clientesComEmprestimosAtivos();
    this.exibirTabela(
      dados.map((d) => ({
        ID: d.id,
        Nome: d.nome,
        Email: d.email,
        "Empréstimos ativos": d.emprestimosAtivos,
      })),
      "Nenhum cliente com empréstimo ativo."
    );
  }

  private async emprestimosEmAtraso(): Promise<void> {
    const dados = await this.servico.emprestimosEmAtraso();
    this.exibirTabela(
      dados.map((d) => ({
        "ID do empréstimo": d.id,
        Livro: d.livro,
        Cliente: d.cliente,
        "Data prevista": d.dataPrevista,
        "Dias de atraso": d.diasAtraso,
      })),
      "Nenhum empréstimo em atraso."
    );
  }

  private async livrosMaisEmprestados(): Promise<void> {
    const dados = await this.servico.livrosMaisEmprestados();
    this.exibirTabela(
      dados.map((d, indice) => ({
        Posição: indice + 1,
        Título: d.titulo,
        "Total de empréstimos": d.totalEmprestimos,
      })),
      "Nenhum livro cadastrado."
    );
  }
}