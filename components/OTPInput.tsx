import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

export type OTPInputProps = {
	length?: number;
	onComplete: (otp: string) => void;
	onChange?: (otp: string) => void;
	onResend?: () => void;
	resendDisabled?: boolean;
	resendTimer?: number;
	disabled?: boolean;
};

const OTPInput = ({
	length = 6,
	onComplete,
	onChange,
	onResend,
	resendDisabled = false,
	resendTimer = 0,
	disabled = false,
}: OTPInputProps) => {
    const inputRefs = useRef<(TextInput | null)[]>([]);
	const [digits, setDigits] = useState<string[]>(() => Array.from({ length }, () => ''));

	useEffect(() => {
		setDigits(Array.from({ length }, () => ''));
	}, [length]);

	const otpValue = useMemo(() => digits.join(''), [digits]);

	useEffect(() => {
		// Call onChange whenever OTP value changes
		onChange?.(otpValue);
		
		// Call onComplete when OTP is fully entered
		if (otpValue.length === length && !otpValue.includes('')) {
			onComplete(otpValue);
		}
	}, [otpValue, length, onComplete, onChange]);

	const focusInput = (index: number) => {
		const ref = inputRefs.current[index];
		ref?.focus();
	};

	const handleChange = (text: string, index: number) => {
		const char = text.replace(/\D/g, '').slice(-1);
		setDigits((prev) => {
			const updated = [...prev];
			updated[index] = char;
			return updated;
		});

		if (char && index < length - 1) {
			focusInput(index + 1);
		}
	};

	const handleKeyPress = (e: any, index: number) => {
		if (e.nativeEvent.key === 'Backspace') {
			setDigits((prev) => {
				const updated = [...prev];
				if (updated[index]) {
					updated[index] = '';
					return updated;
				}
				if (index > 0) {
					updated[index - 1] = '';
					requestAnimationFrame(() => focusInput(index - 1));
				}
				return updated;
			});
		}
	};

	const canResend = !disabled && !resendDisabled && (resendTimer ?? 0) <= 0;

	return (
		<View>
			<View style={styles.inputsRow}>
				{Array.from({ length }).map((_, index) => (
					<TextInput
						key={index}
                    ref={(el: TextInput | null) => {
                        inputRefs.current[index] = el;
                    }}
						style={styles.inputBox}
						value={digits[index]}
						onChangeText={(t) => handleChange(t, index)}
						onKeyPress={(e) => handleKeyPress(e, index)}
						keyboardType="number-pad"
						returnKeyType="done"
						maxLength={1}
						textAlign="center"
						autoCapitalize="none"
						autoCorrect={false}
						editable={!disabled}
					/>
				))}
			</View>

			{onResend && (
				<View style={styles.resendRow}>
					<ThemedText style={{ color: '#333333', marginRight: 6 }}>Didn't get a code?</ThemedText>
					<TouchableOpacity disabled={!canResend} onPress={onResend} activeOpacity={0.7}>
						<ThemedText
							style={{
								color: canResend ? '#007AFF' : '#666666',
								fontWeight: '600',
							}}
						>
							{canResend ? 'Resend' : `Resend in ${resendTimer}s`}
						</ThemedText>
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	inputsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	inputBox: {
		width: 48,
		height: 56,
		borderRadius: 12,
		borderWidth: 1,
		marginHorizontal: 4,
		fontSize: 20,
		backgroundColor: '#F8F9FA',
		borderColor: '#E0E0E0',
		color: '#000000',
	},
	resendRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 14,
	},
});

export default OTPInput;


