import { db } from '../database/database.connection.js'

export async function postRentals(req, res) {
  const { customerId, gameId, daysRented } = req.body

  try {
    const customerExist = await db.query(
      'SELECT * FROM customers WHERE id = $1',
      [customerId]
    )

    if (customerExist.rows.length === 0) {
      return res.status(400).send('Cliente não encontrado.')
    }

    const gameExist = await db.query('SELECT * FROM games WHERE id = $1', [
      gameId
    ])

    if (gameExist.rows.length === 0) {
      return res.status(400).send('Jogo não encontrado.')
    }

    const rentalsInProgress = await db.query(
      'SELECT COUNT(*) FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL',
      [gameId]
    )

    const availableStock =
      gameExist.rows[0].stockTotal - rentalsInProgress.rows[0].count

    if (availableStock <= 0) {
      return res.status(400).send('Não há jogos disponíveis para alugar.')
    }

    // Validar se daysRented é um número inteiro maior que zero
    if (!Number.isInteger(daysRented) || daysRented <= 0) {
      return res
        .status(400)
        .send(
          'O número de dias alugados deve ser um valor inteiro maior que zero.'
        )
    }

    const gamePricePerDay = gameExist.rows[0].pricePerDay
    const originalPrice = daysRented * gamePricePerDay

    // Obter a data atual para o campo rentDate
    const rentDate = new Date().toISOString()

    const insertQuery =
      'INSERT INTO rentals ("customerId", "gameId", "daysRented", "originalPrice", "rentDate") VALUES ($1, $2, $3, $4, $5) RETURNING *'
    const values = [customerId, gameId, daysRented, originalPrice, rentDate]

    const result = await db.query(insertQuery, values)

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Erro ao inserir aluguel:', error)
    res.status(500).send('Erro ao inserir aluguel no banco de dados.')
  }
}

export async function getRentals(req, res) {
  try {
    const query = `
      SELECT
        r.id,
        r."customerId",
        r."gameId",
        r."rentDate",
        r."daysRented",
        r."returnDate",
        r."originalPrice",
        r."delayFee",
        c.id AS "customer.id",
        c.name AS "customer.name",
        g.id AS "game.id",
        g.name AS "game.name"
      FROM
        rentals r
      JOIN
        customers c ON r."customerId" = c.id
      JOIN
        games g ON r."gameId" = g.id;
    `

    const result = await db.query(query)
    const rentals = result.rows.map(rental => ({
      id: rental.id,
      customerId: rental.customerId,
      gameId: rental.gameId,
      rentDate: rental.rentDate,
      daysRented: rental.daysRented,
      returnDate: rental.returnDate,
      originalPrice: rental.originalPrice,
      delayFee: rental.delayFee,
      customer: {
        id: rental['customer.id'],
        name: rental['customer.name']
      },
      game: {
        id: rental['game.id'],
        name: rental['game.name']
      }
    }))

    res.json(rentals)
  } catch (error) {
    console.error('Erro ao obter aluguéis:', error)
    res.status(500).send('Erro ao obter aluguéis do banco de dados.')
  }
}
