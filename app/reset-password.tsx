import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
// Removed OTP storage dependency
import { supabase } from '@/lib/supabase';

const ResetPasswordScreen = () => {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const params = useLocalSearchParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        router.push('/login');
        return;
      }
      setSessionReady(true);
    };
    checkSession();
  }, []);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (!sessionReady) return;

    setLoading(true);
    
    try {
      // Update the user's password
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        Alert.alert('Reset Error', error.message);
        return;
      }

      Alert.alert(
        'Password Updated!',
        'Your password has been successfully updated. You can now sign in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => router.push('/login');

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={navigateToLogin}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Set New Password
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Create a new password for your account
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          <ThemedView style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color={colors.icon} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="New Password"
              placeholderTextColor={colors.icon}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.icon}
              />
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color={colors.icon} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Confirm New Password"
              placeholderTextColor={colors.icon}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.icon}
              />
            </TouchableOpacity>
          </ThemedView>

          <TouchableOpacity
            style={[
              styles.resetButton, 
              { 
                backgroundColor: loading ? '#CCCCCC' : '#007AFF',
                opacity: loading ? 0.7 : 1
              }
            ]}
            onPress={handleResetPassword}
            activeOpacity={0.8}
            disabled={loading}
          >
            <ThemedText style={styles.resetButtonText}>
              {loading ? 'Updating Password...' : 'Update Password'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.text }]}>
            Remember your password?{' '}
          </ThemedText>
          <TouchableOpacity onPress={navigateToLogin}>
            <ThemedText style={[styles.signInText, { color: colors.tint }]}>
              Sign In
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  backButton: {
    marginTop: 20,
    padding: 8,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  resetButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  signInText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ResetPasswordScreen;
