# Webservice API (Node.js 18)

API em Node.js + Express com documentacao Swagger em `/docs`, usando camadas de router, controller, service, model e validacoes.

## Requisitos
- Node.js 18+

## Instalacao
```bash
npm install
```

## Execucao
- Desenvolvimento: `npm run dev`
- Producao/local: `npm start`
- Testes: `npm test`

A API sobe em `http://localhost:3000` por padrao.

## Endpoints principais
- `GET /health` - verificacao de status.
- `GET /api/users` - lista usuarios.
- `GET /api/users/:id` - busca usuario por id.
- `POST /api/users` - cria usuario (campos: `email`, `nome`, `sobrenome`, opcionais `data_nascimento`, `celular`).
- `POST /api/users/usuarios/integrar` - integra do randomuser com filtros `idadeMin` e `maxRegistros` (use `download=true` para baixar o PDF da integracao).
- `GET /api/relatorios/usuarios?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD` - baixa relatorio PDF filtrado por data de nascimento.
- `GET /docs` - UI do Swagger.

## Estrutura de pastas
- `src/server.js` - bootstrap do servidor.
- `src/app.js` - configuracao do Express e Swagger.
- `src/config/swagger.js` - configuracao do Swagger.
- `src/routes` - rotas e documentacao via JSDoc.
- `src/controllers` - controladores HTTP.
- `src/services` - regras/coordenacao de negocio (validacoes e regras ficam aqui).
- `src/models` - SQL e mapeamento de dados (tabela `usuario`).
- `src/config/db.js` - pool MySQL e teste de conexao (usa `.env`).

## Banco de dados
- Conexao via pool em `src/config/db.js` (usado pelos services) com `mysql2/promise`.
- Configure as variaveis no `.env` (recomendado):
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `DB_PING_ON_STARTUP` (opcional: defina `false` para nao pingar no start)
- Model usa a tabela `usuario`.
