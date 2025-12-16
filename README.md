# Webservice API (Node.js 18)

API em Node.js + Express com documentacao Swagger em `/docs`, usando camadas de router, controller, service, model e validacoes.

## Requisitos
- Node.js 18+

## Instalacao
```bash
npm install
```

## Execucao
- Desenvolvimento (com reload): `npm run dev`
- Producao/local: `npm start`

A API sobe em `http://localhost:3000` por padrao.

## Endpoints principais
- `GET /health` - verificacao de status.
- `GET /api/users` - lista usuarios.
- `GET /api/users/:id` - busca usuario por id.
- `POST /api/users` - cria usuario (campos: `email`, `nome`, `sobrenome`, opcionais `data_nascimento`, `celular`).
- `POST /api/users/usuarios/integrar` - integra do randomuser com filtros `idadeMin` e `maxRegistros`.
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
- Variaveis de ambiente (opcionais, ja ha defaults):
  - `DB_HOST` (default `roundhouse.proxy.rlwy.net`)
  - `DB_PORT` (default `51673`)
  - `DB_USER` (default `root`)
  - `DB_PASSWORD` (default `15c-eCde4hhD4h4FFCg41FHbBChh5b-E`)
  - `DB_NAME` (default `railway`)
- Model usa a tabela `usuario` com colunas `id`, `email`, `nome`, `sobrenome`, `data_nascimento`, `celular`.
