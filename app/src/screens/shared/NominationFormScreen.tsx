import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Screen, TopBar, Heading, Body, Kicker, TextField, Button } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../data/AuthContext';
import { submitNomination } from '../../data/api';
import { color, font } from '../../theme/theme';

export default function NominationFormScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { t, lang, toggleLang } = useI18n();
  const { profile } = useAuth();
  const variant = profile?.role === 'driver' ? 'dark' : 'light';

  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const hasContact = phone.trim().length > 0 || email.trim().length > 0;
  const canSubmit = firstName.trim().length > 0 && surname.trim().length > 0 && confirmed && hasContact;

  async function onSubmit() {
    if (!profile || !canSubmit) return;
    setSubmitting(true);
    try {
      await submitNomination({
        nominatedFirstName: firstName.trim(),
        nominatedSurname: surname.trim(),
        isWomanConfirmed: confirmed,
        contactPhone: phone.trim(),
        contactEmail: email.trim(),
        nominatedById: profile.id,
        nominatedByType: profile.role,
      });
      setSent(true);
    } catch (e: any) {
      Alert.alert(t.error, e.message ?? String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <Screen variant={variant}>
        <TopBar variant={variant} lang={lang} onToggleLang={toggleLang} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 30 }}>
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: variant === 'light' ? color.successBg : color.successBgDark,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 28, color: color.success }}>✓</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Heading variant={variant} style={{ textAlign: 'center' }}>
              {t.nominationSentTitle}
            </Heading>
            <Body variant={variant} style={{ textAlign: 'center', marginTop: 12, maxWidth: 280 }}>
              {t.nominationSentBody}
            </Body>
          </View>
          <Button
            title={t.doneButton}
            onPress={() => navigation.goBack()}
            tone={variant === 'light' ? 'dark' : 'amber'}
            style={{ width: 'auto', paddingHorizontal: 26 }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen variant={variant} scroll>
      <TopBar variant={variant} lang={lang} onToggleLang={toggleLang} />
      <View style={{ paddingHorizontal: 24, paddingTop: 4 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ paddingVertical: 16 }}>
          <Text style={{ color: variant === 'light' ? color.client.textFaint : color.driver.textMuted }}>← {t.back}</Text>
        </Pressable>
        <Kicker tone={variant === 'light' ? 'accent' : 'amber'}>{t.nominateDriver}</Kicker>
        <Heading variant={variant} style={{ marginTop: 12, marginBottom: 8 }}>
          {t.nominationTitle}
        </Heading>
        <Body variant={variant} style={{ marginBottom: 22 }}>
          {t.nominationBody}
        </Body>

        <TextField variant={variant} label={t.nominatedFirstName} value={firstName} onChangeText={setFirstName} />
        <TextField variant={variant} label={t.nominatedSurname} value={surname} onChangeText={setSurname} />

        <Pressable
          onPress={() => setConfirmed((c) => !c)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              borderWidth: 1.5,
              borderColor: confirmed ? color.success : variant === 'light' ? 'rgba(34,30,28,.25)' : 'rgba(242,239,234,.25)',
              backgroundColor: confirmed ? color.success : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {confirmed ? <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text> : null}
          </View>
          <Text
            style={{
              flex: 1,
              fontFamily: font.medium,
              fontSize: 13.5,
              lineHeight: 19,
              color: variant === 'light' ? color.client.text : color.driver.text,
            }}
          >
            {t.confirmWoman}
          </Text>
        </Pressable>

        <TextField
          variant={variant}
          label={t.contactPhoneOptional}
          value={phone}
          onChangeText={setPhone}
          placeholder="+34 600 000 000"
          keyboardType="phone-pad"
        />
        <TextField
          variant={variant}
          label={t.contactEmailOptional}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {!hasContact ? (
          <Text
            style={{
              fontFamily: font.regular,
              fontSize: 12,
              lineHeight: 17,
              color: variant === 'light' ? color.client.textMuted : color.driver.textMuted,
              marginTop: -6,
              marginBottom: 18,
            }}
          >
            {t.contactRequiredNote}
          </Text>
        ) : null}

        <Button
          title={t.submitNomination}
          onPress={onSubmit}
          disabled={!canSubmit}
          loading={submitting}
          tone={variant === 'light' ? 'accent' : 'amber'}
        />
      </View>
    </Screen>
  );
}
