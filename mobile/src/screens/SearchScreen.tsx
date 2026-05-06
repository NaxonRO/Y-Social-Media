import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/PostCard';
import { trendingHashtags, suggestedUsers } from '../data/mockData';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={[styles.searchBar, focused && styles.searchBarFocused]}>
          <Ionicons name="search" size={18} color={colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Caută pe Y"
            placeholderTextColor={colors.input.placeholder}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
        {focused && (
          <TouchableOpacity onPress={() => { setQuery(''); setFocused(false); }} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Anulează</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tendințe în România</Text>
          {trendingHashtags.map((item, index) => (
            <TouchableOpacity key={item.tag} style={styles.trendItem}>
              <View style={styles.trendLeft}>
                <Text style={styles.trendRank}>{index + 1}</Text>
                <View>
                  <Text style={styles.trendTag}>#{item.tag}</Text>
                  <Text style={styles.trendCount}>
                    {item.posts >= 1000
                      ? `${(item.posts / 1000).toFixed(1)}k postări`
                      : `${item.posts} postări`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cine să urmărești</Text>
          {suggestedUsers.map((u) => (
            <View key={u.id} style={styles.userItem}>
              <Avatar username={u.username} size={44} />
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userDisplay}>{u.display_name ?? u.username}</Text>
                  {u.is_verified && (
                    <Ionicons name="checkmark-circle" size={15} color={colors.accent} style={styles.badge} />
                  )}
                </View>
                <Text style={styles.userHandle}>@{u.username}</Text>
                {u.bio ? (
                  <Text style={styles.userBio} numberOfLines={1}>{u.bio}</Text>
                ) : null}
              </View>
              <TouchableOpacity style={styles.followBtn}>
                <Text style={styles.followBtnText}>Urmărește</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.showMore}>
            <Text style={styles.showMoreText}>Arată mai mult</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
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
  searchBarFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.background,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
  },
  cancelBtn: {
    paddingVertical: 4,
  },
  cancelText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  section: {
    borderBottomWidth: 8,
    borderBottomColor: colors.surface,
    paddingBottom: 4,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  trendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  trendRank: {
    ...typography.body,
    color: colors.text.secondary,
    width: 16,
    textAlign: 'center',
  },
  trendTag: {
    ...typography.label,
    color: colors.text.primary,
  },
  trendCount: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badge: {},
  userDisplay: {
    ...typography.label,
    fontSize: 14,
    color: colors.text.primary,
  },
  userHandle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  userBio: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: colors.text.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  followBtnText: {
    ...typography.label,
    fontSize: 13,
    color: '#fff',
  },
  showMore: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  showMoreText: {
    ...typography.body,
    color: colors.accent,
  },
});
