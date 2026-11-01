# genyo

API em Node.js + TypeScript com Express, MongoDB e Prisma.

## Estrutura do repositório

- `api/`: a API, com `package.json`, ESLint, Prettier e TypeScript próprios.
- Raiz: orquestração (`package.json` com scripts atalho), release
  (semantic-release), CI e `.editorconfig`.

Os caminhos citados daqui para baixo são relativos a `api/`.

## Stack

- Node 24, TypeScript 6, Express 5
- MongoDB + Prisma 6
- Zod (validação de DTOs e de variáveis de ambiente) e OpenAPI com Swagger UI
- Vitest + Supertest (testes), ESLint com `@prdev-solutions/eslint-config` e
  Prettier
- GitHub Actions + semantic-release

## Como rodar

```bash
cd api
cp .env.example .env
npm ci
npm run db:up         # MongoDB local com replica set (Docker)
npm run prisma:push   # cria coleções e índices
npm run dev
```

A API sobe em `http://localhost:3000`. A documentação interativa (Swagger UI)
fica em `http://localhost:3000/docs`, onde dá para testar todas as rotas.

Outros scripts, dentro de `api/`: `npm test`, `npm run test:integration`,
`npm run test:e2e`, `npm run lint`, `npm run typecheck`, `npm run build` e
`npm start`. Da raiz, `npm run dev`, `npm test`, `npm run lint`,
`npm run typecheck` e `npm run build` chamam os mesmos scripts da API.

## Decisões técnicas

### Arquitetura

Usei as pastas `core`, `domain`, `application` e `infra` (Clean Architecture)
porque é o que eu conheço e já aplico no dia a dia. Não tentei inventar uma
estrutura nova para este teste.

- `core`: código sem regra de negócio e sem dependência de framework (`Either`,
  entidades base, erros, tipos utilitários).
- `domain`: entidades e contratos de repositório (classes abstratas).
- `application`: DTOs (schemas Zod) e use cases.
- `infra`: tudo que depende de tecnologia externa (Express, Prisma, env). As
  camadas de dentro não importam nada daqui.

### Either (Left / Right) no tratamento de erro

Os use cases não lançam exceção para erros esperados (não encontrado, conflito,
validação). Eles retornam `Left(erro)` ou `Right(valor)`. Adotei esse padrão
porque foi o jeito de organizar erros que aprendi e que prefiro usar hoje: o
tipo de retorno deixa explícito quais erros cada use case pode produzir, e o
TypeScript obriga o controller a tratar o caso de falha.

O controller faz `throw result.value` quando recebe um `Left`, e um único
`errorHandler` converte `AppError` em resposta HTTP. Exceções inesperadas viram
`InternalError` no use case ou 500 no handler.

### Validação

O schema Zod fica em `application/dtos` e é executado só no use case, que
devolve um `ValidationError` com os campos inválidos. Datas (`YYYY-MM-DD`) e
horários (`HH:mm`) ficam como string no DTO e só viram `Date` ao criar a
entidade. Assim o schema não transforma o tipo, e comparar datas ou horários é
comparar texto ISO.

### Documentação da API

O OpenAPI 3.1 é gerado a partir dos schemas Zod com
`@asteasolutions/zod-to-openapi`, então o DTO de entrada é a mesma fonte da
validação e da documentação. Descrições e exemplos dos campos vêm de `.meta()`
no próprio schema. As rotas e respostas são registradas em `infra/http/docs`. A
interface do Swagger UI fica em `/docs` e o JSON em `/docs.json`.

### Paginação

`GET /employees` usa paginação por cursor (`limit` e `cursor`), e não por
`page`. No MongoDB o `skip` percorre e descarta os documentos anteriores, então
a página 500 fica cada vez mais lenta. Com cursor o custo é o mesmo em qualquer
página. A resposta traz `meta.nextCursor` (o `id` do último item), que é nulo na
última página. A ordem é por data de admissão, com o `id` como desempate: sem
ele, funcionários com a mesma data poderiam repetir ou sumir entre páginas. O
preço é não ter `total` nem salto direto para uma página.

### Express sem injeção de dependência

