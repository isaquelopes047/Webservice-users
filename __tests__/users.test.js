jest.mock('../src/services/users.service', () => ({
  listUsers: jest.fn(),
  getUserById: jest.fn(),
  createUser: jest.fn(),
  integrateUsersFromRandom: jest.fn(),
}));

jest.mock('../src/services/reports.service', () => ({
  generateUsersBirthReport: jest.fn(),
  generateUsersIntegrationReport: jest.fn(),
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

  it('POST /api/users deve rejeitar idade menor ou igual a 18', async () => {
    const err = new Error('usuario deve ter mais de 18 anos');
    err.status = 400;
    userService.createUser.mockRejectedValue(err);

    const res = await request(app)
      .post('/api/users')
      .send({
        email: 'young@example.com',
        nome: 'Young',
        sobrenome: 'Tester',
        data_nascimento: '2010-01-01',
        celular: '11999999999',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('usuario deve ter mais de 18 anos');
    expect(userService.createUser).toHaveBeenCalledTimes(1);
  });

  it('POST /api/users/usuarios/integrar?download=true deve baixar PDF', async () => {
    userService.integrateUsersFromRandom.mockResolvedValue({
      totalFetched: 150,
      params: { idadeMin: 18, maxRegistros: 2 },
      summary: { attempted: 2, inserted: 1, updated: 1, success: 2, errors: 0 },
      rows: [
        { email: 'a@example.com', nome: 'A', sobrenome: 'B', data_nascimento: '1990-01-01', celular: null, status: 'inserted', erro: null },
        { email: 'b@example.com', nome: 'C', sobrenome: 'D', data_nascimento: '1991-01-01', celular: null, status: 'updated', erro: null },
      ],
    });

    const reportsService = require('../src/services/reports.service');
    reportsService.generateUsersIntegrationReport.mockResolvedValue({
      filename: 'relatorio-integracao.pdf',
      stream: require('stream').Readable.from(Buffer.from('%PDF-1.4\nfake\n')),
    });

    const res = await request(app)
      .post('/api/users/usuarios/integrar')
      .query({ idadeMin: 18, maxRegistros: 2, download: true });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(userService.integrateUsersFromRandom).toHaveBeenCalledTimes(1);
    expect(reportsService.generateUsersIntegrationReport).toHaveBeenCalledTimes(1);
  });
});
