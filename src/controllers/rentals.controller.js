import { db } from '../database/database.connection.js'
import dayjs from 'dayjs'

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

export async function returnRentals(req, res) {
  const { id } = req.params

  try {
    // const rentalQuery = 'SELECT * FROM rentals WHERE id = $1'
    const rentalQuery =
      'SELECT rentals.*, games."pricePerDay" FROM rentals LEFT JOIN games ON rentals."gameId" = games.id WHERE rentals.id = $1'

    const rentalResult = await db.query(rentalQuery, [id])

    if (rentalResult.rows.length === 0) {
      return res.status(404).send('Aluguel não encontrado')
    }

    const rental = rentalResult.rows[0]

    if (rental.returnDate !== null) {
      return res.status(400).send('Aluguel já foi finalizado')
    }

    const returnDate = dayjs()

    const rentDate = dayjs(rental.rentDate)

    if (!returnDate.isValid() || !rentDate.isValid()) {
      return res.status(400).send('Datas inválidas')
    }

    const prevReturnDate = rentDate.add(rental.daysRented, 'day')
    const diasAtrasados = Math.max(0, returnDate.diff(prevReturnDate, 'day'))
    // const diasAtrasados = 2
    // const prevReturnDate = rentDate.add(
    //   rental.daysRented + diasAtrasados,
    //   'day'
    // )

    rental.returnDate = returnDate.format('YYYY-MM-DD')

    console.log('prevReturnDate', prevReturnDate)
    console.log('diasAtrasados', diasAtrasados)
    console.log('rental.returnDate', rental.returnDate)

    console.log('rentDate', rentDate.format('YYYY-MM-DD'))
    console.log('returnDate', returnDate.format('YYYY-MM-DD'))
    console.log('prevReturnDate', prevReturnDate.format('YYYY-MM-DD'))
    console.log('diasAtrasados', diasAtrasados)
    console.log('rental.game', rental.game)
    console.log('rental.daysRented', rental.daysRented)

    const gamePricePerDay = rental.pricePerDay

    rental.delayFee = diasAtrasados * gamePricePerDay

    console.log('rental.delayFee', rental.delayFee)

    const updateQuery = `
    UPDATE rentals
    SET "returnDate" = $1, "delayFee" = $2
    WHERE id = $3
  `
    const values = [returnDate.format('YYYY-MM-DD'), rental.delayFee, id]
    await db.query(updateQuery, values)

    res.status(200).json(rental)
  } catch (err) {
    res.status(500).send(err.message)
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
      rentDate: dayjs(rental.rentDate).format('YYYY-MM-DD'),
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

export async function deleteRental(req, res) {
  const { id } = req.params

  try {
    // Verificar se o aluguel com o ID fornecido existe
    const rentalQuery = 'SELECT * FROM rentals WHERE id = $1'
    const rentalResult = await db.query(rentalQuery, [id])

    if (rentalResult.rows.length === 0) {
      return res.status(404).send('Aluguel não encontrado')
    }

    const rental = rentalResult.rows[0]

    // Verificar se o aluguel já está finalizado
    if (rental.returnDate === null) {
      return res
        .status(400)
        .send('Aluguel ainda não foi finalizado e não ser excluído')
    }

    // Se o aluguel existe e está finalizado, podemos prosseguir com a exclusão
    const deleteQuery = 'DELETE FROM rentals WHERE id = $1'
    await db.query(deleteQuery, [id])

    res.sendStatus(200)
  } catch (err) {
    res.status(500).send(err.message)
  }
}
