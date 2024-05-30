import { dbClient } from '@choco/db'

export default {
  async getUserByFirebaseId(firebaseId: string) {
    return await dbClient.$transaction(async (transaction) => {
      let firebaseUser = await transaction.firebaseUser.findFirst({
        where: {
          firebaseId,
        },
        include: { user: true },
      })

      if (!firebaseUser) {
        const user = await transaction.user.create({ data: {} })

        firebaseUser = await transaction.firebaseUser.create({
          data: {
            firebaseId,
            userId: user.id,
          },
          include: { user: true },
        })
      }

      return firebaseUser.user
    })
  },
}
