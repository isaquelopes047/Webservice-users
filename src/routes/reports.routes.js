const express = require('express');
const reportsController = require('../controllers/reports.controller');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Relatorios
 *     description: Download de relatorios em PDF
 */

/**
 * @openapi
 * /api/relatorios/usuarios:
 *   get:
 *     tags: [Relatorios]
 *     summary: Baixa relatorio PDF de usuarios
 *     description: Retorna um PDF filtrando usuarios por range de data_nascimento.
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         required: true
 *         schema:
 *           type: string
 *           example: 1990-01-01
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         required: true
 *         schema:
 *           type: string
 *           example: 2000-12-31
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: PDF do relatorio
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parametros invalidos
 *       500:
 *         description: Erro interno
 */
router.get('/usuarios', reportsController.downloadUsersBirthReport);

module.exports = router;

