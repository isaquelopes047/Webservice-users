const TABELA = 'usuario';

function mapUser(row) {
  return {
    id: row.id,
    email: row.email,
    nome: row.nome,
    sobrenome: row.sobrenome,
    data_nascimento: row.data_nascimento,
    celular: row.celular,
  };
}

function mapUsers(rows) {
  return rows.map(mapUser);
}

async function findAll(connection) {
  const [rows] = await connection.query(
    `SELECT id, email, nome, sobrenome, data_nascimento, celular FROM ${TABELA}`
  );
  return mapUsers(rows);
}

async function findById(connection, id) {
  const [rows] = await connection.query(
    `SELECT id, email, nome, sobrenome, data_nascimento, celular FROM ${TABELA} WHERE id = ?`,
    [id]
  );
  return rows.length ? mapUser(rows[0]) : null;
}

async function insertMany(connection, values) {
  if (!values.length) return 0;
  const [result] = await connection.query(
    `INSERT INTO ${TABELA} (email, nome, sobrenome, data_nascimento, celular) VALUES ?`,
    [values]
  );
  return result.affectedRows || 0;
}

function mapRandomUserToInsertRow(randomUser) {
  const first = randomUser?.name?.first || '';
  const last = randomUser?.name?.last || '';
  const email = randomUser?.email || '';
  const birthDate = randomUser?.dob?.date ? randomUser.dob.date.slice(0, 10) : null;
  const cell = randomUser?.cell || randomUser?.phone || '';

  return [email, first, last, birthDate, cell];
}

module.exports = {
  mapUser,
  mapUsers,
  findAll,
  findById,
  insertMany,
  mapRandomUserToInsertRow,
};
