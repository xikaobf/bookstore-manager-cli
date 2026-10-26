# BookStore Manager CLI

Sistema de gerenciamento de uma pequena livraria, executado inteiramente pelo terminal (CLI). Permite controlar autores, livros, clientes e empréstimos, com controle de prazos de devolução, identificação de atrasos e relatórios gerenciais, usando PostgreSQL como banco de dados.

Projeto de Recuperação do Módulo 01 do curso Desenvolvedor(a) Back End Node (Turma 03).

## Objetivo

Substituir os registros manuais de uma livraria por uma aplicação organizada em camadas que:

- gerencia autores, livros, clientes e empréstimos (cadastro, consulta, atualização e remoção);
- persiste os dados em PostgreSQL;
- aplica regras de negócio (disponibilidade, datas, devolução única, duplicidades);
- controla prazos de devolução e identifica empréstimos em atraso;
- gera relatórios por meio de consultas SQL relacionais;
- cria o próprio banco de dados e as tabelas na primeira execução.

## Tecnologias utilizadas

- Node.js
- TypeScript 5
- PostgreSQL
- Biblioteca `pg` (acesso ao banco)
- Biblioteca `dotenv` (variáveis de ambiente)
- Biblioteca `readline-sync` (entrada de dados no terminal)
- `ts-node-dev` (execução em desenvolvimento)
- Git e GitHub (versionamento com GitFlow)

## Requisitos para execução

- Node.js 18 ou superior
- PostgreSQL instalado e em execução
- Git
- Um usuário do PostgreSQL com permissão para criar bancos de dados (o usuário `postgres` já possui)

## Instalação

```bash
git clone https://github.com/xikaobf/bookstore-manager-cli.git
cd bookstore-manager-cli
npm install
```

Crie o arquivo `.env` na raiz do projeto, com base no `.env.example`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=bookstore
```

Se a senha tiver caracteres especiais (como `#`), coloque-a entre aspas. O arquivo `.env` não é versionado, pois contém credenciais.

## Configuração do banco de dados

Não é necessário criar o banco manualmente. Ao iniciar, a aplicação:

1. conecta ao PostgreSQL com as credenciais do arquivo `.env`;
2. cria o banco de dados definido em `DB_NAME`, caso ele ainda não exista;
3. executa o script `src/database/schema.sql`, que cria as tabelas `autores`, `livros`, `clientes` e `emprestimos`, caso ainda não existam, com chaves primárias e estrangeiras.

Os dados nunca são apagados na inicialização. Basta que o PostgreSQL esteja em execução e que o usuário informado no `.env` possa criar bancos.

O script SQL também pode ser executado manualmente, caso prefira:

```bash
psql -U postgres -d bookstore -f src/database/schema.sql
```

Modelo das tabelas:

| Tabela | Descrição | Relacionamentos |
|---|---|---|
| `autores` | Autores dos livros | |
| `livros` | Livros, com quantidade total e disponível | `autor_id` referencia `autores` |
| `clientes` | Clientes da livraria (e-mail único) | |
| `emprestimos` | Empréstimos, com data do empréstimo, data prevista e data efetiva de devolução (nula enquanto não devolvido) | `livro_id` referencia `livros`; `cliente_id` referencia `clientes` |

## Execução

Ambiente de desenvolvimento:

```bash
npm run dev
```

Compilação e execução da versão compilada:

```bash
npm run build
npm start
```

No Windows, para exibir corretamente os acentos no terminal, execute `chcp 65001` antes de iniciar a aplicação.

## Arquitetura do projeto

A aplicação é organizada em camadas, cada uma com uma responsabilidade:

| Camada | Responsabilidade |
|---|---|
| **Main** | Inicializa o banco, conecta ao PostgreSQL e abre o menu principal |
| **Controllers** | Interagem com o usuário no terminal e acionam os serviços |
| **Services** | Implementam as regras de negócio e validações |
| **Repositories** | Executam os comandos SQL no PostgreSQL |
| **Models** | Representam as entidades (classes e interfaces) |
| **Database** | Configuração da conexão, criação automática do banco e script SQL |
| **Utils** | Funções auxiliares (leitura de entrada, datas, tratamento de erros) |
| **Menus** | Textos dos menus de cada módulo |

