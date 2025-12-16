# Webservice API (Node.js 18)

API em Node.js + Express com documentação Swagger em `/docs`, usando camadas de router, controller, service, model e funções de validação.

## Requisitos
- Node.js 18+

## Instalação
```bash
npm install
```

## Execução
- Desenvolvimento (com reload): `npm run dev`
- Produção/local: `npm start`

A API sobe em `http://localhost:3000` por padrão.

## Endpoints principais
- `GET /health` - verificação de status.
- `GET /api/users` - lista usuários.
- `GET /api/users/:id` - busca usuário por id.
- `POST /api/users` - cria usuário (campos: `name`, `email`, opcional `role`).
- `POST /api/users/usuarios` - integra do randomuser com filtros `idadeMin` e `maxRegistros`.
- `GET /docs` - UI do Swagger.

## Estrutura de pastas
- `src/server.js` - bootstrap do servidor.
- `src/app.js` - configuração do Express e Swagger.
- `src/config/swagger.js` - configuração do Swagger.
- `src/routes` - rotas e documentação via JSDoc.
- `src/controllers` - controladores HTTP.
- `src/services` - regras/coordenação de negócio.
- `src/models` - SQL e mapeamento de dados (tabela `usuario`).
- `src/validations` - validações de payload e ids.
- `src/config/db.js` - pool MySQL e teste de conexão (usa `.env`).

## Banco de dados
- Conexão via pool em `src/config/db.js` (usado pelos services) usando `mysql2/promise`.
- Variáveis de ambiente (opcionais, já há defaults):
  - `DB_HOST` (default `roundhouse.proxy.rlwy.net`)
  - `DB_PORT` (default `51673`)
  - `DB_USER` (default `root`)
  - `DB_PASSWORD` (default `15c-eCde4hhD4h4FFCg41FHbBChh5b-E`)
  - `DB_NAME` (default `railway`)
- Model usa a tabela `usuario` com colunas `id`, `email`, `nome`, `sobrenome`, `data_nascimento`, `celular`.
-
