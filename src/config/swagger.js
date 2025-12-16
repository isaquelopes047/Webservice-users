const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Webservice API',
    version: '1.0.0',
    description: 'API Node.js 18 com Express, camadas e documentação Swagger disponível em /docs.',
  },
  servers: [
    {
      url: 'http://localhost:{port}',
      description: 'Servidor local'
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, '../routes/*.js')],
};

module.exports = swaggerJSDoc(options);
