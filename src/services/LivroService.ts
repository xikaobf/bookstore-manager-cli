import { Livro } from "../models/Livro";
import { LivroRepository } from "../repositories/LivroRepository";
import { AutorService } from "./AutorService";
import { RegraNegocioError } from "../utils/erros";

export interface DadosAtualizacaoLivro {
  titulo?: string;
  anoPublicacao?: number | null;
  quantidadeTotal?: number;
}

export class LivroService {
  constructor(
    private readonly repositorio: LivroRepository = new LivroRepository(),
    private readonly autorService: AutorService = new AutorService()
  ) {}

  private validarAno(ano: number | null): void {
    if (ano === null) return;
    const anoAtual = new Date().getFullYear();
    if (!Number.isInteger(ano) || ano < 1 || ano > anoAtual) {
      throw new RegraNegocioError("Informe um ano de publicação válido.");
    }
  }

  private validarQuantidade(quantidade: number): void {
    if (!Number.isInteger(quantidade) || quantidade < 1) {
      throw new RegraNegocioError("A quantidade deve ser um número inteiro maior que zero.");
    }
  }

  async cadastrar(
    titulo: string,
    anoPublicacao: number | null,
    quantidade: number,
    autorId: number
  ): Promise<Livro> {
    const tituloLimpo = titulo.trim();
    if (!tituloLimpo) {
      throw new RegraNegocioError("O título do livro é obrigatório.");
    }
    this.validarAno(anoPublicacao);
    this.validarQuantidade(quantidade);

    await this.autorService.buscarPorId(autorId); // lança erro se o autor não existir

    if (await this.repositorio.buscarPorTituloEAutor(tituloLimpo, autorId)) {
      throw new RegraNegocioError("Já existe um livro com esse título para esse autor.");
    }
    return this.repositorio.inserir(
      new Livro(tituloLimpo, anoPublicacao, quantidade, quantidade, autorId)
    );
  }

  async listar(): Promise<Livro[]> {
    return this.repositorio.listar();
  }

  async buscarPorId(id: number): Promise<Livro> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new RegraNegocioError("Informe um identificador válido.");
    }
    const livro = await this.repositorio.buscarPorId(id);
    if (!livro) {
      throw new RegraNegocioError("Livro não encontrado.");
    }
    return livro;
  }

  async atualizar(id: number, dados: DadosAtualizacaoLivro): Promise<Livro> {
    const atual = await this.buscarPorId(id);

    const titulo = dados.titulo?.trim() || atual.titulo;
    const ano = dados.anoPublicacao === undefined ? atual.anoPublicacao : dados.anoPublicacao;
    const total = dados.quantidadeTotal ?? atual.quantidadeTotal;

    this.validarAno(ano);
    this.validarQuantidade(total);

    const emprestados = atual.quantidadeTotal - atual.quantidadeDisponivel;
    if (total < emprestados) {
      throw new RegraNegocioError(
        `A quantidade total não pode ser menor que ${emprestados} (exemplares emprestados).`
      );
    }

    const existente = await this.repositorio.buscarPorTituloEAutor(titulo, atual.autorId);
    if (existente && existente.id !== id) {
      throw new RegraNegocioError("Já existe outro livro com esse título para esse autor.");
    }

    return this.repositorio.atualizar(
      id,
      new Livro(titulo, ano, total, total - emprestados, atual.autorId)
    );
  }

  async remover(id: number): Promise<void> {
    await this.buscarPorId(id);
    if (await this.repositorio.possuiEmprestimos(id)) {
      throw new RegraNegocioError(
        "Não é possível remover: o livro possui empréstimos registrados."
      );
    }
    await this.repositorio.remover(id);
  }
}