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
  SuccessResponse,
} from 'tsoa'
import { AuthenticatedRequest } from '../types/express'
import { IPost } from '../types/client'
import { ServerError } from '../shared/ServerError'
import { PostService } from '../services/post'

@Route('posts')
export class PostsController extends Controller {
  @Security('firebase')
  @Get()
  @SuccessResponse('200')
  public async getPosts(
    @Query('userId') userId: number,
    @Query('sortBy') sortBy: 'likes' | 'updatedAt',
    @Query('lastSeenLikesCount') lastSeenLikesCount: number,
    @Query('lastSeenUpdatedAt') lastSeenUpdatedAt: number
  ): Promise<{ post: IPost[] }> {
    if (sortBy === 'likes') {
      return {
        post: await PostService.feedListSortedByLikes(
          lastSeenLikesCount,
          userId
        ),
      }
    } else {
      return {
        post: await PostService.feedListSortedByUpdatedAt(
          lastSeenUpdatedAt,
          userId
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

  @Security('firebase')
  @Get('{postId}')
  @SuccessResponse('200')
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
}
