// Mini player — fixed above the nav on all tabs except Now Playing.
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { TuiText } from './TuiText';
import { BlockCover } from './BlockCover';
import { usePlayer } from '@/store/playerStore';
import { useLibrary, songById, albumById } from '@/store/libraryStore';

export function MiniPlayer() {
  const t = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  // subscribe so it re-renders on track / progress changes
  const index = usePlayer((s) => s.index);
  const queue = usePlayer((s) => s.queue);
  const playing = usePlayer((s) => s.playing);
  const position = usePlayer((s) => s.position);
  const duration = usePlayer((s) => s.duration);
  useLibrary((s) => s.songs); // re-render when library changes

  const nowId = index >= 0 && index < queue.length ? queue[index] : null;
  const song = songById(nowId);
  if (!song || pathname === '/now') return null;

  const album = albumById(song.albumId);
  const seed = album?.seed ?? song.id;
  const pct = duration > 0 ? Math.max(0, Math.min(1, position / duration)) : 0;

  return (
    <Pressable
      onPress={() => router.push('/now')}
      style={[styles.wrap, { backgroundColor: t.colors.bgElev, borderTopColor: t.colors.hairline }]}
    >
      <BlockCover seed={seed} size={3} cell={6} label={song.title} />
      <View style={styles.mid}>
        <TuiText color="ink" weight="medium" d={-1} numberOfLines={1}>{song.title}</TuiText>
        <TuiText color="inkSoft" d={-2} numberOfLines={1}>{song.artist}</TuiText>
        <View style={[styles.track, { backgroundColor: t.colors.hairline }]}>
          <View style={[styles.fill, { backgroundColor: t.colors.accent, width: `${pct * 100}%` }]} />
        </View>
      </View>
      <View style={styles.controls}>
        <MiniBtn label="⏮" onPress={() => usePlayer.getState().prev()} />
        <MiniBtn label={playing ? '⏸' : '▶'} onPress={() => usePlayer.getState().toggle()} />
        <MiniBtn label="⏭" onPress={() => usePlayer.getState().next()} />
      </View>
    </Pressable>
  );
}

function MiniBtn({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.btn,
        { borderColor: t.colors.hairline, backgroundColor: pressed ? t.colors.selection : 'transparent' },
      ]}
    >
      <TuiText color="ink">{label}</TuiText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  mid: { flex: 1, minWidth: 0 },
  track: { height: 2, marginTop: 4, borderRadius: 1, overflow: 'hidden' },
  fill: { height: 2 },
  controls: { flexDirection: 'row', gap: 6 },
  btn: {
    borderWidth: 1,
    borderRadius: 2,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