O projeto de referência que usei como base é em NestJS. Aqui o Nest não existe,
então a ligação repositório → use case → controller é feita à mão em
`infra/http/container.ts` (composition root). É mais verboso, mas é simples,
explícito e permite testar o app HTTP com repositórios em memória sem banco.

### Middlewares

- `helmet` para headers de segurança (ele já remove o `X-Powered-By`).
- `cors` configurável por `CORS_ORIGIN` (lista separada por vírgula; `*` por
  padrão).
- `express.json` com limite de 1mb.
- A validação do body fica no use case, com Zod. O `errorHandler` formata os
  erros por campo.
- `notFoundHandler` e `errorHandler` por último, no lugar dos filters do Nest.
  Aproveitei que o Express 5 propaga erros de handlers `async`, então não
  precisa de wrapper nem de `try/catch` nos controllers.

### Variáveis de ambiente

`infra/env/env.ts` valida `process.env` com Zod no boot. Se algo estiver errado,
a aplicação não sobe e mostra quais campos são inválidos, em vez de falhar
depois no meio de uma request.

### Prisma 6 em vez do 7

Comecei com a versão mais recente, mas o Prisma 7 exige um driver adapter e não
existe adapter para MongoDB, então ele não funciona com este banco. Usei a
6.19.3, a última com suporte a MongoDB. Os ids são strings (UUID) mapeadas para
`_id`, para manter as entidades independentes do `ObjectId`.

O Prisma não tem migrations para MongoDB, então o schema é aplicado com
`prisma db push`. Ele só faz transações com replica set, por isso o
`docker-compose.yml` sobe o Mongo já com `rs0` iniciado.

### TypeScript 6 em vez do 7

A versão mais recente do TypeScript (7) ainda não é compatível com o
`@prdev-solutions/eslint-config`, que declara peer `typescript ^5 || ^6`. Fixei
a 6.0.3.

### Build

Usei `tsc` + `tsc-alias` (para resolver o alias `@/`). Não adotei bundler nem
minificação: é um servidor de longa duração, o tempo de carga do código não
importa e o ganho de minificar seria pequeno. Isso mudaria se fosse rodar em
lambda.

### Testes

Vitest com SWC (necessário para o transform dos arquivos de teste), em três
níveis:

- **Unitário** (`__tests__/unit`, `npm test`): use cases com repositórios em
  memória (`__tests__/test-repositories`).
- **Integração** (`__tests__/integration`, `npm run test:integration`): use
  cases com o `PrismaEmployeeRepository` contra um MongoDB real.
- **E2E** (`__tests__/e2e`, `npm run test:e2e`): chamadas HTTP com Supertest no
  app completo, também contra um MongoDB real.

Integração e e2e compartilham o MongoDB do `docker-compose.test.yml` (porta
27018, banco `genyo_test`), isolado do de desenvolvimento. O `globalSetup` do
Vitest sobe o container antes da suíte e o remove no fim, inclusive quando algum
teste falha. `npm run test:infra` roda integração e e2e com um único container.

### CI

O workflow `release.yml` roda lint, typecheck, build e os testes unitários, de
integração e e2e (com o MongoDB de teste em Docker) em push na `master` e, se
passar, executa o semantic-release. O workflow roda só na `master`; ainda não há
CI em pull request.

### Observações

- Rotas de `Employee`: `POST /employees`, `GET /employees`,
  `GET /employees/:id`, `PUT /employees/:id` e `DELETE /employees/:id`.
- O `PUT` substitui todos os campos e aplica as mesmas regras do cadastro, como
  um formulário preenchido com os dados atuais. Omitir `terminationDate` volta o
  funcionário a ativo. Os modais de confirmação da spec são do frontend: a API
  só persiste quando recebe a requisição já confirmada.
- A periodicidade do fechamento usa códigos em inglês na API (`MONTHLY`,
  `BIMONTHLY`, `QUARTERLY`, `SEMIANNUAL` e `ANNUAL`). O mapeamento para Mensal,
  Bimestral, Trimestral, Semestral e Anual fica no frontend.
- O `GET /health` faz ping no MongoDB e responde 503 se o banco estiver
  indisponível.
