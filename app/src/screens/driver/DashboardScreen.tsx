import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { DriverStackParamList } from '../../navigation/types';
import { Screen, TopBar, Badge, Initials, Card } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../data/AuthContext';
import {
  getMyDriverProfile,
  listIncomingRequests,
  subscribeToIncomingRequests,
  respondToRequest,
  setAvailability,
  signOut,
  getActiveRideForDriver,
} from '../../data/api';
import { DriverProfile, IncomingRequest } from '../../data/types';
import { color, font, radius } from '../../theme/theme';

type Props = NativeStackScreenProps<DriverStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const { t, lang, toggleLang } = useI18n();
  const { profile } = useAuth();
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profile) return;
    const [dp, active] = await Promise.all([getMyDriverProfile(profile.id), getActiveRideForDriver(profile.id)]);
    setDriverProfile(dp);
    if (active) {
      navigation.replace('DriverRide', { requestId: active.id });
      return;
    }
    const reqs = await listIncomingRequests(profile.id);
    setRequests(reqs);
    setLoading(false);
  }, [profile, navigation]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    if (!profile) return;
    const unsubscribe = subscribeToIncomingRequests(profile.id, refresh);
    return unsubscribe;
  }, [profile, refresh]);

  async function onToggleAvailable() {
    if (!profile || !driverProfile) return;
    const next = !driverProfile.available;
    setDriverProfile({ ...driverProfile, available: next });
    await setAvailability(profile.id, next);
  }

  async function onAccept(r: IncomingRequest) {
    await respondToRequest(r.id, 'accepted');
    navigation.replace('DriverRide', { requestId: r.id });
  }

  async function onDecline(r: IncomingRequest) {
    await respondToRequest(r.id, 'declined');
    setRequests((prev) => prev.filter((x) => x.id !== r.id));
  }

  if (!profile || !driverProfile) return null;

  return (
    <Screen variant="dark">
      <TopBar
        variant="dark"
        lang={lang}
        onToggleLang={toggleLang}
        onSignOut={() => signOut()}
        profileName={profile.name}
        onProfile={() => navigation.navigate('MyProfile')}
      />
      <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: font.regular, fontSize: 12.5, color: color.driver.textMuted }}>{t.driverGreeting}</Text>
            <Text style={{ fontFamily: font.semibold, fontSize: 21, color: color.driver.text, marginTop: 4 }}>
              {profile.name.split(' ')[0]}
            </Text>
          </View>
          <Badge label={driverProfile.verified ? t.verified : t.statPending} tone="amber" />
        </View>

        <Pressable onPress={() => navigation.navigate('NominationForm')} style={{ alignSelf: 'flex-start', marginTop: 10 }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 12.5, color: color.driver.amber }}>{t.nominateDriver} →</Text>
        </Pressable>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: color.driver.panel,
            borderRadius: 16,
            padding: 14,
            marginTop: 16,
          }}
        >
          <View>
            <Text style={{ fontFamily: font.semibold, fontSize: 14.5, color: color.driver.text }}>{t.availableNow}</Text>
            <Text style={{ fontFamily: font.regular, fontSize: 11.5, color: color.driver.textMuted, marginTop: 4 }}>
              {driverProfile.available ? t.availOn : t.availOff}
            </Text>
          </View>
          <Pressable
            onPress={onToggleAvailable}
            style={{
              width: 52,
              height: 30,
              borderRadius: radius.pill,
              backgroundColor: driverProfile.available ? color.driver.amber : 'rgba(242,239,234,.15)',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#fff',
                marginLeft: driverProfile.available ? 25 : 3,
              }}
            />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', gap: 9, marginTop: 12 }}>
          <Stat value={`★ ${driverProfile.rating_avg.toFixed(1)}`} label={t.statRating} />
          <Stat value={String(driverProfile.rating_count)} label={t.statRides} />
          <Stat value={String(requests.length)} label={t.statPending} amber />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20, flex: 1 }}>
        <Text
          style={{
            fontFamily: font.semibold,
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: color.driver.textFaint,
            marginBottom: 12,
          }}
        >
          {t.incomingRequests}
        </Text>
        {!driverProfile.available ? (
          <Card variant="dark" style={{ alignItems: 'center', paddingVertical: 26 }}>
            <Text style={{ fontFamily: font.regular, fontSize: 13.5, color: color.driver.textMuted, textAlign: 'center' }}>
              {t.offlineNote}
            </Text>
          </Card>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(r) => r.id}
            ListEmptyComponent={
              !loading ? (
                <Text style={{ textAlign: 'center', paddingVertical: 24, color: color.driver.textFaint }}>{t.noRequests}</Text>
              ) : null
            }
            renderItem={({ item }) => (
              <Card variant="dark" style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Initials name={item.client_name} variant="dark" size={42} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: font.semibold, fontSize: 15, color: color.driver.text }}>{item.client_name}</Text>
                    <Text style={{ fontFamily: font.regular, fontSize: 12, color: color.driver.amber, marginTop: 5 }}>
                      {item.client_rating_count > 0 ? `★ ${item.client_rating_avg.toFixed(1)}` : lang === 'es' ? 'Sin valoraciones aún' : 'No ratings yet'}
                    </Text>
                  </View>
                </View>
                <View style={{ backgroundColor: color.driver.panelAlt, borderRadius: 13, padding: 13, marginTop: 13 }}>
                  <Text style={{ fontFamily: font.regular, fontSize: 13, color: color.driver.text }}>{item.pickup}</Text>
                  <View style={{ width: 1, height: 10, backgroundColor: 'rgba(242,239,234,.15)', marginVertical: 3, marginLeft: 3 }} />
                  <Text style={{ fontFamily: font.regular, fontSize: 13, color: color.driver.textFainter }}>{item.dropoff}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 9, marginTop: 13 }}>
                  <Pressable
                    onPress={() => onDecline(item)}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: color.driver.border,
                      borderRadius: 13,
                      paddingVertical: 13,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: font.semibold, fontSize: 13.5, color: color.driver.textMuted }}>{t.decline}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onAccept(item)}
                    style={{
                      flex: 1,
                      backgroundColor: color.driver.amber,
                      borderRadius: 13,
                      paddingVertical: 13,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: font.semibold, fontSize: 14, color: color.driver.onAmber }}>{t.accept}</Text>
                  </Pressable>
                </View>
              </Card>
            )}
          />
        )}
      </View>
    </Screen>
  );
}

function Stat({ value, label, amber }: { value: string; label: string; amber?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: color.driver.panel, borderRadius: 14, padding: 12 }}>
      <Text style={{ fontFamily: font.semibold, fontSize: 19, color: amber ? color.driver.amber : color.driver.text }}>{value}</Text>
      <Text style={{ fontFamily: font.regular, fontSize: 10.5, color: color.driver.textMuted, marginTop: 5 }}>{label}</Text>
    </View>
  );
}
