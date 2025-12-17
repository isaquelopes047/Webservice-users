// Normaliza email para comparacao e persistencia
function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
};

// Decide se deve atualizar quando email ja existe
function shouldUpdateExisting(existingRow) {
  return Boolean(existingRow && existingRow.id);
};

module.exports = {
  normalizeEmail,
  shouldUpdateExisting,
};

