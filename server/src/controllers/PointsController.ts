import { Request, Response } from 'express'
import knex from '../database/connection'

class PointsController {
  async index(req: Request, res: Response) {
    const { items, city, uf } = req.query

    const parsedItems = String(items)
      .split(',')
      .map((item) => Number(item.trim()))

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .where('points.city', String(city))
      .where('points.uf', String(uf))
      .whereIn('point_items.item_id', parsedItems)
      .distinct()
      .select('points.*')

    return res.json(points)
  }

  async show(req: Request, res: Response) {
    const id = Number(req.params.id)
    const point = await knex('points').select('*').where('id', id).first()

    if (!point) return res.status(404).json({ message: 'Point not found' })

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title')

    return res.json({ point, items })
  }

  async create(req: Request, res: Response) {
    const trx = await knex.transaction()

    const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body

    const point = {
      image:
        'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    }

    const insertedIds = await trx('points').insert(point)
    const pointId = insertedIds[0]

    const pointItems = items.map((item_id: number) => ({
      item_id,
      point_id: pointId,
    }))

    await trx('point_items').insert(pointItems)

    await trx.commit()
    return res.json({ id: pointId, ...point })
  }
}

export default PointsController
