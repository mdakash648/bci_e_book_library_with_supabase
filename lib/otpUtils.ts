import AsyncStorage from '@react-native-async-storage/async-storage';

interface OTPData {
	email: string;
	type: 'register' | 'reset';
	password?: string;
	session?: any;
}

const OTP_STORAGE_KEY = 'otp_verification_data';

export const storeOTPData = async (data: OTPData): Promise<void> => {
	try {
		await AsyncStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(data));
	} catch (error) {
		console.error('Error storing OTP data:', error);
	}
};

export const getOTPData = async (): Promise<OTPData | null> => {
	try {
		const data = await AsyncStorage.getItem(OTP_STORAGE_KEY);
		return data ? JSON.parse(data) : null;
	} catch (error) {
		console.error('Error getting OTP data:', error);
		return null;
	}
};

export const clearOTPData = async (): Promise<void> => {
	try {
		await AsyncStorage.removeItem(OTP_STORAGE_KEY);
	} catch (error) {
		console.error('Error clearing OTP data:', error);
	}
};


