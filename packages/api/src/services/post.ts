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
      return PostService.transformToClient(post)
    }

    return null
  }

  public async remove(userId: number): Promise<void> {
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
  }

  public async like(userId: number): Promise<void> {
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
  }

  public async unlike(userId: number): Promise<void> {
    await dbClient.postLike.delete({
      where: {
        userId_postId: {
          postId: this.id,
          userId: userId,
        },
      },
    })
  }

  static async create(
    imageGenerationId: number,
    userId: number
  ): Promise<IPost | null> {
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
        },
        select: {
          id: true,
        },
      })
      .then((post) => post.id)

    const post = new PostService(postId)

    return post.getData(userId)
  }

  static async feedListSortedByLikes(
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
          imageGeneration: {
            generation: {
              userId: authorId,
            },
          },
        }),
      },
      orderBy: {
        likesCount: 'desc',
      },
      take: 20,
      select: postSelect,
    })

    return posts.map((post) => PostService.transformToClient(post))
  }

  static async feedListSortedByUpdatedAt(
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
          imageGeneration: {
            generation: {
              userId: authorId,
            },
          },
        }),
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
      select: postSelect,
    })

    return posts.map((post) => PostService.transformToClient(post))
  }

  static transformToClient(post: PostData): IPost {
    return {
      id: post.id,
      imageUrl: post.imageGeneration.image.publicUrl,
      prompt: post.imageGeneration.generation.promptFull,
      deleted: post.deleted || post.blocked,
      likes: post.likesCount,
      comments: post.commentsCount,
      createdAt: post.createdAt.getTime(),
      updatedAt: post.updatedAt.getTime(),
      authorId: post.imageGeneration.generation.user.id,
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
  imageGeneration: {
    generation: {
      promptFull: string
      user: {
        id: number
      }
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
  imageGeneration: {
    select: {
      image: {
        select: {
          publicUrl: true,
        },
      },
      generation: {
        select: {
          promptFull: true,
          user: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  },
})
