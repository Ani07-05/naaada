// Waveform with tap/drag-to-seek. Uses the real decoded amplitudes of the audio
// file when available (cached per track), falling back to a stylized shape.
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { waveformHeights, WAVEFORM_BARS } from '@/art/waveform';
import { extractPeaks, canExtractPeaks } from '@/playback/peaks';

type Props = {
  trackId: string;
  position: number;
  duration: number;
  onSeek: (pos: number) => void;
  height?: number;
  uri?: string | null;
};

// Real waveforms are expensive to decode; keep them for the session.
const peakCache = new Map<string, number[]>();

export function Waveform({ trackId, position, duration, onSeek, height = 28, uri }: Props) {
  const t = useTheme();
  const widthRef = useRef(0);
  const [heights, setHeights] = useState<number[]>(
    () => peakCache.get(trackId) ?? waveformHeights(trackId)
  );

  useEffect(() => {
    const cached = peakCache.get(trackId);
    if (cached) {
      setHeights(cached);
      return;
    }
    // stylized shape shows immediately; swap in the real one when decoded
    setHeights(waveformHeights(trackId));
    if (!canExtractPeaks || !uri) return;
    let alive = true;
    extractPeaks(uri, WAVEFORM_BARS).then((real) => {
      if (alive && real && real.length) {
        peakCache.set(trackId, real);
        setHeights(real);
      }
    });
    return () => {
      alive = false;
    };
  }, [trackId, uri]);

  const pct = duration > 0 ? Math.max(0, Math.min(1, position / duration)) : 0;
  const playhead = Math.floor(pct * heights.length);

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
  };
  const seekFrom = (e: GestureResponderEvent) => {
    const w = widthRef.current;
    if (w <= 0 || duration <= 0) return;
    const x = Math.max(0, Math.min(w, e.nativeEvent.locationX));
    onSeek(Math.round((x / w) * duration));
  };

  return (
    <View
      style={[styles.row, { height }]}
      onLayout={onLayout}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={seekFrom}
      onResponderMove={seekFrom}
    >
      {heights.map((h, i) => {
        const color =
          i < playhead ? t.colors.accent : i === playhead ? t.colors.ink : t.colors.inkFaint;
        return (
          <View
            key={i}
            style={{ width: 3, height: Math.max(2, h * height), backgroundColor: color, borderRadius: 1 }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
});
