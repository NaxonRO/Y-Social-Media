import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/PostCard';
import { mockPosts, formatRelativeTime, formatCount, getAvatarColor } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MainStackParamList, Comment } from '../types';

type RouteType = RouteProp<MainStackParamList, 'PostDetail'>;

function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'Anulează', style: 'cancel' },
      { text: 'Șterge', style: 'destructive', onPress: onConfirm },
    ]);
  }
}

export default function PostDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');

  const { interactions, comments: allComments, toggleLike, toggleRepost, addComment, removeComment } = usePosts();
  const currentUserId = user?.id ?? '';
  const currentUsername = user?.username ?? '';
  const post = mockPosts.find((p) => p.id === route.params.postId) ?? mockPosts[0];
  const state = interactions[post.id] ?? {
    liked: post.liked_by_me,
    likeCount: post.like_count,
    reposted: post.reposted_by_me,
    repostCount: post.repost_count,
    commentCount: post.comment_count,
  };
  const postComments = allComments[post.id] ?? [];

  const handleLike = () => toggleLike(post.id);
  const handleRepost = () => toggleRepost(post.id);

  const handleReply = () => {
    if (!replyText.trim() || !user) return;
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      user_id: user.id,
      post_id: post.id,
      author: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified,
      },
      content: replyText.trim(),
      like_count: 0,
      created_at: new Date().toISOString(),
    };
    addComment(post.id, newComment);
    setReplyText('');
  };

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

  const PostHeader = () => (
    <View>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          <Text style={styles.backLabel}>Postare</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.postContainer}>
        <View style={styles.authorRow}>
          <Avatar username={post.author.username} size={44} />
          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>
                {post.author.display_name ?? post.author.username}
              </Text>
              {post.author.is_verified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.accent} style={styles.badge} />
              )}
            </View>
            <Text style={styles.username}>@{post.author.username}</Text>
          </View>
          <TouchableOpacity style={styles.followBtn}>
            <Text style={styles.followBtnText}>Urmărește</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.postContent}>{renderContent(post.content)}</Text>

        <Text style={styles.timestamp}>
          {new Date(post.created_at).toLocaleTimeString('ro-RO', {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {' · '}
          {new Date(post.created_at).toLocaleDateString('ro-RO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>

        <View style={styles.statsBar}>
          {state.repostCount > 0 && (
            <TouchableOpacity style={styles.statBtn}>
              <Text style={styles.statCount}>{formatCount(state.repostCount)}</Text>
              <Text style={styles.statLabel}> Repostări</Text>
            </TouchableOpacity>
          )}
          {state.likeCount > 0 && (
            <TouchableOpacity style={[styles.statBtn, styles.statBtnGap]}>
              <Text style={styles.statCount}>{formatCount(state.likeCount)}</Text>
              <Text style={styles.statLabel}> Like-uri</Text>
            </TouchableOpacity>
          )}
          {state.commentCount > 0 && (
            <TouchableOpacity style={[styles.statBtn, styles.statBtnGap]}>
              <Text style={styles.statCount}>{formatCount(state.commentCount)}</Text>
              <Text style={styles.statLabel}> Răspunsuri</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => {}}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleRepost}>
            <Ionicons name="repeat" size={22} color={state.reposted ? '#17BF63' : colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
            <Ionicons
              name={state.liked ? 'heart' : 'heart-outline'}
              size={22}
              color={state.liked ? '#E0245E' : colors.text.secondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="stats-chart-outline" size={22} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-outline" size={22} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {postComments.length > 0 && (
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Răspunsuri</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={postComments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommentItem
              comment={item}
              currentUserId={currentUserId}
              currentUsername={currentUsername}
              onDelete={(commentId) => {
                confirmAction(
                  'Șterge comentariul',
                  'Ești sigur că vrei să ștergi acest comentariu?',
                  () => removeComment(post.id, commentId, currentUserId)
                );
              }}
            />
          )}
          ListHeaderComponent={<PostHeader />}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.replyBar}>
          {user && <Avatar username={user.username} size={34} />}
          <TextInput
            style={styles.replyInput}
            placeholder="Postează răspunsul tău"
            placeholderTextColor={colors.input.placeholder}
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity
            style={[styles.replyBtn, !replyText.trim() && styles.replyBtnDisabled]}
            onPress={handleReply}
            disabled={!replyText.trim()}
          >
            <Text style={styles.replyBtnText}>Răspunde</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CommentItem({
  comment,
  currentUserId,
  currentUsername,
  onDelete,
}: {
  comment: Comment;
  currentUserId: string;
  currentUsername: string;
  onDelete: (commentId: string) => void;
}) {
  const avatarColor = getAvatarColor(comment.author.username);
  // comparam atat dupa id cat si dupa username pentru robustete
  const isOwn =
    (currentUserId !== '' && comment.user_id === currentUserId) ||
    (currentUsername !== '' && comment.author.username === currentUsername);

  return (
    <View style={styles.commentContainer}>
      <View style={[styles.commentAvatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.commentAvatarText}>
          {comment.author.username[0].toUpperCase()}
        </Text>
      </View>

      <View style={styles.commentBody}>
        {/* Rand cu meta + trash aliniat la dreapta */}
        <View style={styles.commentHeaderRow}>
          <View style={styles.commentMeta}>
            <Text style={styles.commentName} numberOfLines={1}>
              {comment.author.display_name ?? comment.author.username}
            </Text>
            {comment.author.is_verified && (
              <Ionicons name="checkmark-circle" size={13} color={colors.accent} style={{ marginLeft: 2 }} />
            )}
            <Text style={styles.commentUsername} numberOfLines={1}>
              {' '}@{comment.author.username}
            </Text>
            <Text style={styles.commentDot}> · </Text>
            <Text style={styles.commentTime}>{formatRelativeTime(comment.created_at)}</Text>
          </View>
          {isOwn && (
            <TouchableOpacity
              onPress={() => onDelete(comment.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={15} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.commentContent}>{comment.content}</Text>

        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.commentAction}>
            <Ionicons name="heart-outline" size={16} color={colors.text.secondary} />
            {comment.like_count > 0 && (
              <Text style={styles.commentActionCount}>{formatCount(comment.like_count)}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentAction}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backLabel: {
    ...typography.h3,
    color: colors.text.primary,
  },
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    ...typography.label,
    color: colors.text.primary,
  },
  badge: {
    marginLeft: 3,
  },
  username: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  followBtn: {
    borderWidth: 1.5,
    borderColor: colors.text.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  followBtnText: {
    ...typography.label,
    fontSize: 13,
    color: colors.text.primary,
  },
  postContent: {
    ...typography.body,
    fontSize: 20,
    lineHeight: 28,
    color: colors.text.primary,
    marginBottom: 14,
  },
  mention: {
    color: colors.accent,
    fontWeight: '500',
  },
  timestamp: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  statsBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statBtn: {
    flexDirection: 'row',
  },
  statBtnGap: {
    marginLeft: 16,
  },
  statCount: {
    ...typography.label,
    fontSize: 14,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: -16,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  actionBtn: {
    padding: 10,
  },
  commentsHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  commentsTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  commentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  commentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  commentBody: {
    flex: 1,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    overflow: 'hidden',
  },
  commentName: {
    ...typography.label,
    fontSize: 14,
    color: colors.text.primary,
    flexShrink: 1,
  },
  commentUsername: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flexShrink: 1,
  },
  commentDot: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  commentTime: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flexShrink: 0,
  },
  commentContent: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionCount: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  deleteBtn: {
    paddingLeft: 10,
    flexShrink: 0,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
    backgroundColor: colors.background,
  },
  replyInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    maxHeight: 80,
  },
  replyBtn: {
    backgroundColor: colors.text.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  replyBtnDisabled: {
    backgroundColor: colors.text.disabled,
  },
  replyBtnText: {
    ...typography.label,
    color: '#fff',
    fontSize: 13,
  },
});
