// Script to clear rate limit data
// Run this in your app's development environment

import AsyncStorage from '@react-native-async-storage/async-storage';

const clearAllRateLimits = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const rateLimitKeys = keys.filter(key => key.includes('rate_limit_data'));
    
    if (rateLimitKeys.length > 0) {
      await AsyncStorage.multiRemove(rateLimitKeys);
      console.log('Rate limits cleared:', rateLimitKeys);
    } else {
      console.log('No rate limit data found');
    }
  } catch (error) {
    console.error('Error clearing rate limits:', error);
  }
};

// Export for use in your app
export { clearAllRateLimits };

// For immediate use in development
if (typeof window !== 'undefined') {
  window.clearRateLimits = clearAllRateLimits;
}

