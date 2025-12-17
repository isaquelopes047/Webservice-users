const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use('/public', express.static(path.join(__dirname, '../public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCssUrl: '/public/swagger-custom.css',
    customfavIcon: '/public/unnamed.png',
    customSiteTitle: 'Webservice API - Docs',
  })
);
app.use('/api', routes);

// Fallback for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

module.exports = app;
