/**
 * OTP Verification Screen - Production Ready
 * 
 * This component handles OTP verification for both registration and password reset flows.
 * It properly matches verification types with the authentication flow:
 * 
 * FLOWS SUPPORTED:
 * 1. Registration Flow (signUp):
 *    - Uses type 'signup' for verifyOtp()
 *    - Uses type 'signup' for resend()
 * 
 * 2. Password Reset Flow:
 *    - Uses type 'recovery' for verifyOtp()
 *    - Uses type 'recovery' for resend()
 * 
 * FEATURES:
 * - Auto-verification when 6 digits are entered
 * - Proper error handling for expired/invalid codes
 * - Rate limiting protection
 * - Session validation after verification
 * - Clean success/error messaging
 * - Production-ready logging
 * 
 * SUPABASE SETUP REQUIRED:
 * - Email confirmation enabled in Auth settings
 * - Email templates configured with {{ .Token }} variable
 * - Proper email provider configured (SMTP/SendGrid/etc.)
 */

import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import OTPInput from '@/components/OTPInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { clearOTPData, getOTPData } from '@/lib/otpUtils';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

const OTPVerificationScreen = () => {
	const { theme } = useTheme();
	const colors = Colors[theme];

	const [loading, setLoading] = useState(false);
	const [resendTimer, setResendTimer] = useState(0);
	const [resendDisabled, setResendDisabled] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const [enteredOtp, setEnteredOtp] = useState('');

	const [email, setEmail] = useState('');
	const [type, setType] = useState<'register' | 'reset'>('register');

	/**
	 * Validate OTP format
	 */
	const isValidOTP = (otp: string): boolean => {
		return /^\d{6}$/.test(otp);
	};

	useEffect(() => {
		const loadOTPData = async () => {
			const data = await getOTPData();
			if (data && data.email && data.type) {
				setEmail(data.email);
				setType(data.type);
			} else {
				Alert.alert('Error', 'No verification data found. Please try again.');
				router.push('/login');
			}
		};
		loadOTPData();
	}, []);

	useEffect(() => {
		if (resendTimer > 0) {
			const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
			return () => clearTimeout(timer);
		}
		setResendDisabled(false);
	}, [resendTimer]);

	/**
	 * Handle OTP verification with proper type matching
	 * - For signUp() flow: use type 'signup'
	 * - For signInWithOtp() flow: use type 'email'
	 */
	const handleVerify = async (otp: string) => {
		if (verifying) return;
		
		// Validate OTP format first
		if (!isValidOTP(otp)) {
			Alert.alert(
				'Invalid Format', 
				'Please enter a valid 6-digit verification code.',
				[{ text: 'OK' }]
			);
			return;
		}
		
		setVerifying(true);
		setLoading(true);
		
		try {
			console.log('🔐 Starting OTP verification:', { 
				email, 
				otp: otp.substring(0, 2) + '****', 
				flowType: type 
			});
			
			// Determine correct verification type based on registration flow
			const verificationType = type === 'register' ? 'signup' : 'recovery';
			
			console.log('📧 Using verification type:', verificationType);
			
			// Verify OTP with correct type
			const { data, error } = await supabase.auth.verifyOtp({
				email,
				token: otp,
				type: verificationType
			});
			
			console.log('✅ Verification response:', { 
				hasUser: !!data?.user, 
				hasSession: !!data?.session,
				error: error?.message 
			});
			
			// Handle verification errors
			if (error) {
				console.error('❌ Verification failed:', error.message);
				
				// Handle specific error cases
				if (error.message.toLowerCase().includes('expired')) {
					Alert.alert(
						'Code Expired', 
						'Your verification code has expired. Please request a new one.',
						[{ text: 'OK' }]
					);
				} else if (error.message.toLowerCase().includes('invalid') || 
						   error.message.toLowerCase().includes('token')) {
					Alert.alert(
						'Invalid Code', 
						'The verification code you entered is incorrect. Please try again.',
						[{ text: 'OK' }]
					);
				} else if (error.message.toLowerCase().includes('rate limit')) {
					Alert.alert(
						'Too Many Attempts', 
						'You have made too many verification attempts. Please wait before trying again.',
						[{ text: 'OK' }]
					);
				} else {
					Alert.alert('Verification Failed', error.message);
				}
				return;
			}
			
			// Check if verification was successful
			if (!data?.user && !data?.session) {
				console.error('❌ No user or session returned');
				Alert.alert(
					'Verification Error', 
					'Verification completed but no user session was created. Please try again.',
					[{ text: 'OK' }]
				);
				return;
			}
			
			console.log('🎉 Verification successful! User ID:', data.user?.id);
			
			// Fetch the latest session to ensure we have current auth state
			const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
			
			if (sessionError) {
				console.error('❌ Session fetch error:', sessionError);
				Alert.alert('Session Error', 'Failed to retrieve user session. Please try logging in.');
				router.push('/login');
				return;
			}
			
			if (!sessionData.session) {
				console.error('❌ No session found after verification');
				Alert.alert('Session Error', 'No active session found. Please try logging in.');
				router.push('/login');
				return;
			}
			
			console.log('✅ Session confirmed:', {
				userId: sessionData.session.user.id,
				email: sessionData.session.user.email,
				emailConfirmed: sessionData.session.user.email_confirmed_at
			});
			
			// Clear stored OTP data
			await clearOTPData();
			
			// Show success message and redirect
			Alert.alert(
				'🎉 Verification Successful!', 
				type === 'register' 
					? 'Your account has been verified successfully. Welcome!'
					: 'Your identity has been verified successfully.',
				[{ 
					text: 'Continue', 
					onPress: () => router.replace('/(tabs)') 
				}]
			);
			
		} catch (err) {
			console.error('💥 Verification exception:', err);
			Alert.alert(
				'Verification Error', 
				'An unexpected error occurred during verification. Please try again.',
				[{ text: 'OK' }]
			);
		} finally {
			setLoading(false);
			setVerifying(false);
		}
	};

	/**
	 * Handle resend OTP with proper type matching
	 * - For signUp() flow: use type 'signup'
	 * - For password reset flow: use resetPasswordForEmail() instead of resend()
	 * Note: resend() only supports 'signup' type in current Supabase version
	 */
	const handleResend = async () => {
		if (resendDisabled) return;
		
		setLoading(true);
		
		try {
			console.log('📤 Resending OTP for:', { email, flowType: type });
			
			let error = null;
			
			if (type === 'register') {
				// For registration, use resend with signup type
				console.log('📧 Using resend for signup flow');
				const result = await supabase.auth.resend({ 
					type: 'signup', 
					email 
				});
				error = result.error;
			} else {
				// For password reset, use resetPasswordForEmail
				console.log('📧 Using resetPasswordForEmail for reset flow');
				const result = await supabase.auth.resetPasswordForEmail(email);
				error = result.error;
			}
			
			if (error) {
				console.error('❌ Resend failed:', error.message);
				
				// Handle specific resend errors
				if (error.message.toLowerCase().includes('rate limit') || 
					error.message.toLowerCase().includes('too many requests')) {
					Alert.alert(
						'Rate Limited', 
						'You have requested too many codes. Please wait a few minutes before requesting another one.',
						[{ text: 'OK' }]
					);
					// Set a longer timer for rate limiting
					setResendTimer(300); // 5 minutes
					setResendDisabled(true);
				} else if (error.message.toLowerCase().includes('user not found')) {
					Alert.alert(
						'User Not Found', 
						'No user found with this email address. Please check your email or register a new account.',
						[{ text: 'OK' }]
					);
				} else {
					Alert.alert('Resend Failed', error.message);
				}
				return;
			}
			
			console.log('✅ OTP resent successfully');
			
			// Start resend cooldown timer (30 seconds for normal operation)
			const cooldownTime = 30;
			setResendTimer(cooldownTime);
			setResendDisabled(true);
			
			Alert.alert(
				'📧 Code Sent!', 
				`A new verification code has been sent to ${email}. Please check your inbox and spam folder.`,
				[{ text: 'OK' }]
			);
			
		} catch (err) {
			console.error('💥 Resend exception:', err);
			Alert.alert(
				'Resend Error', 
				'An unexpected error occurred while sending the code. Please try again later.',
				[{ text: 'OK' }]
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ThemedView style={styles.container} lightColor="#fff" darkColor="#fff">
			<TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
				<Ionicons name="arrow-back" size={24} color="#000000" />
			</TouchableOpacity>

			<ThemedView style={styles.content} lightColor="transparent" darkColor="transparent">
				<ThemedView style={styles.header} lightColor="transparent" darkColor="transparent">
					<ThemedText type="title" style={styles.title}>
						Verify Your Email
					</ThemedText>
					<ThemedText style={styles.subtitle}>
						We've sent a 6-digit code to {email}
					</ThemedText>
				</ThemedView>

				<ThemedView style={styles.otpContainer} lightColor="transparent" darkColor="transparent">
					<OTPInput
						length={6}
						onChange={(code) => {
							// Update entered OTP for button state
							setEnteredOtp(code);
						}}
						onComplete={(code) => {
							console.log('📱 OTP input completed:', code.length, 'digits');
							setEnteredOtp(code);
							// Auto-verify when 6 digits are entered
							handleVerify(code);
						}}
						onResend={handleResend}
						resendDisabled={resendDisabled}
						resendTimer={resendTimer}
						disabled={verifying || loading}
					/>
				</ThemedView>

				{loading && (
					<ThemedView style={styles.loadingContainer} lightColor="transparent" darkColor="transparent">
						<ThemedText style={[styles.loadingText, { color: '#333333' }]}>Verifying...</ThemedText>
					</ThemedView>
				)}

				{/* Create Account Button - only show for registration flow */}
				{type === 'register' && (
					<ThemedView style={styles.createAccountContainer} lightColor="transparent" darkColor="transparent">
						<TouchableOpacity
							style={[
								styles.createAccountButton,
								{ 
									opacity: (verifying || loading || !enteredOtp || enteredOtp.length !== 6) ? 0.5 : 1
								}
							]}
							onPress={() => {
								if (enteredOtp && enteredOtp.length === 6) {
									handleVerify(enteredOtp);
								} else {
									Alert.alert(
										'Enter Code', 
										'Please enter the complete 6-digit verification code.',
										[{ text: 'OK' }]
									);
								}
							}}
							activeOpacity={0.8}
							disabled={verifying || loading || !enteredOtp || enteredOtp.length !== 6}
						>
							<ThemedText style={styles.createAccountButtonText}>
								{verifying ? 'Creating Account...' : 'Create Account'}
							</ThemedText>
						</TouchableOpacity>
						
						<ThemedText style={styles.autoVerifyHint}>
							💡 Account will be created automatically when you enter the complete code
						</ThemedText>
					</ThemedView>
				)}
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
		position: 'absolute',
		top: 50,
		left: 20,
		zIndex: 1,
		padding: 8,
	},
	content: {
		flex: 1,
		padding: 20,
		justifyContent: 'center',
		alignItems: 'center',
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
	otpContainer: {
		marginBottom: 30,
	},
	loadingContainer: {
		alignItems: 'center',
		marginBottom: 20,
	},
	loadingText: {
		fontSize: 16,
		color: '#333333',
	},
	createAccountContainer: {
		marginTop: 20,
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	createAccountButton: {
		backgroundColor: '#007AFF',
		borderRadius: 12,
		paddingVertical: 14,
		paddingHorizontal: 32,
		marginBottom: 12,
		minWidth: 200,
		alignItems: 'center',
		justifyContent: 'center',
	},
	createAccountButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'center',
	},
	autoVerifyHint: {
		fontSize: 12,
		color: '#666666',
		textAlign: 'center',
		fontStyle: 'italic',
		paddingHorizontal: 10,
	},
});

export default OTPVerificationScreen;


