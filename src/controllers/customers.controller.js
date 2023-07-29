import { db } from '../database/database.connection.js'

export async function postCustomers(req, res) {
  const { name, phone, cpf, birthday } = req.body

  try {
    const existingCustomer = await db.query(
      'SELECT * FROM customers WHERE cpf = $1',
      [cpf]
    )
    if (existingCustomer.rows.length > 0) {
      return res.status(409).send('O cliente já existe.')
    }

    const query =
      'INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4) RETURNING *'
    const values = [name, phone, cpf, birthday]

    const result = await db.query(query, values)

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Erro ao inserir cliente:', error)
    res.status(500).send('Erro ao inserir cliente no banco de dados.')
  }
}

export async function getCustomers(req, res) {
  try {
    const customers = await db.query(`SELECT * FROM customers;`)
    res.send(customers.rows)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export async function getCustomersById(req, res) {
  const { id } = req.params

  try {
    const query = `SELECT * FROM customers WHERE id = $1`
    const result = await db.query(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' })
    }

    res.send(result.rows[0])
  } catch (err) {
    res.status(500).send(err.message)
  }
}
