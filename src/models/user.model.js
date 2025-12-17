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

// Converte lista de linhas do banco para objetos de usuario
function mapUsers(rows) {
  return rows.map(mapUser);
}

// Busca todos os usuarios na tabela
async function findAll(connection) {
  const [rows] = await connection.query(
    `SELECT id, email, nome, sobrenome, data_nascimento, celular FROM ${TABELA}`
  );
  return mapUsers(rows);
}

// Busca um usuario pelo id
async function findById(connection, id) {
  const [rows] = await connection.query(
    `SELECT id, email, nome, sobrenome, data_nascimento, celular FROM ${TABELA} WHERE id = ?`,
    [id]
  );
  return rows.length ? mapUser(rows[0]) : null;
}

// Verifica existencia por email
async function findByEmail(connection, email) {
  const [rows] = await connection.query(
    `SELECT id FROM ${TABELA} WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows.length ? rows[0] : null;
}

// Atualiza um usuario existente pelo email
async function updateByEmail(connection, email, user) {
  const [result] = await connection.query(
    `UPDATE ${TABELA}
     SET nome = ?, sobrenome = ?, data_nascimento = ?, celular = ?
     WHERE email = ?`,
    [user.nome, user.sobrenome, user.data_nascimento, user.celular, email]
  );
  return result.affectedRows || 0;
}

// Insere varios usuarios em lote
async function insertMany(connection, values) {
  if (!values.length) return 0;
  const [result] = await connection.query(
    `INSERT INTO ${TABELA} (email, nome, sobrenome, data_nascimento, celular) VALUES ?
     ON DUPLICATE KEY UPDATE
       nome = VALUES(nome),
       sobrenome = VALUES(sobrenome),
       data_nascimento = VALUES(data_nascimento),
       celular = VALUES(celular)`,
    [values]
  );
  return result.affectedRows || 0;
}

// Insere um unico usuario e retorna o id
async function insertOne(connection, user) {
  const [result] = await connection.query(
    `INSERT INTO ${TABELA} (email, nome, sobrenome, data_nascimento, celular) VALUES (?, ?, ?, ?, ?)`,
    [
      user.email,
      user.nome,
      user.sobrenome,
      user.data_nascimento,
      user.celular,
    ]
  );
  return result.insertId;
}

// Mapeia dados do randomuser para a ordem de colunas de insert
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
  findByEmail,
  updateByEmail,
  insertMany,
  insertOne,
  mapRandomUserToInsertRow,
};
