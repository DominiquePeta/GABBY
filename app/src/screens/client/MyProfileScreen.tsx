import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../navigation/types';
import { Screen, TopBar, Badge, Initials, Card } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../data/AuthContext';
import { getMyRatingSummary, countCompletedRides } from '../../data/api';
import { color, font } from '../../theme/theme';

type Props = NativeStackScreenProps<ClientStackParamList, 'MyProfile'>;

export default function MyProfileScreen({ navigation }: Props) {
  const { t, lang, toggleLang } = useI18n();
  const { profile } = useAuth();
  const [rating, setRating] = useState({ avg: 0, count: 0 });
  const [completedRides, setCompletedRides] = useState(0);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [r, c] = await Promise.all([getMyRatingSummary(profile.id), countCompletedRides(profile.id, 'client')]);
      setRating(r);
      setCompletedRides(c);
    })();
  }, [profile]);

  if (!profile) return null;

  return (
    <Screen variant="light" scroll>
      <TopBar variant="light" lang={lang} onToggleLang={toggleLang} />
      <View style={{ paddingHorizontal: 22, paddingTop: 6 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ paddingVertical: 14 }}>
          <Text style={{ color: color.client.textMuted }}>← {t.back}</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
          <Initials name={profile.name} size={72} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 22, letterSpacing: -0.3, color: color.client.text }}>
              {profile.name}
            </Text>
            <Text style={{ fontFamily: font.regular, fontSize: 13.5, color: color.client.textFaint, marginTop: 4 }}>
              {profile.phone}
            </Text>
            {profile.nominations_converted >= 1 ? (
              <View style={{ marginTop: 9 }}>
                <Badge label={t.foundingConnector} tone="success" />
              </View>
            ) : null}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
          <Stat
            value={rating.count > 0 ? `★ ${rating.avg.toFixed(1)}` : '—'}
            label={t.statRating}
            sub={rating.count > 0 ? `${rating.count} ${lang === 'es' ? 'valoraciones' : 'reviews'}` : undefined}
          />
          <Stat value={String(completedRides)} label={t.statRides} />
        </View>
      </View>
    </Screen>
  );
}

function Stat({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <Card variant="light" style={{ flex: 1, alignItems: 'flex-start' }}>
      <Text style={{ fontFamily: font.semibold, fontSize: 21, color: color.client.text }}>{value}</Text>
      <Text style={{ fontFamily: font.regular, fontSize: 11.5, color: color.client.textFaint, marginTop: 5 }}>{label}</Text>
      {sub ? (
        <Text style={{ fontFamily: font.regular, fontSize: 10.5, color: color.client.textFainter, marginTop: 2 }}>{sub}</Text>
      ) : null}
    </Card>
  );
}
