const pool = require('../config/db');
const userModel = require('../models/user.model');

async function listUsers() {
  return userModel.findAll(pool);
}

async function getUserById(id) {
  return userModel.findById(pool, id);
}

async function createUser() {
  throw new Error('createUser nao implementado');
}

async function integrateUsersFromRandom({ idadeMin, maxRegistros }) {
  const url = 'https://randomuser.me/api/?results=150';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao buscar randomuser: ${response.status}`);
  }

  const payload = await response.json();
  const usersRaw = payload.results || [];

  const filtered = usersRaw
    .filter((u) => Number.parseInt(u.dob?.age, 10) >= idadeMin)
    .slice(0, maxRegistros);

  if (!filtered.length) {
    return { inserted: 0, totalFetched: usersRaw.length };
  }

  const values = filtered.map(userModel.mapRandomUserToInsertRow);

  const inserted = await userModel.insertMany(pool, values);

  return { inserted, totalFetched: usersRaw.length };
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  integrateUsersFromRandom,
};
