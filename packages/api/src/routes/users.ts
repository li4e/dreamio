import { userController } from '../controllers/user'
import express from 'express'

const router = express.Router()

router.get('/:userId', userController.getUser)

export default router
