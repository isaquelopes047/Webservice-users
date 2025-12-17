const reportsService = require('../services/reports.service');

function handleError(res, error) {
  if (error && error.status) {
    return res.status(error.status).json({ message: error.message, errors: error.errors });
  }
  console.error(error);
  return res.status(500).json({ message: 'Erro interno' });
}

async function downloadUsersBirthReport(req, res) {
  try {
    const report = await reportsService.generateUsersBirthReport(req.query);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);

    report.stream.on('error', (err) => {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Erro ao gerar PDF' });
      } else {
        res.end();
      }
    });

    return report.stream.pipe(res);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  downloadUsersBirthReport,
};

