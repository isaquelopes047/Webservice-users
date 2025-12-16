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

module.exports = {
  validateId,
  validateUserPayload,
};
