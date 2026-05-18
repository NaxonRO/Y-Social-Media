import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { followService } from '../services/followService';

interface FollowContextValue {
  followingIds: Set<string>;
  isFollowing: (userId: string) => boolean;
  follow: (userId: string) => Promise<void>;
  unfollow: (userId: string) => Promise<void>;
  counts: { followers: number; following: number };
  refreshCounts: () => Promise<void>;
}

const FollowContext = createContext<FollowContextValue | null>(null);

export const FollowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState({ followers: 0, following: 0 });

  useEffect(() => {
    if (!user) {
      setFollowingIds(new Set());
      setCounts({ followers: 0, following: 0 });
      return;
    }
    // Incarca lista de urmariti si contoarele la login
    Promise.all([
      followService.getFollowingIds(),
      followService.getMyCounts(),
    ]).then(([ids, c]) => {
      setFollowingIds(new Set(ids));
      setCounts(c);
    }).catch(() => {});
  }, [user?.id]);

  const isFollowing = useCallback((userId: string) => followingIds.has(userId), [followingIds]);

  const follow = useCallback(async (userId: string) => {
    setFollowingIds((prev) => new Set([...prev, userId]));
    setCounts((c) => ({ ...c, following: c.following + 1 }));
    try {
      await followService.follow(userId);
    } catch {
      // revert
      setFollowingIds((prev) => { const s = new Set(prev); s.delete(userId); return s; });
      setCounts((c) => ({ ...c, following: Math.max(0, c.following - 1) }));
    }
  }, []);

  const unfollow = useCallback(async (userId: string) => {
    setFollowingIds((prev) => { const s = new Set(prev); s.delete(userId); return s; });
    setCounts((c) => ({ ...c, following: Math.max(0, c.following - 1) }));
    try {
      await followService.unfollow(userId);
    } catch {
      // revert
      setFollowingIds((prev) => new Set([...prev, userId]));
      setCounts((c) => ({ ...c, following: c.following + 1 }));
    }
  }, []);

  const refreshCounts = useCallback(async () => {
    if (!user) return;
    const c = await followService.getMyCounts();
    setCounts(c);
  }, [user]);

  return (
    <FollowContext.Provider value={{ followingIds, isFollowing, follow, unfollow, counts, refreshCounts }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = (): FollowContextValue => {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error('useFollow must be used inside FollowProvider');
  return ctx;
};
