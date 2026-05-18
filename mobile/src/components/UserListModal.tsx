import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './PostCard';
import { followService } from '../services/followService';
import { useFollow } from '../context/FollowContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface UserItem {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

interface Props {
  visible: boolean;
  type: 'followers' | 'following';
  userId: string;
  title: string;
  onClose: () => void;
}

export default function UserListModal({ visible, type, userId, title, onClose }: Props) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isFollowing, follow, unfollow } = useFollow();

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    const fetch = type === 'followers'
      ? followService.getFollowers(userId)
      : followService.getFollowing(userId);
    fetch
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [visible, type, userId]);

  const handleFollow = async (user: UserItem) => {
    await follow(user.id);
  };

  const handleUnfollow = async (user: UserItem) => {
    await unfollow(user.id);
    // daca suntem in tab "following", scoatem utilizatorul din lista instant
    if (type === 'following') {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.text.primary} />
          </View>
        ) : users.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="people-outline" size={48} color={colors.text.disabled} />
            <Text style={styles.emptyText}>
              {type === 'followers' ? 'Niciun urmăritor încă' : 'Nu urmărești pe nimeni încă'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <UserRow
                user={item}
                type={type}
                isFollowing={isFollowing(item.id)}
                onFollow={() => handleFollow(item)}
                onUnfollow={() => handleUnfollow(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

function UserRow({
  user,
  type,
  isFollowing,
  onFollow,
  onUnfollow,
}: {
  user: UserItem;
  type: 'followers' | 'following';
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      if (isFollowing) await onUnfollow();
      else await onFollow();
    } finally {
      setLoading(false);
    }
  };

  const btnLabel = isFollowing ? 'Urmărești' : 'Urmărește';
  const btnStyle = isFollowing ? styles.btnFollowing : styles.btnFollow;
  const btnTextStyle = isFollowing ? styles.btnTextFollowing : styles.btnTextFollow;

  return (
    <View style={styles.row}>
      <Avatar username={user.username} size={44} />
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.displayName} numberOfLines={1}>
            {user.display_name ?? user.username}
          </Text>
          {user.is_verified && (
            <Ionicons name="checkmark-circle" size={14} color={colors.accent} style={{ marginLeft: 3 }} />
          )}
        </View>
        <Text style={styles.username}>@{user.username}</Text>
      </View>
      <TouchableOpacity style={[styles.btn, btnStyle]} onPress={handlePress} disabled={loading}>
        {loading
          ? <ActivityIndicator size="small" color={isFollowing ? colors.text.primary : '#fff'} />
          : <Text style={[styles.btnText, btnTextStyle]}>{btnLabel}</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { ...typography.h3, color: colors.text.primary },
  closeBtn: { padding: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  list: { paddingVertical: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  displayName: { ...typography.label, color: colors.text.primary, flexShrink: 1 },
  username: { ...typography.bodySmall, color: colors.text.secondary, marginTop: 2 },
  btn: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  btnFollow: { backgroundColor: colors.text.primary },
  btnFollowing: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
  btnText: { ...typography.label, fontSize: 13 },
  btnTextFollow: { color: '#fff' },
  btnTextFollowing: { color: colors.text.primary },
});
