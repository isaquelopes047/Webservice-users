const pool = require('../config/db');
const userModel = require('../models/user.model');
const { ensureAdult } = require('../validations/age.validation');
const { normalizeEmail, shouldUpdateExisting } = require('../validations/emailUpsert.validation');

function buildError(status, message, errors) {
  const err = new Error(message);
  err.status = status;
  if (errors) err.errors = errors;
  return err;
};

function validateId(rawId) {
  const parsed = Number.parseInt(rawId, 10);
  if (Number.isNaN(parsed) || parsed <= 0) throw buildError(400, 'id deve ser um inteiro positivo');
  
  return parsed;
};

function validateCreatePayload(payload) {
  const errors = [];
  const sanitized = {};

  if (!payload || typeof payload !== 'object') throw buildError(400, 'payload deve ser um objeto');
  
  const email = normalizeEmail(payload.email);
  const sexo = typeof payload.sexo === 'string' ? payload.sexo.trim().toLowerCase() : '';
  const nome = typeof payload.nome === 'string' ? payload.nome.trim() : '';
  const sobrenome = typeof payload.sobrenome === 'string' ? payload.sobrenome.trim() : '';
  const dataNascimento = typeof payload.data_nascimento === 'string' ? payload.data_nascimento.trim() : '';
  const celular = typeof payload.celular === 'string' ? payload.celular.trim() : '';

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('email eh obrigatorio e deve ser valido');
  
  if (!nome) errors.push('nome eh obrigatorio e deve ser string');

  if (!sobrenome)  errors.push('sobrenome eh obrigatorio e deve ser string');

  if (sexo && !['male', 'female', 'm', 'f'].includes(sexo)) errors.push('sexo deve ser male/female (ou m/f)');

  if (dataNascimento && !/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) errors.push('data_nascimento deve estar no formato YYYY-MM-DD');
  
  if (!dataNascimento) errors.push('data_nascimento eh obrigatoria para validar idade');

  if (errors.length) throw buildError(400, 'Payload invalido', errors);
  
  sanitized.email = email;
  sanitized.sexo = sexo ? (sexo === 'm' ? 'male' : sexo === 'f' ? 'female' : sexo) : null;
  sanitized.nome = nome;
  sanitized.sobrenome = sobrenome;
  sanitized.data_nascimento = dataNascimento;
  sanitized.celular = celular || null;

  return sanitized;
};

function validateIntegrateParams(query) {
  const errors = [];
  const idadeMinRaw = query.idade ?? query.idadeMin ?? query.age;
  const maxRegistrosRaw = query.maxRegistros ?? query.max ?? query.limit;

  const idadeMin = idadeMinRaw !== undefined ? Number.parseInt(idadeMinRaw, 10) : 0;

  if (Number.isNaN(idadeMin) || idadeMin < 0) errors.push('idade deve ser um inteiro maior ou igual a 0');
  
  const maxRegistros = maxRegistrosRaw !== undefined ? Number.parseInt(maxRegistrosRaw, 10) : 50;

  if (Number.isNaN(maxRegistros) || maxRegistros <= 0) {
    errors.push('maxRegistros deve ser um inteiro positivo');
  } else if (maxRegistros > 150) {
    errors.push('maxRegistros nao pode ultrapassar 150');
  }

  if (errors.length) throw buildError(400, 'Parametros invalidos', errors);

  return {
    idadeMin: Number.isNaN(idadeMin) ? 0 : idadeMin,
    maxRegistros: Number.isNaN(maxRegistros) ? 50 : Math.min(maxRegistros, 150),
  };
};

async function listUsers() {
  return userModel.findAll(pool);
};

async function getUserById(rawId) {
  const id = validateId(rawId);
  const user = await userModel.findById(pool, id);

  if (!user) throw buildError(404, 'Usuario nao encontrado');
  
  return user;
};

async function createUser(payload) {
  const data = validateCreatePayload(payload);

  try {
    ensureAdult(data.data_nascimento);
  } catch (error) {
    throw buildError(400, error.message);
  }

  const existing = await userModel.findByEmail(pool, data.email);
  if (shouldUpdateExisting(existing)) {
    await userModel.updateByEmail(pool, data.email, data);
    return { id: existing.id, ...data, updated: true };
  }

  const insertId = await userModel.insertOne(pool, data);
  return { id: insertId, ...data, updated: false };
};

// Busca randomuser e insere respeitando filtros simples (idade minima e quantidade)
async function integrateUsersFromRandom(rawQuery) {
  const params = validateIntegrateParams(rawQuery);
  const url = 'https://randomuser.me/api/?results=150';
  const response = await fetch(url);
  if (!response.ok) throw buildError(502, `Falha ao buscar randomuser: ${response.status}`);
  
  const payload = await response.json();
  const usersRaw = payload.results || [];

  const filtered = usersRaw
    .filter((u) => Number.parseInt(u.dob?.age, 10) >= params.idadeMin)
    .slice(0, params.maxRegistros);

  if (!filtered.length) {
    return {
      totalFetched: usersRaw.length,
      params,
      summary: { attempted: 0, inserted: 0, updated: 0, success: 0, errors: 0 },
      rows: [],
    };
  }

  const rows = [];
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const raw of filtered) {
    const mapped = {
      email: raw?.email,
      sexo: raw?.gender,
      nome: raw?.name?.first,
      sobrenome: raw?.name?.last,
      data_nascimento: raw?.dob?.date ? raw.dob.date.slice(0, 10) : '',
      celular: raw?.cell || raw?.phone || '',
    };

    try {
      const data = validateCreatePayload(mapped);
      ensureAdult(data.data_nascimento);

      const existing = await userModel.findByEmail(pool, data.email);
      if (shouldUpdateExisting(existing)) {
        await userModel.updateByEmail(pool, data.email, data);
        updated += 1;
        rows.push({ ...data, id: existing.id, status: 'updated', erro: null });
        continue;
      }

      const id = await userModel.insertOne(pool, data);
      inserted += 1;
      rows.push({ ...data, id, status: 'inserted', erro: null });
    } catch (error) {
      errors += 1;
      const message = error && error.errors ? error.errors.join('; ') : error.message;
      const shortMessage = (message || 'erro ao processar').slice(0, 140);
      rows.push({
        email: normalizeEmail(mapped.email),
        sexo: typeof mapped.sexo === 'string' ? mapped.sexo.trim().toLowerCase() : null,
        nome: typeof mapped.nome === 'string' ? mapped.nome.trim() : '',
        sobrenome: typeof mapped.sobrenome === 'string' ? mapped.sobrenome.trim() : '',
        data_nascimento: mapped.data_nascimento || null,
        celular: mapped.celular || null,
        id: null,
        status: 'error',
        erro: shortMessage,
      });
    }
  }

  return {
    totalFetched: usersRaw.length,
    params,
    summary: {
      attempted: filtered.length,
      inserted,
      updated,
      success: inserted + updated,
      errors,
    },
    rows,
  };
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  integrateUsersFromRandom,
};
