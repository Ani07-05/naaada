// Root layout: load fonts, mount providers, gate splash until ready.
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_500Medium,
  NotoSansDevanagari_600SemiBold,
} from '@expo-google-fonts/noto-sans-devanagari';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useSettings } from '@/store/settingsStore';
import { useLibrary } from '@/store/libraryStore';
import { PlaybackHost } from '@/playback/PlaybackHost';
import { RowActionMenu } from '@/components/RowActionMenu';
import { DialogHost } from '@/dialogs/DialogHost';
import { Welcome } from '@/components/Welcome';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Register the track-player background service (native only).
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const TP = require('@/playback/tp').default;
    TP.registerPlaybackService(() => require('@/playback/service'));
  } catch (e) {
    console.warn('track-player service registration skipped', e);
  }
}

export default function RootLayout() {
  const hydrated = useSettings((s) => s.hydrated);
  const libLoaded = useLibrary((s) => s.loaded);
  const initLib = useLibrary((s) => s.init);

  useEffect(() => {
    initLib().catch((e) => console.warn('library init failed', e));
  }, [initLib]);
  const [fontsLoaded] = useFonts({
    JetBrainsMono: JetBrainsMono_400Regular,
    'JetBrainsMono-Medium': JetBrainsMono_500Medium,
    'JetBrainsMono-SemiBold': JetBrainsMono_600SemiBold,
    NotoSansDevanagari: NotoSansDevanagari_400Regular,
    'NotoSansDevanagari-Medium': NotoSansDevanagari_500Medium,
    'NotoSansDevanagari-SemiBold': NotoSansDevanagari_600SemiBold,
    SpaceMono: SpaceMono_400Regular,
    'SpaceMono-Bold': SpaceMono_700Bold,
    VT323: VT323_400Regular,
  });

  const ready = fontsLoaded && hydrated && libLoaded;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar style="auto" />
          <PlaybackHost />
          <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 120 }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
          <RowActionMenu />
          <DialogHost />
          <Welcome />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
