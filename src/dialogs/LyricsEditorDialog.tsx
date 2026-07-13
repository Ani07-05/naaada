// LRC lyrics editor: edit / preview / help. ⊙ stamp now inserts the live playback
// time at the start of the cursor's current line — sync line-by-line while playing.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { TuiDialog } from '@/components/TuiDialog';
import { TuiText } from '@/components/TuiText';
import { TuiButton } from '@/components/TuiButton';
import { TuiChip } from '@/components/TuiChip';
import { useTheme } from '@/theme/ThemeProvider';
import { useUi } from '@/store/uiStore';
import { useLibrary, songById } from '@/store/libraryStore';
import { usePlayer } from '@/store/playerStore';
import { getLyrics } from '@/data/repo';
import { parseLrc, serializeLrc, stampTime } from '@/lib/lrc';
import { fmt } from '@/lib/format';

type Mode = 'edit' | 'preview' | 'help';

export function LyricsEditorDialog({ songId }: { songId: string }) {
  const t = useTheme();
  const close = useUi((s) => s.closeDialog);
  const lib = useLibrary();
  const song = songById(songId);
  const [mode, setMode] = useState<Mode>('edit');
  const [text, setText] = useState('');
  const [sel, setSel] = useState({ start: 0, end: 0 });
  const inputRef = useRef<TextInput>(null);

  // live position when this track is the one playing
  const nowId = usePlayer((s) => (s.index >= 0 ? s.queue[s.index] : null));
  const position = usePlayer((s) => s.position);
  const duration = usePlayer((s) => s.duration);
  const isCurrent = nowId === songId;
  const livePos = isCurrent ? position : 0;

  useEffect(() => {
    getLyrics(songId).then((l) => setText(l ? serializeLrc(l) : ''));
  }, [songId]);

  const parsed = useMemo(() => parseLrc(text), [text]);
  const nLines = text.trim() ? text.split('\n').length : 0;

  const stampNow = () => {
    const caret = sel.start;
    const before = text.slice(0, caret);
    const lineStart = before.lastIndexOf('\n') + 1;
    const stamp = stampTime(livePos) + ' ';
    const next = text.slice(0, lineStart) + stamp + text.slice(lineStart);
    setText(next);
  };

  const save = async () => {
    const parsedNow = parseLrc(text);
    const clean = text.trim() ? parsedNow : [];
    await lib.saveLyrics(songId, clean);
    close();
  };

  const currentPreviewIdx = (() => {
    let i = -1;
    for (let k = 0; k < parsed.length; k++) if (parsed[k].t <= livePos) i = k; else break;
    return i;
  })();

  return (
    <TuiDialog
      title={`edit lyrics${song ? ' · ' + (song.title.length > 14 ? song.title.slice(0, 14) + '…' : song.title) : ''}`}
      onClose={close}
      footer={
        <>
          <TuiButton label="cancel" onPress={close} />
          <TuiButton label={`[↵] save · ${nLines}`} variant="primary" onPress={save} />
        </>
      }
    >
      {/* mode + live pos */}
      <View style={styles.modeRow}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {(['edit', 'preview', 'help'] as Mode[]).map((m) => (
            <TuiChip key={m} label={m} active={mode === m} bracket onPress={() => setMode(m)} />
          ))}
        </View>
        <TuiText color="inkSoft" d={-1} tabular>pos: {fmt(livePos)} / {fmt(duration || song?.dur || 0)}</TuiText>
      </View>

      {mode === 'edit' && (
        <>
          <View style={styles.actions}>
            <TuiButton label={`⊙ stamp now [${fmt(livePos)}]`} variant="accent" onPress={stampNow} />
            <TuiButton label="clear" onPress={() => setText('')} />
            <TuiText color="inkFaint" d={-2} style={{ marginLeft: 'auto' }}>{nLines} lines</TuiText>
          </View>
          {!isCurrent ? (
            <TuiText color="inkFaint" d={-2}>tip: play this track to stamp times live.</TuiText>
          ) : null}
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            onSelectionChange={(e) => setSel(e.nativeEvent.selection)}
            multiline
            placeholder={'[0:12] first line\nsecond line (auto +4s)'}
            placeholderTextColor={t.colors.inkFaint}
            style={[
              styles.area,
              { color: t.colors.ink, fontFamily: t.family('regular', false), fontSize: t.size(0), backgroundColor: t.colors.bgElev, borderColor: t.colors.hairline },
            ]}
          />
        </>
      )}

      {mode === 'preview' && (
        <View style={{ gap: 2 }}>
          {parsed.length === 0 ? (
            <TuiText color="inkFaint">nothing to preview.</TuiText>
          ) : (
            parsed.map((l, i) => {
              const active = i === currentPreviewIdx;
              return (
                <View
                  key={i}
                  style={[styles.pv, active && { backgroundColor: t.colors.selection, borderLeftWidth: 2, borderLeftColor: t.colors.accent, paddingLeft: 6 }]}
                >
                  <TuiText color="inkFaint" d={-2} tabular>{fmt(l.t)} </TuiText>
                  <TuiText color={active ? 'accent' : 'ink'} weight={active ? 'semibold' : 'normal'} d={-1}>{l.line || ' '}</TuiText>
                </View>
              );
            })
          )}
        </View>
      )}

      {mode === 'help' && (
        <View style={{ gap: 6 }}>
          <HelpRow k="[mm:ss] text" v="timed line" />
          <HelpRow k="[mm:ss.xx]" v="with hundredths" />
          <HelpRow k="plain text" v="prev time + 4s" />
          <HelpRow k="empty line" v="spacer" />
          <HelpRow k="save empty" v="removes lyrics" />
          <TuiText color="inkFaint" d={-2} style={{ marginTop: 6 }}>example</TuiText>
          <TuiText color="inkSoft" d={-1}>{'[0:00] [intro]\n[0:12] first line\nsecond line'}</TuiText>
        </View>
      )}
    </TuiDialog>
  );
}

function HelpRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <TuiText color="ink" d={-1}>{k}</TuiText>
      <TuiText color="inkSoft" d={-1}>{v}</TuiText>
    </View>
  );
}

const styles = StyleSheet.create({
  modeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  area: { borderWidth: 1, borderRadius: 2, padding: 10, minHeight: 180, textAlignVertical: 'top' },
  pv: { flexDirection: 'row', alignItems: 'baseline', paddingVertical: 2 },
});
