import { dbClient } from '@choco/db'
import { IPost } from '../types/client'

export class PostService {
  constructor(private readonly id: number) {}

  public async getData(userId?: number): Promise<IPost | null> {
    const post = await dbClient.post.findUnique({
      where: {
        id: this.id,
        ...(userId && {
          imageGeneration: {
            generation: { user: { id: userId } },
          },
        }),
      },
      select: postSelect,
    })

    if (post) {
      return PostService.transformToClient(post, userId)
    }

    return null
  }

  public async remove(userId: number): Promise<void> {
    try {
      await dbClient.post.update({
        where: {
          id: this.id,
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
      throw new Error(`Unable to delete the post with id=${this.id}`)
    }
  }

  public async like(userId: number): Promise<void> {
    try {
      await dbClient.postLike.upsert({
        where: {
          userId_postId: {
            postId: this.id,
            userId: userId,
          },
        },
        create: {
          postId: this.id,
          userId: userId,
        },
        update: {
          postId: this.id,
          userId: userId,
        },
      })
    } catch (error) {
      throw new Error(`Unable to like the post with id=${this.id}`)
    }
  }

  public async unlike(userId: number): Promise<void> {
    try {
      await dbClient.postLike.delete({
        where: {
          userId_postId: {
            postId: this.id,
            userId: userId,
          },
        },
      })
    } catch (error) {
      throw new Error(`Unable to unlike the post with id=${this.id}`)
    }
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
    lastSeenLikesCount?: number,
    authorId?: number
  ): Promise<IPost[]> {
    const posts = await dbClient.post.findMany({
      where: {
        ...(lastSeenLikesCount && {
          likesCount: {
            lte: lastSeenLikesCount,
          },
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

    return posts.map((post) => PostService.transformToClient(post, authorId))
  }

  static async feedListSortedByUpdatedAt(
    limit: number,
    lastSeenUpdatedAt?: number,
    authorId?: number
  ): Promise<IPost[]> {
    const posts = await dbClient.post.findMany({
      where: {
        ...(lastSeenUpdatedAt && {
          updatedAt: {
            lte: new Date(lastSeenUpdatedAt),
          },
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

    return posts.map((post) => PostService.transformToClient(post, authorId))
  }

  static transformToClient(post: PostData, userId?: number): IPost {
    const deleted = post.deleted || post.blocked

    if (post.deleted || (post.blocked && userId !== post.userId)) {
      return {
        id: post.id,
        updatedAt: post.updatedAt.getTime(),
        deleted: true,
      }
    }

    return {
      id: post.id,
      imageUrl: post.imageGeneration.image.publicUrl,
      prompt: post.imageGeneration.generation.prompt,
      deleted,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt.getTime(),
      updatedAt: post.updatedAt.getTime(),
      authorId: post.userId,
      ...(userId === post.userId && post.blocked && { blocked: true }),
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
        },
      },
    },
  },
})
