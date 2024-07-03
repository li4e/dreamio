import {
  Controller,
  Post,
  Delete,
  Path,
  Body,
  Route,
  Request,
  Security,
} from 'tsoa'
import { AuthenticatedRequest } from '../types/express'
import { PostCommentsService } from '../services/post_comments'
import { CreatePostClaimDto } from '@choco/db'

@Route('post_comments')
export class PostsCommentsController extends Controller {
  @Security('firebase')
  @Delete('{commentId}')
  public async deletePostComment(
    @Path('commentId') commentId: string,
    @Request() request: AuthenticatedRequest
  ): Promise<{ success: boolean }> {
    const { userId } = request
    await new PostCommentsService(BigInt(commentId)).delete(userId)
    return { success: true }
  }

  @Security('firebase')
  @Post('{commentId}/reports')
  public async createPostCommentReport(
    @Body() body: CreatePostClaimDto,
    @Path('commentId') commentId: string,
    @Request() request: AuthenticatedRequest
  ): Promise<{ reportId: number }> {
    const { userId } = request
    const report = await new PostCommentsService(BigInt(commentId)).report(
      userId,
      body.reason
    )
    return { reportId: report.reportId }
  }
}
