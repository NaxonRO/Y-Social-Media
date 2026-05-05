import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PostCard from '../components/PostCard';
import { Avatar } from '../components/PostCard';
import { mockPosts, formatCount } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MainStackParamList, Post } from '../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;
type ProfileTab = 'Postări' | 'Răspunsuri' | 'Media' | 'Like-uri';
const TABS: ProfileTab[] = ['Postări', 'Răspunsuri', 'Media', 'Like-uri'];

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const { likedPostIds, repostedPostIds, commentedPostIds } = usePosts();
  const [activeTab, setActiveTab] = useState<ProfileTab>('Postări');

  const repostedPosts = mockPosts.filter((p) => repostedPostIds.includes(p.id));
  const likedPosts    = mockPosts.filter((p) => likedPostIds.includes(p.id));
  const repliedPosts  = mockPosts.filter((p) => commentedPostIds.includes(p.id));

  const displayedPosts =
    activeTab === 'Postări'    ? repostedPosts :
    activeTab === 'Răspunsuri' ? repliedPosts  :
    activeTab === 'Like-uri'   ? likedPosts    : [];

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Ești sigur că vrei să ieși din cont?')) logout();
    } else {
      Alert.alert('Ieși din cont', 'Ești sigur că vrei să ieși?', [
        { text: 'Anulează', style: 'cancel' },
        { text: 'Ieși', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const handlePostPress = (post: Post) => navigation.navigate('PostDetail', { postId: post.id });

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={displayedPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} onPress={() => handlePostPress(item)} />
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <ProfileHeader
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onEdit={() => navigation.navigate('EditProfile')}
            onLogout={handleLogout}
          />
        }
        ListEmptyComponent={
          activeTab !== 'Postări' ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={40} color={colors.text.disabled} />
              <Text style={styles.emptyText}>Nicio postare aici</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function ProfileHeader({
  user,
  activeTab,
  setActiveTab,
  onEdit,
  onLogout,
}: {
  user: ReturnType<typeof useAuth>['user'];
  activeTab: ProfileTab;
  setActiveTab: (t: ProfileTab) => void;
  onEdit: () => void;
  onLogout: () => void;
}) {
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })
    : 'Aprilie 2026';

  return (
    <View>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Ionicons name="person-outline" size={22} color={colors.text.primary} />
          <Text style={styles.topBarTitle}>Profilul meu</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Ieși</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.coverPhoto} />

      <View style={styles.profileRow}>
        <View style={styles.avatarWrapper}>
          {user && <Avatar username={user.username} size={72} />}
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
          <Ionicons name="pencil-outline" size={16} color={colors.text.primary} />
          <Text style={styles.editBtnText}>Editează profilul</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.displayName}>
            {user?.display_name || user?.username || 'Utilizator'}
          </Text>
          {user?.is_verified && (
            <Ionicons name="checkmark-circle" size={18} color={colors.accent} style={styles.badge} />
          )}
        </View>
        <Text style={styles.username}>@{user?.username}</Text>

        {user?.bio ? (
          <Text style={styles.bio}>{user.bio}</Text>
        ) : (
          <TouchableOpacity onPress={onEdit}>
            <Text style={styles.addBio}>+ Adaugă o bio</Text>
          </TouchableOpacity>
        )}

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
          <Text style={styles.metaText}>  Înregistrat în {joinedDate}</Text>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statCount}>0</Text>
            <Text style={styles.statLabel}> Urmărești</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statItem, styles.statItemGap]}>
            <Text style={styles.statCount}>0</Text>
            <Text style={styles.statLabel}> Urmăritori</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topBarTitle: { ...typography.h3, color: colors.text.primary },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  logoutText: { ...typography.label, fontSize: 14, color: colors.error },
  coverPhoto: { height: 120, backgroundColor: colors.surface },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: -36,
    marginBottom: 12,
  },
  avatarWrapper: { borderWidth: 4, borderColor: colors.background, borderRadius: 40 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editBtnText: { ...typography.label, color: colors.text.primary, fontSize: 14 },
  profileInfo: { paddingHorizontal: 16, marginBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  displayName: { ...typography.h3, color: colors.text.primary },
  badge: { marginLeft: 4 },
  username: { ...typography.body, color: colors.text.secondary, marginBottom: 10 },
  bio: { ...typography.body, color: colors.text.primary, lineHeight: 22, marginBottom: 10 },
  addBio: { ...typography.body, color: colors.accent, marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  metaText: { ...typography.bodySmall, color: colors.text.secondary },
  statsRow: { flexDirection: 'row' },
  statItem: { flexDirection: 'row' },
  statItemGap: { marginLeft: 16 },
  statCount: { ...typography.label, color: colors.text.primary, fontSize: 14 },
  statLabel: { ...typography.bodySmall, color: colors.text.secondary },
  tabsRow: { borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { paddingHorizontal: 20, paddingVertical: 14, minWidth: 80, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.text.primary },
  tabText: { ...typography.label, color: colors.text.secondary },
  tabTextActive: { color: colors.text.primary },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { ...typography.body, color: colors.text.secondary },
});
