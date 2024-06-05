import { dbClient } from '@choco/db'

export class UsersService {
  async getUserIdByFirebaseId(firebaseId: string): Promise<number> {
    return await dbClient.$transaction(async (transaction) => {
      let firebaseUser = await transaction.firebaseUser.findFirst({
        where: {
          firebaseId,
        },
        select: {
          userId: true,
        },
      })

      if (!firebaseUser) {
        const user = await transaction.user.create({
          data: {},
          select: { id: true },
        })

        firebaseUser = await transaction.firebaseUser.create({
          data: {
            firebaseId,
            userId: user.id,
          },
          select: { userId: true },
        })
      }

      return firebaseUser.userId
    })
  }

  assignPurchases(
    userId: number,
    items: { type: 'inApp' | 'subscription'; id: number }[]
  ) {
    const userSubscriptions: { id: number }[] = []
    const userInApps: { id: number }[] = []

    for (const result of items) {
      if (result.type === 'subscription') {
        userSubscriptions.push({ id: result.id })
      } else {
        userInApps.push({ id: result.id })
      }
    }

    return dbClient.user.update({
      where: { id: userId },
      data: {
        ...(userSubscriptions.length > 0 && {
          subscriptions: {
            connect: userSubscriptions,
          },
        }),
        ...(userInApps.length > 0 && {
          inAppPurchases: {
            connect: userInApps,
          },
        }),
      },
      select: {
        id: true,
        subscriptions: true,
        inAppPurchases: true,
        freeCredits: true,
      },
    })
  }
}
