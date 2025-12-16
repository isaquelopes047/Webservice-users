const express = require('express');
const usersController = require('../controllers/users.controller');

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
 *         name:
 *           type: string
 *           example: Ada Lovelace
 *         email:
 *           type: string
 *           example: ada@example.com
 *         role:
 *           type: string
 *           example: admin
 *     CreateUserInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           example: Ada Lovelace
 *         email:
 *           type: string
 *           example: ada@example.com
 *         role:
 *           type: string
 *           example: admin
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

module.exports = router;