Fluxo de uma funcionalidade: **Main → Controller → Service → Repository → PostgreSQL**.

## Funcionalidades implementadas

- **Autores:** cadastrar, listar, consultar por ID, atualizar e remover. Bloqueia nomes duplicados e a remoção de autor que possui livros.
- **Livros:** cadastrar (vinculado a um autor existente), listar com o nome do autor, consultar, atualizar e remover. Bloqueia título duplicado para o mesmo autor e a remoção de livro com empréstimos.
- **Clientes:** cadastrar, listar, consultar, atualizar e remover. Valida o formato do e-mail e bloqueia e-mail duplicado.
- **Empréstimos:** realizar empréstimo (valida livro, cliente, disponibilidade e data prevista posterior à data do empréstimo), registrar devolução (uma única vez, com atualização do estoque e identificação de devolução no prazo ou com atraso) e consultar empréstimos por situação: ativo, devolvido ou em atraso.
- **Relatórios:** livros disponíveis, livros emprestados, livros cadastrados por autor, quantidade de empréstimos por livro, clientes com empréstimos ativos, empréstimos em atraso (livro, cliente, data prevista e dias de atraso) e top 5 livros mais emprestados.
- **Criação automática** do banco de dados e das tabelas na primeira execução.

Outros recursos:

- Mensagens claras para operações inválidas, sem interromper a execução.
- Operações de empréstimo e devolução executadas em transação (`BEGIN`, `COMMIT` e `ROLLBACK`), garantindo a consistência entre empréstimos e estoque.
- A situação do empréstimo (ativo, devolvido ou em atraso) é calculada por consulta SQL, a partir das datas armazenadas.
- Consultas SQL com `INNER JOIN`, `LEFT JOIN`, `GROUP BY`, `ORDER BY`, `LIMIT` e funções de agregação.

## Estrutura de pastas

```
bookstore-manager-cli/
├── src/
│   ├── controllers/
│   │   ├── AutorController.ts
│   │   ├── LivroController.ts
│   │   ├── ClienteController.ts
│   │   ├── EmprestimoController.ts
│   │   ├── RelatorioController.ts
│   │   └── MenuPrincipalController.ts
│   ├── database/
│   │   ├── connection.ts
│   │   ├── inicializarBanco.ts
│   │   └── schema.sql
│   ├── menus/
│   ├── models/
│   ├── repositories/
│   ├── services/
│   ├── utils/
│   └── main.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Exemplos de utilização

Menu principal:

```
===== BOOKSTORE MANAGER CLI =====
1 - Autores
2 - Livros
3 - Clientes
4 - Empréstimos
5 - Relatórios
0 - Encerrar aplicação
```

Realizando um empréstimo (menu 4, opção 1):

```
ID do livro: 1
ID do cliente: 1
Data prevista de devolução (DD/MM/AAAA): 15/11/2026

Empréstimo 1 registrado. Devolução prevista para 15/11/2026.
```

Registrando a devolução de um empréstimo atrasado (menu 4, opção 2):

```
ID do empréstimo: 1

Devolução registrada em 25/10/2026, com 3 dia(s) de atraso.
```

Relatório de empréstimos em atraso (menu 5, opção 6):

```
┌─────────┬──────────────────┬──────────────┬─────────┬───────────────┬────────────────┐
│ (index) │ ID do empréstimo │ Livro        │ Cliente │ Data prevista │ Dias de atraso │
├─────────┼──────────────────┼──────────────┼─────────┼───────────────┼────────────────┤
│ 0       │ 1                │ Dom Casmurro │ Maria   │ 22/10/2026    │ 3              │
└─────────┴──────────────────┴──────────────┴─────────┴───────────────┴────────────────┘
```

Exemplos de validações:

```
[AVISO] Livro sem exemplares disponíveis no momento.
[AVISO] Este empréstimo já foi devolvido.
[AVISO] Já existe um autor com esse nome.
```

## Kanban

Quadro de organização das tarefas: https://github.com/users/xikaobf/projects/3/