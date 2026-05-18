import { Router } from 'express';
import { postController } from '../controllers/postController';
import { authenticate } from '../middleware/authenticate';
import { optionalAuthenticate } from '../middleware/optionalAuthenticate';

const router = Router();

router.get('/feed', optionalAuthenticate, postController.getFeed);
router.get('/mine', authenticate, postController.getMyPosts);
router.get('/search', optionalAuthenticate, postController.searchPosts);
router.get('/trending-tags', postController.getTrendingHashtags);
router.post('/', authenticate, postController.createPost);
router.get('/:id', optionalAuthenticate, postController.getPostById);
router.delete('/:id', authenticate, postController.deletePost);

router.post('/:id/like', authenticate, postController.toggleLike);
router.post('/:id/repost', authenticate, postController.toggleRepost);

router.get('/:id/comments', postController.getComments);
router.post('/:id/comments', authenticate, postController.createComment);
router.delete('/:id/comments/:commentId', authenticate, postController.deleteComment);

export default router;
