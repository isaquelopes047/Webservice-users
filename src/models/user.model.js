const queries = {
  findAll: 'SELECT id, name, email, role FROM usuario',
  findById: 'SELECT id, name, email, role FROM usuario WHERE id = ?',
};

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

function mapUsers(rows) {
  return rows.map(mapUser);
}

module.exports = {
  queries,
  mapUser,
  mapUsers,
};
