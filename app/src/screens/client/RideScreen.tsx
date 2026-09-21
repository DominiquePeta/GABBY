import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../navigation/types';
import { Screen, TopBar, Card, Initials } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { getRideRequest, getRideContact, getDriverProfileById, completeRide } from '../../data/api';
import { RideRequest, DriverProfile } from '../../data/types';
import { color, font } from '../../theme/theme';

type Props = NativeStackScreenProps<ClientStackParamList, 'Ride'>;

export default function RideScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const { t, lang, toggleLang } = useI18n();
  const [ride, setRide] = useState<RideRequest | null>(null);
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [contact, setContact] = useState<{ name: string; phone: string } | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const r = await getRideRequest(requestId);
      setRide(r);
      if (r) {
        setDriver(await getDriverProfileById(r.driver_id));
        setContact(await getRideContact(requestId));
      }
    })();
  }, [requestId]);

  if (!ride || !driver || !contact) return null;

  const checkRows = [
    { key: 'plate', label: t.plate, value: driver.car_plate },
    { key: 'car', label: t.makeModel, value: driver.car_make_model },
    { key: 'colour', label: t.colour, value: driver.car_colour },
    { key: 'face', label: lang === 'es' ? 'La cara coincide con la foto' : 'Face matches the photo', value: driver.name ?? '' },
  ];

  return (
    <Screen variant="light">
      <TopBar variant="light" lang={lang} onToggleLang={toggleLang} />
      <View style={{ backgroundColor: color.success, padding: 22, marginTop: 4 }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 10.5, letterSpacing: 1.5, textTransform: 'uppercase', color: '#A8E6C4' }}>
          {t.rideConfirmed}
        </Text>
        <Text style={{ fontFamily: font.semibold, fontSize: 25, color: '#fff', marginTop: 10 }}>{t.rideTitle}</Text>
      </View>

      <View style={{ padding: 22 }}>
        <Card variant="light">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
            <Initials name={driver.name ?? ''} size={54} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.semibold, fontSize: 16, color: color.client.text }}>{driver.name}</Text>
              <Text style={{ fontFamily: font.regular, fontSize: 12.5, color: color.client.textFaint, marginTop: 5 }}>
                ★ {driver.rating_avg.toFixed(1)}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => Linking.openURL(`tel:${contact.phone}`)}
            style={{ backgroundColor: color.client.accent, borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 15 }}
          >
            <Text style={{ fontFamily: font.semibold, fontSize: 14, color: '#fff' }}>{contact.phone}</Text>
          </Pressable>
        </Card>

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
          {t.beforeYouGetIn}
        </Text>
        <Card variant="light" style={{ padding: 0, overflow: 'hidden' }}>
          {checkRows.map((r, i) => {
            const on = !!checks[r.key];
            return (
              <Pressable
                key={r.key}
                onPress={() => setChecks((p) => ({ ...p, [r.key]: !p[r.key] }))}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: color.client.border,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    borderWidth: 1.5,
                    borderColor: on ? color.success : 'rgba(34,30,28,.25)',
                    backgroundColor: on ? color.success : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {on ? <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.regular, fontSize: 11.5, color: color.client.textFaint }}>{r.label}</Text>
                  <Text style={{ fontFamily: font.semibold, fontSize: 14.5, color: color.client.text, marginTop: 4 }}>{r.value}</Text>
                </View>
              </Pressable>
            );
          })}
          <View style={{ padding: 14, backgroundColor: color.client.bg }}>
            <Text style={{ fontFamily: font.regular, fontSize: 12, lineHeight: 17, color: color.client.textMuted }}>{t.matchNote}</Text>
          </View>
        </Card>

        <View style={{ marginTop: 22, gap: 10 }}>
          <Pressable
            onPress={async () => {
              await completeRide(requestId);
              navigation.replace('ClientRate', { requestId, driverId: driver.profile_id });
            }}
            style={{ backgroundColor: color.client.dark, borderRadius: 18, padding: 18, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: font.semibold, fontSize: 16, color: color.client.onDark }}>{t.rideDone}</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL('tel:112')}
            style={{ borderWidth: 1, borderColor: color.dangerBorder, borderRadius: 18, padding: 15, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: font.semibold, fontSize: 14, color: color.danger }}>{t.emergency}</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
