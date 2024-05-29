import express from 'express' // Express
import users from './users'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    success: true,
  })
})

router.use('/users', users)

export default router
