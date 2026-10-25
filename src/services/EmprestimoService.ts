import {
  Emprestimo,
  EmprestimoDetalhado,
  SituacaoEmprestimo,
} from "../models/Emprestimo";
import { EmprestimoRepository } from "../repositories/EmprestimoRepository";
import { LivroService } from "./LivroService";
import { ClienteService } from "./ClienteService";
import { RegraNegocioError } from "../utils/erros";
import { converterParaIso, dataAtualIso } from "../utils/datas";

export class EmprestimoService {
  constructor(
    private readonly repositorio: EmprestimoRepository = new EmprestimoRepository(),
    private readonly livroService: LivroService = new LivroService(),
    private readonly clienteService: ClienteService = new ClienteService()
  ) {}

  async realizar(
    livroId: number,
    clienteId: number,
    dataPrevistaBr: string
  ): Promise<EmprestimoDetalhado> {
    const livro = await this.livroService.buscarPorId(livroId); // erro se não existir
    await this.clienteService.buscarPorId(clienteId); // erro se não existir

    if (livro.quantidadeDisponivel <= 0) {
      throw new RegraNegocioError("Livro sem exemplares disponíveis no momento.");
    }

    const dataPrevista = converterParaIso(dataPrevistaBr);
    if (dataPrevista <= dataAtualIso()) {
      throw new RegraNegocioError(
        "A data prevista de devolução deve ser posterior à data do empréstimo (hoje)."
      );
    }

    const id = await this.repositorio.registrar(
      new Emprestimo(livroId, clienteId, dataPrevista)
    );
    if (id === null) {
      throw new RegraNegocioError("Livro sem exemplares disponíveis no momento.");
    }
    return this.buscarPorId(id);
  }

  async devolver(id: number): Promise<EmprestimoDetalhado> {
    const emprestimo = await this.buscarPorId(id); // erro se não existir
    if (emprestimo.dataDevolucao) {
      throw new RegraNegocioError("Este empréstimo já foi devolvido.");
    }

    const devolvido = await this.repositorio.registrarDevolucao(id);
    if (!devolvido) {
      throw new RegraNegocioError("Este empréstimo já foi devolvido.");
    }
    return this.buscarPorId(id);
  }

  async buscarPorId(id: number): Promise<EmprestimoDetalhado> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new RegraNegocioError("Informe um identificador válido.");
    }
    const emprestimo = await this.repositorio.buscarPorId(id);
    if (!emprestimo) {
      throw new RegraNegocioError("Empréstimo não encontrado.");
    }
    return emprestimo;
  }

  async listar(situacao?: SituacaoEmprestimo): Promise<EmprestimoDetalhado[]> {
    return this.repositorio.listar(situacao);
  }
}