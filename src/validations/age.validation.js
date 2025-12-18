function ensureAdult(dateStr) {
  if (!dateStr) throw new Error('Data de nascimento é obrigatória para validar idade');

  const dob = new Date(dateStr);

  if (Number.isNaN(dob.getTime())) throw new Error('Data de nascimento inválida');

  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age -= 1;
  
  if (age <= 18) throw new Error('usuario deve ter mais de 18 anos');

  return true;
}

module.exports = {
  ensureAdult,
};
