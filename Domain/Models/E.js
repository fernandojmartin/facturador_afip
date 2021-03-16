const Joi = require('joi').extend(require('@joi/date'));

const schema = Joi.object().keys({
  tipo: Joi.string().equal('E').required(),
  punto_venta: Joi.number().min(1).max(9999).precision(0).required(),
  fecha: Joi.date().format('DD/MM/YYYY').min('now').required().raw(),
  concepto: Joi.number().required(),
  destino: Joi.number().required(),
  tipo_receptor: Joi.number().required(),
  id_receptor: Joi.string().required(),
  razon_social: Joi.string().required(),
  domicilio: Joi.string(),
  forma_pago: Joi.string().required(),
  descripcion: Joi.string().required(),
  medida: Joi.string().required(),
  monto: Joi.number().min(0).precision(2).required(),
});

module.exports = {schema};
