import Joi from "joi";


const contribuyenteSchema = Joi.object().keys({
  cuit: Joi.number().required(), 
  clave: Joi.string().required(),
  nombre: Joi.string().required(),
});

export {contribuyenteSchema};