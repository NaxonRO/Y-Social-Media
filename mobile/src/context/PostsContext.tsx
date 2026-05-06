import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { mockPosts, mockComments } from '../data/mockData';
import { appStorage } from '../services/appStorage';
import { useAuth } from './AuthContext';
import { Comment, Post } from '../types';
import { postService } from '../services/postService';

interface PostInteraction {
  liked: boolean;
  likeCount: number;
  reposted: boolean;
  repostCount: number;
  commentCount: number;
}

interface PostsContextValue {
  interactions: Record<string, PostInteraction>;
  comments: Record<string, Comment[]>;
  knownPosts: Record<string, Post>;
  likedPostIds: string[];
  repostedPostIds: string[];
  commentedPostIds: string[];
  isLoaded: boolean;
  toggleLike: (postId: string) => void;
  toggleRepost: (postId: string) => void;
  addComment: (postId: string, comment: Comment) => void;
  removeComment: (postId: string, commentId: string, userId: string) => void;
  registerPosts: (posts: Post[]) => void;
  markAsCommented: (postId: string) => void;
}

const PostsContext = createContext<PostsContextValue | null>(null);

function storageKeys(userId: string) {
  return {
    interactions: `y_interactions_${userId}`,
    userComments: `y_user_comments_${userId}`,
    reposted: `y_reposted_${userId}`,
    commented: `y_commented_${userId}`,
  };
}

function buildInitialInteractions(): Record<string, PostInteraction> {
  const map: Record<string, PostInteraction> = {};
  for (const post of mockPosts) {
    map[post.id] = {
      liked: false,
      likeCount: post.like_count,
      reposted: false,
      repostCount: post.repost_count,
      commentCount: post.comment_count,
    };
  }
  return map;
}

