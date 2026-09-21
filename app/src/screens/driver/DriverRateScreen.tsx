import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DriverStackParamList } from '../../navigation/types';
import { Screen, TopBar, Heading, Body, Kicker, StarPicker, Button, Card } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../data/AuthContext';
import { submitRating } from '../../data/api';
import { STAR_WORDS } from '../../i18n/strings';
import { color, font, radius } from '../../theme/theme';

type Props = NativeStackScreenProps<DriverStackParamList, 'DriverRate'>;

export default function DriverRateScreen({ route, navigation }: Props) {
  const { requestId, clientId } = route.params;
  const { t, lang, toggleLang } = useI18n();
  const { profile } = useAuth();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!profile || stars === 0) return;
    setSubmitting(true);
    try {
      await submitRating({ rideRequestId: requestId, raterId: profile.id, rateeId: clientId, stars, comment });
    } finally {
      navigation.replace('Dashboard');
    }
  }

  return (
    <Screen variant="dark">
      <TopBar variant="dark" lang={lang} onToggleLang={toggleLang} />
      <View style={{ paddingHorizontal: 22, paddingTop: 12 }}>
        <Kicker tone="amber">{t.rateKicker}</Kicker>
        <Heading variant="dark" style={{ marginTop: 12, marginBottom: 8 }}>
          {lang === 'es' ? '¿Cómo fue el viaje?' : 'How was the ride?'}
        </Heading>
        <Body variant="dark" style={{ marginBottom: 22 }}>
          {t.rateClientBody}
        </Body>

        <Card variant="dark" style={{ borderRadius: 22, padding: 20 }}>
          <StarPicker value={stars} onChange={setStars} variant="dark" />
          <Text style={{ textAlign: 'center', fontFamily: font.medium, fontSize: 13, color: color.driver.textMuted, marginTop: 14 }}>
            {STAR_WORDS[lang][stars]}
          </Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder={t.commentPlaceholder}
            placeholderTextColor={color.driver.textFaint}
            multiline
            style={{
              marginTop: 18,
              minHeight: 104,
              backgroundColor: color.driver.panelAlt,
              borderWidth: 1,
              borderColor: color.driver.border,
              borderRadius: radius.md,
              padding: 14,
              color: color.driver.text,
              fontFamily: font.regular,
              fontSize: 14,
              textAlignVertical: 'top',
            }}
          />
        </Card>

        <View style={{ marginTop: 24 }}>
          <Button title={t.submitRating} onPress={onSubmit} disabled={stars === 0} loading={submitting} tone="amber" />
          <Pressable onPress={() => navigation.replace('Dashboard')} style={{ paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ fontFamily: font.medium, fontSize: 13.5, color: color.driver.textFaint }}>{t.skip}</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
