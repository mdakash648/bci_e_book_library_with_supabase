import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';

const ForgotPasswordScreen = () => {
  const { theme } = useTheme();
  const colors = Colors[theme];

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        Alert.alert('Reset Error', error.message);
        return;
      }

      Alert.alert(
        'Reset Link Sent',
        'If an account with this email exists, you will receive a password reset link shortly.',
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
    <ThemedView style={styles.container} lightColor="#fff" darkColor="#fff">
      <TouchableOpacity
        style={styles.backButton}
        onPress={navigateToLogin}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#000000" />
      </TouchableOpacity>
      
      <ThemedView style={styles.content} lightColor="transparent" darkColor="transparent">
        <ThemedView style={styles.header} lightColor="transparent" darkColor="transparent">
          <ThemedText type="title" style={styles.title}>
            Forgot Password?
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form} lightColor="transparent" darkColor="transparent">
          <ThemedView style={styles.inputContainer} lightColor="transparent" darkColor="transparent">
            <Ionicons name="mail" size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: '#000000' }]}
              placeholder="Enter your email"
              placeholderTextColor="#666666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.footer} lightColor="transparent" darkColor="transparent">
          <ThemedText style={styles.footerText}>Remember your password? </ThemedText>
          <TouchableOpacity onPress={navigateToLogin}>
            <ThemedText style={[styles.signInText, { color: '#007AFF' }]}>
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
    paddingTop: 60,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 20,
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
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#333333',
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
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 24,
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
  resetButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#333333',
  },
  signInText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
