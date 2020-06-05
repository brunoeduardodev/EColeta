import express from 'express'
import path from 'path'
import multer from 'multer'
import multerConfig from './config/multer'
import { celebrate, Joi } from 'celebrate'
import PointsController from './controllers/PointsController'
import ItemsController from './controllers/ItemsController'

const pointsController = new PointsController()
const itemsController = new ItemsController()

const upload = multer(multerConfig)

const routes = express.Router()

routes.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))
routes.get('/items/', itemsController.index)
routes.get('/points/:id', pointsController.show)
routes.get('/points/', pointsController.index)
routes.post(
  '/points/',
  upload.single('image'),
  celebrate(
    {
      body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        whatsapp: Joi.number().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        city: Joi.string().required(),
        uf: Joi.string().max(2).required(),
        items: Joi.string()
          .regex(/^(\d,)*\d$/)
          .required(),
      }),
    },
    { abortEarly: false }
  ),
  pointsController.create
)

export default routes
/**
 * {
	
    "name": "Mercado Imperatriz",
    "email": "contato@imperatriz.com.br",
    "whatsapp": "84484845421",
    "latitude": -46.818151,
    "longitude": -35.1516156,
    "city": "Caicó",
    "uf": "RN",
    "items": [
			1,
			2,
			6
		]
}
 */
