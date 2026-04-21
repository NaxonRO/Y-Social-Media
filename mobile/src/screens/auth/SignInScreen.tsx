import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;
};

type FormData = {
  email: string;
  password: string;
};

export default function SignInScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await login(data.email.toLowerCase().trim(), data.password);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'A apărut o eroare. Încearcă din nou.';
      Alert.alert('Eroare la autentificare', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.logo}>Y</Text>
        <Text style={styles.title}>Intră în cont</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email-ul este obligatoriu',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Email invalid' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="email@exemplu.ro"
                  placeholderTextColor={colors.input.placeholder}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{ required: 'Parola este obligatorie' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.field}>
                <Text style={styles.label}>Parolă</Text>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Parola ta"
                  placeholderTextColor={colors.input.placeholder}
                  secureTextEntry
                  autoComplete="password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )}
              </View>
            )}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
          >
            <Text style={styles.linkText}>Ai uitat parola?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={styles.buttonText}>Intră în cont</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Nu ai cont? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.linkText}>Înregistrează-te</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 32,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    gap: 8,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: 6,
  },
  input: {
    height: 52,
    backgroundColor: colors.input.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.input.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  button: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.label,
    color: colors.text.inverse,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  linkText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
});
