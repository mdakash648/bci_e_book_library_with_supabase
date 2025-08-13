import AsyncStorage from '@react-native-async-storage/async-storage';

interface RateLimitData {
  lastRequest: number;
  requestCount: number;
  blockedUntil?: number;
}

const RATE_LIMIT_KEY = 'rate_limit_data';
const MAX_REQUESTS_PER_MINUTE = 3;
const BLOCK_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const checkRateLimit = async (action: string): Promise<{ allowed: boolean; waitTime?: number }> => {
  try {
    const key = `${RATE_LIMIT_KEY}_${action}`;
    const data = await AsyncStorage.getItem(key);
    const now = Date.now();
    
    if (!data) {
      // First request
      await AsyncStorage.setItem(key, JSON.stringify({
        lastRequest: now,
        requestCount: 1
      }));
      return { allowed: true };
    }
    
    const rateLimitData: RateLimitData = JSON.parse(data);
    
    // Check if currently blocked
    if (rateLimitData.blockedUntil && now < rateLimitData.blockedUntil) {
      return { 
        allowed: false, 
        waitTime: Math.ceil((rateLimitData.blockedUntil - now) / 1000) 
      };
    }
    
    // Reset if more than 1 minute has passed
    if (now - rateLimitData.lastRequest > 60 * 1000) {
      await AsyncStorage.setItem(key, JSON.stringify({
        lastRequest: now,
        requestCount: 1
      }));
      return { allowed: true };
    }
    
    // Check if within rate limit
    if (rateLimitData.requestCount < MAX_REQUESTS_PER_MINUTE) {
      await AsyncStorage.setItem(key, JSON.stringify({
        lastRequest: now,
        requestCount: rateLimitData.requestCount + 1
      }));
      return { allowed: true };
    }
    
    // Rate limit exceeded, block for 5 minutes
    const blockedUntil = now + BLOCK_DURATION;
    await AsyncStorage.setItem(key, JSON.stringify({
      lastRequest: now,
      requestCount: rateLimitData.requestCount + 1,
      blockedUntil
    }));
    
    return { 
      allowed: false, 
      waitTime: Math.ceil(BLOCK_DURATION / 1000) 
    };
    
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true }; // Allow if there's an error
  }
};

export const clearRateLimit = async (action: string): Promise<void> => {
  try {
    const key = `${RATE_LIMIT_KEY}_${action}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Clear rate limit error:', error);
  }
};

export const formatWaitTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

