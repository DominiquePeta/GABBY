import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ClientStackParamList } from '../../navigation/types';
import { Screen, TopBar, Chip, Card, Initials, Badge } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../data/AuthContext';
import { AREAS } from '../../i18n/strings';
import { listVerifiedDrivers, pickAnyAvailableDriver, signOut, getActiveClientRequest } from '../../data/api';
import { DriverProfile } from '../../data/types';
import { color, font, radius } from '../../theme/theme';

type Props = NativeStackScreenProps<ClientStackParamList, 'Browse'>;

export default function BrowseScreen({ navigation }: Props) {
  const { t, lang, toggleLang } = useI18n();
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [area, setArea] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await listVerifiedDrivers({ query, area });
    setDrivers(list);
    setLoading(false);
  }, [query, area]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const activeId = await getActiveClientRequest(profile.id);
      if (activeId) navigation.navigate('Status', { requestId: activeId });
    })();
  }, [profile]);

  async function onAnyAvailable() {
    const pick = await pickAnyAvailableDriver(area);
    if (pick) navigation.navigate('Confirm', { driverId: pick.profile_id });
  }

  return (
    <Screen variant="light">
      <TopBar
        variant="light"
        lang={lang}
        onToggleLang={toggleLang}
        onSignOut={() => signOut()}
        profileName={profile?.name}
        onProfile={() => navigation.navigate('MyProfile')}
      />
      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <View>
            <Text style={{ fontFamily: font.regular, fontSize: 13, color: color.client.textFaint }}>{t.greeting}</Text>
            <Text style={{ fontFamily: font.semibold, fontSize: 23, letterSpacing: -0.3, color: color.client.text, marginTop: 4 }}>
              {t.browseTitle}
            </Text>
          </View>
          {profile && profile.nominations_converted >= 1 ? <Badge label={t.foundingConnector} tone="success" /> : null}
        </View>

        <Pressable onPress={() => navigation.navigate('NominationForm')} style={{ alignSelf: 'flex-start', marginTop: 12 }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 12.5, color: color.client.accent }}>{t.nominateDriver} →</Text>
        </Pressable>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 9,
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: color.client.border,
            borderRadius: radius.md,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginTop: 16,
          }}
        >
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={color.client.textFainter}
            style={{ flex: 1, fontFamily: font.regular, fontSize: 14.5, color: color.client.text }}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 7 }}>
          <Chip label={lang === 'es' ? 'Todas' : 'All areas'} active={area === null} onPress={() => setArea(null)} />
          {AREAS.map((a) => (
            <Chip key={a} label={a} active={area === a} onPress={() => setArea(a)} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={drivers}
        keyExtractor={(d) => d.profile_id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32, gap: 12 }}
        ListHeaderComponent={
          <Pressable
            onPress={onAnyAvailable}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 13,
              backgroundColor: color.client.dark,
              borderRadius: 18,
              padding: 16,
              marginHorizontal: 20,
              marginBottom: 18,
            }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.client.onDarkAmber }} />
            <Text style={{ flex: 1, fontFamily: font.semibold, fontSize: 14.5, color: color.client.onDark }}>{t.anyAvailable}</Text>
            <Text style={{ fontSize: 17, color: color.client.onDarkAmber }}>→</Text>
          </Pressable>
        }
        ListEmptyComponent={
          !loading ? <Text style={{ textAlign: 'center', padding: 30, color: color.client.textFainter }}>{t.noResults}</Text> : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('DriverProfile', { driverId: item.profile_id })}
            style={{ flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: color.client.border, borderRadius: 18, padding: 13 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Initials name={item.name ?? ''} />
              <Badge label={t.verified} tone="success" />
            </View>
            <Text style={{ fontFamily: font.semibold, fontSize: 14.5, color: color.client.text, marginTop: 11 }}>{item.name}</Text>
            <Text style={{ fontFamily: font.semibold, fontSize: 12, color: color.client.text, marginTop: 5 }}>
              ★ {item.rating_avg.toFixed(1)} <Text style={{ fontFamily: font.regular, color: color.client.textFainter }}>({item.rating_count})</Text>
            </Text>
            <Text style={{ fontFamily: font.regular, fontSize: 11.5, color: color.client.textFaint, marginTop: 8 }} numberOfLines={2}>
              {item.areas.slice(0, 3).join(' · ')}
            </Text>
            <Text style={{ fontFamily: font.regular, fontSize: 11, color: item.available ? color.success : color.client.textFainter, marginTop: 9 }}>
              {item.available ? (lang === 'es' ? 'Disponible ahora' : 'Available now') : lang === 'es' ? 'No disponible' : 'Offline'}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}
