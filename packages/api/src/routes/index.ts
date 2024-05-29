import express from 'express' // Express
import users from './users'

const router = express.Router()

router.use('/users', users)

export default router
