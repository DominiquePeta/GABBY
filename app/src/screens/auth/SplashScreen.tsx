import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Screen, TopBar, Kicker, Heading, Body } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { color, font, radius } from '../../theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const { t, lang, toggleLang } = useI18n();

  return (
    <Screen variant="light">
      <TopBar variant="light" lang={lang} onToggleLang={toggleLang} />
      <View style={{ flex: 1, paddingHorizontal: 26, paddingTop: 24, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 9,
              backgroundColor: color.client.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: '#fff' }}>G</Text>
          </View>
          <Text style={{ fontFamily: font.bold, fontSize: 15, letterSpacing: 3, color: color.client.text }}>GABBY</Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 20 }}>
          <Kicker>{t.splashKicker}</Kicker>
          <Heading style={{ fontSize: 36, marginTop: 16 }}>{t.splashTitle}</Heading>
          <Body style={{ marginTop: 16, maxWidth: 300 }}>{t.splashBody}</Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 22 }}>
            {[t.splashChip1, t.splashChip2].map((chip) => (
              <View
                key={chip}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: color.client.chip,
                  borderRadius: radius.pill,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                }}
              >
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color.success }} />
                <Text style={{ fontFamily: font.medium, fontSize: 11.5, color: color.client.textMuted }}>{chip}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Pressable
            onPress={() => navigation.navigate('Login', { role: 'client' })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: color.client.accent,
              borderRadius: 20,
              padding: 20,
            }}
          >
            <View>
              <Text style={{ fontFamily: font.semibold, fontSize: 16.5, color: '#fff' }}>{t.imClient}</Text>
              <Text style={{ fontFamily: font.regular, fontSize: 12.5, color: 'rgba(255,255,255,.8)', marginTop: 3 }}>
                {t.imClientSub}
              </Text>
            </View>
            <Text style={{ fontSize: 20, color: '#fff' }}>→</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Login', { role: 'driver' })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: color.client.dark,
              borderRadius: 20,
              padding: 20,
            }}
          >
            <View>
              <Text style={{ fontFamily: font.semibold, fontSize: 16.5, color: color.client.onDark }}>{t.imDriver}</Text>
              <Text style={{ fontFamily: font.regular, fontSize: 12.5, color: 'rgba(242,239,234,.7)', marginTop: 3 }}>
                {t.imDriverSub}
              </Text>
            </View>
            <Text style={{ fontSize: 20, color: color.client.onDarkAmber }}>→</Text>
          </Pressable>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 6 }}>
            <Pressable onPress={() => navigation.navigate('Login', { role: 'admin' })}>
              <Text style={{ fontFamily: font.semibold, fontSize: 12, color: color.client.textFaint }}>{t.adminEntry}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}
