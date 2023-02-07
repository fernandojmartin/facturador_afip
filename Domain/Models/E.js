import { today } from "../../Application/utils.js";
import JoiImport from "joi";
import DateExtension from "@joi/date";
const Joi = JoiImport.extend(DateExtension);

const schemaFacturaE = Joi.object().keys({
  tipo: Joi.string().equal('E').required(),
  punto_venta: Joi.number().min(1).max(9999).precision(0).required(),
  fecha: Joi.date().format('DD/MM/YYYY').min(today()).required().raw(),
  concepto: Joi.number().required(),
  destino: Joi.number().required(),
  tipo_receptor: Joi.number().required(),
  id_receptor: Joi.string(),
  razon_social: Joi.string().required(),
  domicilio: Joi.string(),
  forma_pago: Joi.string().required(),
  descripcion: Joi.string().required(),
  medida: Joi.string().required(),
  monto: Joi.number().min(0).precision(2).required(),
});

export { schemaFacturaE };
