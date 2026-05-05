import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/PostCard';
import { formatRelativeTime } from '../data/mockData';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type NotifType = 'like' | 'comment' | 'repost' | 'follow' | 'mention';

interface Notification {
  id: string;
  type: NotifType;
  actor_username: string;
  actor_display: string;
  is_verified: boolean;
  preview?: string;
  is_read: boolean;
  created_at: string;
}

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'like',
    actor_username: 'elena_startup',
    actor_display: 'Elena Marinescu',
    is_verified: true,
    preview: 'TypeScript strict mode la inceput: 😤',
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'n2',
    type: 'follow',
    actor_username: 'mihai_foto',
    actor_display: 'Mihai Dumitrescu',
    is_verified: false,
    is_read: false,
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'n3',
    type: 'repost',
    actor_username: 'vlad_tech',
    actor_display: 'Vlad Constantin',
    is_verified: false,
    preview: 'TypeScript strict mode la inceput: 😤',
    is_read: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n4',
    type: 'comment',
    actor_username: 'maria_ux',
    actor_display: 'Maria Ionescu',
    is_verified: false,
    preview: 'Felicitari! Meritati tot succesul 🎉',
    is_read: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n5',
    type: 'mention',
    actor_username: 'elena_startup',
    actor_display: 'Elena Marinescu',
    is_verified: true,
    preview: 'Cautam React Native developer... @andrei_dev',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const notifConfig: Record<NotifType, { icon: string; color: string; label: string }> = {
  like: { icon: 'heart', color: '#E0245E', label: 'a dat like la postarea ta' },
  comment: { icon: 'chatbubble', color: colors.accent, label: 'a răspuns la postarea ta' },
  repost: { icon: 'repeat', color: '#17BF63', label: 'a repostat postarea ta' },
  follow: { icon: 'person-add', color: '#794BC4', label: 'a început să te urmărească' },
  mention: { icon: 'at', color: colors.accent, label: 'te-a menționat' },
};

type FilterTab = 'Toate' | 'Mențiuni';

export default function NotificationsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Toate');

  const filtered =
    activeFilter === 'Toate'
      ? mockNotifications
      : mockNotifications.filter((n) => n.type === 'mention');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificări</Text>
        <TouchableOpacity>
          <Ionicons name="options-outline" size={22} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {(['Toate', 'Mențiuni'] as FilterTab[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotifItem notif={item} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={48} color={colors.text.disabled} />
            <Text style={styles.emptyTitle}>Nicio notificare</Text>
            <Text style={styles.emptyText}>Când cineva interacționează cu tine, vei vedea aici.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function NotifItem({ notif }: { notif: Notification }) {
  const cfg = notifConfig[notif.type];
  return (
    <TouchableOpacity style={[styles.notifItem, !notif.is_read && styles.notifUnread]}>
      {!notif.is_read && <View style={styles.unreadDot} />}
      <View style={[styles.iconCircle, { backgroundColor: `${cfg.color}20` }]}>
        <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Avatar username={notif.actor_username} size={32} />
        </View>
        <Text style={styles.notifText} numberOfLines={2}>
          <Text style={styles.notifActor}>{notif.actor_display} </Text>
          {notif.is_verified && (
            <Ionicons name="checkmark-circle" size={13} color={colors.accent} />
          )}
          <Text style={styles.notifAction}>{cfg.label}</Text>
          {notif.preview && (
            <Text style={styles.notifPreview}>{': ' + notif.preview}</Text>
          )}
        </Text>
        <Text style={styles.notifTime}>{formatRelativeTime(notif.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  filters: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  filterBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.text.primary,
  },
  filterText: {
    ...typography.label,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.primary,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  notifUnread: {
    backgroundColor: '#F0F8FF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    position: 'absolute',
    left: 6,
    top: 20,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
    gap: 6,
  },
  notifHeader: {
    flexDirection: 'row',
  },
  notifText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 20,
  },
  notifActor: {
    fontWeight: '700',
  },
  notifAction: {
    color: colors.text.secondary,
  },
  notifPreview: {
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  notifTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
