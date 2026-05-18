import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../components/PostCard';
import { Avatar } from '../components/PostCard';
import { mockPosts } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { postService } from '../services/postService';
import { useFollow } from '../context/FollowContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MainStackParamList, Post } from '../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function FeedScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { isLoaded, registerPosts } = usePosts();
  const { followingIds } = useFollow();
  const flatListRef = useRef<FlatList>(null);

  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');
  const [realPosts, setRealPosts] = useState<Post[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Reload feed cand se schimba tab-ul
  useEffect(() => {
    setRealPosts([]);
    setNextCursor(null);
    setIsLoadingFeed(true);
    loadFeed(undefined, activeTab === 'following');
  }, [activeTab]);

  const loadFeed = useCallback(async (cursor?: string, followingOnly = false) => {
    try {
      const { posts, nextCursor: nc } = await postService.getFeed(cursor, followingOnly);
      if (cursor) {
        setRealPosts((prev) => [...prev, ...posts]);
      } else {
        setRealPosts(posts);
      }
      registerPosts(posts);
      setNextCursor(nc);
    } catch {
      // daca backend-ul nu e accesibil, afisam doar mock-urile
    } finally {
      setIsLoadingFeed(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadFeed();
  }, [loadFeed]));

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const handleLoadMore = () => {
    if (loadingMore || !nextCursor) return;
    setLoadingMore(true);
    loadFeed(nextCursor);
  };

  const handleDeletePost = (postId: string) => {
    const doDelete = async () => {
      try {
        await postService.deletePost(postId);
        setRealPosts((prev) => prev.filter((p) => p.id !== postId));
      } catch {
        if (Platform.OS === 'web') {
          window.alert('Nu s-a putut șterge postarea.');
        } else {
          Alert.alert('Eroare', 'Nu s-a putut șterge postarea.');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Ștergi această postare?')) doDelete();
    } else {
      Alert.alert('Șterge postarea', 'Ești sigur?', [
        { text: 'Anulează', style: 'cancel' },
        { text: 'Șterge', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const handlePostPress = (post: Post) =>
    navigation.navigate('PostDetail', { postId: post.id, post });

  // tab "Urmărești": doar posturi reale; tab "Pentru tine": reale + mock fallback
  const realIds = new Set(realPosts.map((p) => p.id));
  const allPosts = activeTab === 'following'
    ? realPosts
    : [...realPosts, ...mockPosts.filter((p) => !realIds.has(p.id))];

  if (!isLoaded || isLoadingFeed) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color={colors.text.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        {user ? <Avatar username={user.username} size={34} /> : <View style={styles.avatarPlaceholder} />}
        <TouchableOpacity onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}>
          <Text style={styles.logo}>Y</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sparkleBtn}>
          <Ionicons name="sparkles-outline" size={22} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={allPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => handlePostPress(item)}
            currentUserId={user?.id}
            onDelete={item.user_id === user?.id ? () => handleDeletePost(item.id) : undefined}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<TabsBar activeTab={activeTab} onTabChange={setActiveTab} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.text.primary} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.text.secondary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function TabsBar({ activeTab, onTabChange }: { activeTab: 'forYou' | 'following'; onTabChange: (t: 'forYou' | 'following') => void }) {
  return (
    <View style={styles.feedTabs}>
      <TouchableOpacity style={[styles.feedTab, activeTab === 'forYou' && styles.feedTabActive]} onPress={() => onTabChange('forYou')}>
        <Text style={[styles.feedTabText, activeTab === 'forYou' && styles.feedTabTextActive]}>Pentru tine</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.feedTab, activeTab === 'following' && styles.feedTabActive]} onPress={() => onTabChange('following')}>
        <Text style={[styles.feedTabText, activeTab === 'following' && styles.feedTabTextActive]}>Urmărești</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  avatarPlaceholder: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.border },
  logo: { fontSize: 30, fontWeight: '900', color: colors.text.primary, letterSpacing: -1 },
  sparkleBtn: { width: 34, alignItems: 'flex-end' },
  feedTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  feedTab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  feedTabActive: { borderBottomWidth: 2, borderBottomColor: colors.text.primary },
  feedTabText: { ...typography.label, color: colors.text.secondary },
  feedTabTextActive: { color: colors.text.primary },
  footerLoader: { paddingVertical: 20, alignItems: 'center' },
});
