import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

// Fallback storage for web or if AsyncStorage fails
const fallbackStorage = {
  async getItem(key) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return null;
  },
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    }
  },
  async removeItem(key) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    }
  }
};

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  console.log('AsyncStorage not available, using fallback');
  AsyncStorage = fallbackStorage;
}

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

const defaultSettings = {
  isDarkMode: false,
  notifications: true,
  restTimerSound: true,
  userProfile: {
    name: 'John Doe',
    email: 'john@example.com',
    weight: '175',
    height: '5\'10"',
  },
};

export const SettingsProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(defaultSettings.isDarkMode);
  const [notifications, setNotifications] = useState(defaultSettings.notifications);
  const [restTimerSound, setRestTimerSound] = useState(defaultSettings.restTimerSound);
  const [userProfile, setUserProfile] = useState(defaultSettings.userProfile);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from storage on app start
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setIsDarkMode(settings.isDarkMode ?? defaultSettings.isDarkMode);
        setNotifications(settings.notifications ?? defaultSettings.notifications);
        setRestTimerSound(settings.restTimerSound ?? defaultSettings.restTimerSound);
        setUserProfile(settings.userProfile ?? defaultSettings.userProfile);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if loading fails
      setIsDarkMode(defaultSettings.isDarkMode);
      setNotifications(defaultSettings.notifications);
      setRestTimerSound(defaultSettings.restTimerSound);
      setUserProfile(defaultSettings.userProfile);
    } finally {
      setIsInitialized(true);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    const newSettings = {
      isDarkMode: newValue,
      notifications,
      restTimerSound,
      userProfile,
    };
    saveSettings(newSettings);
  };

  const toggleNotifications = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    const newSettings = {
      isDarkMode,
      notifications: newValue,
      restTimerSound,
      userProfile,
    };
    saveSettings(newSettings);
  };

  const toggleRestTimerSound = () => {
    const newValue = !restTimerSound;
    setRestTimerSound(newValue);
    const newSettings = {
      isDarkMode,
      notifications,
      restTimerSound: newValue,
      userProfile,
    };
    saveSettings(newSettings);
  };

  const updateUserProfile = (newProfile) => {
    setUserProfile(newProfile);
    const newSettings = {
      isDarkMode,
      notifications,
      restTimerSound,
      userProfile: newProfile,
    };
    saveSettings(newSettings);
  };

  const resetSettings = async () => {
    try {
      await AsyncStorage.removeItem('appSettings');
      setIsDarkMode(defaultSettings.isDarkMode);
      setNotifications(defaultSettings.notifications);
      setRestTimerSound(defaultSettings.restTimerSound);
      setUserProfile(defaultSettings.userProfile);
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  const value = {
    isDarkMode,
    notifications,
    restTimerSound,
    userProfile,
    isInitialized,
    toggleDarkMode,
    toggleNotifications,
    toggleRestTimerSound,
    updateUserProfile,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
