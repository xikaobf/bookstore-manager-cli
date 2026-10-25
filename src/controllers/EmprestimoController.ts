import { EmprestimoService } from "../services/EmprestimoService";
import { EmprestimoDetalhado, SituacaoEmprestimo } from "../models/Emprestimo";
import { MENU_EMPRESTIMOS } from "../menus/menuEmprestimos";
import { lerTexto, lerInteiro } from "../utils/entrada";
import { exibirErro } from "../utils/erros";

export class EmprestimoController {
  constructor(
    private readonly servico: EmprestimoService = new EmprestimoService()
  ) {}

  async iniciar(): Promise<void> {
    let voltar = false;
    while (!voltar) {
      console.log(MENU_EMPRESTIMOS);
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
      case "1": await this.realizar(); break;
      case "2": await this.devolver(); break;
      case "3": await this.listar(); break;
      case "4": await this.listar("ativo"); break;
      case "5": await this.listar("em atraso"); break;
      case "6": await this.listar("devolvido"); break;
      case "7": await this.consultar(); break;
      case "0": return true;
      default: console.log("Opção inválida.");
    }
    return false;
  }

  private formatar(emprestimo: EmprestimoDetalhado) {
    return {
      ID: emprestimo.id,
      Livro: emprestimo.livroTitulo,
      Cliente: emprestimo.clienteNome,
      Empréstimo: emprestimo.dataEmprestimo,
      Previsto: emprestimo.dataPrevista,
      Devolução: emprestimo.dataDevolucao ?? "-",
      Situação: emprestimo.situacao,
      "Dias de atraso": emprestimo.diasAtraso,
    };
  }

  private async realizar(): Promise<void> {
    const livroId = lerInteiro("ID do livro: ");
    const clienteId = lerInteiro("ID do cliente: ");
    const dataPrevista = lerTexto("Data prevista de devolução (DD/MM/AAAA): ");

    const emprestimo = await this.servico.realizar(livroId, clienteId, dataPrevista);
    console.log(
      `\nEmpréstimo ${emprestimo.id} registrado. Devolução prevista para ${emprestimo.dataPrevista}.`
    );
  }

  private async devolver(): Promise<void> {
    const emprestimo = await this.servico.devolver(lerInteiro("ID do empréstimo: "));
    if (emprestimo.diasAtraso > 0) {
      console.log(
        `\nDevolução registrada em ${emprestimo.dataDevolucao}, com ${emprestimo.diasAtraso} dia(s) de atraso.`
      );
    } else {
      console.log(`\nDevolução registrada em ${emprestimo.dataDevolucao}, dentro do prazo.`);
    }
  }

  private async listar(situacao?: SituacaoEmprestimo): Promise<void> {
    const emprestimos = await this.servico.listar(situacao);
    if (emprestimos.length === 0) {
      console.log("\nNenhum empréstimo encontrado.");
      return;
    }
    console.table(emprestimos.map((emprestimo) => this.formatar(emprestimo)));
  }

  private async consultar(): Promise<void> {
    const emprestimo = await this.servico.buscarPorId(lerInteiro("ID do empréstimo: "));
    console.table([this.formatar(emprestimo)]);
  }
}
