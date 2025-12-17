const userService = require('../services/users.service');
const reportsService = require('../services/reports.service');

function handleError(res, error) {
  if (error && error.status) return res.status(error.status).json({ message: error.message, errors: error.errors });
  console.error(error);
  return res.status(500).json({ message: 'Erro interno' });
}

async function list(req, res) {
  try {
    const users = await userService.listUsers();
    res.json({ data: users });
  } catch (error) {
    handleError(res, error);
  }
}

async function getById(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ data: user });
  } catch (error) {
    handleError(res, error);
  }
}

async function create(req, res) {
  try {
    const created = await userService.createUser(req.body);
    res.status(201).json({ data: created });
  } catch (error) {
    handleError(res, error);
  }
}

async function integrateRandomUsers(req, res) {
  try {
    const result = await userService.integrateUsersFromRandom(req.query);

    const download = String(req.query.download || req.query.baixarRelatorio || '').toLowerCase();
    const wantsPdf =
      download === '1' ||
      download === 'true' ||
      download === 'pdf' ||
      (req.headers.accept && req.headers.accept.includes('application/pdf'));

    if (wantsPdf) {
      const pdf = await reportsService.generateUsersIntegrationReport(result);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${pdf.filename}"`);
      res.setHeader('X-Integration-Params', JSON.stringify(result.params || {}));
      res.setHeader('X-Integration-Summary', JSON.stringify(result.summary || {}));
      return pdf.stream.pipe(res);
    }

    return res.json({
      message: 'Integracao concluida',
      totalFetched: result.totalFetched,
      idadeMin: result.params.idadeMin,
      maxRegistros: result.params.maxRegistros,
      summary: result.summary,
      request: { query: result.params },
    });
  } catch (error) {
    handleError(res, error);
  }
}

module.exports = {
  list,
  getById,
  create,
  integrateRandomUsers,
};
