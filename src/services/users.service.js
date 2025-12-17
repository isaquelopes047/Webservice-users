const pool = require('../config/db');
const userModel = require('../models/user.model');
const { ensureAdult } = require('../validations/age.validation');

function buildError(status, message, errors) {
  const err = new Error(message);
  err.status = status;
  if (errors) err.errors = errors;
  return err;
}

function validateId(rawId) {
  const parsed = Number.parseInt(rawId, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw buildError(400, 'id deve ser um inteiro positivo');
  }
  return parsed;
}

function validateCreatePayload(payload) {
  const errors = [];
  const sanitized = {};

  if (!payload || typeof payload !== 'object') {
    throw buildError(400, 'payload deve ser um objeto');
  }

  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const nome = typeof payload.nome === 'string' ? payload.nome.trim() : '';
  const sobrenome = typeof payload.sobrenome === 'string' ? payload.sobrenome.trim() : '';
  const dataNascimento =
    typeof payload.data_nascimento === 'string' ? payload.data_nascimento.trim() : '';
  const celular = typeof payload.celular === 'string' ? payload.celular.trim() : '';

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    errors.push('email eh obrigatorio e deve ser valido');
  }
  if (!nome) {
    errors.push('nome eh obrigatorio e deve ser string');
  }
  if (!sobrenome) {
    errors.push('sobrenome eh obrigatorio e deve ser string');
  }
  if (dataNascimento && !/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) {
    errors.push('data_nascimento deve estar no formato YYYY-MM-DD');
  }
  if (!dataNascimento) {
    errors.push('data_nascimento eh obrigatoria para validar idade');
  }

  if (errors.length) {
    throw buildError(400, 'Payload invalido', errors);
  }

  sanitized.email = email;
  sanitized.nome = nome;
  sanitized.sobrenome = sobrenome;
  sanitized.data_nascimento = dataNascimento;
  sanitized.celular = celular || null;

  return sanitized;
}

function validateIntegrateParams(query) {
  const errors = [];
  const idadeMinRaw = query.idade ?? query.idadeMin ?? query.age;
  const maxRegistrosRaw = query.maxRegistros ?? query.max ?? query.limit;

  const idadeMin = idadeMinRaw !== undefined ? Number.parseInt(idadeMinRaw, 10) : 0;
  if (Number.isNaN(idadeMin) || idadeMin < 0) {
    errors.push('idade deve ser um inteiro maior ou igual a 0');
  }

  const maxRegistros = maxRegistrosRaw !== undefined ? Number.parseInt(maxRegistrosRaw, 10) : 50;
  if (Number.isNaN(maxRegistros) || maxRegistros <= 0) {
    errors.push('maxRegistros deve ser um inteiro positivo');
  } else if (maxRegistros > 150) {
    errors.push('maxRegistros nao pode ultrapassar 150');
  }

  if (errors.length) {
    throw buildError(400, 'Parametros invalidos', errors);
  }

  return {
    idadeMin: Number.isNaN(idadeMin) ? 0 : idadeMin,
    maxRegistros: Number.isNaN(maxRegistros) ? 50 : Math.min(maxRegistros, 150),
  };
}

async function listUsers() {
  return userModel.findAll(pool);
}

async function getUserById(rawId) {
  const id = validateId(rawId);
  const user = await userModel.findById(pool, id);
  if (!user) {
    throw buildError(404, 'Usuario nao encontrado');
  }
  return user;
}

async function createUser(payload) {
  const data = validateCreatePayload(payload);

  try {
    ensureAdult(data.data_nascimento);
  } catch (error) {
    throw buildError(400, error.message);
  }

  const existing = await userModel.findByEmail(pool, data.email);
  if (existing) {
    throw buildError(409, 'email ja cadastrado');
  }

  const insertId = await userModel.insertOne(pool, data);
  return { id: insertId, ...data };
}

// Busca randomuser e insere respeitando filtros simples (idade minima e quantidade)
async function integrateUsersFromRandom(rawQuery) {
  const params = validateIntegrateParams(rawQuery);
  const url = 'https://randomuser.me/api/?results=150';
  const response = await fetch(url);
  if (!response.ok) {
    throw buildError(502, `Falha ao buscar randomuser: ${response.status}`);
  }

  const payload = await response.json();
  const usersRaw = payload.results || [];

  const filtered = usersRaw
    .filter((u) => Number.parseInt(u.dob?.age, 10) >= params.idadeMin)
    .slice(0, params.maxRegistros);

  if (!filtered.length) {
    return { inserted: 0, totalFetched: usersRaw.length, params };
  }

  const values = filtered.map(userModel.mapRandomUserToInsertRow);

  const inserted = await userModel.insertMany(pool, values);

  return { inserted, totalFetched: usersRaw.length, params };
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  integrateUsersFromRandom,
};
