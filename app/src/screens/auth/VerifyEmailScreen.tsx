import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Screen, TopBar, Heading, Body, TextField, Button, Kicker } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { verifySignupOtp, resendSignupOtp } from '../../data/api';
import { color, font } from '../../theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

export default function VerifyEmailScreen({ route, navigation }: Props) {
  const { email, role } = route.params;
  const { t, lang, toggleLang } = useI18n();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const variant = role === 'driver' ? 'dark' : 'light';

  async function onVerify() {
    setVerifying(true);
    try {
      await verifySignupOtp(email, code.trim());
      // AuthProvider's onAuthStateChange picks up the new session, and by
      // then verifySignupOtp() has already created the profiles row, so
      // RootNavigator routes straight into the right flow for the role.
    } catch (e: any) {
      Alert.alert(t.error, e.message ?? String(e));
    } finally {
      setVerifying(false);
    }
  }

  async function onResend() {
    setResending(true);
    try {
      await resendSignupOtp(email);
      Alert.alert(t.codeResentNote, '');
    } catch (e: any) {
      Alert.alert(t.error, e.message ?? String(e));
    } finally {
      setResending(false);
    }
  }

  return (
    <Screen variant={variant}>
      <TopBar variant={variant} lang={lang} onToggleLang={toggleLang} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ paddingVertical: 16 }}>
          <Text style={{ color: variant === 'light' ? color.client.textFaint : color.driver.textMuted }}>← {t.back}</Text>
        </Pressable>
        <Kicker tone={variant === 'light' ? 'accent' : 'amber'}>{t.verifyEmailKicker}</Kicker>
        <Heading variant={variant} style={{ marginTop: 12, marginBottom: 8 }}>
          {t.verifyEmailTitle}
        </Heading>
        <Body variant={variant} style={{ marginBottom: 22 }}>
          {(lang === 'es' ? 'Hemos enviado un código de 6 dígitos a ' : "We've sent a 6-digit code to ") + email}
        </Body>

        <TextField
          label={t.codeLabel}
          variant={variant}
          value={code}
          onChangeText={(v) => setCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="123456"
        />

        <Button
          title={t.verifyButton}
          onPress={onVerify}
          loading={verifying}
          disabled={code.trim().length !== 6}
          tone={variant === 'light' ? 'accent' : 'amber'}
          style={{ marginTop: 8 }}
        />

        <Pressable onPress={onResend} disabled={resending} style={{ paddingVertical: 18, alignItems: 'center' }}>
          <Body variant={variant}>{t.resendCode}</Body>
        </Pressable>

        <Text
          style={{
            textAlign: 'center',
            fontFamily: font.regular,
            fontSize: 11.5,
            color: variant === 'light' ? color.client.textFainter : color.driver.textFaint,
          }}
        >
          {t.checkSpamNote}
        </Text>
      </View>
    </Screen>
  );
}
