import { dbClient, Prisma } from '@choco/db'
import { PopulatedUser } from '../types/user'

export class UserService {
  constructor(private userId: number) {}

  public async getPopulated(): Promise<PopulatedUser> {
    const user = await dbClient.user.findUnique({
      where: {
        id: this.userId,
      },
      select: {
        id: true,
        freeCredits: true,
        inAppPurchases: true,
        subscriptions: true,
      },
    })

    if (user === null) {
      throw new Error('User with the provided id is not defined')
    }

    return user
  }

  static async getUserIdByFirebaseId(firebaseId: string): Promise<number> {
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
    items: { type: 'inApp' | 'subscription'; id: number }[]
  ): Promise<PopulatedUser> {
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
      where: { id: this.userId },
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
        freeCredits: true,
        subscriptions: true,
        inAppPurchases: true,
      },
    })
  }

  async consumeFreeCredits(): Promise<number | null> {
    try {
      const data = await dbClient.user.update({
        where: {
          id: this.userId,
          freeCredits: {
            gt: 0,
          },
        },
        data: {
          freeCredits: {
            decrement: 1,
          },
        },
        select: {
          freeCredits: true,
        },
      })

      return data.freeCredits
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // P2025 error code indicates that the record does not exist
        return null
      }
      throw error
    }
  }

  incrementFreeCredits(): Promise<number> {
    return dbClient.user
      .update({
        where: {
          id: this.userId,
        },
        data: {
          freeCredits: {
            increment: 1,
          },
        },
        select: {
          freeCredits: true,
        },
      })
      .then((data) => data.freeCredits)
  }
}
