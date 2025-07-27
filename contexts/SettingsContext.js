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

export const SettingsProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [restTimerSound, setRestTimerSound] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    weight: '175',
    height: '5\'10"',
  });

  // Load settings from storage on app start
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setIsDarkMode(settings.isDarkMode || false);
        setNotifications(settings.notifications !== undefined ? settings.notifications : true);
        setRestTimerSound(settings.restTimerSound !== undefined ? settings.restTimerSound : true);
        setUserProfile(settings.userProfile || userProfile);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
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

  const value = {
    isDarkMode,
    notifications,
    restTimerSound,
    userProfile,
    toggleDarkMode,
    toggleNotifications,
    toggleRestTimerSound,
    updateUserProfile,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
