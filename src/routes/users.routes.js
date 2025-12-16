const express = require('express');
const usersController = require('../controllers/users.controller');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: Operacoes com usuarios
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
 *     CreateUserInput:
 *       type: object
 *       required: [email, nome, sobrenome]
 *       properties:
 *         email:
 *           type: string
 *         nome:
 *           type: string
 *         sobrenome:
 *           type: string
 *         data_nascimento:
 *           type: string
 *           format: date
 *         celular:
 *           type: string
 */

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Lista todos os usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *   post:
 *     tags: [Users]
 *     summary: Cria um usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       201:
 *         description: Usuario criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Payload invalido
 */
router.get('/', usersController.list);
router.post('/', usersController.create);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Busca um usuario pelo id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: ID invalido
 *       404:
 *         description: Usuario nao encontrado
 */
router.get('/:id', usersController.getById);

/**
 * @openapi
 * /api/users/usuarios/integrar:
 *   post:
 *     tags: [Users]
 *     summary: Integra usuarios do randomuser e insere no banco
 *     description: Chama https://randomuser.me/api, filtra por idade minima e insere ate o limite definido.
 *     parameters:
 *       - in: query
 *         name: idadeMin
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Idade minima dos usuarios (default 0)
 *       - in: query
 *         name: maxRegistros
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 150
 *         description: Quantidade maxima a inserir (default 50, max 150)
 *     responses:
 *       200:
 *         description: Integracao executada
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
 *         description: Parametros invalidos
 *       500:
 *         description: Erro interno
 */
router.post('/usuarios/integrar', usersController.integrateRandomUsers);

module.exports = router;
