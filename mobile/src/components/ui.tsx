import { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lumen } from '@/theme/lumen';
import { useTheme } from '@/theme/ThemeContext';

/** The lapis-navy gradient backdrop every screen sits on. */
export function Screen({
  children,
  edges = ['top'],
}: {
  children: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}) {
  const { theme } = useTheme();
  return (
    <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

/** A card: white at 5% over navy, hairline gold border. */
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** A small-caps section label in Cinzel. */
export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Lumen.colors.card,
    borderColor: Lumen.colors.cardBorder,
    borderWidth: 1,
    borderRadius: Lumen.radius.lg,
    padding: 18,
  },
  label: {
    fontFamily: Lumen.fonts.label,
    fontSize: Lumen.type.label,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Lumen.colors.accent,
  },
});
