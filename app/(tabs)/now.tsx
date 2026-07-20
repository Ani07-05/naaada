// Now Playing (hero): art/banner, waveform, progress, transport, extras, lyrics.
import React, { useRef } from 'react';
import { View, Pressable, StyleSheet, Text, Image, PanResponder } from 'react-native';
import { TuiScreen } from '@/components/TuiScreen';
import { TuiText } from '@/components/TuiText';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHead } from '@/components/SectionHead';
import { BlockCover } from '@/components/BlockCover';
import { Waveform } from '@/components/Waveform';
import { AsciiProgress } from '@/components/AsciiProgress';
import { LyricsView } from '@/components/LyricsView';
import { TuiChip } from '@/components/TuiChip';
import { useTheme } from '@/theme/ThemeProvider';
import { usePlayer } from '@/store/playerStore';
import { useLibrary, songById, albumById } from '@/store/libraryStore';
import { useUi } from '@/store/uiStore';
import { seekTo, setPlaybackRate } from '@/playback/usePlayback';
import { fmt } from '@/lib/format';
import { useSettings } from '@/store/settingsStore';
import { THEME_IDS } from '@/theme/tokens';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const fmtSpeed = (n: number) => `${n}×`;

export default function NowScreen() {
  const t = useTheme();
  const index = usePlayer((s) => s.index);
  const queue = usePlayer((s) => s.queue);
  const playing = usePlayer((s) => s.playing);
  const position = usePlayer((s) => s.position);
  const duration = usePlayer((s) => s.duration);
  const shuffle = usePlayer((s) => s.shuffle);
  const repeat = usePlayer((s) => s.repeat);
  useLibrary((s) => s.songs);

  const theme = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);
  const cycleTheme = () => setTheme(THEME_IDS[(THEME_IDS.indexOf(theme) + 1) % THEME_IDS.length]);

  const speed = useSettings((s) => s.speed);
  const cycleSpeed = () => setPlaybackRate(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length] ?? 1);

  const nowId = index >= 0 && index < queue.length ? queue[index] : null;
  const song = songById(nowId);

  if (!song) {
    return (
      <TuiScreen bottomInset={140}>
        <Breadcrumb parts={[{ label: 'now playing' }]} />
        <View style={styles.emptyWrap}>
          <TuiText color="inkFaint">┌────────────────────┐</TuiText>
          <TuiText color="inkSoft">   nothing playing</TuiText>
          <TuiText color="inkFaint">   pick a song in library</TuiText>
          <TuiText color="inkFaint">└────────────────────┘</TuiText>
        </View>
      </TuiScreen>
    );
  }

  const album = albumById(song.albumId);
  const seed = album?.seed ?? song.id;
  const dur = duration || song.dur;

  // Horizontal swipe on the art -> prev/next; vertical drag falls through to
  // the screen's own ScrollView so it doesn't fight page scrolling.
  const swipe = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        if (g.dx <= -40) usePlayer.getState().next();
        else if (g.dx >= 40) usePlayer.getState().prev();
      },
    })
  ).current;

  return (
    <TuiScreen bottomInset={140}>
      <Breadcrumb parts={[{ label: 'library' }, { label: song.artist }, { label: 'now playing' }]} />

      {/* theme/edit chips */}
      <View style={[styles.chipRow, styles.toggleRow, { borderBottomColor: t.colors.hairline }]}>
        <TuiChip label="◐ theme" onPress={cycleTheme} />
        <TuiChip label="✎ edit" onPress={() => useUi.getState().openDialog({ kind: 'editTrack', songId: song.id })} />
      </View>

      {/* art / banner */}
      <View style={styles.art} {...swipe.panHandlers}>
        {song.coverUri ? (
          <Image source={{ uri: song.coverUri }} style={styles.coverImg} resizeMode="cover" />
        ) : song.banner ? (
          <Text
            style={{
              color: t.colors.accent,
              fontFamily: t.family('regular', /[ऀ-ॿ]/.test(song.banner)),
              fontSize: t.size(0),
              lineHeight: t.size(0) * 1.25,
              textAlign: 'center',
            }}
          >
            {song.banner}
          </Text>
        ) : (
          <BlockCover seed={seed} size={10} cell={11} label={song.title} />
        )}
      </View>

      {/* title / artist / album line */}
      <View style={styles.meta}>
        <TuiText color="ink" d={4} weight="medium" center>{song.title}</TuiText>
        <TuiText color="inkSoft" center>{song.artist}</TuiText>
        {album ? (
          <TuiText color="inkFaint" italic d={-1} center>— from {album.title} ({album.year}) —</TuiText>
        ) : null}
      </View>

      {/* waveform */}
      <View style={{ marginVertical: 10 }}>
        <Waveform trackId={song.id} uri={song.uri} position={position} duration={dur} onSeek={seekTo} />
      </View>

      {/* progress row */}
      <View style={styles.progressRow}>
        <TuiText color="inkSoft" d={-1} tabular>{fmt(position)}</TuiText>
        <AsciiProgress value={position} max={dur} width={22} />
        <TuiText color="inkSoft" d={-1} tabular>{fmt(dur)}</TuiText>
      </View>

      {/* transport */}
      <View style={styles.transport}>
        <Transport label="⇋" active={shuffle} onPress={() => usePlayer.getState().toggleShuffle()} />
        <Transport label="⏮" onPress={() => usePlayer.getState().prev()} />
        <Transport label={playing ? '⏸' : '▶'} primary onPress={() => usePlayer.getState().toggle()} />
        <Transport label="⏭" onPress={() => usePlayer.getState().next()} />
        <Transport
          label={repeat === 'one' ? '↻¹' : '↻'}
          active={repeat !== 'off'}
          onPress={() => usePlayer.getState().cycleRepeat()}
        />
      </View>

      {/* extras */}
      <View style={[styles.extras, { borderTopColor: t.colors.hairline }]}>
        <TuiChip
          label={song.liked ? '♥ liked' : '♡ like'}
          active={song.liked}
          onPress={() => useLibrary.getState().toggleLike(song.id)}
        />
        <TuiChip label={`▷ ${fmtSpeed(speed)}`} active={speed !== 1} onPress={cycleSpeed} />
        <TuiChip label={`[≡] queue (${queue.length})`} onPress={() => {}} />
      </View>

      {/* lyrics */}
      <SectionHead label="lyrics" />
      <LyricsView
        songId={song.id}
        position={position}
        onEdit={() => useUi.getState().openDialog({ kind: 'editLyrics', songId: song.id })}
        big
      />
    </TuiScreen>
  );
}

function Transport({
  label, onPress, primary, active,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  active?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.tbtn,
        primary && [
          styles.tbtnPrimary,
          { borderColor: t.colors.accent, backgroundColor: pressed ? t.colors.selection : t.colors.bg },
        ],
        !primary && pressed && { backgroundColor: t.colors.selection },
      ]}
    >
      <TuiText color={primary ? 'accent' : active ? 'accent' : 'ink'} d={primary ? 3 : 1}>{label}</TuiText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 2 },
  toggleRow: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    paddingBottom: 8,
    marginTop: 12,
  },
  chipRow: { flexDirection: 'row', gap: 6 },
  art: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20, minHeight: 200 },
  coverImg: { width: 200, height: 200, borderRadius: 4 },
  meta: { alignItems: 'center', gap: 2, marginTop: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  transport: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 16 },
  tbtn: { width: 48, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 2 },
  tbtnPrimary: { width: 64, height: 64, borderRadius: 32, borderWidth: 2 },
  extras: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
});
