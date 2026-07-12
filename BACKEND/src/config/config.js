const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config(); // Intenta también el local por si acaso

// Validación de variables de entorno requeridas
const required = ['ORACLE_USER', 'ORACLE_PASSWORD', 'ORACLE_CONNECTION_STRING'];
const missing = required.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missing.join(', '));
  console.error('   Copia .env.example a .env y configúralo');
  process.exit(1);
}

module.exports = {
  app: {
    port: process.env.PORT || 3000,
  },
  oracle: {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECTION_STRING,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'biblioguest-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  }
};