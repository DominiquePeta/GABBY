import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../navigation/types';
import { Screen, TopBar, Badge, Initials, Card, Button } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { getDriverProfileById, getDriverReviews } from '../../data/api';
import { DriverProfile, DriverReview } from '../../data/types';
import { color, font } from '../../theme/theme';

type Props = NativeStackScreenProps<ClientStackParamList, 'DriverProfile'>;

export default function DriverProfileScreen({ route, navigation }: Props) {
  const { driverId } = route.params;
  const { t, lang, toggleLang } = useI18n();
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [reviews, setReviews] = useState<DriverReview[]>([]);

  useEffect(() => {
    (async () => {
      setDriver(await getDriverProfileById(driverId));
      setReviews(await getDriverReviews(driverId));
    })();
  }, [driverId]);

  if (!driver) return null;

  return (
    <Screen variant="light" scroll>
      <TopBar variant="light" lang={lang} onToggleLang={toggleLang} />
      <View style={{ backgroundColor: color.client.chip, paddingHorizontal: 22, paddingTop: 6, paddingBottom: 26 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ paddingVertical: 14 }}>
          <Text style={{ color: color.client.textMuted }}>← {t.back}</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 15, alignItems: 'flex-start' }}>
          <Initials name={driver.name ?? ''} size={86} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 24, letterSpacing: -0.3, color: color.client.text }}>{driver.name}</Text>
            <Text style={{ fontFamily: font.semibold, fontSize: 14, color: color.client.text, marginTop: 8 }}>
              ★ {driver.rating_avg.toFixed(1)}{' '}
              <Text style={{ fontFamily: font.regular, fontSize: 12.5, color: color.client.textFaint }}>
                · {driver.rating_count} {lang === 'es' ? 'valoraciones' : 'reviews'}
              </Text>
            </Text>
            <View style={{ marginTop: 11 }}>
              <Badge label={t.licenceVerified} tone="success" />
            </View>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 22, paddingTop: 22 }}>
        {driver.bio ? <Text style={{ fontFamily: font.regular, fontSize: 15, lineHeight: 23, color: '#4A443F' }}>{driver.bio}</Text> : null}

        <SectionLabel>{t.areasServed}</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
          {driver.areas.map((a) => (
            <View key={a} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: color.client.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}>
              <Text style={{ fontFamily: font.medium, fontSize: 12, color: '#4A443F' }}>{a}</Text>
            </View>
          ))}
        </View>

        <SectionLabel>{t.theCar}</SectionLabel>
        <Card variant="light" style={{ padding: 0, overflow: 'hidden' }}>
          <InfoRow label={t.makeModel} value={driver.car_make_model} />
          <InfoRow label={t.colour} value={driver.car_colour} />
          <InfoRow label={t.plate} value={driver.car_plate} last />
        </Card>

        <SectionLabel>{t.recentReviews}</SectionLabel>
        <View style={{ gap: 10 }}>
          {reviews.map((r, i) => (
            <Card key={i} variant="light" style={{ borderRadius: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: font.semibold, fontSize: 12.5, color: color.client.text }}>{r.reviewer_display}</Text>
                <Text style={{ fontFamily: font.semibold, fontSize: 11.5, color: color.client.accent }}>{'★'.repeat(r.stars)}</Text>
              </View>
              {r.comment ? (
                <Text style={{ fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: color.client.textMuted, marginTop: 8 }}>
                  {r.comment}
                </Text>
              ) : null}
            </Card>
          ))}
        </View>
      </View>

      <View style={{ padding: 22 }}>
        <Button title={t.requestBooking} onPress={() => navigation.navigate('Confirm', { driverId })} />
      </View>
    </Screen>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: font.semibold,
        fontSize: 11,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: color.client.textFaint,
        marginTop: 24,
        marginBottom: 11,
      }}
    >
      {children}
    </Text>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: color.client.border,
      }}
    >
      <Text style={{ fontFamily: font.regular, fontSize: 13, color: color.client.textFaint }}>{label}</Text>
      <Text style={{ fontFamily: font.semibold, fontSize: 13, color: color.client.text }}>{value}</Text>
    </View>
  );
}
