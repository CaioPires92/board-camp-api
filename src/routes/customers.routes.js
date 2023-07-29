import { Router } from 'express'
import { validateSchema } from '../middlewares/validateSchema.middleware.js'
import { editCustomerById, getCustomers, getCustomersById, postCustomers } from '../controllers/customers.controller.js'
import { customersSchema } from '../schemas/customers.schema.js'

const customersRouter = Router()

customersRouter.get('/customers', getCustomers)
customersRouter.post('/customers', validateSchema(customersSchema), postCustomers)
customersRouter.get("/customers/:id", getCustomersById)
customersRouter.put("/customers/:id", validateSchema(customersSchema), editCustomerById)
// receitasRouter.post("/receitas", validateSchema(receitaSchema), createReceita)
// receitasRouter.delete("/receitas/:id", deleteReceita)

export default customersRouter