function buildMockComments(): Record<string, Comment[]> {
  const map: Record<string, Comment[]> = {};
  for (const post of mockPosts) {
    map[post.id] = mockComments.filter((c) => c.post_id === post.id);
  }
  return map;
}

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [interactions, setInteractions] = useState<Record<string, PostInteraction>>(buildInitialInteractions);
  const [userComments, setUserComments] = useState<Record<string, Comment[]>>({});
  const [repostedPostIds, setRepostedPostIds] = useState<string[]>([]);
  const [commentedPostIds, setCommentedPostIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [knownPosts, setKnownPosts] = useState<Record<string, Post>>(() => {
    const map: Record<string, Post> = {};
    for (const p of mockPosts) map[p.id] = p as unknown as Post;
    return map;
  });
  const knownPostsRef = useRef(knownPosts);
  useEffect(() => { knownPostsRef.current = knownPosts; }, [knownPosts]);

  // comentarii finale = cele ale userului (noi primele) + mock-urile
  const mockCommentMap = buildMockComments();
  const comments: Record<string, Comment[]> = {};
  for (const postId of Object.keys(mockCommentMap)) {
    comments[postId] = [...(userComments[postId] ?? []), ...mockCommentMap[postId]];
  }
  for (const postId of Object.keys(userComments)) {
    if (!comments[postId]) comments[postId] = userComments[postId];
  }

  // Resetare + incarcare din storage la fiecare schimbare de user
  useEffect(() => {
    setInteractions(buildInitialInteractions());
    setUserComments({});
    setRepostedPostIds([]);
    setCommentedPostIds([]);
    setIsLoaded(false);
    setKnownPosts(() => {
      const map: Record<string, Post> = {};
      for (const p of mockPosts) map[p.id] = p as unknown as Post;
      return map;
    });

    if (!userId) {
      setIsLoaded(true);
      return;
    }

    const keys = storageKeys(userId);
    async function load() {
      const [savedInteractions, savedUserComments, savedReposted, savedCommented] = await Promise.all([
        appStorage.getJson<Record<string, PostInteraction>>(keys.interactions),
        appStorage.getJson<Record<string, Comment[]>>(keys.userComments),
        appStorage.getJson<string[]>(keys.reposted),
        appStorage.getJson<string[]>(keys.commented),
      ]);

      if (savedInteractions) {
        setInteractions((prev) => ({ ...prev, ...savedInteractions }));
      }
      if (savedUserComments) setUserComments(savedUserComments);
      if (savedReposted) setRepostedPostIds(savedReposted);
      if (savedCommented) setCommentedPostIds(savedCommented);
      setIsLoaded(true);
    }
    load();
  }, [userId]);

  // Salvare cu debounce 500ms
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userIdRef = useRef(userId);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  function scheduleSave(
    i: Record<string, PostInteraction>,
    uc: Record<string, Comment[]>,
    r: string[],
    c: string[]
  ) {
    if (!userIdRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!userIdRef.current) return;
      const keys = storageKeys(userIdRef.current);
      Promise.all([
        appStorage.setJson(keys.interactions, i),
        appStorage.setJson(keys.userComments, uc),
        appStorage.setJson(keys.reposted, r),
        appStorage.setJson(keys.commented, c),
      ]);
    }, 500);
  }

  const getOrBuildCur = (prev: Record<string, PostInteraction>, postId: string): PostInteraction => {
    const known = knownPostsRef.current[postId];
    return prev[postId] ?? {
      liked: false,
      likeCount: known?.like_count ?? 0,
      reposted: false,
      repostCount: known?.repost_count ?? 0,
      commentCount: known?.comment_count ?? 0,
    };
  };

  const toggleLike = useCallback((postId: string) => {
    // optimistic update
    setInteractions((prev) => {
      const cur = getOrBuildCur(prev, postId);
      return { ...prev, [postId]: { ...cur, liked: !cur.liked, likeCount: cur.liked ? cur.likeCount - 1 : cur.likeCount + 1 } };
    });
    postService.toggleLike(postId).then(({ liked, likeCount }) => {
      setInteractions((prev) => {
        const cur = getOrBuildCur(prev, postId);
        return { ...prev, [postId]: { ...cur, liked, likeCount } };
      });
    }).catch(() => {
      // revert
      setInteractions((prev) => {
        const cur = getOrBuildCur(prev, postId);
        return { ...prev, [postId]: { ...cur, liked: !cur.liked, likeCount: cur.liked ? cur.likeCount - 1 : cur.likeCount + 1 } };
      });
    });
  }, []);

  const toggleRepost = useCallback((postId: string) => {
    // optimistic update
    setInteractions((prev) => {
      const cur = getOrBuildCur(prev, postId);
      const nowReposted = !cur.reposted;
      setRepostedPostIds((r) => nowReposted ? [...r.filter((id) => id !== postId), postId] : r.filter((id) => id !== postId));
      return { ...prev, [postId]: { ...cur, reposted: nowReposted, repostCount: cur.reposted ? cur.repostCount - 1 : cur.repostCount + 1 } };
    });
    postService.toggleRepost(postId).then(({ reposted, repostCount }) => {
      setInteractions((prev) => {
        const cur = getOrBuildCur(prev, postId);
        return { ...prev, [postId]: { ...cur, reposted, repostCount } };
      });
      setRepostedPostIds((r) => reposted ? [...r.filter((id) => id !== postId), postId] : r.filter((id) => id !== postId));
    }).catch(() => {
      // revert
      setInteractions((prev) => {
        const cur = getOrBuildCur(prev, postId);
        const reverted = !cur.reposted;
        setRepostedPostIds((r) => reverted ? [...r.filter((id) => id !== postId), postId] : r.filter((id) => id !== postId));
        return { ...prev, [postId]: { ...cur, reposted: reverted, repostCount: cur.reposted ? cur.repostCount - 1 : cur.repostCount + 1 } };
      });
    });
  }, []);

  const addComment = useCallback((postId: string, comment: Comment) => {
    setUserComments((prevUC) => {
      const nextUC = { ...prevUC, [postId]: [comment, ...(prevUC[postId] ?? [])] };
      setInteractions((prevI) => {
        const cur = prevI[postId];
        if (!cur) return prevI;
        const nextI = { ...prevI, [postId]: { ...cur, commentCount: cur.commentCount + 1 } };
        const newCommented = commentedPostIds.includes(postId)
          ? commentedPostIds
          : [...commentedPostIds, postId];
        setCommentedPostIds(newCommented);
        scheduleSave(nextI, nextUC, repostedPostIds, newCommented);
        return nextI;
      });
      return nextUC;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repostedPostIds, commentedPostIds]);

  const removeComment = useCallback((postId: string, commentId: string, ownerUserId: string) => {
    setUserComments((prevUC) => {
      const updated = (prevUC[postId] ?? []).filter((c) => c.id !== commentId);
      const nextUC = { ...prevUC, [postId]: updated };
      setInteractions((prevI) => {
        const cur = prevI[postId];
        if (!cur) return prevI;
        const nextI = { ...prevI, [postId]: { ...cur, commentCount: Math.max(0, cur.commentCount - 1) } };
        const stillHas = updated.some((c) => c.user_id === ownerUserId);
        const newCommented = stillHas
          ? commentedPostIds
          : commentedPostIds.filter((id) => id !== postId);
        setCommentedPostIds(newCommented);
        scheduleSave(nextI, nextUC, repostedPostIds, newCommented);
        return nextI;
      });
      return nextUC;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repostedPostIds, commentedPostIds]);

  const markAsCommented = useCallback((postId: string) => {
    setCommentedPostIds((prev) => {
      if (prev.includes(postId)) return prev;
      const next = [...prev, postId];
      if (userIdRef.current) {
        const keys = storageKeys(userIdRef.current);
        appStorage.setJson(keys.commented, next);
      }
      return next;
    });
    setInteractions((prev) => {
      const cur = prev[postId];
      const known = knownPostsRef.current[postId];
      if (cur) {
        return { ...prev, [postId]: { ...cur, commentCount: cur.commentCount + 1 } };
      }
      return {
        ...prev,
        [postId]: {
          liked: false,
          likeCount: known?.like_count ?? 0,
          reposted: false,
          repostCount: known?.repost_count ?? 0,
          commentCount: (known?.comment_count ?? 0) + 1,
        },
      };
    });
  }, []);

  const registerPosts = useCallback((posts: Post[]) => {
    setKnownPosts((prev) => {
      const next = { ...prev };
      for (const p of posts) next[p.id] = p;
      return next;
    });
    setInteractions((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const p of posts) {
        if (next[p.id]) {
          const cur = next[p.id];
          if (cur.commentCount !== p.comment_count || cur.likeCount !== p.like_count || cur.repostCount !== p.repost_count) {
            next[p.id] = { ...cur, commentCount: p.comment_count, likeCount: p.like_count, repostCount: p.repost_count };
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, []);

  const likedPostIds = Object.entries(interactions)
    .filter(([, s]) => s.liked)
    .map(([id]) => id);

  return (
    <PostsContext.Provider value={{
      interactions,
      comments,
      knownPosts,
      likedPostIds,
      repostedPostIds,
      commentedPostIds,
      isLoaded,
      toggleLike,
      toggleRepost,
      addComment,
      removeComment,
      registerPosts,
      markAsCommented,
    }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = (): PostsContextValue => {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used inside PostsProvider');
  return ctx;
};
