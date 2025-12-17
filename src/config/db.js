const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'roundhouse.proxy.rlwy.net',
  port: Number(process.env.DB_PORT) || 51673,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '15c-eCde4hhD4h4FFCg41FHbBChh5b-E',
  database: process.env.DB_NAME || 'railway',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

// Loga uma vez no start para confirmar conectividade (nao roda em testes)
if (process.env.NODE_ENV !== 'test' && process.env.DB_PING_ON_STARTUP !== 'false') {
  (async () => {
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      console.log('Conexao com banco estabelecida');
    } catch (error) {
      console.error('Falha ao conectar no banco:', error.message);
    }
  })();
}

module.exports = pool;
