const userService = require('../services/users.service');

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
    res.json({
      message: 'Integracao concluida',
      inserted: result.inserted,
      totalFetched: result.totalFetched,
      idadeMin: result.params.idadeMin,
      maxRegistros: result.params.maxRegistros,
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
