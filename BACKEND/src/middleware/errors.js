const respuesta = require('../util/respuestas');

function errors(err, req, res, next) {
  console.error('[error]', err);

  const message = err.message || 'Error interno del servidor';
  const status = err.status || 500;

  respuesta.error(req, res, message, status);
}

module.exports = errors;