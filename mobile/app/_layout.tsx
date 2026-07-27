import { useEffect } from 'react';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import { Cardo_400Regular, Cardo_700Bold } from '@expo-google-fonts/cardo';
import { Cinzel_600SemiBold } from '@expo-google-fonts/cinzel';
import { ThemeProvider } from '@/theme/ThemeContext';
import { VersionProvider } from '@/state/VersionContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded] = useFonts({
    // Aliases match Lumen.fonts.* in the theme.
    CormorantGaramond: CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    Cardo: Cardo_400Regular,
    Cardo_700Bold,
    Cinzel: Cinzel_600SemiBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: '#0d1830' }} />;
  }

  return (
    <SafeAreaProvider>
      <Head>
        <title>Holy Bible · AI Assisted</title>
      </Head>
      <ThemeProvider>
        <VersionProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0d1830' } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="rosary" options={{ presentation: 'card' }} />
            <Stack.Screen name="give" options={{ presentation: 'card' }} />
          </Stack>
        </VersionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
