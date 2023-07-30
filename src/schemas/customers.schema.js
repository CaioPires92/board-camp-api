import Joi from 'joi'

export const customersSchema = Joi.object({
  name: Joi.string().required().trim(),
  cpf: Joi.string().length(11).pattern(/^\d+$/),
  phone: Joi.alternatives().try(
    Joi.string().length(10).pattern(/^\d+$/),
    Joi.string().length(11).pattern(/^\d+$/)
  ),
  birthday: Joi.date().iso().required()
})
