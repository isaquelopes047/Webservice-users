const express = require('express');
const usersController = require('../controllers/users.controller');
const integrationController = require('../controllers/users.controller');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: Operações com usuários
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           example: ada@example.com
 *         nome:
 *           type: string
 *           example: Ada
 *         sobrenome:
 *           type: string
 *           example: Lovelace
 *         data_nascimento:
 *           type: string
 *           format: date
 *           example: 1815-12-10
 *         celular:
 *           type: string
 *           example: "+55 11 99999-9999"
 */

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Lista todos os usuários
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get('/', usersController.list);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Busca um usuário pelo id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', usersController.getById);

/**
 * @openapi
 * /api/users/usuarios/integrar:
 *   post:
 *     tags: [Users]
 *     summary: Integra usuários do randomuser e insere no banco
 *     description: Chama https://randomuser.me/api, filtra por idade mínima e insere até o limite definido.
 *     parameters:
 *       - in: query
 *         name: idadeMin
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Idade mínima dos usuários (default 0)
 *       - in: query
 *         name: maxRegistros
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 150
 *         description: Quantidade máxima a inserir (default 50, máx 150)
 *     responses:
 *       200:
 *         description: Integração executada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 inserted:
 *                   type: integer
 *                 totalFetched:
 *                   type: integer
 *                 idadeMin:
 *                   type: integer
 *                 maxRegistros:
 *                   type: integer
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno
 */
router.post('/usuarios/integrar', integrationController.integrateRandomUsers);

module.exports = router;
