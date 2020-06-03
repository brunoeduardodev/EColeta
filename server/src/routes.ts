import express from 'express'
import path from 'path'

import PointsController from './controllers/PointsController'
import ItemsController from './controllers/ItemsController'

const pointsController = new PointsController()
const itemsController = new ItemsController()

const routes = express.Router()

routes.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))
routes.get('/items/', itemsController.index)
routes.get('/points/:id', pointsController.show)
routes.get('/points/', pointsController.index)
routes.post('/points/', pointsController.create)

export default routes
