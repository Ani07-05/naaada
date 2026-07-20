// Read-only synced lyrics: current line accent+semibold, past soft, future faint.
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { TuiText } from './TuiText';
import { TuiButton } from './TuiButton';
import { getLyrics } from '@/data/repo';
import { LyricLine } from '@/data/types';

function currentIdx(lines: LyricLine[], t: number): number {
  let i = -1;
  for (let k = 0; k < lines.length; k++) {
    if (lines[k].t <= t) i = k;
    else break;
  }
  return i;
}

export function LyricsView({
  songId, position, onEdit, big,
}: {
  songId: string;
  position: number;
  onEdit?: () => void;
  /** Render as the page's main lyrics section instead of a capped subview. */
  big?: boolean;
}) {
  const [lines, setLines] = useState<LyricLine[] | null | undefined>(undefined);
  const scrollRef = useRef<ScrollView>(null);
  const rowYs = useRef<Record<number, number>>({});

  useEffect(() => {
    let ok = true;
    getLyrics(songId).then((l) => ok && setLines(l));
    return () => {
      ok = false;
    };
  }, [songId]);

  const idx = lines ? currentIdx(lines, position) : -1;

  // In "big" mode the outer page ScrollView owns scrolling, so there's no
  // local scrollRef to auto-scroll — nesting a same-direction ScrollView
  // there would fight the page for the drag gesture.
  useEffect(() => {
    if (!big && idx >= 0 && rowYs.current[idx] != null) {
      scrollRef.current?.scrollTo({ y: Math.max(0, rowYs.current[idx] - 110), animated: true });
    }
  }, [big, idx]);

  if (lines === undefined) return null;
  if (!lines) {
    return (
      <View style={styles.empty}>
        <TuiText color="inkFaint">┌──────────────┐</TuiText>
        <TuiText color="inkSoft">  no lyrics yet</TuiText>
        <TuiText color="inkFaint">└──────────────┘</TuiText>
        {onEdit ? <View style={{ marginTop: 12 }}><TuiButton label="+ add lyrics" variant="accent" onPress={onEdit} /></View> : null}
      </View>
    );
  }

  const rows = lines.map((l, i) => {
    const color = i === idx ? 'accent' : i < idx ? 'inkSoft' : 'inkFaint';
    return (
      <View key={i} onLayout={(e) => (rowYs.current[i] = e.nativeEvent.layout.y)}>
        <TuiText color={color} weight={i === idx ? 'semibold' : 'normal'} d={big ? 2 : 1} center lh={1.7}>
          {l.line || ' '}
        </TuiText>
      </View>
    );
  });

  const editButton = onEdit ? (
    <View style={{ alignItems: 'center', marginTop: 16 }}>
      <TuiButton label="✎ edit lyrics" onPress={onEdit} />
    </View>
  ) : null;

  if (big) {
    return (
      <View>
        {rows}
        {editButton}
      </View>
    );
  }

  return (
    <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false}>
      {rows}
      {editButton}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 280 },
  empty: { alignItems: 'center', paddingVertical: 40 },
});
