const Joi = require('joi');

const schema = Joi.object().keys({
  cuit: Joi.number().required(), 
  clave: Joi.string().required(),
  nombre: Joi.string().required(),
});

module.exports = {schema};
