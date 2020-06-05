import express from 'express'
import routes from './routes'
import cors from 'cors'
import { errors } from 'celebrate'

const app = express()

app.use(express.json())
app.use(cors())
app.use(routes)
app.use(errors())

console.log('Servidor iniciado')

app.listen(3333)
