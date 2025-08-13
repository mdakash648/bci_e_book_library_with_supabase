import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect } from 'react';

const AuthCallback = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/login');
          return;
        }

        if (data.session) {
          // User is authenticated, redirect to main app
          router.push('/(tabs)');
        } else {
          // No session, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText>Processing authentication...</ThemedText>
    </ThemedView>
  );
};

export default AuthCallback;

