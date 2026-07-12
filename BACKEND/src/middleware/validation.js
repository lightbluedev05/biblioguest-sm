const respuesta = require('../util/respuestas');

const validation = {
  
  validatePagination: (req, res, next) => {
    let { page=1, limit=10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if(isNaN(page) || page < 1){
      return respuesta.error(res, res, 'El parámetro "page" debe ser un número entero positivo.', 400);
    }

    if(isNaN(limit) || limit < 1){
      return respuesta.error(res, res, 'El parámetro "limit" debe ser un número entero positivo.', 400);
    }

    req.query.page = page;
    req.query.limit = limit;

    next();
  }

}

module.exports = validation;