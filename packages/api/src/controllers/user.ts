import { Request, Response } from 'express'
import userService from '../services/users'

export const userController = {
  getUser: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId
      console.log(userId)

      const user = await userService.getUserByFirebaseId(userId)
      res.json(user)
    } catch (err) {
      res.status(500).send(err)
    }
  },
}
