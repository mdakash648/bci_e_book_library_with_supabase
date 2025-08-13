import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';

const LoginScreen = () => {
  const { theme } = useTheme();
  const colors = Colors[theme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert('Login Error', error.message);
        return;
      }

      if (data.user) {
        Alert.alert('Success', 'Login successful!');
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      });

      if (error) {
        Alert.alert('Google Sign-In Error', error.message);
        return;
      }

      // Google OAuth will redirect to browser, so we show a message
      Alert.alert('Google Sign-In', 'Please complete the sign-in process in your browser.');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Google sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => router.push('/register');
  const navigateToForgot = () => router.push('/forgot');

  return (
    <ThemedView style={styles.container} lightColor="#fff" darkColor="#fff">
      <ThemedView style={styles.header} lightColor="transparent" darkColor="transparent">
        <ThemedText type="title" style={styles.title}>
          Welcome Back
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Sign in to your BCI Library account sdf
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.form} lightColor="transparent" darkColor="transparent">
        <ThemedView style={styles.inputContainer} lightColor="transparent" darkColor="transparent">
          <Ionicons name="mail" size={20} color="#666666" style={styles.inputIcon} />
                      <TextInput
              style={[styles.input, { color: '#000000' }]}
              placeholder="Email"
              placeholderTextColor="#666666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
        </ThemedView>

        <ThemedView style={styles.inputContainer} lightColor="transparent" darkColor="transparent">
          <Ionicons name="lock-closed" size={20} color="#666666" style={styles.inputIcon} />
                      <TextInput
              style={[styles.input, { color: '#000000' }]}
              placeholder="Password"
              placeholderTextColor="#666666"
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
              color="#666666"
            />
          </TouchableOpacity>
        </ThemedView>

        <TouchableOpacity
          style={[
            styles.loginButton, 
            { 
              backgroundColor: loading ? '#CCCCCC' : '#007AFF',
              opacity: loading ? 0.7 : 1
            }
          ]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          <ThemedText style={styles.loginButtonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.googleButton,
            { opacity: loading ? 0.7 : 1 }
          ]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.googleIcon} />
          <ThemedText style={styles.googleButtonText}>
            {loading ? 'Signing In...' : 'Continue with Google'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={navigateToForgot}
        >
          <ThemedText style={[styles.forgotPasswordText, { color: '#007AFF' }]}>
            Forgot Password?
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.footer} lightColor="transparent" darkColor="transparent">
        <ThemedText style={styles.footerText}>Don't have an account? </ThemedText>
        <TouchableOpacity onPress={navigateToRegister}>
          <ThemedText style={[styles.signUpText, { color: '#007AFF' }]}>
            Sign Up
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
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
  loginButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginTop: 0,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 10,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
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
  signUpText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 0,
  },
});

export default LoginScreen;
