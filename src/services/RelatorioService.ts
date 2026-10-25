import { RelatorioRepository } from "../repositories/RelatorioRepository";
import {
  LivroDisponivel,
  LivroEmprestado,
  LivrosPorAutor,
  EmprestimosPorLivro,
  ClienteComEmprestimoAtivo,
  EmprestimoEmAtraso,
} from "../models/Relatorio";

const LIMITE_TOP_LIVROS = 5;

export class RelatorioService {
  constructor(
    private readonly repositorio: RelatorioRepository = new RelatorioRepository()
  ) {}

  livrosDisponiveis(): Promise<LivroDisponivel[]> {
    return this.repositorio.livrosDisponiveis();
  }

  livrosEmprestados(): Promise<LivroEmprestado[]> {
    return this.repositorio.livrosEmprestados();
  }

  livrosPorAutor(): Promise<LivrosPorAutor[]> {
    return this.repositorio.livrosPorAutor();
  }

  emprestimosPorLivro(): Promise<EmprestimosPorLivro[]> {
    return this.repositorio.emprestimosPorLivro();
  }

  livrosMaisEmprestados(): Promise<EmprestimosPorLivro[]> {
    return this.repositorio.livrosMaisEmprestados(LIMITE_TOP_LIVROS);
  }

  clientesComEmprestimosAtivos(): Promise<ClienteComEmprestimoAtivo[]> {
    return this.repositorio.clientesComEmprestimosAtivos();
  }

  emprestimosEmAtraso(): Promise<EmprestimoEmAtraso[]> {
    return this.repositorio.emprestimosEmAtraso();
  }
}
