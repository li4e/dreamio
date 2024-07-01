import express, { urlencoded, json } from 'express'
import { RegisterRoutes } from '../__generated/routes'
import { errorHandler } from './middleware/error'

export const app = express()

app.use(urlencoded({ extended: true }))
app.use(json())

RegisterRoutes(app)

app.use(errorHandler)
