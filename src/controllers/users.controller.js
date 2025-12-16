const userService = require('../services/users.service');
const { validateId, validateUserPayload } = require('../validations/user.validation');
const { validateIntegrateParams } = require('../validations/user.validation');

async function list(req, res) {
  try {
    const users = await userService.listUsers();
    res.json({ data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
}

async function getById(req, res) {
  const validation = validateId(req.params.id);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.error });
  }

  try {
    const user = await userService.getUserById(validation.value);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    return res.json({ data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
}

async function create(req, res) {
  return res
    .status(501)
    .json({ message: 'Criação de usuário ainda não implementada. Apenas GET habilitado.' });
}

async function integrateRandomUsers(req, res) {
  const { isValid, errors, value } = validateIntegrateParams(req.query);
  if (!isValid) {
    return res.status(400).json({ message: 'Parâmetros inválidos', errors });
  }

  try {
    const result = await userService.integrateUsersFromRandom(value);
    return res.json({
      message: 'Integração concluída',
      inserted: result.inserted,
      totalFetched: result.totalFetched,
      idadeMin: value.idadeMin,
      maxRegistros: value.maxRegistros,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao integrar usuários', detail: error.message });
  }
}

module.exports = {
  list,
  getById,
  create,
  integrateRandomUsers
};
