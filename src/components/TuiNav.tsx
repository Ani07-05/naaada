// Bottom nav — ASCII tab strip: [library] │ search │ now │ queue │ config
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/theme/ThemeProvider';
import { TuiText } from './TuiText';

const TAB_LABELS: Record<string, string> = {
  library: 'library',
  search: 'search',
  now: 'now',
  queue: 'queue',
  config: 'config',
};
const ORDER = ['library', 'search', 'now', 'queue', 'config'];

export function TuiNav({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;

  const routesByName = Object.fromEntries(state.routes.map((r) => [r.name, r]));
  const tabs = ORDER.filter((n) => routesByName[n]);

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: t.colors.bgElev,
          borderTopColor: t.colors.hairline,
          paddingBottom: insets.bottom || 8,
        },
      ]}
    >
      <View style={styles.top}>
        {tabs.map((name, i) => {
          const active = activeRoute === name;
          const route = routesByName[name];
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!active && !event.defaultPrevented) navigation.navigate(name as never);
          };
          return (
            <React.Fragment key={name}>
              <Pressable onPress={onPress} style={styles.tab} hitSlop={6}>
                <TuiText color={active ? 'accent' : 'inkFaint'}>{active ? '[' : ' '}</TuiText>
                <TuiText color={active ? 'accent' : 'inkSoft'} weight={active ? 'medium' : 'normal'}>
                  {TAB_LABELS[name]}
                </TuiText>
                <TuiText color={active ? 'accent' : 'inkFaint'}>{active ? ']' : ' '}</TuiText>
              </Pressable>
              {i < tabs.length - 1 && <TuiText color="hairline">│</TuiText>}
            </React.Fragment>
          );
        })}
      </View>
      <TuiText color="inkFaint" d={-3} center style={styles.hint}>
        [tap] select · [L][S][N][Q] jump · [space] play/pause
      </TuiText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: 1, paddingTop: 8, paddingHorizontal: 8 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', minHeight: 32, paddingHorizontal: 2 },
  hint: { marginTop: 4 },
});
