const pool = require('../config/db');
const userModel = require('../models/user.model');

async function listUsers() {
  const [rows] = await pool.query(userModel.queries.findAll);
  return userModel.mapUsers(rows);
}

async function getUserById(id) {
  const [rows] = await pool.query(userModel.queries.findById, [id]);
  return rows.length ? userModel.mapUser(rows[0]) : null;
}

async function createUser() {
  throw new Error('createUser não implementado');
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
};
