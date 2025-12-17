const TABELA = 'usuario';

// Converte uma linha do banco para objeto de usuario
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

// Busca usuarios por range de data_nascimento (YYYY-MM-DD)
async function listByBirthDateRange(connection, { dataInicio, dataFim }) {
  const [rows] = await connection.query(
    `
      SELECT id, email, nome, sobrenome, data_nascimento, celular
      FROM ${TABELA}
      WHERE data_nascimento IS NOT NULL
        AND data_nascimento BETWEEN ? AND ?
      ORDER BY data_nascimento ASC
    `,
    [dataInicio, dataFim]
  );

  return rows.map(mapUser);
}

module.exports = {
  listByBirthDateRange,
};
