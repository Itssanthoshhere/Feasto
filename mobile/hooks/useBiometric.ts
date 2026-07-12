import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_LOCK_KEY = 'feasto_biometric_lock';

export function useBiometric() {
  const [isLocked, setIsLocked] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  // Load user preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_LOCK_KEY);
      setIsBiometricEnabled(enabled === 'true');
      if (enabled === 'true') {
        setIsLocked(true); // Lock immediately on startup if enabled
      }
    };
    loadPreference();
  }, []);

  // Listen to AppState to lock when backgrounded
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (isBiometricEnabled && (nextAppState === 'background' || nextAppState === 'inactive')) {
        setIsLocked(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isBiometricEnabled]);

  // Handle the authentication prompt
  const promptAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      setIsLocked(false);
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access Feasto',
      fallbackLabel: 'Use Passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      setIsLocked(false);
    }
  };

  // Trigger prompt when locked
  useEffect(() => {
    if (isLocked) {
      promptAuth();
    }
  }, [isLocked]);

  const toggleBiometric = async (enable: boolean) => {
    if (enable) {
      // Prompt before enabling to ensure they can actually authenticate
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        throw new Error('Biometric authentication is not set up on this device.');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable App Lock',
      });

      if (!result.success) {
        throw new Error('Authentication failed');
      }
    }

    await SecureStore.setItemAsync(BIOMETRIC_LOCK_KEY, enable ? 'true' : 'false');
    setIsBiometricEnabled(enable);
  };

  return { isLocked, isBiometricEnabled, toggleBiometric, promptAuth };
}
