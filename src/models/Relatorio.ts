export interface LivroDisponivel {
  id: number;
  titulo: string;
  autor: string;
  disponiveis: number;
  total: number;
}

export interface LivroEmprestado {
  id: number;
  titulo: string;
  autor: string;
  emprestimosAtivos: number;
}

export interface LivrosPorAutor {
  id: number;
  autor: string;
  quantidadeTitulos: number;
  totalExemplares: number;
}

export interface EmprestimosPorLivro {
  id: number;
  titulo: string;
  totalEmprestimos: number;
}

export interface ClienteComEmprestimoAtivo {
  id: number;
  nome: string;
  email: string;
  emprestimosAtivos: number;
}

export interface EmprestimoEmAtraso {
  id: number;
  livro: string;
  cliente: string;
  dataPrevista: string;
  diasAtraso: number;
}