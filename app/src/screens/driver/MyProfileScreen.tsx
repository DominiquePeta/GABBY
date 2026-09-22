import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DriverStackParamList } from '../../navigation/types';
import { Screen, TopBar, Badge, Initials, Card } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../data/AuthContext';
import { getMyDriverProfile, getMyVerification, countCompletedRides, getPublicPhotoUrl } from '../../data/api';
import { DriverProfile, DriverVerification } from '../../data/types';
import { color, font } from '../../theme/theme';

type Props = NativeStackScreenProps<DriverStackParamList, 'MyProfile'>;

export default function MyProfileScreen({ navigation }: Props) {
  const { t, lang, toggleLang } = useI18n();
  const { profile } = useAuth();
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [verification, setVerification] = useState<DriverVerification | null>(null);
  const [completedRides, setCompletedRides] = useState(0);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [dp, v, c] = await Promise.all([
        getMyDriverProfile(profile.id),
        getMyVerification(profile.id),
        countCompletedRides(profile.id, 'driver'),
      ]);
      setDriverProfile(dp);
      setVerification(v);
      setCompletedRides(c);
    })();
  }, [profile]);

  if (!profile || !driverProfile) return null;

  const photoUrl = getPublicPhotoUrl(driverProfile.profile_photo_path);
  const verificationLabel = verification
    ? verification.status === 'approved'
      ? t.verified
      : verification.status === 'rejected'
      ? t.statusRejectedLabel
      : t.statusPendingLabel
    : t.notSubmittedLabel;
  const verificationTone = verification?.status === 'approved' ? 'success' : 'amber';

  return (
    <Screen variant="dark" scroll>
      <TopBar variant="dark" lang={lang} onToggleLang={toggleLang} />
      <View style={{ paddingHorizontal: 22, paddingTop: 6 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ paddingVertical: 14 }}>
          <Text style={{ color: color.driver.textMuted }}>← {t.back}</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 15, alignItems: 'flex-start' }}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={{ width: 72, height: 72, borderRadius: 23 }} />
          ) : (
            <Initials name={profile.name} size={72} variant="dark" />
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 22, letterSpacing: -0.3, color: color.driver.text }}>
              {profile.name}
            </Text>
            <View style={{ marginTop: 9 }}>
              <Badge label={verificationLabel} tone={verificationTone} />
            </View>
          </View>
        </View>

        {driverProfile.bio ? (
          <Text style={{ fontFamily: font.regular, fontSize: 14.5, lineHeight: 22, color: color.driver.textFainter, marginTop: 18 }}>
            {driverProfile.bio}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          <Stat
            value={driverProfile.rating_count > 0 ? `★ ${driverProfile.rating_avg.toFixed(1)}` : '—'}
            label={t.statRating}
            sub={driverProfile.rating_count > 0 ? `${driverProfile.rating_count} ${lang === 'es' ? 'valoraciones' : 'reviews'}` : undefined}
          />
          <Stat value={String(completedRides)} label={t.statRides} />
        </View>

        <SectionLabel>{t.verificationStatus}</SectionLabel>
        <Card variant="dark">
          <Text style={{ fontFamily: font.regular, fontSize: 13, color: color.driver.textMuted }}>{verificationLabel}</Text>
        </Card>

        <SectionLabel>{t.theCar}</SectionLabel>
        <Card variant="dark" style={{ padding: 0, overflow: 'hidden' }}>
          <InfoRow label={t.makeModel} value={driverProfile.car_make_model} />
          <InfoRow label={t.colour} value={driverProfile.car_colour} />
          <InfoRow label={t.plate} value={driverProfile.car_plate} last />
        </Card>
      </View>
    </Screen>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: font.semibold,
        fontSize: 10.5,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: color.driver.textFaint,
        marginTop: 22,
        marginBottom: 10,
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
        borderBottomColor: color.driver.borderFaint,
      }}
    >
      <Text style={{ fontFamily: font.regular, fontSize: 13, color: color.driver.textFaint }}>{label}</Text>
      <Text style={{ fontFamily: font.semibold, fontSize: 13, color: color.driver.text }}>{value}</Text>
    </View>
  );
}

function Stat({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <Card variant="dark" style={{ flex: 1, alignItems: 'flex-start' }}>
      <Text style={{ fontFamily: font.semibold, fontSize: 21, color: color.driver.text }}>{value}</Text>
      <Text style={{ fontFamily: font.regular, fontSize: 11.5, color: color.driver.textMuted, marginTop: 5 }}>{label}</Text>
      {sub ? (
        <Text style={{ fontFamily: font.regular, fontSize: 10.5, color: color.driver.textFainter, marginTop: 2 }}>{sub}</Text>
      ) : null}
    </Card>
  );
}
