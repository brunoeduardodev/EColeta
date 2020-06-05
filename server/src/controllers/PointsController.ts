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

    const serializedPoints = points.map((point) => {
      return {
        ...point,
        image_url: `http://192.168.1.15:3333/uploads/${point.image}`,
      }
    })
    return res.json(serializedPoints)
  }

  async show(req: Request, res: Response) {
    const id = Number(req.params.id)
    const point = await knex('points').select('*').where('id', id).first()

    if (!point) return res.status(404).json({ message: 'Point not found' })

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title')

    const serializedPoint = {
      ...point,
      image_url: `http://192.168.1.15:3333/uploads/${point.image}`,
    }

    return res.json({ point: serializedPoint, items })
  }

  async create(req: Request, res: Response) {
    const trx = await knex.transaction()

    const image_url = req.file.filename

    const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body

    const point = {
      image: image_url,
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

    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => ({
        item_id,
        point_id: pointId,
      }))

    await trx('point_items').insert(pointItems)

    await trx.commit()
    return res.json({ id: pointId, image_url: `http://192.168.1.15:3333/uploads/${image_url}`, ...point })
  }
}

export default PointsController
