import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DriverStackParamList } from '../../navigation/types';
import { Screen, TopBar, Card } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { getRideRequest, getRideContact, completeRide, signOut } from '../../data/api';
import { RideRequest } from '../../data/types';
import { color, font } from '../../theme/theme';

type Props = NativeStackScreenProps<DriverStackParamList, 'DriverRide'>;

export default function DriverRideScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const { t, lang, toggleLang } = useI18n();
  const [ride, setRide] = useState<RideRequest | null>(null);
  const [contact, setContact] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    (async () => {
      const r = await getRideRequest(requestId);
      setRide(r);
      setContact(await getRideContact(requestId));
    })();
  }, [requestId]);

  async function onCompleted() {
    await completeRide(requestId);
    navigation.replace('DriverRate', { requestId, clientId: ride!.client_id });
  }

  if (!ride || !contact) return null;

  return (
    <Screen variant="dark">
      <TopBar variant="dark" lang={lang} onToggleLang={toggleLang} onSignOut={() => signOut()} />
      <View style={{ backgroundColor: color.driver.amber, padding: 22, marginTop: 8 }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 10.5, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(23,22,26,.6)' }}>
          {t.activeRide}
        </Text>
        <Text style={{ fontFamily: font.semibold, fontSize: 25, color: color.driver.onAmber, marginTop: 10 }}>{contact.name}</Text>
      </View>

      <View style={{ padding: 22 }}>
        <Card variant="dark">
          <Row label={t.pickup} value={ride.pickup} dot={color.driver.amber} />
          <View style={{ width: 1, height: 18, backgroundColor: 'rgba(242,239,234,.15)', marginVertical: 6, marginLeft: 3 }} />
          <Row label={t.dropoff} value={ride.dropoff} dot={color.driver.textMuted} />
        </Card>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 13 }}>
          <Pressable
            onPress={() => Linking.openURL(`tel:${contact.phone}`)}
            style={{ flex: 1, backgroundColor: color.driver.panel, borderRadius: 15, padding: 15, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: font.semibold, fontSize: 14, color: color.driver.text }}>{t.callClient}</Text>
          </Pressable>
        </View>

        {ride.share_trip ? (
          <View style={{ backgroundColor: 'rgba(232,179,61,.09)', borderRadius: 16, padding: 15, marginTop: 20, flexDirection: 'row', gap: 11 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color.driver.amber, marginTop: 6 }} />
            <Text style={{ flex: 1, fontFamily: font.regular, fontSize: 12.5, lineHeight: 18, color: color.driver.textFainter }}>
              {t.driverSafetyNote}
            </Text>
          </View>
        ) : null}

        <View style={{ marginTop: 24, gap: 10 }}>
          <Pressable onPress={onCompleted} style={{ backgroundColor: '#F2EFEA', borderRadius: 18, padding: 18, alignItems: 'center' }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 16, color: '#17161A' }}>{t.markCompleted}</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.replace('Dashboard')}
            style={{ borderWidth: 1, borderColor: color.driver.border, borderRadius: 18, padding: 15, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: font.semibold, fontSize: 14, color: color.driver.textMuted }}>{t.backToDashboard}</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

function Row({ label, value, dot }: { label: string; value: string; dot: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 11, alignItems: 'flex-start' }}>
      <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: dot, marginTop: 6 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.regular, fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase', color: color.driver.textFaint }}>
          {label}
        </Text>
        <Text style={{ fontFamily: font.medium, fontSize: 15, color: color.driver.text, marginTop: 5 }}>{value}</Text>
      </View>
    </View>
  );
}
