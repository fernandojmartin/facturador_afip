const {today} = require("../../Application/utils");
const Joi = require('joi').extend(require('@joi/date'));

const forma_pago_opts = [
  // TODO: Handle required additional data for debito/credito
  'contado', 'debito', 'credito', 'ctacte', 'cheque', 'ticket', 'otra'
];

const schema = Joi.object().keys({
  tipo: Joi.string().equal('C').required(),
  punto_venta: Joi.number().min(1).max(9999).precision(0).required(),
  fecha: Joi.date().format('DD/MM/YYYY').min(today()).required().raw(),
  concepto: Joi.number().required(),
  desde: Joi.date().format('DD/MM/YYYY').required().raw(),
  hasta: Joi.date().format('DD/MM/YYYY').min(Joi.ref('desde')).required().raw(),
  vencimiento_pago: Joi.date().format('DD/MM/YYYY').min(Joi.ref('fecha')).required().raw(),
  tipo_receptor: Joi.number().required(),
  forma_pago: Joi.string().case('lower').valid(...forma_pago_opts).required().raw(),
  descripcion: Joi.string().required(),
  medida: Joi.string().required(),
  monto: Joi.number().min(0).precision(2).required(),
});

module.exports = {schema};
