import { dbClient } from '@choco/db'
import { IPost } from '../types/client'

export class PostService {
  constructor(private readonly postId: number) {}

  public async getData(userId?: number): Promise<IPost | null> {
    const post = await dbClient.post.findUnique({
      where: {
        blocked: false,
        deleted: false,
        id: this.postId,
        ...(userId && {
          imageGeneration: {
            generation: { user: { id: userId } },
          },
        }),
      },
      select: postSelect,
    })

    if (post) {
      return PostService.transformToClient(post)
    }

    return null
  }

  public async delete(userId: number): Promise<void> {
    try {
      await dbClient.post.update({
        where: {
          id: this.postId,
          imageGeneration: {
            generation: {
              userId,
            },
          },
        },
        data: {
          deleted: true,
        },
      })
    } catch (error) {
      throw new Error(`Unable to delete the post with id=${this.postId}`)
    }
  }

  public async like(userId: number): Promise<void> {
    try {
      await dbClient.postLike.upsert({
        where: {
          userId_postId: {
            postId: this.postId,
            userId: userId,
          },
        },
        create: {
          postId: this.postId,
          userId: userId,
        },
        update: {
          postId: this.postId,
          userId: userId,
        },
      })
    } catch (error) {
      throw new Error(`Unable to like the post with id=${this.postId}`)
    }
  }

  public async unlike(userId: number): Promise<void> {
    try {
      await dbClient.postLike.delete({
        where: {
          userId_postId: {
            postId: this.postId,
            userId: userId,
          },
        },
      })
    } catch (error) {
      throw new Error(`Unable to unlike the post with id=${this.postId}`)
    }
  }

  public async report(
    userId: number,
    reason: string
  ): Promise<{ reportId: number }> {
    const data = {
      postId: this.postId,
      userId,
    }

    const report = await dbClient.postClaim.upsert({
      where: {
        postId_userId: data,
      },
      create: {
        ...data,
        reason,
      },
      update: data,
      select: {
        id: true,
      },
    })

    return { reportId: report.id }
  }

  static async create(
    imageGenerationId: number,
    userId: number
  ): Promise<IPost | null> {
    try {
      const imageGeneration = await dbClient.imageGeneration.findFirstOrThrow({
        where: { imageId: imageGenerationId },
        select: {
          generation: {
            select: {
              userId: true,
            },
          },
        },
      })

      if (imageGeneration.generation.userId !== userId) {
        return null
      }

      const postId = await dbClient.post
        .create({
          data: {
            imageGenerationId,
            userId,
          },
          select: {
            id: true,
          },
        })
        .then((post) => post.id)

      const post = new PostService(postId)

      return post.getData(userId)
    } catch (error) {
      throw new Error(
        `Error during the post creation with imageGenerationId=${imageGenerationId}, for userId=${userId}`
      )
    }
  }

  static async feedListSortedByLikes(
    limit: number,
    lastSeen?: {
      likesCount: number
      postId: number
    },
    authorId?: number
  ): Promise<IPost[]> {
    const posts = await dbClient.post.findMany({
      where: {
        deleted: false,
        blocked: false,
        ...(lastSeen && {
          OR: [
            {
              likesCount: {
                lt: lastSeen.likesCount,
              },
            },
            {
              likesCount: lastSeen.likesCount,
              id: {
                lt: lastSeen.postId,
              },
            },
          ],
        }),
        ...(authorId && {
          userId: authorId,
        }),
      },
      orderBy: {
        likesCount: 'desc',
      },
      take: limit,
      select: postSelect,
    })

    return posts.map((post) => PostService.transformToClient(post))
  }

  static async feedListSortedByUpdatedAt(
    limit: number,
    lastSeen?: {
      updatedAt: Date
      postId: number
    },
    authorId?: number
  ): Promise<IPost[]> {
    const posts = await dbClient.post.findMany({
      where: {
        deleted: false,
        blocked: false,
        ...(lastSeen && {
          OR: [
            {
              updatedAt: {
                lt: lastSeen.updatedAt,
              },
            },
            {
              updatedAt: lastSeen.updatedAt,
              id: {
                lt: lastSeen.postId,
              },
            },
          ],
        }),
        ...(authorId && {
          userId: authorId,
        }),
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      select: postSelect,
    })

    return posts.map((post) => PostService.transformToClient(post))
  }

  static transformToClient(post: PostData): IPost {
    return {
      id: post.id,
      imageUrl: post.imageGeneration.image.publicUrl,
      prompt: post.imageGeneration.generation.prompt,
      style: post.imageGeneration.generation.style,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: post.userId,
    }
  }
}

interface PostData {
  id: number
  createdAt: Date
  updatedAt: Date
  likesCount: number
  commentsCount: number
  deleted: boolean
  blocked: boolean
  userId: number
  imageGeneration: {
    generation: {
      prompt: string
      style: string | null
    }
    image: {
      publicUrl: string
    }
  }
}

const postSelect = Object.freeze({
  id: true,
  deleted: true,
  blocked: true,
  likesCount: true,
  commentsCount: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  imageGeneration: {
    select: {
      image: {
        select: {
          publicUrl: true,
        },
      },
      generation: {
        select: {
          prompt: true,
          style: true,
        },
      },
    },
  },
})
