jest.mock('../src/services/users.service', () => ({
  listUsers: jest.fn(),
  getUserById: jest.fn(),
  createUser: jest.fn(),
  integrateUsersFromRandom: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const userService = require('../src/services/users.service');

describe('Users routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/users deve retornar lista de usuarios', async () => {
    userService.listUsers.mockResolvedValue([
      { id: 1, email: 'a@example.com', nome: 'A', sobrenome: 'B', data_nascimento: null, celular: null },
      { id: 2, email: 'b@example.com', nome: 'C', sobrenome: 'D', data_nascimento: null, celular: null },
    ]);

    const res = await request(app).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].email).toBe('a@example.com');
    expect(userService.listUsers).toHaveBeenCalledTimes(1);
  });
});
