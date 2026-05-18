import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/PostCard';
import { notificationService } from '../services/notificationService';
import { formatRelativeTime } from '../data/mockData';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppNotification, MainStackParamList } from '../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const notifConfig: Record<string, { icon: string; color: string; label: string }> = {
  like:    { icon: 'heart',        color: '#E0245E', label: 'a dat like la postarea ta' },
  comment: { icon: 'chatbubble',   color: colors.accent, label: 'a răspuns la postarea ta' },
  repost:  { icon: 'repeat',       color: '#17BF63', label: 'a repostat postarea ta' },
  follow:  { icon: 'person-add',   color: '#794BC4', label: 'a început să te urmărească' },
  message: { icon: 'mail',         color: colors.accent, label: 'ți-a trimis un mesaj' },
};

export default function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const { notifications: notifs, unreadCount: cnt } = await notificationService.getNotifications();
      setNotifications(notifs);
      setUnreadCount(cnt);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load();
  }, [load]));

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleTap = async (notif: AppNotification) => {
    // marcheaza ca citit
    if (!notif.is_read) {
      notificationService.markRead(notif.id).catch(() => {});
      setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    // navigheaza la postare sau conversatie
    if (notif.type === 'message' && notif.conversation_id) {
      navigation.navigate('Conversation', {
        conversationId: notif.conversation_id,
        otherUsername: notif.actor.display_name ?? `@${notif.actor.username}`,
      });
    } else if (notif.post_id) {
      navigation.navigate('PostDetail', { postId: notif.post_id });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificări</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.readAllBtn}>
            <Text style={styles.readAllText}>Marchează toate ca citite</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.text.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotifItem notif={item} onPress={() => handleTap(item)} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="notifications-outline" size={56} color={colors.text.disabled} />
              <Text style={styles.emptyTitle}>Nicio notificare</Text>
              <Text style={styles.emptyText}>
                Când cineva interacționează cu tine, vei vedea aici.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function NotifItem({ notif, onPress }: { notif: AppNotification; onPress: () => void }) {
  const cfg = notifConfig[notif.type] ?? notifConfig.like;
  return (
    <TouchableOpacity
      style={[styles.item, !notif.is_read && styles.itemUnread]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {!notif.is_read && <View style={styles.unreadDot} />}
      <View style={[styles.iconCircle, { backgroundColor: `${cfg.color}20` }]}>
        <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
      </View>
      <View style={styles.content}>
        <Avatar username={notif.actor.username} size={36} />
        <View style={styles.textBlock}>
          <Text style={styles.text} numberOfLines={3}>
            <Text style={styles.actor}>
              {notif.actor.display_name ?? notif.actor.username}{' '}
            </Text>
            <Text style={styles.action}>{cfg.label}</Text>
            {notif.type === 'message' && notif.message_preview ? (
              <Text style={styles.preview}>: "{notif.message_preview}"</Text>
            ) : notif.post_preview ? (
              <Text style={styles.preview}>: "{notif.post_preview}"</Text>
            ) : null}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(notif.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { ...typography.h3, color: colors.text.primary },
  readAllBtn: { paddingVertical: 4 },
  readAllText: { ...typography.bodySmall, color: colors.accent, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { ...typography.h3, color: colors.text.primary },
  emptyText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  itemUnread: { backgroundColor: '#F0F8FF' },
  unreadDot: {
    position: 'absolute',
    left: 5,
    top: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  textBlock: { flex: 1, gap: 4 },
  text: { ...typography.body, color: colors.text.primary, lineHeight: 20 },
  actor: { fontWeight: '700' },
  action: { color: colors.text.secondary },
  preview: { color: colors.text.secondary, fontStyle: 'italic' },
  time: { ...typography.caption, color: colors.text.secondary },
});
