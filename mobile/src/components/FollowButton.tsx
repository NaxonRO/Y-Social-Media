import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFollow } from '../context/FollowContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface Props {
  userId: string;
  size?: 'small' | 'normal';
}

export default function FollowButton({ userId, size = 'normal' }: Props) {
  const { user } = useAuth();
  const { isFollowing, follow, unfollow } = useFollow();
  const [loading, setLoading] = React.useState(false);

  // Nu afisa butonul pentru propriul profil
  if (!user || user.id === userId) return null;

  const following = isFollowing(userId);

  const handlePress = async () => {
    setLoading(true);
    try {
      if (following) await unfollow(userId);
      else await follow(userId);
    } finally {
      setLoading(false);
    }
  };

  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        following ? styles.btnFollowing : styles.btnFollow,
        isSmall && styles.btnSmall,
      ]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={following ? colors.text.primary : '#fff'} />
      ) : (
        <Text style={[styles.text, following ? styles.textFollowing : styles.textFollow, isSmall && styles.textSmall]}>
          {following ? 'Urmărești' : 'Urmărește'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFollow: {
    backgroundColor: colors.text.primary,
  },
  btnFollowing: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  btnSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 70,
  },
  text: { ...typography.label, fontSize: 14 },
  textFollow: { color: '#fff' },
  textFollowing: { color: colors.text.primary },
  textSmall: { fontSize: 13 },
});
