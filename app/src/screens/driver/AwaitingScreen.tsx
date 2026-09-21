import React from 'react';
import { View, Text } from 'react-native';
import { Screen, TopBar, Heading, Body, Kicker } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../data/AuthContext';
import { signOut } from '../../data/api';
import { color, font } from '../../theme/theme';

export default function AwaitingScreen() {
  const { t, lang, toggleLang } = useI18n();
  const { profile } = useAuth();

  const steps = [
    { label: lang === 'es' ? 'Datos recibidos' : 'Details received', state: lang === 'es' ? 'Hecho' : 'Done', done: true },
    {
      label: lang === 'es' ? 'Revisión del equipo' : 'Team review',
      state: lang === 'es' ? 'En curso' : 'In progress',
      done: false,
    },
  ];

  return (
    <Screen variant="dark">
      <TopBar variant="dark" lang={lang} onToggleLang={toggleLang} onSignOut={() => signOut()} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8 }}>
        <Kicker tone="amber">{t.driverBadge}</Kicker>
        <View style={{ flex: 1, justifyContent: 'center', gap: 22 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              backgroundColor: 'rgba(232,179,61,.13)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color.driver.amber }} />
          </View>
          <View>
            <Heading variant="dark" style={{ fontSize: 27 }}>
              {t.awaitingTitle}
            </Heading>
            <Body variant="dark" style={{ marginTop: 12 }}>
              {t.awaitingBody}
            </Body>
            {profile ? (
              <Text style={{ fontFamily: font.regular, fontSize: 12, color: color.driver.textFaint, marginTop: 8 }}>
                {profile.name}
              </Text>
            ) : null}
          </View>
          <View style={{ backgroundColor: color.driver.panel, borderRadius: 18, paddingHorizontal: 16 }}>
            {steps.map((v, i) => (
              <View
                key={v.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 11,
                  paddingVertical: 14,
                  borderBottomWidth: i === steps.length - 1 ? 0 : 1,
                  borderBottomColor: 'rgba(242,239,234,.06)',
                }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 6,
                    backgroundColor: v.done ? color.success : 'rgba(242,239,234,.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {v.done ? <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text> : null}
                </View>
                <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 13.5, color: color.driver.text }}>{v.label}</Text>
                <Text style={{ fontFamily: font.regular, fontSize: 11.5, color: v.done ? '#6FA98C' : color.driver.textFaint }}>
                  {v.state}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}
