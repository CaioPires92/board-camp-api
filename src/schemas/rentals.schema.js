import Joi from 'joi'

// export const rentalSchema = Joi.object({
//   customerId: Joi.number().integer().required(),
//   gameId: Joi.number().integer().required(),
//   rentDate: Joi.date().iso().required(),
//   daysRented: Joi.number().integer().min(1).required(),
//   returnDate: Joi.date().iso().allow(null).default(null),
//   originalPrice: Joi.number().integer().required(),
//   delayFee: Joi.number().integer().allow(null).default(null)
// })

export const rentalSchema = Joi.object({
  customerId: Joi.number().integer().required(),
  gameId: Joi.number().integer().required(),
  daysRented: Joi.number().integer().min(1).required()
})
