import { prisma } from '../config/prisma'

export default {
  async getUserByFirebaseId(firebaseId: string) {
    return await prisma.$transaction(async (transaction) => {
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
