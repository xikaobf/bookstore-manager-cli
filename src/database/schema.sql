-- BookStore Manager CLI - estrutura do banco
DROP TABLE IF EXISTS emprestimos CASCADE;
DROP TABLE IF EXISTS livros CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS autores CASCADE;

CREATE TABLE autores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    nacionalidade VARCHAR(60)
);

CREATE TABLE livros (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    ano_publicacao INTEGER,
    quantidade_total INTEGER NOT NULL CHECK (quantidade_total >= 0),
    quantidade_disponivel INTEGER NOT NULL CHECK (quantidade_disponivel >= 0),
    autor_id INTEGER NOT NULL REFERENCES autores(id),
    UNIQUE (titulo, autor_id),
    CHECK (quantidade_disponivel <= quantidade_total)
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefone VARCHAR(20)
);

CREATE TABLE emprestimos (
    id SERIAL PRIMARY KEY,
    livro_id INTEGER NOT NULL REFERENCES livros(id),
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    data_emprestimo DATE NOT NULL DEFAULT CURRENT_DATE,
    data_prevista_devolucao DATE NOT NULL,
    data_devolucao DATE, -- NULL enquanto não devolvido
    CHECK (data_prevista_devolucao > data_emprestimo)
);  