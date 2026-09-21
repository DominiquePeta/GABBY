import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../navigation/types';
import { Screen, TopBar, Heading, TextField, Button, Initials, Card } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../data/AuthContext';
import { getDriverProfileById, createRideRequest } from '../../data/api';
import { DriverProfile } from '../../data/types';
import { color, font, radius } from '../../theme/theme';

type Props = NativeStackScreenProps<ClientStackParamList, 'Confirm'>;

export default function ConfirmScreen({ route, navigation }: Props) {
  const { driverId } = route.params;
  const { t, lang, toggleLang } = useI18n();
  const { profile } = useAuth();
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [share, setShare] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDriverProfileById(driverId).then(setDriver);
  }, [driverId]);

  async function onSubmit() {
    if (!profile || !pickup.trim() || !dropoff.trim()) return;
    setSubmitting(true);
    try {
      const req = await createRideRequest({
        clientId: profile.id,
        driverId,
        pickup: pickup.trim(),
        dropoff: dropoff.trim(),
        shareTrip: share,
      });
      navigation.replace('Status', { requestId: req.id });
    } finally {
      setSubmitting(false);
    }
  }

  if (!driver) return null;

  return (
    <Screen variant="light" scroll>
      <TopBar variant="light" lang={lang} onToggleLang={toggleLang} />
      <View style={{ paddingHorizontal: 24, paddingTop: 4 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ paddingVertical: 16 }}>
          <Text style={{ color: color.client.textFaint }}>← {t.back}</Text>
        </Pressable>
        <Heading style={{ marginBottom: 18 }}>{t.confirmTitle}</Heading>

        <Card variant="light" style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
          <Initials name={driver.name ?? ''} size={48} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 15.5, color: color.client.text }}>{driver.name}</Text>
            <Text style={{ fontFamily: font.regular, fontSize: 12.5, color: color.client.textFaint, marginTop: 5 }}>
              ★ {driver.rating_avg.toFixed(1)} · {driver.car_make_model}
            </Text>
          </View>
        </Card>

        <View style={{ marginTop: 16 }}>
          <TextField label={t.pickup} value={pickup} onChangeText={setPickup} placeholder="Carrer de Cadis 42, Russafa" />
          <TextField label={t.dropoff} value={dropoff} onChangeText={setDropoff} placeholder="Estació del Nord" />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: color.client.chip,
            borderRadius: radius.md,
            padding: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 13.5, color: color.client.text }}>{t.shareTrip}</Text>
            <Text style={{ fontFamily: font.regular, fontSize: 11.5, color: color.client.textMuted, marginTop: 4 }}>{t.shareTripSub}</Text>
          </View>
          <Pressable
            onPress={() => setShare((s) => !s)}
            style={{ width: 48, height: 28, borderRadius: radius.pill, backgroundColor: share ? color.success : 'rgba(34,30,28,.18)', justifyContent: 'center' }}
          >
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', marginLeft: share ? 23 : 3 }} />
          </Pressable>
        </View>

        <View style={{ marginTop: 20 }}>
          <Button title={t.sendRequest} onPress={onSubmit} loading={submitting} disabled={!pickup.trim() || !dropoff.trim()} />
          <Text style={{ textAlign: 'center', fontFamily: font.regular, fontSize: 11.5, color: color.client.textFainter, marginTop: 12 }}>
            {t.confirmNote}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
