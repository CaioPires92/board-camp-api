import { Router } from 'express'
import {
  deleteRental,
  getRentals,
  postRentals,
  returnRentals
} from '../controllers/rentals.controller.js'
import { rentalSchema } from '../schemas/rentals.schema.js'
import { validateSchema } from '../middlewares/validateSchema.middleware.js'

const rentalsRouter = Router()

rentalsRouter.get('/rentals', getRentals)
rentalsRouter.post('/rentals', validateSchema(rentalSchema), postRentals)
rentalsRouter.post('/rentals/:id/return', returnRentals)
rentalsRouter.delete('/rentals/:id', deleteRental)

// receitasRouter.get("/receitas/:id", getReceitaById)
// receitasRouter.post("/receitas", validateSchema(receitaSchema), createReceita)
// receitasRouter.delete("/receitas/:id", deleteReceita)
// receitasRouter.put("/receitas/:id", validateSchema(receitaSchema), editReceitaById)

export default rentalsRouter
