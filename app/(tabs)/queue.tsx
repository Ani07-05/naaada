// Queue: now playing · up next (reorder + clear) · history.
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { TuiScreen } from '@/components/TuiScreen';
import { TuiText } from '@/components/TuiText';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SectionHead } from '@/components/SectionHead';
import { TuiChip } from '@/components/TuiChip';
import { useTheme } from '@/theme/ThemeProvider';
import { usePlayer } from '@/store/playerStore';
import { useLibrary, songById } from '@/store/libraryStore';
import { fmt } from '@/lib/format';

export default function QueueScreen() {
  const t = useTheme();
  const queue = usePlayer((s) => s.queue);
  const index = usePlayer((s) => s.index);
  const history = usePlayer((s) => s.history);
  useLibrary((s) => s.songs);

  const current = index >= 0 ? queue[index] : null;
  const upNext = queue.slice(index + 1);
  const upNextDur = upNext.reduce((n, id) => n + (songById(id)?.dur || 0), 0);

  const move = (absIndex: number, dir: -1 | 1) => {
    const to = absIndex + dir;
    if (to <= index || to >= queue.length) return; // keep within up-next
    usePlayer.getState().reorderQueue(absIndex, to);
  };

  return (
    <TuiScreen bottomInset={140}>
      <Breadcrumb parts={[{ label: 'queue' }]} />

      <SectionHead label="now playing" accent />
      {current ? (
        <QRow id={current} playing />
      ) : (
        <TuiText color="inkFaint">nothing playing</TuiText>
      )}

      <SectionHead
        label={`up next · ${upNext.length} songs · ${fmt(upNextDur)}`}
        right={upNext.length ? <TuiChip label="[×] clear" onPress={() => usePlayer.getState().clearQueue()} /> : undefined}
      />
      {upNext.length === 0 ? (
        <View style={styles.panel}>
          <TuiText color="inkFaint">┌─ queue end ─┐</TuiText>
          <TuiText color="inkSoft">  nothing queued</TuiText>
          <TuiText color="inkFaint">└─────────────┘</TuiText>
        </View>
      ) : (
        upNext.map((id, i) => {
          const abs = index + 1 + i;
          return (
            <QRow
              key={`${id}-${abs}`}
              id={id}
              onPress={() => usePlayer.getState().playSong(id)}
              onUp={abs > index + 1 ? () => move(abs, -1) : undefined}
              onDown={abs < queue.length - 1 ? () => move(abs, 1) : undefined}
              onRemove={() => usePlayer.getState().removeFromQueue(id)}
            />
          );
        })
      )}

      {history.length > 0 && (
        <>
          <SectionHead label="history" />
          {history.map((id, i) => (
            <QRow key={`h-${id}-${i}`} id={id} faded onPress={() => usePlayer.getState().playSong(id)} replay />
          ))}
        </>
      )}
    </TuiScreen>
  );
}

function QRow({
  id, playing, faded, onPress, onUp, onDown, onRemove, replay,
}: {
  id: string;
  playing?: boolean;
  faded?: boolean;
  onPress?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onRemove?: () => void;
  replay?: boolean;
}) {
  const t = useTheme();
  const song = songById(id);
  if (!song) return null;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { opacity: faded ? 0.6 : 1, backgroundColor: playing || pressed ? t.colors.selection : 'transparent' },
        playing && { borderLeftWidth: 2, borderLeftColor: t.colors.accent, paddingLeft: 6 },
      ]}
    >
      <TuiText color={playing ? 'accent' : 'inkFaint'}>{playing ? '▶' : replay ? '↺' : '≡'}</TuiText>
      <View style={{ flex: 1, minWidth: 0 }}>
        <TuiText color="ink" numberOfLines={1}>{song.title}</TuiText>
        <TuiText color="inkSoft" d={-2} numberOfLines={1}>{song.artist}</TuiText>
      </View>
      {onUp || onDown ? (
        <View style={styles.moves}>
          <Ctl label="▲" onPress={onUp} />
          <Ctl label="▼" onPress={onDown} />
          <Ctl label="×" onPress={onRemove} />
        </View>
      ) : (
        <TuiText color="inkSoft" d={-1} tabular>{song.dur ? fmt(song.dur) : ''}</TuiText>
      )}
    </Pressable>
  );
}

function Ctl({ label, onPress }: { label: string; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} disabled={!onPress} style={styles.ctl}>
      <TuiText color={onPress ? 'inkSoft' : 'inkFaint'}>{label}</TuiText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingVertical: 6, paddingHorizontal: 8 },
  moves: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  ctl: { width: 24, height: 32, alignItems: 'center', justifyContent: 'center' },
  panel: { alignItems: 'center', paddingVertical: 24, gap: 2 },
});
