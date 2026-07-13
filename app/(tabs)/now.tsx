// Now Playing (hero): art/banner, waveform, progress, transport, extras, track info, lyrics.
import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
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
import { seekTo } from '@/playback/usePlayback';
import { fmt } from '@/lib/format';
import { useSettings } from '@/store/settingsStore';
import { THEME_IDS } from '@/theme/tokens';

export default function NowScreen() {
  const t = useTheme();
  const [view, setView] = useState<'art' | 'lyrics'>('art');
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

  return (
    <TuiScreen bottomInset={140}>
      <Breadcrumb parts={[{ label: 'library' }, { label: song.artist }, { label: 'now playing' }]} />

      {/* view toggle + theme/edit chips */}
      <View style={[styles.toggleRow, { borderBottomColor: t.colors.hairline }]}>
        <View style={styles.toggleTabs}>
          <Pressable onPress={() => setView('art')} hitSlop={6} style={styles.toggleTab}>
            <TuiText color={view === 'art' ? 'accent' : 'inkFaint'}>{view === 'art' ? '[art]' : ' art '}</TuiText>
          </Pressable>
          <Pressable onPress={() => setView('lyrics')} hitSlop={6} style={styles.toggleTab}>
            <TuiText color={view === 'lyrics' ? 'accent' : 'inkFaint'}>
              {view === 'lyrics' ? '[lyrics]' : ' lyrics '}
            </TuiText>
          </Pressable>
        </View>
        <View style={styles.chipRow}>
          <TuiChip label="◐ theme" onPress={cycleTheme} />
          <TuiChip label="✎ edit" onPress={() => useUi.getState().openDialog({ kind: 'editTrack', songId: song.id })} />
        </View>
      </View>

      {/* art / banner / lyrics */}
      {view === 'art' ? (
        <View style={styles.art}>
          {song.banner ? (
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
      ) : (
        <LyricsView
          songId={song.id}
          position={position}
          onEdit={() => useUi.getState().openDialog({ kind: 'editLyrics', songId: song.id })}
        />
      )}

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
        <Waveform trackId={song.id} position={position} duration={dur} onSeek={seekTo} />
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
        <TuiChip label={`[≡] queue (${queue.length})`} onPress={() => {}} />
      </View>

      {/* track info */}
      <SectionHead label="track info" />
      <InfoRow k="track" v={album ? `${String(song.track).padStart(2, '0')} / ${album.tracks}` : String(song.track)} />
      <InfoRow k="length" v={fmt(song.dur || dur)} />
      {album ? <InfoRow k="album" v={album.title} /> : null}
      {album ? <InfoRow k="year" v={String(album.year)} /> : null}
      <InfoRow k="source" v={song.sourceType === 'local' ? 'local file' : 'demo'} />
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
        primary && { borderWidth: 1, borderColor: t.colors.ink, backgroundColor: pressed ? t.colors.ink : 'transparent', width: 56, height: 48 },
        primary && pressed && { backgroundColor: t.colors.ink },
        !primary && pressed && { backgroundColor: t.colors.selection },
      ]}
    >
      <TuiText color={active ? 'accent' : 'ink'} d={primary ? 2 : 1}>{label}</TuiText>
    </Pressable>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.info}>
      <TuiText color="inkSoft" d={-1}>{k}</TuiText>
      <TuiText color="ink" d={-1} tabular>{v}</TuiText>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 2 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    paddingBottom: 8,
    marginTop: 4,
  },
  toggleTabs: { flexDirection: 'row', gap: 10 },
  toggleTab: { paddingVertical: 4 },
  chipRow: { flexDirection: 'row', gap: 6 },
  art: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20, minHeight: 200 },
  meta: { alignItems: 'center', gap: 2, marginTop: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  transport: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 16 },
  tbtn: { width: 48, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 2 },
  extras: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  info: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
});
