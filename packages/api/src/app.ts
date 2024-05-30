import express, { urlencoded, json } from 'express'
import { RegisterRoutes } from '../generated/routes'

export const app = express()

app.use(urlencoded({ extended: true }))
app.use(json())

RegisterRoutes(app)
