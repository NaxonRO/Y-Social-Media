import { Request, Response } from 'express';
import { PostModel } from '../models/Post';
import { CommentModel } from '../models/Comment';
import { AuthenticatedRequest } from '../types';

export const postController = {
  async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { content } = req.body as { content?: string };
      if (!content || content.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Conținutul postării este obligatoriu' });
        return;
      }
      if (content.trim().length > 280) {
        res.status(400).json({ success: false, message: 'Postarea poate avea maxim 280 de caractere' });
        return;
      }
      const post = await PostModel.create(req.user!.id, content.trim());
      if (!post) {
        res.status(500).json({ success: false, message: 'Eroare la crearea postării' });
        return;
      }
      res.status(201).json({ success: true, data: { post: PostModel.toPublic(post) } });
    } catch (error) {
      console.error('CreatePost error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async getMyPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limit = Math.min(Number(req.query.limit) || 20, 50);
      const cursor = req.query.cursor as string | undefined;
      const posts = await PostModel.getByUserId(req.user!.id, limit, cursor, req.user!.id);
      res.status(200).json({
        success: true,
        data: {
          posts: posts.map(PostModel.toPublic),
          nextCursor: posts.length === limit ? posts[posts.length - 1].created_at : null,
        },
      });
    } catch (error) {
      console.error('GetMyPosts error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async getFeed(req: Request, res: Response): Promise<void> {
    try {
      const limit = Math.min(Number(req.query.limit) || 20, 50);
      const cursor = req.query.cursor as string | undefined;
      const userId = (req as AuthenticatedRequest).user?.id;
      const posts = await PostModel.getFeed(limit, cursor, userId);
      res.status(200).json({
        success: true,
        data: {
          posts: posts.map(PostModel.toPublic),
          nextCursor: posts.length === limit ? posts[posts.length - 1].created_at : null,
        },
      });
    } catch (error) {
      console.error('GetFeed error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async toggleLike(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await PostModel.toggleLike(id, req.user!.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('ToggleLike error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async toggleRepost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await PostModel.toggleRepost(id, req.user!.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('ToggleRepost error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async getComments(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const comments = await CommentModel.getForPost(id);
      res.status(200).json({ success: true, data: { comments: comments.map(CommentModel.toPublic) } });
    } catch (error) {
      console.error('GetComments error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async createComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: postId } = req.params;
      const { content } = req.body as { content?: string };
      if (!content || content.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Comentariul nu poate fi gol' });
        return;
      }
      const comment = await CommentModel.create(postId, req.user!.id, content.trim());
      if (!comment) {
        res.status(500).json({ success: false, message: 'Eroare la crearea comentariului' });
        return;
      }
      res.status(201).json({ success: true, data: { comment: CommentModel.toPublic(comment) } });
    } catch (error) {
      console.error('CreateComment error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async deleteComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const deleted = await CommentModel.delete(commentId, req.user!.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Comentariul nu există sau nu ești proprietarul' });
        return;
      }
      res.status(200).json({ success: true, message: 'Comentariu șters' });
    } catch (error) {
      console.error('DeleteComment error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },

  async deletePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await PostModel.delete(id, req.user!.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Postarea nu există sau nu ești proprietarul' });
        return;
      }
      res.status(200).json({ success: true, message: 'Postare ștearsă' });
    } catch (error) {
      console.error('DeletePost error:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  },
};
