const userService = require('../services/users.service');
const { validateId, validateUserPayload } = require('../validations/user.validation');

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

module.exports = {
  list,
  getById,
  create,
};
