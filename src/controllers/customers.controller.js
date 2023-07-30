import { db } from '../database/database.connection.js'
import dayjs from 'dayjs'

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

    const formattedCustomers = customers.rows.map(customer => ({
      ...customer,
      birthday: dayjs(customer.birthday).format('YYYY-MM-DD')
    }))
    res.send(formattedCustomers)
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

export async function editCustomerById(req, res) {
  const { id } = req.params
  const { name, phone, cpf, birthday } = req.body

  try {
    const existingCustomer = await db.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    )

    if (existingCustomer.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' })
    }

    if (existingCustomer.rows[0].cpf !== cpf) {
      const cpfExists = await db.query(
        'SELECT * FROM customers WHERE cpf = $1',
        [cpf]
      )
      if (cpfExists.rows.length > 0) {
        return res.status(409).send('O CPF já está associado a outro cliente.')
      }
    }

    const updateQuery =
      'UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5 RETURNING *'
    const values = [name, phone, cpf, birthday, id]

    const result = await db.query(updateQuery, values)

    res.status(200).json(result.rows[0])
  } catch (err) {
    res.status(500).send(err.message)
  }
}
