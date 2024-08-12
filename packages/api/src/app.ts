import express, { urlencoded, json } from 'express'
import { RegisterRoutes } from '../__generated/routes'
import { errorHandler } from './middleware/error'

export const app = express()
const router = express.Router()

app.use(urlencoded({ extended: true }))
app.use(json())

RegisterRoutes(router)

app.use('/api/v1', router)
app.use(errorHandler)
