import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, FlatList, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useI18n } from '../../i18n/I18nContext';
import {
  listOpenNominations,
  markNominationInvited,
  markNominationDeclined,
  listDriversForLinking,
  linkNominationToDriver,
} from '../../data/api';
import { Nomination, DriverPickOption } from '../../data/types';
import { color, font, radius } from '../../theme/theme';

export default function NominationsPanel() {
  const { t, lang } = useI18n();
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [linkingId, setLinkingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setNominations(await listOpenNominations());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  async function onInvite(id: string) {
    await markNominationInvited(id);
    refresh();
  }

  async function onDecline(id: string) {
    setLinkingId(null);
    await markNominationDeclined(id);
    refresh();
  }

  async function onLinked(nominationId: string, driverId: string) {
    await linkNominationToDriver(nominationId, driverId);
    setLinkingId(null);
    refresh();
  }

  return (
    <FlatList
      data={nominations}
      keyExtractor={(n) => n.id}
      contentContainerStyle={{ padding: 20, gap: 12 }}
      ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 30, color: color.client.textFainter }}>{t.nominationsEmpty}</Text>}
      renderItem={({ item }) => (
        <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: color.client.border, borderRadius: 18, padding: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.semibold, fontSize: 14.5, color: color.client.text }}>
                {item.nominated_first_name} {item.nominated_surname}
              </Text>
              <Text style={{ fontFamily: font.regular, fontSize: 11.5, color: color.client.textFaint, marginTop: 5 }}>
                {t.nominatedBy}: {item.nominated_by_type === 'client' ? (lang === 'es' ? 'clienta' : 'client') : lang === 'es' ? 'conductora' : 'driver'}
              </Text>
            </View>
            <View
              style={{
                borderRadius: radius.pill,
                paddingHorizontal: 9,
                paddingVertical: 4,
                backgroundColor: item.status === 'invited' ? color.successBg : color.client.chip,
              }}
            >
              <Text
                style={{
                  fontFamily: font.semibold,
                  fontSize: 10,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: item.status === 'invited' ? color.success : color.client.textMuted,
                }}
              >
                {item.status === 'invited' ? t.statusInvitedLabel : t.statusPendingLabel}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 10, gap: 3 }}>
            {item.contact_phone ? (
              <Text style={{ fontFamily: font.mono, fontSize: 12.5, color: color.client.text }}>{item.contact_phone}</Text>
            ) : null}
            {item.contact_email ? (
              <Text style={{ fontFamily: font.mono, fontSize: 12.5, color: color.client.text }}>{item.contact_email}</Text>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', gap: 9, marginTop: 13 }}>
            <Pressable
              onPress={() => onDecline(item.id)}
              style={{ borderWidth: 1, borderColor: 'rgba(181,67,47,.3)', borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 11 }}
            >
              <Text style={{ fontFamily: font.semibold, fontSize: 12.5, color: color.danger }}>{t.markDeclined}</Text>
            </Pressable>
            {item.status === 'pending' ? (
              <Pressable
                onPress={() => onInvite(item.id)}
                style={{ flex: 1, backgroundColor: color.client.accent, borderRadius: radius.sm, paddingVertical: 11, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: font.semibold, fontSize: 13, color: '#fff' }}>{t.sendInvite}</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => setLinkingId(linkingId === item.id ? null : item.id)}
                style={{ flex: 1, backgroundColor: color.success, borderRadius: radius.sm, paddingVertical: 11, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: font.semibold, fontSize: 13, color: '#fff' }}>{t.linkToDriver}</Text>
              </Pressable>
            )}
          </View>

          {linkingId === item.id ? <DriverLinker nominationId={item.id} onLinked={onLinked} /> : null}
        </View>
      )}
    />
  );
}

function DriverLinker({ nominationId, onLinked }: { nominationId: string; onLinked: (nominationId: string, driverId: string) => void }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DriverPickOption[]>([]);

  async function onSearch(next: string) {
    setQuery(next);
    setResults(await listDriversForLinking(next));
  }

  return (
    <View style={{ marginTop: 13, borderTopWidth: 1, borderTopColor: color.client.border, paddingTop: 13 }}>
      <TextInput
        value={query}
        onChangeText={onSearch}
        placeholder={t.searchDrivers}
        placeholderTextColor={color.client.textFainter}
        style={{
          backgroundColor: color.client.bg,
          borderWidth: 1,
          borderColor: color.client.border,
          borderRadius: radius.sm,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontFamily: font.regular,
          fontSize: 13.5,
          color: color.client.text,
        }}
      />
      <View style={{ gap: 6, marginTop: 8 }}>
        {results.map((d) => (
          <Pressable
            key={d.id}
            onPress={() => onLinked(nominationId, d.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: color.client.chip,
              borderRadius: radius.sm,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <Text style={{ fontFamily: font.medium, fontSize: 13, color: color.client.text }}>{d.name}</Text>
            <Text style={{ fontFamily: font.semibold, fontSize: 12, color: color.success }}>{t.confirmLink}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
