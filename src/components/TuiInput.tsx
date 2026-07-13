// Dialog text input: bg-elev, hairline border, accent border on focus, monospace.
import React, { useState } from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { TuiText } from './TuiText';

type Props = TextInputProps & {
  label?: string;
  multiline?: boolean;
  minHeight?: number;
};

export function TuiInput({ label, multiline, minHeight, style, ...rest }: Props) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 4 }}>
      {label ? <TuiText color="inkSoft" d={-1}>{label}</TuiText> : null}
      <TextInput
        {...rest}
        multiline={multiline}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        placeholderTextColor={t.colors.inkFaint}
        style={[
          styles.input,
          {
            color: t.colors.ink,
            fontFamily: t.family('regular', false),
            fontSize: t.size(0),
            backgroundColor: t.colors.bgElev,
            borderColor: focused ? t.colors.accent : t.colors.hairline,
            minHeight: minHeight ?? (multiline ? 100 : 42),
            textAlignVertical: multiline ? 'top' : 'center',
          },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 2, paddingHorizontal: 10, paddingVertical: 8 },
});
