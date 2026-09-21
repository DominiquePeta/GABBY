import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../navigation/types';
import { Screen, TopBar, Heading, Body, Initials, Button } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { getRideRequest, subscribeToRideRequest, getDriverProfileById, cancelRideRequest } from '../../data/api';
import { RideRequest, DriverProfile } from '../../data/types';
import { color, font } from '../../theme/theme';

type Props = NativeStackScreenProps<ClientStackParamList, 'Status'>;

const RING: Record<string, { ring: string; dot: string }> = {
  pending: { ring: color.client.chip, dot: color.client.accent },
  accepted: { ring: color.successBg, dot: color.success },
  declined: { ring: '#F5E7E4', dot: color.danger },
};

export default function StatusScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const { t, lang, toggleLang } = useI18n();
  const [ride, setRide] = useState<RideRequest | null>(null);
  const [driver, setDriver] = useState<DriverProfile | null>(null);

  useEffect(() => {
    getRideRequest(requestId).then((r) => {
      setRide(r);
      if (r) getDriverProfileById(r.driver_id).then(setDriver);
    });
    return subscribeToRideRequest(requestId, setRide);
  }, [requestId]);

  useEffect(() => {
    if (ride?.status === 'accepted') navigation.replace('Ride', { requestId });
  }, [ride?.status]);

  if (!ride || !driver) return null;

  const status = ride.status === 'declined' ? 'declined' : 'pending';
  const visuals = RING[status];
  const title = status === 'declined' ? t.declinedTitle : t.pendingTitle;
  const body = status === 'declined' ? t.declinedBody : t.pendingBody;

  return (
    <Screen variant="light">
      <TopBar variant="light" lang={lang} onToggleLang={toggleLang} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 4 }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: color.client.accent }}>
          {t.yourRequest}
        </Text>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: visuals.ring, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: visuals.dot }} />
          </View>
          <View style={{ alignItems: 'center' }}>
            <Heading style={{ textAlign: 'center' }}>{title}</Heading>
            <Body style={{ textAlign: 'center', marginTop: 12, maxWidth: 270 }}>{body}</Body>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 11,
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: color.client.border,
              borderRadius: 18,
              padding: 14,
              width: '100%',
            }}
          >
            <Initials name={driver.name ?? ''} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.semibold, fontSize: 14, color: color.client.text }}>{driver.name}</Text>
              <Text style={{ fontFamily: font.regular, fontSize: 12, color: color.client.textFaint, marginTop: 4 }}>
                {ride.pickup} → {ride.dropoff}
              </Text>
            </View>
          </View>
        </View>

        {status === 'declined' ? (
          <Button title={t.findAnother} onPress={() => navigation.replace('Browse')} tone="dark" />
        ) : (
          <Pressable
            onPress={async () => {
              await cancelRideRequest(requestId);
              navigation.replace('Browse');
            }}
            style={{ borderWidth: 1, borderColor: color.client.borderStrong, borderRadius: 18, padding: 16, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: font.semibold, fontSize: 15, color: color.client.textMuted }}>{t.cancelRequest}</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}
