import React, { useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../components/PostCard';
import { Avatar } from '../components/PostCard';
import { mockPosts } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MainStackParamList, Post } from '../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function FeedScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { isLoaded } = usePosts();
  const flatListRef = useRef<FlatList>(null);

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.text.primary} />
      </SafeAreaView>
    );
  }

  const handlePostPress = (post: Post) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        {user ? (
          <Avatar username={user.username} size={34} />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <TouchableOpacity onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}>
          <Text style={styles.logo}>Y</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sparkleBtn}>
          <Ionicons name="sparkles-outline" size={22} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={mockPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} onPress={() => handlePostPress(item)} />
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<TabsBar />}
      />
    </SafeAreaView>
  );
}

function TabsBar() {
  return (
    <View style={styles.feedTabs}>
      <View style={[styles.feedTab, styles.feedTabActive]}>
        <Text style={[styles.feedTabText, styles.feedTabTextActive]}>Pentru tine</Text>
      </View>
      <View style={styles.feedTab}>
        <Text style={styles.feedTabText}>Urmărești</Text>
      </View>
    </View>
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  avatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.border,
  },
  logo: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  sparkleBtn: {
    width: 34,
    alignItems: 'flex-end',
  },
  feedTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  feedTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  feedTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.text.primary,
  },
  feedTabText: {
    ...typography.label,
    color: colors.text.secondary,
  },
  feedTabTextActive: {
    color: colors.text.primary,
  },
});
