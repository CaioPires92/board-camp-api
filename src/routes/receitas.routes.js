import { Router } from "express"
import { createReceita, deleteReceita, editReceitaById, getReceitaById, getReceitas } from "../controllers/receitas.controller.js"
import { validateSchema } from "../middlewares/validateSchema.middleware.js"
import { receitaSchema } from "../schemas/receitas.schema.js"

const receitasRouter = Router()

receitasRouter.get("/receitas", getReceitas)
receitasRouter.get("/receitas/:id", getReceitaById)
receitasRouter.post("/receitas", validateSchema(receitaSchema), createReceita)
receitasRouter.delete("/receitas/:id", deleteReceita)
receitasRouter.put("/receitas/:id", validateSchema(receitaSchema), editReceitaById)

export default receitasRouter