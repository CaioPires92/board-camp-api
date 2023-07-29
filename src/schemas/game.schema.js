import Joi from 'joi'

export const gameSchema = Joi.object({
  name: Joi.string().required().trim().min(1),
  image: Joi.string().required(),
  stockTotal: Joi.number().integer().positive().required(),
  pricePerDay: Joi.number().positive().required()
})
