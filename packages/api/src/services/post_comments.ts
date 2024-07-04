import { CreatePostCommentDto, dbClient } from '@choco/db'
import { IPostComment } from '../types/client'

export class PostCommentsService {
  constructor(private readonly commentId: bigint) {}

  public async report(
    userId: number,
    reason: string
  ): Promise<{ reportId: number }> {
    const data = {
      commentId: BigInt(this.commentId),
      userId,
    }
    const report = await dbClient.commentClaim.upsert({
      where: {
        commentId_userId: data,
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
    return {
      reportId: report.id,
    }
  }

  public async delete(requestUserId: number) {
    await dbClient.postComment.update({
      where: {
        id: this.commentId,
        userId: requestUserId,
      },
      data: {
        deleted: true,
      },
    })
  }

  public async like(requestUserId: number): Promise<void> {
    await dbClient.postCommentLike.upsert({
      where: {
        userId_commentId: {
          userId: requestUserId,
          commentId: this.commentId,
        },
      },
      create: {
        userId: requestUserId,
        commentId: this.commentId,
      },
      update: {},
    })
  }

  public async unlike(requestUserId: number): Promise<void> {
    await dbClient.postCommentLike.delete({
      where: {
        userId_commentId: {
          userId: requestUserId,
          commentId: this.commentId,
        },
      },
    })
  }

  static async create(
    data: CreatePostCommentDto,
    postId: number,
    userId: number
  ): Promise<IPostComment> {
    const content = data.content

    return await dbClient.postComment
      .create({
        data: {
          content: content,
          postId: postId,
          userId: userId,
        },
        select: {
          id: true,
          createdAt: true,
          likesCount: true,
        },
      })
      .then((data) => ({
        ...data,
        id: data.id.toString(),
        content: content,
        userId,
        postId,
        updatedAt: data.createdAt,
      }))
  }

  static async getCommentsByPostId(
    postId: number,
    limit: number,
    sortOrder: 'asc' | 'desc',
    lastSeen?: {
      updatedAt: Date
      commentId: string
    }
  ): Promise<{ items: IPostComment[]; deletedItems: string[] }> {
    const orderCondition = sortOrder === 'asc' ? 'gt' : 'lt'

    const allComments = await dbClient.postComment.findMany({
      where: {
        postId,
        ...(lastSeen && {
          OR: [
            {
              updatedAt: {
                [orderCondition]: lastSeen.updatedAt,
              },
            },
            {
              updatedAt: {
                [orderCondition]: lastSeen.updatedAt,
              },
              id: {
                [orderCondition]: BigInt(lastSeen.commentId),
              },
            },
          ],
        }),
      },
      orderBy: {
        createdAt: sortOrder,
      },
      take: limit,
      select: {
        id: true,
        content: true,
        postId: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        likesCount: true,
        blocked: true,
        deleted: true,
      },
    })

    const items: IPostComment[] = []
    const deletedItems: string[] = []

    for (const comment of allComments) {
      const { blocked, deleted, id, ...restCommentProps } = comment
      if (deleted || blocked) {
        deletedItems.push(id.toString())
      } else {
        items.push({
          ...restCommentProps,
          id: id.toString(),
        })
      }
    }

    return {
      items,
      deletedItems,
    }
  }
}
