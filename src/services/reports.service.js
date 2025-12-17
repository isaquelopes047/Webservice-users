const { PassThrough } = require('stream');
const PDFDocument = require('pdfkit');
const pool = require('../config/db');
const usersReportModel = require('../models/usersReport.model');

function fitColumnsToWidth(columns, contentWidth) {
  const total = columns.reduce((sum, col) => sum + col.width, 0);
  if (total <= contentWidth) return columns;

  const scale = contentWidth / total;
  const scaled = columns.map((col) => ({
    ...col,
    width: Math.max(45, Math.floor(col.width * scale)),
  }));

  const newTotal = scaled.reduce((sum, col) => sum + col.width, 0);
  const diff = contentWidth - newTotal;
  if (diff !== 0) {
    scaled[scaled.length - 1].width += diff;
  }

  return scaled;
}

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

  const columns = fitColumnsToWidth([
    { header: 'ID', width: 35, align: 'right', key: 'id' },
    { header: 'Nome', width: 70, align: 'left', key: 'nome' },
    { header: 'Sobrenome', width: 80, align: 'left', key: 'sobrenome' },
    { header: 'Email', width: 150, align: 'left', key: 'email' },
    { header: 'Nascimento', width: 70, align: 'left', key: 'data_nascimento' },
    { header: 'Celular', width: 90, align: 'left', key: 'celular' },
  ], contentWidth);

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

  const clipText = (text, width) => {
    const str = String(text ?? '');
    if (!str) return '-';
    if (doc.widthOfString(str) <= width) return str;
    const suffix = '...';
    const target = Math.max(0, width - doc.widthOfString(suffix));
    let low = 0;
    let high = str.length;

    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      const candidate = str.slice(0, mid);
      if (doc.widthOfString(candidate) <= target) low = mid;
      else high = mid - 1;
    }

    return `${str.slice(0, low)}${suffix}`;
  };

  const formatarDataTimeBr = (date) => {
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

      const width = Math.max(10, col.width - 12);
      const clipped = clipText(String(value), width);

      doc.text(clipped, x + 6, y + 5, {
        width,
        align: col.align,
        lineBreak: false,
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
  doc.text(`Gerado em: ${formatarDataTimeBr(new Date())}`);
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

function writeUsersIntegrationReportPdf(doc, { params, summary, rows }) {
  const marginLeft = doc.page.margins.left;
  const marginRight = doc.page.margins.right;
  const marginTop = doc.page.margins.top;
  const marginBottom = doc.page.margins.bottom;
  const contentWidth = doc.page.width - marginLeft - marginRight;

  const columns = fitColumnsToWidth([
    { header: 'Email', width: 220, align: 'left', key: 'email' },
    { header: 'Nome', width: 95, align: 'left', key: 'nome' },
    { header: 'Sobrenome', width: 115, align: 'left', key: 'sobrenome' },
    { header: 'Nascimento', width: 90, align: 'left', key: 'data_nascimento' },
    { header: 'Status', width: 70, align: 'left', key: 'status' },
    { header: 'Erro', width: 140, align: 'left', key: 'erro' },
  ], contentWidth);

  const totalColumnsWidth = columns.reduce((sum, col) => sum + col.width, 0);

  const formatDate = (value) => {
    if (!value) return '-';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === 'string') return value.slice(0, 10);
    return String(value);
  };

  const clipText = (text, width) => {
    const str = String(text ?? '');

    if (!str) return '-';
    if (doc.widthOfString(str) <= width) return str;

    const suffix = '...';
    const target = Math.max(0, width - doc.widthOfString(suffix));

    let low = 0;
    let high = str.length;

    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      const candidate = str.slice(0, mid);

      if (doc.widthOfString(candidate) <= target) low = mid;
      
      else high = mid - 1;
    }

    return `${str.slice(0, low)}${suffix}`;
  };

  const formatarDataTimeBr = (date) => {
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

  const drawRow = (y, row) => {
    const xStart = marginLeft;

    const cellPaddingX = 6;
    const cellPaddingY = 5;
    const textWidthFor = (col) => Math.max(10, col.width - cellPaddingX * 2);

    doc.font('Helvetica').fontSize(9);
    const rowHeight = 18;

    doc.lineWidth(1).rect(xStart, y, totalColumnsWidth, rowHeight).stroke();

    let x = xStart;
    for (const col of columns) {
      doc.rect(x, y, col.width, rowHeight).stroke();

      let value = row[col.key];
      if (col.key === 'data_nascimento') value = formatDate(value);
      if (value === null || value === undefined || value === '') value = '-';

      const clipped = clipText(String(value), textWidthFor(col));

      doc.text(clipped, x + cellPaddingX, y + cellPaddingY, {
        width: textWidthFor(col),
        align: col.align,
        lineBreak: false,
      });
      x += col.width;
    }

    return y + rowHeight;
  };

  doc.font('Helvetica-Bold').fontSize(18).text('Relatorio de Integracao de Usuarios', { align: 'center' });
  doc.moveDown(0.5);

  doc.font('Helvetica').fontSize(11).text(`Idade minima: ${params.idadeMin} | Max registros: ${params.maxRegistros}`);
  doc.moveDown(0.4);
  doc.text(
    `Tentados: ${summary.attempted} | Sucesso: ${summary.success} | Erros: ${summary.errors} | Inseridos: ${summary.inserted} | Atualizados: ${summary.updated}`
  );
  doc.moveDown(0.4);
  doc.text(`Gerado em: ${formatarDataTimeBr(new Date())}`);
  doc.moveDown(1.2);

  let y = Math.max(doc.y, marginTop + 90);
  y = drawTableHeader(y);

  for (const row of rows) {
    if (y + 18 > doc.page.height - marginBottom) {
      doc.addPage();
      y = marginTop;
      y = drawTableHeader(y);
    }
    y = drawRow(y, row);
  }
};

async function generateUsersIntegrationReport(integrationResult) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
  const stream = new PassThrough();
  doc.pipe(stream);

  writeUsersIntegrationReportPdf(doc, integrationResult);
  doc.end();

  const idadeMin = integrationResult?.params?.idadeMin ?? 0;
  const maxRegistros = integrationResult?.params?.maxRegistros ?? 0;

  return {
    filename: `relatorio-integracao-usuarios-${idadeMin}-${maxRegistros}.pdf`,
    stream,
  };
};

module.exports = {
  generateUsersBirthReport,
  generateUsersIntegrationReport,
};
