// Shared dialog chrome: centered card, ink border, hard 4dp offset shadow,
// bg-elev title bar (`┌── title ──`) with [×] close, dashed-topped action row.
import React from 'react';
import {
  Modal, View, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { TuiText } from './TuiText';

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function TuiDialog({ title, onClose, children, footer }: Props) {
  const t = useTheme();
  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
          {/* offset shadow layer */}
          <View style={styles.shadowWrap}>
            <View style={[styles.shadow]} />
            <Pressable
              style={[styles.card, { backgroundColor: t.colors.bg, borderColor: t.colors.ink }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={[styles.titleBar, { backgroundColor: t.colors.bgElev, borderBottomColor: t.colors.hairline }]}>
                <TuiText color="ink" weight="medium">┌── {title} ──</TuiText>
                <Pressable onPress={onClose} hitSlop={10}>
                  <TuiText color="inkSoft">[×]</TuiText>
                </Pressable>
              </View>
              <ScrollView
                style={styles.body}
                contentContainerStyle={{ padding: 14, gap: 10 }}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
              {footer ? (
                <View style={[styles.footer, { borderTopColor: t.colors.hairline }]}>{footer}</View>
              ) : null}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  kav: { width: '100%', alignItems: 'center' },
  shadowWrap: { width: '100%', maxWidth: 360 },
  shadow: {
    ...StyleSheet.absoluteFillObject,
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  card: { borderWidth: 1, maxHeight: '82%' },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },
  body: { flexGrow: 0 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
});
