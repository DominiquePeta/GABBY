import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { I18nProvider } from './src/i18n/I18nContext';
import { AuthProvider } from './src/data/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { fontsToLoad } from './src/theme/theme';

export default function App() {
  const [fontsLoaded] = useFonts(fontsToLoad);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8E2DC' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </I18nProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
