import React, { useState } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const MAX_BIO = 160;
const MAX_NAME = 100;

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    displayName !== (user?.display_name ?? '') || bio !== (user?.bio ?? '');

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;
    setIsSaving(true);
    try {
      const updated = await authService.updateProfile({
        display_name: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      updateUser(updated);
      navigation.goBack();
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut salva profilul. Incearca din nou.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Editează profilul</Text>
          <TouchableOpacity
            style={[styles.saveBtn, (!hasChanges || isSaving) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Salvează</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.flex} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarSection}>
            <View style={styles.coverPlaceholder} />
            <View style={styles.avatarRow}>
              <View style={styles.avatarWrapper}>
                {user && <Avatar username={user.username} size={72} />}
              </View>
              <TouchableOpacity style={styles.changePhotoBtn}>
                <Ionicons name="camera" size={18} color={colors.accent} />
                <Text style={styles.changePhotoText}>Schimbă poza</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Nume afișat</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Cum vrei să fii cunoscut"
                placeholderTextColor={colors.input.placeholder}
                maxLength={MAX_NAME}
              />
              <Text style={styles.charCount}>{displayName.length}/{MAX_NAME}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.field}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Spune ceva despre tine"
                placeholderTextColor={colors.input.placeholder}
                multiline
                maxLength={MAX_BIO}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, bio.length > MAX_BIO - 20 && styles.charCountWarn]}>
                {bio.length}/{MAX_BIO}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.field}>
              <Text style={styles.label}>Username</Text>
              <Text style={styles.staticValue}>@{user?.username}</Text>
              <Text style={styles.hint}>Username-ul nu poate fi schimbat în această versiune</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.staticValue}>{user?.email}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutRow} onPress={async () => {
            const { logout } = require('../context/AuthContext').useAuth?.() ?? {};
          }}>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelBtn: { padding: 4 },
  title: { ...typography.h3, color: colors.text.primary },
  saveBtn: {
    backgroundColor: colors.text.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: colors.text.disabled },
  saveBtnText: { ...typography.label, color: '#fff' },
  avatarSection: { backgroundColor: colors.background },
  coverPlaceholder: { height: 90, backgroundColor: colors.surface },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -36,
    marginBottom: 16,
  },
  avatarWrapper: {
    borderWidth: 4,
    borderColor: colors.background,
    borderRadius: 40,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  changePhotoText: { ...typography.label, fontSize: 13, color: colors.accent },
  form: { paddingHorizontal: 16 },
  field: { paddingVertical: 14 },
  label: { ...typography.caption, color: colors.text.secondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { ...typography.body, color: colors.text.primary, paddingVertical: 4 },
  bioInput: { minHeight: 80, lineHeight: 22 },
  charCount: { ...typography.caption, color: colors.text.disabled, textAlign: 'right', marginTop: 4 },
  charCountWarn: { color: '#FFAD1F' },
  staticValue: { ...typography.body, color: colors.text.primary, paddingVertical: 4 },
  hint: { ...typography.caption, color: colors.text.disabled, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border },
  logoutRow: { height: 0 },
});
