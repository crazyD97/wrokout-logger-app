import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Font from 'expo-font';

import AppNavigator from './navigation/AppNavigator';
import { DatabaseService } from './database/DatabaseService';
import { lightTheme, darkTheme } from './constants/theme';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize database
        console.log('Initializing database...');
        await DatabaseService.init();
        console.log('Database initialized successfully');
        
        // Load fonts
        console.log('Loading fonts...');
        await Font.loadAsync({
          'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
          'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
          'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
        });
        console.log('Fonts loaded successfully');
      } catch (e) {
        console.error('App initialization error:', e);
        // Still set ready to true so the app can load even if database fails
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer theme={theme}>
            <AppNavigator />
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
