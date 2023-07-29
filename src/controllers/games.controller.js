import { db } from '../database/database.connection.js'

export async function getGames(req, res) {
  try {
    const games = await db.query(`SELECT * FROM games;`)
    res.send(games.rows)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

// export async function getReceitaById(req, res) {
//   const { id } = req.params

//   try {
//     const receita = await db.query(`SELECT * FROM receitas WHERE id=$1;`, [id])
//     res.send(receita.rows[0])
//   } catch (err) {
//     res.status(500).send(err.message)
//   }
// }

export async function postGames(req, res) {
  const { name, image, stockTotal, pricePerDay } = req.body

  try {
    const existingGame = await db.query('SELECT * FROM games WHERE name = $1', [
      name
    ])
    if (existingGame.rows.length > 0) {
      return res
        .status(409)
        .send('O nome do jogo já existe. Escolha um nome diferente.')
    }

    if (!name || name.trim() === '') {
      return res
        .status(400)
        .send("O campo 'name' deve estar presente e não pode estar vazio.")
    }

    if (stockTotal <= 0 || pricePerDay <= 0) {
      return res
        .status(400)
        .send("Os campos 'stockTotal' e 'pricePerDay' devem ser maiores que 0.")
    }

    const query =
      'INSERT INTO games (name, image, "stockTotal", "pricePerDay") VALUES ($1, $2, $3, $4) RETURNING *'
    const values = [name, image, stockTotal, pricePerDay]

    const result = await db.query(query, values)

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Erro ao inserir game:', error)
    res.status(500).send('Erro ao inserir game no banco de dados.')
  }
}

// export async function deleteReceita(req, res) {
//   res.send('deleteReceita')
// }

// export async function editReceitaById(req, res) {
//   res.send('editReceitaById')
// }
