import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../types';
import { formatRelativeTime, formatCount, getAvatarColor } from '../data/mockData';
import { usePosts } from '../context/PostsContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface Props {
  post: Post;
  onPress: () => void;
}

function Avatar({ username, size = 44 }: { username: string; size?: number }) {
  const bg = getAvatarColor(username);
  const initial = username[0].toUpperCase();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

export { Avatar };

export default function PostCard({ post, onPress }: Props) {
  const { interactions, toggleLike, toggleRepost } = usePosts();
  const state = interactions[post.id] ?? {
    liked: post.liked_by_me,
    likeCount: post.like_count,
    reposted: post.reposted_by_me,
    repostCount: post.repost_count,
    commentCount: post.comment_count,
  };

  const handleLike = () => toggleLike(post.id);
  const handleRepost = () => toggleRepost(post.id);

  const renderContent = (content: string) => {
    const parts = content.split(/(#\w+|@\w+)/g);
    return parts.map((part, i) =>
      part.startsWith('#') || part.startsWith('@') ? (
        <Text key={i} style={styles.mention}>{part}</Text>
      ) : (
        <Text key={i}>{part}</Text>
      )
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.leftCol}>
        <Avatar username={post.author.username} />
        <View style={styles.threadLine} />
      </View>

      <View style={styles.rightCol}>
        <View style={styles.header}>
          <View style={styles.authorRow}>
            <Text style={styles.displayName} numberOfLines={1}>
              {post.author.display_name ?? post.author.username}
            </Text>
            {post.author.is_verified && (
              <Ionicons name="checkmark-circle" size={16} color={colors.accent} style={styles.badge} />
            )}
            <Text style={styles.username} numberOfLines={1}>
              @{post.author.username}
            </Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.time}>{formatRelativeTime(post.created_at)}</Text>
          </View>
        </View>

        <Text style={styles.content}>{renderContent(post.content)}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.action} onPress={onPress}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.text.secondary} />
            {state.commentCount > 0 && (
              <Text style={styles.actionCount}>{formatCount(state.commentCount)}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={handleRepost}>
            <Ionicons
              name="repeat"
              size={20}
              color={state.reposted ? '#17BF63' : colors.text.secondary}
            />
            {state.repostCount > 0 && (
              <Text style={[styles.actionCount, state.reposted && styles.repostCount]}>
                {formatCount(state.repostCount)}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={handleLike}>
            <Ionicons
              name={state.liked ? 'heart' : 'heart-outline'}
              size={20}
              color={state.liked ? '#E0245E' : colors.text.secondary}
            />
            {state.likeCount > 0 && (
              <Text style={[styles.actionCount, state.liked && styles.likeCount]}>
                {formatCount(state.likeCount)}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.action}>
            <Ionicons name="share-outline" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  leftCol: {
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  threadLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: 6,
    marginBottom: -14,
  },
  rightCol: {
    flex: 1,
    paddingBottom: 14,
  },
  header: {
    marginBottom: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  displayName: {
    ...typography.label,
    color: colors.text.primary,
    flexShrink: 1,
  },
  badge: {
    marginLeft: 3,
    marginRight: 2,
  },
  username: {
    ...typography.body,
    color: colors.text.secondary,
    flexShrink: 1,
    marginLeft: 4,
  },
  dot: {
    ...typography.body,
    color: colors.text.secondary,
    marginHorizontal: 4,
  },
  time: {
    ...typography.body,
    color: colors.text.secondary,
    flexShrink: 0,
  },
  content: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: 12,
  },
  mention: {
    color: colors.accent,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 280,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingRight: 8,
  },
  actionCount: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  likeCount: {
    color: '#E0245E',
  },
  repostCount: {
    color: '#17BF63',
  },
});
