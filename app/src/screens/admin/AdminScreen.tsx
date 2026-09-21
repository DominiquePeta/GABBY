import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, Image, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, TopBar } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../data/AuthContext';
import { listPendingDrivers, getLicencePhotoUrl, reviewDriver, signOut } from '../../data/api';
import { color, font, radius } from '../../theme/theme';
import NominationsPanel from './NominationsPanel';

type PendingDriver = {
  profile_id: string;
  name: string;
  licence_number: string;
  submitted_at: string;
  licence_photo_path: string;
};

export default function AdminScreen() {
  const { t, lang, toggleLang } = useI18n();
  const { profile } = useAuth();
  const [tab, setTab] = useState<'drivers' | 'nominations'>('drivers');
  const [drivers, setDrivers] = useState<PendingDriver[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    const list = (await listPendingDrivers()) as PendingDriver[];
    setDrivers(list);
    const urls: Record<string, string> = {};
    await Promise.all(
      list.map(async (d) => {
        const { data } = await getLicencePhotoUrl(d.licence_photo_path);
        if (data?.signedUrl) urls[d.profile_id] = data.signedUrl;
      })
    );
    setPhotoUrls(urls);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  async function onReview(profileId: string, approve: boolean) {
    if (!profile) return;
    await reviewDriver(profileId, approve, profile.id);
    setDrivers((prev) => prev.filter((d) => d.profile_id !== profileId));
  }

  return (
    <Screen variant="light">
      <TopBar variant="light" lang={lang} onToggleLang={toggleLang} onSignOut={() => signOut()} />
      <View style={{ backgroundColor: color.admin.header, padding: 20, marginTop: 4 }}>
        <Text style={{ fontFamily: font.mono, fontSize: 10.5, letterSpacing: 2, color: color.driver.amber }}>GABBY ADMIN</Text>
        <Text style={{ fontFamily: font.semibold, fontSize: 22, color: color.client.onDark, marginTop: 10 }}>{t.adminTitle}</Text>
        <Text style={{ fontFamily: font.regular, fontSize: 12.5, color: 'rgba(242,239,234,.6)', marginTop: 6 }}>
          {drivers.length} {lang === 'es' ? 'en la cola' : 'in the queue'}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 16 }}>
        <TabButton label={t.adminTabDrivers} active={tab === 'drivers'} onPress={() => setTab('drivers')} />
        <TabButton label={t.adminTabNominations} active={tab === 'nominations'} onPress={() => setTab('nominations')} />
      </View>

      {tab === 'nominations' ? (
        <NominationsPanel />
      ) : (
        <FlatList
        data={drivers}
        keyExtractor={(d) => d.profile_id}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 30, color: color.client.textFainter }}>{t.adminEmpty}</Text>}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: color.client.border, borderRadius: 18, padding: 15 }}>
            <View style={{ flexDirection: 'row', gap: 13 }}>
              {photoUrls[item.profile_id] ? (
                <Image source={{ uri: photoUrls[item.profile_id] }} style={{ width: 62, height: 44, borderRadius: 9 }} />
              ) : (
                <View style={{ width: 62, height: 44, borderRadius: 9, backgroundColor: color.client.chip }} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.semibold, fontSize: 14.5, color: color.client.text }}>{item.name}</Text>
                <Text style={{ fontFamily: font.mono, fontSize: 12, color: color.client.textFaint, marginTop: 6 }}>
                  {item.licence_number}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 9, marginTop: 13 }}>
              <Pressable
                onPress={() => onReview(item.profile_id, false)}
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(181,67,47,.3)',
                  borderRadius: radius.sm,
                  paddingHorizontal: 16,
                  paddingVertical: 11,
                }}
              >
                <Text style={{ fontFamily: font.semibold, fontSize: 12.5, color: color.danger }}>{t.reject}</Text>
              </Pressable>
              <Pressable
                onPress={() => onReview(item.profile_id, true)}
                style={{ flex: 1, backgroundColor: color.success, borderRadius: radius.sm, paddingVertical: 11, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: font.semibold, fontSize: 13, color: '#fff' }}>{t.approve}</Text>
              </Pressable>
            </View>
          </View>
        )}
        />
      )}
    </Screen>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        borderRadius: radius.pill,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: active ? color.admin.header : '#fff',
        borderWidth: 1,
        borderColor: active ? color.admin.header : color.client.border,
      }}
    >
      <Text style={{ fontFamily: font.semibold, fontSize: 12.5, color: active ? '#fff' : color.client.textMuted }}>{label}</Text>
    </Pressable>
  );
}
