import { Cliente } from "../models/Cliente";
import { ClienteRepository } from "../repositories/ClienteRepository";
import { RegraNegocioError } from "../utils/erros";

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ClienteService {
  constructor(
    private readonly repositorio: ClienteRepository = new ClienteRepository()
  ) {}

  private validarEmail(email: string): void {
    if (!FORMATO_EMAIL.test(email)) {
      throw new RegraNegocioError("Informe um e-mail válido.");
    }
  }

  async cadastrar(nome: string, email: string, telefone: string): Promise<Cliente> {
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();
    if (!nomeLimpo) {
      throw new RegraNegocioError("O nome do cliente é obrigatório.");
    }
    this.validarEmail(emailLimpo);
    if (await this.repositorio.buscarPorEmail(emailLimpo)) {
      throw new RegraNegocioError("Já existe um cliente com esse e-mail.");
    }
    return this.repositorio.inserir(
      new Cliente(nomeLimpo, emailLimpo, telefone.trim() || null)
    );
  }

  async listar(): Promise<Cliente[]> {
    return this.repositorio.listar();
  }

  async buscarPorId(id: number): Promise<Cliente> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new RegraNegocioError("Informe um identificador válido.");
    }
    const cliente = await this.repositorio.buscarPorId(id);
    if (!cliente) {
      throw new RegraNegocioError("Cliente não encontrado.");
    }
    return cliente;
  }

  async atualizar(
    id: number,
    nome: string,
    email: string,
    telefone: string
  ): Promise<Cliente> {
    const atual = await this.buscarPorId(id);
    const novoNome = nome.trim() || atual.nome;
    const novoEmail = email.trim() || atual.email;
    const novoTelefone = telefone.trim() || atual.telefone;

    this.validarEmail(novoEmail);
    const existente = await this.repositorio.buscarPorEmail(novoEmail);
    if (existente && existente.id !== id) {
      throw new RegraNegocioError("Já existe outro cliente com esse e-mail.");
    }
    return this.repositorio.atualizar(
      id,
      new Cliente(novoNome, novoEmail, novoTelefone)
    );
  }

  async remover(id: number): Promise<void> {
    await this.buscarPorId(id);
    if (await this.repositorio.possuiEmprestimos(id)) {
      throw new RegraNegocioError(
        "Não é possível remover: o cliente possui empréstimos registrados."
      );
    }
    await this.repositorio.remover(id);
  }
}