import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const MAX_CHARS = 280;

export default function ComposeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const inputRef = useRef<TextInput>(null);
  const remaining = MAX_CHARS - content.length;
  const canPost = content.trim().length > 0 && remaining >= 0;

  const counterColor =
    remaining < 0 ? colors.error : remaining < 20 ? '#FFAD1F' : colors.text.disabled;

  const handlePost = () => {
    if (!canPost) return;
    setContent('');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Anulează</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
            onPress={handlePost}
            disabled={!canPost}
          >
            <Text style={[styles.postBtnText, !canPost && styles.postBtnTextDisabled]}>
              Postează
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.flex} keyboardShouldPersistTaps="handled">
          <View style={styles.composeRow}>
            {user && <Avatar username={user.username} size={44} />}
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Ce se întâmplă?"
                placeholderTextColor={colors.input.placeholder}
                value={content}
                onChangeText={setContent}
                multiline
                autoFocus
                maxLength={MAX_CHARS + 50}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.hashtagRow}>
            <Ionicons name="earth-outline" size={16} color={colors.accent} />
            <Text style={styles.audienceText}>Toată lumea poate răspunde</Text>
          </View>
          <View style={styles.divider} />
        </ScrollView>

        <View style={styles.toolbar}>
          <View style={styles.toolbarLeft}>
            <TouchableOpacity style={styles.toolBtn}>
              <Ionicons name="image-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}>
              <Ionicons name="gift-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}>
              <Ionicons name="stats-chart-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}>
              <Ionicons name="happy-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}>
              <Ionicons name="location-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
          </View>

          <View style={styles.counterContainer}>
            {content.length > 200 && (
              <Text style={[styles.counter, { color: counterColor }]}>{remaining}</Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
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
  cancelBtn: {
    paddingVertical: 4,
  },
  cancelText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  postBtn: {
    backgroundColor: colors.text.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnDisabled: {
    backgroundColor: colors.text.disabled,
  },
  postBtnText: {
    ...typography.label,
    color: '#fff',
  },
  postBtnTextDisabled: {
    color: '#fff',
  },
  composeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    ...typography.h3,
    fontWeight: '400',
    color: colors.text.primary,
    minHeight: 120,
    fontSize: 18,
    lineHeight: 26,
  },
  hashtagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 6,
  },
  audienceText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  toolbarLeft: {
    flexDirection: 'row',
    gap: 4,
  },
  toolBtn: {
    padding: 8,
  },
  counterContainer: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
  counter: {
    ...typography.body,
    fontWeight: '600',
  },
});
