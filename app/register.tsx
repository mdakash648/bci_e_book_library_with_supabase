import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
// Removed OTP verification flow
import { supabase } from '@/lib/supabase';

const RegisterScreen = () => {
  const { theme } = useTheme();
  const colors = Colors[theme];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
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

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          Alert.alert('Rate Limited', 'Too many registration attempts. Please wait a few minutes before trying again.');
        } else {
          Alert.alert('Registration Error', error.message);
        }
        return;
      }

      if (data.user) {
        // Try to sign the user in immediately (works if email confirmation is not required)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!signInError && signInData.user) {
          Alert.alert('Welcome!', 'Your account is ready.', [
            { text: 'OK', onPress: () => router.replace('/(tabs)') },
          ]);
          return;
        }

        // Fallback to login screen if immediate sign-in is not allowed
        Alert.alert(
          'Account Created',
          'You can now sign in to your account.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/login'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
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

      Alert.alert('Google Sign-In', 'Please complete the sign-in process in your browser.');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Google sign-in error:', error);
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
            Create Account
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Join BCI Library and start exploring
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form} lightColor="transparent" darkColor="transparent">
          <ThemedView style={styles.inputContainer} lightColor="transparent" darkColor="transparent">
            <Ionicons name="person" size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: '#000000' }]}
              placeholder="Full Name"
              placeholderTextColor="#666666"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </ThemedView>

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

          <ThemedView style={styles.inputContainer} lightColor="transparent" darkColor="transparent">
            <Ionicons name="lock-closed" size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: '#000000' }]}
              placeholder="Confirm Password"
              placeholderTextColor="#666666"
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
                color="#666666"
              />
            </TouchableOpacity>
          </ThemedView>

          <TouchableOpacity
            style={[
              styles.registerButton, 
              { 
                backgroundColor: loading ? '#CCCCCC' : '#007AFF',
                opacity: loading ? 0.7 : 1
              }
            ]}
            onPress={handleRegister}
            activeOpacity={0.8}
            disabled={loading}
          >
            <ThemedText style={styles.registerButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
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
        </ThemedView>

        <ThemedView style={styles.footer} lightColor="transparent" darkColor="transparent">
          <ThemedText style={styles.footerText}>Already have an account? </ThemedText>
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
  registerButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  registerButtonText: {
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
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginTop: 16,
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
});

export default RegisterScreen;
