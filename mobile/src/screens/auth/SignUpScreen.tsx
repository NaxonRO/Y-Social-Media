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
  navigation: NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;
};

type FormData = {
  email: string;
  username: string;
  password: string;
};

export default function SignUpScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { email: '', username: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await register(data.email.toLowerCase().trim(), data.username.toLowerCase().trim(), data.password);
    } catch (err: unknown) {
      const apiErrors = (err as { response?: { data?: { errors?: Record<string, string>; message?: string } } })
        ?.response?.data;
      const message = apiErrors?.message || 'A apărut o eroare. Încearcă din nou.';
      Alert.alert('Eroare la înregistrare', message);
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
        <Text style={styles.title}>Creează-ți contul</Text>

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
            name="username"
            rules={{
              required: 'Username-ul este obligatoriu',
              minLength: { value: 3, message: 'Minim 3 caractere' },
              maxLength: { value: 30, message: 'Maxim 30 de caractere' },
              pattern: { value: /^[a-zA-Z0-9]+$/, message: 'Doar litere și cifre' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.field}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  placeholder="username123"
                  placeholderTextColor={colors.input.placeholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.username && (
                  <Text style={styles.errorText}>{errors.username.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Parola este obligatorie',
              minLength: { value: 8, message: 'Minim 8 caractere' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.field}>
                <Text style={styles.label}>Parolă</Text>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Minim 8 caractere"
                  placeholderTextColor={colors.input.placeholder}
                  secureTextEntry
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
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={styles.buttonText}>Creează cont</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            Prin înregistrare, ești de acord cu Termenii și Condițiile aplicației Y.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ai deja cont? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.linkText}>Intră în cont</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: 28,
    textAlign: 'center',
  },
  form: {
    gap: 4,
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
  button: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.label,
    color: colors.text.inverse,
    fontSize: 16,
  },
  terms: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
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
