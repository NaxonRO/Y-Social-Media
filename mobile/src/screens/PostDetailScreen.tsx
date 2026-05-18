import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/PostCard';
import { mockPosts, formatRelativeTime, formatCount, getAvatarColor } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { postService } from '../services/postService';
import { messageService } from '../services/messageService';
import FollowButton from '../components/FollowButton';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MainStackParamList, Comment } from '../types';

type RouteType = RouteProp<MainStackParamList, 'PostDetail'>;

interface PostHeaderProps {
  post: any;
  state: { liked: boolean; likeCount: number; reposted: boolean; repostCount: number } | null;
  commentCount: number;
  onBack: () => void;
  onToggleLike: () => void;
  onToggleRepost: () => void;
}

function MessageButton({ authorId, authorUsername }: { authorId: string; authorUsername: string }) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  if (!user || user.id === authorId) return null;

  const handlePress = async () => {
    try {
      const convId = await messageService.getOrCreateConversation(authorId);
      navigation.navigate('Conversation', { conversationId: convId, otherUsername: authorUsername });
    } catch {
      if (Platform.OS === 'web') window.alert('Eroare la deschiderea conversației.');
      else Alert.alert('Eroare', 'Eroare la deschiderea conversației.');
    }
  };

  return (
    <TouchableOpacity style={styles.msgBtn} onPress={handlePress}>
      <Ionicons name="mail-outline" size={16} color={colors.text.primary} />
      <Text style={styles.msgBtnText}>Mesaj</Text>
    </TouchableOpacity>
  );
}

