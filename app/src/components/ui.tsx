import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color, font, radius } from '../theme/theme';

type Variant = 'light' | 'dark';

export function Screen({
  variant = 'light',
  children,
  style,
  scroll,
}: {
  variant?: Variant;
  children: React.ReactNode;
  style?: ViewStyle;
  scroll?: boolean;
}) {
  const bg = variant === 'light' ? color.client.bg : color.driver.bg;
  const Wrapper = scroll ? require('react-native').ScrollView : View;
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: bg }, style]}>
      <Wrapper
        style={{ flex: 1 }}
        contentContainerStyle={scroll ? { flexGrow: 1, paddingBottom: 32 } : undefined}
      >
        {children}
      </Wrapper>
    </SafeAreaView>
  );
}

export function Heading({ children, variant = 'light', style }: { children: React.ReactNode; variant?: Variant; style?: any }) {
  return (
    <Text
      style={[
        {
          fontFamily: font.semibold,
          fontSize: 27,
          letterSpacing: -0.4,
          color: variant === 'light' ? color.client.text : color.driver.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Body({ children, variant = 'light', style }: { children: React.ReactNode; variant?: Variant; style?: any }) {
  return (
    <Text
      style={[
        {
          fontFamily: font.regular,
          fontSize: 14.5,
          lineHeight: 21,
          color: variant === 'light' ? color.client.textMuted : color.driver.textMuted,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Kicker({ children, tone = 'accent' }: { children: React.ReactNode; tone?: 'accent' | 'amber' }) {
  return (
    <Text
      style={{
        fontFamily: font.semibold,
        fontSize: 11,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: tone === 'accent' ? color.client.accent : color.driver.amber,
      }}
    >
      {children}
    </Text>
  );
}

export function Button({
  title,
  onPress,
  tone = 'accent',
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  tone?: 'accent' | 'dark' | 'amber' | 'outline' | 'outlineDark' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const bg: Record<string, string> = {
    accent: color.client.accent,
    dark: color.client.dark,
    amber: color.driver.amber,
    outline: 'transparent',
    outlineDark: 'transparent',
    danger: 'transparent',
  };
  const textColor: Record<string, string> = {
    accent: '#fff',
    dark: color.client.onDark,
    amber: color.driver.onAmber,
    outline: color.client.textMuted,
    outlineDark: color.driver.textMuted,
    danger: color.danger,
  };
  const border: Record<string, string | undefined> = {
    outline: color.client.borderStrong,
    outlineDark: color.driver.border,
    danger: color.dangerBorder,
  };
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: bg[tone],
          borderWidth: border[tone] ? 1 : 0,
          borderColor: border[tone],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor[tone]} />
      ) : (
        <Text style={{ fontFamily: font.semibold, fontSize: 16, color: textColor[tone] }}>{title}</Text>
      )}
    </Pressable>
  );
}

export function TextField({
  label,
  variant = 'light',
  ...props
}: { label: string; variant?: Variant } & TextInputProps) {
  const light = variant === 'light';
  return (
    <View style={{ gap: 7, marginBottom: 14 }}>
      <Text
        style={{
          fontFamily: font.semibold,
          fontSize: 11.5,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: light ? color.client.textFaint : color.driver.textMuted,
        }}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={light ? color.client.textFainter : color.driver.textFaint}
        style={[
          styles.input,
          {
            backgroundColor: light ? '#fff' : color.driver.panel,
            borderColor: light ? color.client.borderStrong : color.driver.border,
            color: light ? color.client.text : color.driver.text,
          },
        ]}
        {...props}
      />
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  variant = 'light',
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  variant?: Variant;
}) {
  const light = variant === 'light';
  const activeBg = light ? color.client.dark : color.driver.amber;
  const activeFg = light ? color.client.onDark : color.driver.onAmber;
  const inactiveBg = light ? '#fff' : color.driver.panel;
  const inactiveFg = light ? color.client.textMuted : color.driver.textFainter;
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: radius.pill,
        paddingHorizontal: 13,
        paddingVertical: 8,
        backgroundColor: active ? activeBg : inactiveBg,
        borderWidth: 1,
        borderColor: active ? activeBg : light ? color.client.borderStrong : color.driver.border,
      }}
    >
      <Text style={{ fontFamily: font.medium, fontSize: 12, color: active ? activeFg : inactiveFg }}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, variant = 'light', style }: { children: React.ReactNode; variant?: Variant; style?: ViewStyle }) {
  const light = variant === 'light';
  return (
    <View
      style={[
        {
          backgroundColor: light ? '#fff' : color.driver.panel,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: light ? color.client.border : color.driver.borderFaint,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Badge({ label, tone = 'success' }: { label: string; tone?: 'success' | 'amber' }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        alignSelf: 'flex-start',
        backgroundColor: tone === 'success' ? color.successBg : color.successBgDark,
        borderRadius: radius.pill,
        paddingHorizontal: 9,
        paddingVertical: 5,
      }}
    >
      <View
        style={{
          width: 5,
          height: 5,
          borderRadius: 3,
          backgroundColor: tone === 'success' ? color.success : color.driver.amber,
        }}
      />
      <Text
        style={{
          fontFamily: font.semibold,
          fontSize: 9.5,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color: tone === 'success' ? color.success : color.driver.amber,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function StarPicker({
  value,
  onChange,
  variant = 'light',
}: {
  value: number;
  onChange: (n: number) => void;
  variant?: Variant;
}) {
  const activeColor = variant === 'light' ? color.client.accent : color.driver.amber;
  const inactiveColor = variant === 'light' ? 'rgba(34,30,28,.18)' : 'rgba(242,239,234,.18)';
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(n)} hitSlop={8}>
          <Text style={{ fontSize: 32, color: n <= value ? activeColor : inactiveColor }}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Initials({ name, size = 46, variant = 'light' }: { name: string; size?: number; variant?: Variant }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const light = variant === 'light';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: light ? color.client.chip : color.driver.panelAlt,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: font.semibold, fontSize: size * 0.32, color: light ? color.client.accent : color.driver.amber }}>
        {initials}
      </Text>
    </View>
  );
}

export function TopBar({
  variant = 'light',
  lang,
  onToggleLang,
  onSignOut,
  profileName,
  onProfile,
}: {
  variant?: Variant;
  lang: string;
  onToggleLang: () => void;
  onSignOut?: () => void;
  profileName?: string;
  onProfile?: () => void;
}) {
  const light = variant === 'light';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 8 }}>
      <View style={{ flex: 1 }} />
      {onProfile ? (
        <Pressable onPress={onProfile} hitSlop={6}>
          <Initials name={profileName ?? ''} size={30} variant={variant} />
        </Pressable>
      ) : null}
      <Pressable
        onPress={onToggleLang}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: light ? '#fff' : color.driver.panel,
          borderWidth: 1,
          borderColor: light ? color.client.borderStrong : color.driver.border,
          borderRadius: radius.pill,
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}
      >
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: light ? color.client.accent : color.driver.amber }} />
        <Text style={{ fontFamily: font.semibold, fontSize: 11, color: light ? color.client.text : color.driver.text }}>
          {lang.toUpperCase()}
        </Text>
      </Pressable>
      {onSignOut ? (
        <Pressable
          onPress={onSignOut}
          style={{
            borderRadius: radius.pill,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: light ? color.client.borderStrong : color.driver.border,
          }}
        >
          <Text style={{ fontFamily: font.semibold, fontSize: 11, color: light ? color.client.textFaint : color.driver.textMuted }}>
            ⏻
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontFamily: font.regular,
    fontSize: 15,
  },
});
