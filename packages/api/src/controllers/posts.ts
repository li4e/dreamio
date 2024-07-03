import {
  Controller,
  Post,
  Delete,
  Get,
  Path,
  Body,
  Query,
  Route,
  Request,
  Security,
} from 'tsoa'
import { AuthenticatedRequest } from '../types/express'
import { IPost, IPostComment } from '../types/client'
import { ServerError } from '../shared/ServerError'
import { PostService } from '../services/post'
import { PostCommentsService } from '../services/post_comments'
import { CreatePostClaimDto, CreatePostCommentDto } from '@choco/db'

@Route('posts')
export class PostsController extends Controller {
  @Get()
  public async getPosts(
    @Query('sortBy') sortBy: 'likes' | 'updatedAt',
    @Query('limit') queryLimit?: number,
    @Query('lastSeenLikesCount') lsLikesCount?: number,
    @Query('lastSeenUpdatedAt') lsUpdatedAt?: Date,
    @Query('lastSeenPostId') lsPostId?: number,
    @Query('authorId') authorId?: number
  ): Promise<{ posts: IPost[] }> {
    let limit = queryLimit || 20
    if (limit > 20) {
      limit = 20
    }

    if (sortBy === 'likes') {
      return {
        posts: await PostService.feedListSortedByLikes(
          limit,
          lsLikesCount !== undefined && lsPostId !== undefined
            ? {
                likesCount: lsLikesCount,
                postId: lsPostId,
              }
            : undefined,
          authorId
        ),
      }
    } else {
      return {
        posts: await PostService.feedListSortedByUpdatedAt(
          limit,
          lsUpdatedAt !== undefined && lsPostId !== undefined
            ? {
                updatedAt: lsUpdatedAt,
                postId: lsPostId,
              }
            : undefined,
          authorId
        ),
      }
    }
  }

  @Security('firebase')
  @Post()
  public async createPost(
    @Body()
    body: {
      imageGenerationId: number
    },
    @Request() request: AuthenticatedRequest
  ): Promise<{
    post: IPost
  }> {
    const { userId } = request
    const post = await PostService.create(body.imageGenerationId, userId)
    if (!post) {
      throw new ServerError(
        'Provided imageGenerationId belongs to another user',
        400
      )
    }
    this.setStatus(201)
    return { post: post }
  }

  @Get('{postId}')
  public async getPost(
    @Path('postId') postId: number
  ): Promise<{ post: IPost }> {
    const post = await new PostService(postId).getData()

    if (!post) {
      throw new ServerError(
        `Post with the provided id=${postId} was not founded`,
        404
      )
    }

    return { post: post }
  }

  @Security('firebase')
  @Delete('{postId}')
  public async deletePost(
    @Path('postId') postId: number,
    @Request() request: AuthenticatedRequest
  ): Promise<{ success: boolean }> {
    const { userId } = request
    await new PostService(postId).delete(userId)
    return { success: true }
  }

  @Security('firebase')
  @Post('{postId}/reports')
  public async createPostReport(
    @Body() body: CreatePostClaimDto,
    @Path('postId') postId: number,
    @Request() request: AuthenticatedRequest
  ): Promise<{ reportId: number }> {
    const { userId } = request
    const postReport = await new PostService(postId).report(userId, body.reason)
    return { reportId: postReport.reportId }
  }

  @Security('firebase')
  @Post('{postId}/likes')
  public async likePost(
    @Path('postId') postId: number,
    @Request() request: AuthenticatedRequest
  ): Promise<{ success: boolean }> {
    const { userId } = request
    await new PostService(postId).like(userId)
    return { success: true }
  }

  @Security('firebase')
  @Delete('{postId}/likes')
  public async unlikePost(
    @Path('postId') postId: number,
    @Request() request: AuthenticatedRequest
  ): Promise<{ success: boolean }> {
    const { userId } = request
    await new PostService(postId).unlike(userId)
    return { success: true }
  }

  @Get('{postId}/comments')
  public async getPostComments(
    @Path('postId') postId: number,
    @Query('limit') queryLimit?: number,
    @Query('lastSeenUpdatedAt') lastSeenUpdatedAt?: Date,
    @Query('lastSeenCommentId') lastSeenCommentId?: string
  ): Promise<{ postComments: IPostComment[] }> {
    let limit = queryLimit || 20
    if (limit > 20) {
      limit = 20
    }

    const lastSeen =
      lastSeenUpdatedAt !== undefined && lastSeenCommentId !== undefined
        ? {
            updatedAt: lastSeenUpdatedAt,
            commentId: lastSeenCommentId,
          }
        : undefined

    const commentsByPostId = await PostCommentsService.getByPostId(
      postId,
      limit,
      lastSeen
    )

    return commentsByPostId
  }

  @Security('firebase')
  @Post('{postId}/comments')
  public async createPostComment(
    @Path('postId') postId: number,
    @Body()
    body: CreatePostCommentDto,
    @Request() request: AuthenticatedRequest
  ): Promise<{
    postComment: IPostComment
  }> {
    const { userId } = request
    const comment = await PostCommentsService.create(body, postId, userId)

    return { postComment: comment }
  }
}
