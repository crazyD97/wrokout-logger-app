import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';

import AppNavigator from './navigation/AppNavigator';
import { DatabaseService } from './database/DatabaseService';
import { lightTheme, darkTheme } from './constants/theme';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const { isDarkMode, isInitialized } = useSettings();

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize database
        console.log('Initializing database...');
        await DatabaseService.init();
        console.log('Database initialized successfully');
        
        // Fonts commented out - files don't exist
        // console.log('Loading fonts...');
        // await Font.loadAsync({
        //   'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
        //   'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
        //   'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
        // });
        // console.log('Fonts loaded successfully');
      } catch (e) {
        console.error('App initialization error:', e);
        // Still set ready to true so the app can load even if database fails
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  // Show loading screen until both app is ready and settings are initialized
  if (!isReady || !isInitialized) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: isDarkMode ? darkTheme.colors.background : lightTheme.colors.background 
      }}>
        <ActivityIndicator 
          size="large" 
          color={isDarkMode ? darkTheme.colors.primary : lightTheme.colors.primary} 
        />
      </View>
    );
  }

  const paperTheme = isDarkMode ? darkTheme : lightTheme;
  const navigationTheme = paperTheme.navigation || paperTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <NavigationContainer theme={navigationTheme}>
            <AppNavigator />
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
