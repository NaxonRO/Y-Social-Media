import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../components/PostCard';
import FollowButton from '../components/FollowButton';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import { trendingHashtags as mockTrending } from '../data/mockData';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MainStackParamList, Post } from '../types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<Post[]>([]);
  const [trending, setTrending] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Incarca trending hashtags la pornire
  useEffect(() => {
    postService.getTrendingHashtags()
      .then(setTrending)
      .catch(() => {
        // fallback la mock-uri daca backend-ul nu e disponibil
        setTrending(mockTrending.map(t => ({ tag: t.tag, count: t.posts })));
      });
  }, []);

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim().replace(/^#+/, ''); // eliminam # daca userul l-a pus
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const posts = await postService.searchByHashtag(trimmed);
      setResults(posts);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce la 600ms
  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(text), 600);
  };

  const handleTagPress = (tag: string) => {
    setQuery(`#${tag}`);
    setFocused(true);
    doSearch(tag);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  const displayTag = query.replace(/^#+/, '') || '';

  const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search bar */}
      <View style={styles.searchHeader}>
        <View style={[styles.searchBar, focused && styles.searchBarFocused]}>
          <Ionicons name="search" size={18} color={colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Caută #hashtag"
            placeholderTextColor={colors.input.placeholder}
            value={query}
            onChangeText={handleQueryChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={() => doSearch(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
        {focused && (
          <TouchableOpacity onPress={() => { setFocused(false); handleClear(); }} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Anulează</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.text.primary} />
        </View>
      ) : searched && results.length === 0 ? (
        /* Niciun rezultat */
        <View style={styles.center}>
          <Ionicons name="search-outline" size={48} color={colors.text.disabled} />
          <Text style={styles.emptyTitle}>Niciun rezultat pentru #{displayTag}</Text>
          <Text style={styles.emptyHint}>Încearcă un alt hashtag</Text>
        </View>
      ) : searched ? (
        /* Rezultate cautare */
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              currentUserId={user?.id}
            />
          )}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {results.length} {results.length === 1 ? 'postare' : 'postări'} cu #{displayTag}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        /* Trending + sugestii */
        <FlatList
          data={trending}
          keyExtractor={(item) => item.tag}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Tendințe</Text>
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.trendItem} onPress={() => handleTagPress(item.tag)}>
              <View style={styles.trendLeft}>
                <Text style={styles.trendRank}>{index + 1}</Text>
                <View>
                  <Text style={styles.trendTag}>#{item.tag}</Text>
                  <Text style={styles.trendCount}>{formatCount(item.count)} postări</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.disabled} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyHint}>Niciun hashtag trending încă.</Text>
              <Text style={styles.emptyHint}>Postează ceva cu #tag!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchBarFocused: { borderColor: colors.accent, backgroundColor: colors.background },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, ...typography.body, color: colors.text.primary },
  cancelBtn: { paddingVertical: 4 },
  cancelText: { ...typography.body, color: colors.accent, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  emptyTitle: { ...typography.h3, color: colors.text.primary, textAlign: 'center' },
  emptyHint: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trendLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  trendRank: { ...typography.body, color: colors.text.secondary, width: 20, textAlign: 'center' },
  trendTag: { ...typography.label, color: colors.text.primary },
  trendCount: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultsTitle: { ...typography.label, color: colors.text.secondary },
});