function PostHeader({ post, state, commentCount, onBack, onToggleLike, onToggleRepost }: PostHeaderProps) {
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
    <View>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
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
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <FollowButton userId={post.author.id} size="small" />
            <MessageButton authorId={post.author.id} authorUsername={post.author.display_name ?? `@${post.author.username}`} />
          </View>
        </View>

        <Text style={styles.postContent}>{renderContent(post.content)}</Text>

        <Text style={styles.timestamp}>
          {new Date(post.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
          {' · '}
          {new Date(post.created_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>

        <View style={styles.statsBar}>
          {(state?.repostCount ?? 0) > 0 && (
            <TouchableOpacity style={styles.statBtn}>
              <Text style={styles.statCount}>{formatCount(state!.repostCount)}</Text>
              <Text style={styles.statLabel}> Repostări</Text>
            </TouchableOpacity>
          )}
          {(state?.likeCount ?? 0) > 0 && (
            <TouchableOpacity style={[styles.statBtn, styles.statBtnGap]}>
              <Text style={styles.statCount}>{formatCount(state!.likeCount)}</Text>
              <Text style={styles.statLabel}> Like-uri</Text>
            </TouchableOpacity>
          )}
          {commentCount > 0 && (
            <TouchableOpacity style={[styles.statBtn, styles.statBtnGap]}>
              <Text style={styles.statCount}>{formatCount(commentCount)}</Text>
              <Text style={styles.statLabel}> Răspunsuri</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onToggleRepost}>
            <Ionicons name="repeat" size={22} color={state?.reposted ? '#17BF63' : colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onToggleLike}>
            <Ionicons
              name={state?.liked ? 'heart' : 'heart-outline'}
              size={22}
              color={state?.liked ? '#E0245E' : colors.text.secondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-outline" size={22} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {commentCount > 0 && (
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Răspunsuri</Text>
        </View>
      )}
    </View>
  );
}

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
  const { interactions, toggleLike, toggleRepost, markAsCommented } = usePosts();

  const [replyText, setReplyText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [posting, setPosting] = useState(false);

  const mockPost = mockPosts.find((p) => p.id === route.params.postId);
  const [displayPost, setDisplayPost] = useState<any>(mockPost ?? route.params.post ?? null);
  const [loadingPost, setLoadingPost] = useState(!mockPost && !route.params.post);

  // daca postul nu e in mock si nu a fost pasat ca param, il incarcam din backend
  useEffect(() => {
    if (mockPost || route.params.post) return;
    setLoadingPost(true);
    postService.getPostById(route.params.postId)
      .then((p) => setDisplayPost(p))
      .catch(() => {})
      .finally(() => setLoadingPost(false));
  }, [route.params.postId]);

  const state = displayPost ? (interactions[displayPost.id] ?? {
    liked: displayPost.liked_by_me ?? false,
    likeCount: displayPost.like_count ?? 0,
    reposted: displayPost.reposted_by_me ?? false,
    repostCount: displayPost.repost_count ?? 0,
    commentCount: comments.length,
  }) : null;

  const loadComments = useCallback(async () => {
    if (!route.params.postId) return;
    setLoadingComments(true);
    try {
      const fetched = await postService.getComments(route.params.postId);
      setComments(fetched);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [route.params.postId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const handleReply = async () => {
    if (!replyText.trim() || !user || posting) return;
    setPosting(true);
    try {
      const newComment = await postService.createComment(route.params.postId, replyText.trim());
      setComments((prev) => [newComment, ...prev]);
      markAsCommented(route.params.postId);
      setReplyText('');
    } catch {
      if (Platform.OS === 'web') {
        window.alert('Nu s-a putut trimite comentariul.');
      } else {
        Alert.alert('Eroare', 'Nu s-a putut trimite comentariul.');
      }
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = (comment: Comment) => {
    confirmAction('Șterge comentariul', 'Ești sigur că vrei să ștergi?', async () => {
      try {
        await postService.deleteComment(route.params.postId, comment.id);
        setComments((prev) => prev.filter((c) => c.id !== comment.id));
      } catch {
        if (Platform.OS === 'web') {
          window.alert('Nu s-a putut șterge comentariul.');
        } else {
          Alert.alert('Eroare', 'Nu s-a putut șterge comentariul.');
        }
      }
    });
  };

  // toate hook-urile trebuie apelate inainte de orice early return
  const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleToggleLike = useCallback(() => {
    if (displayPost) toggleLike(displayPost.id);
  }, [toggleLike, displayPost?.id]);
  const handleToggleRepost = useCallback(() => {
    if (displayPost) toggleRepost(displayPost.id);
  }, [toggleRepost, displayPost?.id]);

  const header = useMemo(() => displayPost ? (
    <PostHeader
      post={displayPost}
      state={state}
      commentCount={comments.length}
      onBack={handleGoBack}
      onToggleLike={handleToggleLike}
      onToggleRepost={handleToggleRepost}
    />
  ) : null, [displayPost, state, comments.length, handleGoBack, handleToggleLike, handleToggleRepost]);

  // spinner cat timp se incarca postul sau comentariile
  if (loadingPost || !displayPost) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.text.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loadingComments && comments.length === 0 ? (
          <>
            {header}
            <View style={styles.loadingComments}>
              <ActivityIndicator size="small" color={colors.text.secondary} />
            </View>
          </>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            extraData={comments.length}
            renderItem={({ item }) => (
              <CommentItem
                comment={item}
                currentUserId={user?.id ?? ''}
                currentUsername={user?.username ?? ''}
                onDelete={() => handleDeleteComment(item)}
              />
            )}
            ListHeaderComponent={header}
            showsVerticalScrollIndicator={false}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            removeClippedSubviews={false}
          />
        )}

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
            style={[styles.replyBtn, (!replyText.trim() || posting) && styles.replyBtnDisabled]}
            onPress={handleReply}
            disabled={!replyText.trim() || posting}
          >
            {posting
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.replyBtnText}>Răspunde</Text>
            }
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
  onDelete: () => void;
}) {
  const avatarColor = getAvatarColor(comment.author.username);
  const isOwn =
    (currentUserId !== '' && comment.user_id === currentUserId) ||
    (currentUsername !== '' && comment.author.username === currentUsername);

  return (
    <View style={styles.commentContainer}>
      <View style={[styles.commentAvatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.commentAvatarText}>{comment.author.username[0].toUpperCase()}</Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentHeaderRow}>
          <View style={styles.commentMeta}>
            <Text style={styles.commentName} numberOfLines={1}>
              {comment.author.display_name ?? comment.author.username}
            </Text>
            {comment.author.is_verified && (
              <Ionicons name="checkmark-circle" size={13} color={colors.accent} style={{ marginLeft: 2 }} />
            )}
            <Text style={styles.commentUsername} numberOfLines={1}> @{comment.author.username}</Text>
            <Text style={styles.commentDot}> · </Text>
            <Text style={styles.commentTime}>{formatRelativeTime(comment.created_at)}</Text>
          </View>
          {isOwn && (
            <TouchableOpacity
              onPress={onDelete}
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
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backLabel: { ...typography.h3, color: colors.text.primary },
  postContainer: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  authorInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  displayName: { ...typography.label, color: colors.text.primary },
  badge: { marginLeft: 3 },
  username: { ...typography.bodySmall, color: colors.text.secondary },
  followBtn: { borderWidth: 1.5, borderColor: colors.text.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  msgBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  msgBtnText: { ...typography.label, fontSize: 13, color: colors.text.primary },
  followBtnText: { ...typography.label, fontSize: 13, color: colors.text.primary },
  postContent: { ...typography.body, fontSize: 20, lineHeight: 28, color: colors.text.primary, marginBottom: 14 },
  mention: { color: colors.accent, fontWeight: '500' },
  timestamp: { ...typography.bodySmall, color: colors.text.secondary, marginBottom: 12 },
  statsBar: { flexDirection: 'row', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border, borderBottomWidth: 1, borderBottomColor: colors.border },
  statBtn: { flexDirection: 'row' },
  statBtnGap: { marginLeft: 16 },
  statCount: { ...typography.label, fontSize: 14, color: colors.text.primary },
  statLabel: { ...typography.bodySmall, color: colors.text.secondary },
  actionsBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: -16, marginHorizontal: -16, paddingHorizontal: 16 },
  actionBtn: { padding: 10 },
  commentsHeader: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  commentsTitle: { ...typography.h3, color: colors.text.primary },
  loadingComments: { padding: 32, alignItems: 'center' },
  commentContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
  commentAvatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  commentBody: { flex: 1 },
  commentHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  commentMeta: { flexDirection: 'row', alignItems: 'center', flex: 1, overflow: 'hidden' },
  commentName: { ...typography.label, fontSize: 14, color: colors.text.primary, flexShrink: 1 },
  commentUsername: { ...typography.bodySmall, color: colors.text.secondary, flexShrink: 1 },
  commentDot: { ...typography.bodySmall, color: colors.text.secondary },
  commentTime: { ...typography.bodySmall, color: colors.text.secondary, flexShrink: 0 },
  deleteBtn: { paddingLeft: 10, flexShrink: 0 },
  commentContent: { ...typography.body, color: colors.text.primary, lineHeight: 20, marginBottom: 8 },
  commentActions: { flexDirection: 'row', gap: 16 },
  commentAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentActionCount: { ...typography.caption, color: colors.text.secondary },
  replyBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, gap: 10, backgroundColor: colors.background },
  replyInput: { flex: 1, ...typography.body, color: colors.text.primary, maxHeight: 80 },
  replyBtn: { backgroundColor: colors.text.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18 },
  replyBtnDisabled: { backgroundColor: colors.text.disabled },
  replyBtnText: { ...typography.label, color: '#fff', fontSize: 13 },
});
