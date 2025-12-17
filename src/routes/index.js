const express = require('express');
const usersRouter = require('./users.routes');
const reportsRouter = require('./reports.routes');

const router = express.Router();

router.use('/users', usersRouter);
router.use('/relatorios', reportsRouter);

module.exports = router;
