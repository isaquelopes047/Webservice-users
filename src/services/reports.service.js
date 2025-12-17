const { PassThrough } = require('stream');
const PDFDocument = require('pdfkit');
const pool = require('../config/db');
const usersReportModel = require('../models/usersReport.model');

function buildError(status, message, errors) {
  const err = new Error(message);
  err.status = status;
  if (errors) err.errors = errors;
  return err;
};

function validateBirthRange(query) {
  const errors = [];
  const dataInicio = typeof query.dataInicio === 'string' ? query.dataInicio.trim() : '';
  const dataFim = typeof query.dataFim === 'string' ? query.dataFim.trim() : '';

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dataInicio || !dateRegex.test(dataInicio)) {
    errors.push('dataInicio deve estar no formato YYYY-MM-DD');
  }
  if (!dataFim || !dateRegex.test(dataFim)) {
    errors.push('dataFim deve estar no formato YYYY-MM-DD');
  }

  if (!errors.length && dataInicio > dataFim) {
    errors.push('dataInicio nao pode ser maior que dataFim');
  }

  if (errors.length) {
    throw buildError(400, 'Parametros invalidos', errors);
  }

  return { dataInicio, dataFim };
};

function writeUsersReportPdf(doc, { dataInicio, dataFim, users }) {
  const marginLeft = doc.page.margins.left;
  const marginRight = doc.page.margins.right;
  const marginTop = doc.page.margins.top;
  const marginBottom = doc.page.margins.bottom;
  const contentWidth = doc.page.width - marginLeft - marginRight;

  const columns = [
    { header: 'ID', width: 35, align: 'right', key: 'id' },
    { header: 'Nome', width: 70, align: 'left', key: 'nome' },
    { header: 'Sobrenome', width: 80, align: 'left', key: 'sobrenome' },
    { header: 'Email', width: 150, align: 'left', key: 'email' },
    { header: 'Nascimento', width: 70, align: 'left', key: 'data_nascimento' },
    { header: 'Celular', width: 90, align: 'left', key: 'celular' },
  ];

  const totalColumnsWidth = columns.reduce((sum, col) => sum + col.width, 0);
  if (totalColumnsWidth > contentWidth) {
    throw buildError(500, 'Configuracao de colunas excede a largura da pagina');
  }

  const formatDate = (value) => {
    if (!value) return '-';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === 'string') return value.slice(0, 10);
    return String(value);
  };

  const formatDateTimeBr = (date) => {
    const pad2 = (n) => String(n).padStart(2, '0');
    const d = pad2(date.getDate());
    const m = pad2(date.getMonth() + 1);
    const y = date.getFullYear();
    const hh = pad2(date.getHours());
    const mm = pad2(date.getMinutes());
    const ss = pad2(date.getSeconds());
    return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
  };

  const drawTableHeader = (y) => {
    const xStart = marginLeft;
    const rowHeight = 18;

    doc.save().rect(xStart, y, totalColumnsWidth, rowHeight).fill('#eeeeee').restore();
    doc.lineWidth(1).rect(xStart, y, totalColumnsWidth, rowHeight).stroke();

    doc.font('Helvetica-Bold').fontSize(10);
    let x = xStart;
    for (const col of columns) {
      doc.rect(x, y, col.width, rowHeight).stroke();
      doc.text(col.header, x + 6, y + 5, { width: col.width - 12, align: col.align });
      x += col.width;
    }
    doc.font('Helvetica').fontSize(10);

    return y + rowHeight;
  };

  const drawRow = (y, user) => {
    const xStart = marginLeft;
    const rowHeight = 18;

    doc.lineWidth(1).rect(xStart, y, totalColumnsWidth, rowHeight).stroke();

    let x = xStart;
    for (const col of columns) {
      doc.rect(x, y, col.width, rowHeight).stroke();

      let value = user[col.key];
      if (col.key === 'data_nascimento') value = formatDate(value);
      if (value === null || value === undefined || value === '') value = '-';

      doc.text(String(value), x + 6, y + 5, {
        width: col.width - 12,
        align: col.align,
        ellipsis: true,
      });
      x += col.width;
    }

    return y + rowHeight;
  };

  doc.font('Helvetica-Bold').fontSize(18).text('Relatorio de Usuarios', { align: 'center' });
  doc.moveDown(0.5);

  doc.font('Helvetica').fontSize(11).text(`Filtro por data de nascimento: ${dataInicio} ate ${dataFim}`);
  doc.moveDown(0.4);
  doc.text(`Total: ${users.length}`);
  doc.moveDown(0.4);
  doc.text(`Gerado em: ${formatDateTimeBr(new Date())}`);
  doc.moveDown(1.2);

  if (!users.length) {
    doc.fontSize(12).text('Nenhum usuario encontrado para o periodo informado.');
    return;
  }

  let y = Math.max(doc.y, marginTop + 90);
  y = drawTableHeader(y);

  for (const user of users) {
    if (y + 18 > doc.page.height - marginBottom) {
      doc.addPage();
      y = marginTop;
      y = drawTableHeader(y);
    }
    y = drawRow(y, user);
  }
};

// Gera um PDF com usuarios filtrados por data_nascimento
async function generateUsersBirthReport(rawQuery) {
  const params = validateBirthRange(rawQuery);
  const users = await usersReportModel.listByBirthDateRange(pool, params);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = new PassThrough();
  doc.pipe(stream);

  writeUsersReportPdf(doc, { ...params, users });
  doc.end();

  return {
    filename: `relatorio-usuarios-${params.dataInicio}-a-${params.dataFim}.pdf`,
    stream,
    params,
    total: users.length,
  };
};

module.exports = {
  generateUsersBirthReport,
};

