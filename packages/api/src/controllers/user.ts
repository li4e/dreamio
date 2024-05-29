import { Request, Response } from 'express'

export const userController = {
  getUser: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId
      console.log(userId)

      const user = null
      res.json(user)
    } catch (err) {
      res.status(500).send(err)
    }
  },
}
