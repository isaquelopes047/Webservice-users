function validateId(rawId) {
  const parsed = Number.parseInt(rawId, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return { isValid: false, error: 'id deve ser um inteiro positivo' };
  }
  return { isValid: true, value: parsed };
}

function validateUserPayload(payload) {
  const errors = [];
  const sanitized = {};

  if (!payload || typeof payload !== 'object') {
    return { isValid: false, errors: ['payload deve ser um objeto'], value: null };
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const role = typeof payload.role === 'string' ? payload.role.trim() : 'user';

  if (!name) {
    errors.push('name é obrigatório e deve ser string');
  }

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    errors.push('email é obrigatório e deve ser válido');
  }

  sanitized.name = name;
  sanitized.email = email;
  sanitized.role = role || 'user';

  return {
    isValid: errors.length === 0,
    errors,
    value: sanitized,
  };
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
    errors.push('maxRegistros não pode ultrapassar 150');
  }

  return {
    isValid: errors.length === 0,
    errors,
    value: {
      idadeMin: Number.isNaN(idadeMin) ? 0 : idadeMin,
      maxRegistros: Number.isNaN(maxRegistros) ? 50 : Math.min(maxRegistros, 150),
    },
  };
}

module.exports = {
  validateId,
  validateUserPayload,
  validateIntegrateParams,
};
