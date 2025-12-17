jest.mock('../src/services/reports.service', () => ({
  generateUsersBirthReport: jest.fn(),
}));

const { Readable } = require('stream');
const request = require('supertest');
const app = require('../src/app');
const reportsService = require('../src/services/reports.service');

describe('Reports routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/relatorios/usuarios deve baixar PDF', async () => {
    reportsService.generateUsersBirthReport.mockResolvedValue({
      filename: 'relatorio.pdf',
      stream: Readable.from(Buffer.from('%PDF-1.4\nfake\n')),
      params: { dataInicio: '1990-01-01', dataFim: '2000-12-31' },
      total: 1,
    });

    const res = await request(app)
      .get('/api/relatorios/usuarios')
      .query({ dataInicio: '1990-01-01', dataFim: '2000-12-31' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(reportsService.generateUsersBirthReport).toHaveBeenCalledTimes(1);
  });
});

