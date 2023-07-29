import { Router } from 'express'
import { validateSchema } from '../middlewares/validateSchema.middleware.js'
import { getCustomers, getCustomersById, postCustomers } from '../controllers/customers.controller.js'
import { customersSchema } from '../schemas/customers.schema.js'

const customersRouter = Router()

customersRouter.get('/customers', getCustomers)
customersRouter.post('/customers', validateSchema(customersSchema), postCustomers)
customersRouter.get("/customers/:id", getCustomersById)
// receitasRouter.post("/receitas", validateSchema(receitaSchema), createReceita)
// receitasRouter.delete("/receitas/:id", deleteReceita)
// receitasRouter.put("/receitas/:id", validateSchema(receitaSchema), editReceitaById)

export default customersRouter