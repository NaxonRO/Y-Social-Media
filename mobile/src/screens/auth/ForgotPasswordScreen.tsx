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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { AuthStackParamList } from '../../types';
import { authService } from '../../services/authService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

type FormData = {
  email: string;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { email: '' } });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email.toLowerCase().trim());
      setSubmitted(true);
    } catch {
      // Always show success to avoid email enumeration
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={styles.successTitle}>Email trimis!</Text>
          <Text style={styles.successText}>
            Dacă adresa {getValues('email')} este asociată unui cont, vei primi un link de
            resetare a parolei în câteva minute.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.buttonText}>Înapoi la autentificare</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Înapoi</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Recuperare parolă</Text>
        <Text style={styles.subtitle}>
          Introdu adresa de email și îți vom trimite un link pentru a-ți reseta parola.
        </Text>

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

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={styles.buttonText}>Trimite link de resetare</Text>
            )}
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
  backButton: {
    marginBottom: 32,
  },
  backText: {
    ...typography.body,
    color: colors.accent,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: 12,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {},
  field: {
    marginBottom: 20,
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
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.label,
    color: colors.text.inverse,
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    fontSize: 56,
    marginBottom: 24,
  },
  successTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
});
