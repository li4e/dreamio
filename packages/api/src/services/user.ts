import { dbClient, Prisma } from '@choco/db'
import { PopulatedUser } from '../types/user'
import { UserSettings } from '../config/settings'
import { generateUsername } from 'unique-username-generator'
import { FileInfo } from '../types/integrations/cloudStorage'

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
        userName: true,
        avatarPublicUrl: true,
        avatarFilePath: true,
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
      let user = await transaction.user.findFirst({
        where: {
          firebaseId,
        },
        select: {
          id: true,
        },
      })

      if (!user) {
        user = await transaction.user.create({
          data: {
            firebaseId: firebaseId,
            freeCredits: UserSettings.initialfreeCredits,
            userName: generateUsername('_', 3, 20),
          },
          select: { id: true },
        })
      }

      return user.id
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
        userName: true,
        freeCredits: true,
        avatarPublicUrl: true,
        avatarFilePath: true,
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

  async changeUserName(userName: string): Promise<void> {
    await dbClient.user.update({
      where: {
        id: this.userId,
      },
      data: {
        userName,
      },
    })
  }

  async updateAvatar(avatarInfo: FileInfo) {
    await dbClient.user.update({
      where: {
        id: this.userId,
      },
      data: {
        avatarFilePath: avatarInfo.filePath,
        avatarPublicUrl: avatarInfo.publicUrl,
      },
    })
  }
}
