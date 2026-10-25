import { Autor } from "../models/Autor";
import { AutorRepository } from "../repositories/AutorRepository";
import { RegraNegocioError } from "../utils/erros";

export class AutorService {
  constructor(
    private readonly repositorio: AutorRepository = new AutorRepository()
  ) {}

  async cadastrar(nome: string, nacionalidade: string): Promise<Autor> {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      throw new RegraNegocioError("O nome do autor é obrigatório.");
    }
    if (await this.repositorio.buscarPorNome(nomeLimpo)) {
      throw new RegraNegocioError("Já existe um autor com esse nome.");
    }
    return this.repositorio.inserir(
      new Autor(nomeLimpo, nacionalidade.trim() || null)
    );
  }

  async listar(): Promise<Autor[]> {
    return this.repositorio.listar();
  }

  async buscarPorId(id: number): Promise<Autor> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new RegraNegocioError("Informe um identificador válido.");
    }
    const autor = await this.repositorio.buscarPorId(id);
    if (!autor) {
      throw new RegraNegocioError("Autor não encontrado.");
    }
    return autor;
  }

  async atualizar(id: number, nome: string, nacionalidade: string): Promise<Autor> {
    const atual = await this.buscarPorId(id);
    const novoNome = nome.trim() || atual.nome;
    const novaNacionalidade = nacionalidade.trim() || atual.nacionalidade;

    const existente = await this.repositorio.buscarPorNome(novoNome);
    if (existente && existente.id !== id) {
      throw new RegraNegocioError("Já existe outro autor com esse nome.");
    }
    return this.repositorio.atualizar(id, new Autor(novoNome, novaNacionalidade));
  }

  async remover(id: number): Promise<void> {
    await this.buscarPorId(id);
    if (await this.repositorio.possuiLivros(id)) {
      throw new RegraNegocioError(
        "Não é possível remover: o autor possui livros cadastrados."
      );
    }
    await this.repositorio.remover(id);
  }
}