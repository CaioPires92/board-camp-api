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

// export async function createReceita(req, res) {
//   res.send('createReceita')
// }

// export async function deleteReceita(req, res) {
//   res.send('deleteReceita')
// }

// export async function editReceitaById(req, res) {
//   res.send('editReceitaById')
// }
