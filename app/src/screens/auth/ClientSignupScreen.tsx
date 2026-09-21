import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Screen, TopBar, Heading, Body, TextField, Button, Kicker } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { signUp } from '../../data/api';
import { color, radius, font } from '../../theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ClientSignup'>;

export default function ClientSignupScreen({ navigation }: Props) {
  const { t, lang, toggleLang } = useI18n();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!name.trim() || !phone.trim() || !email.trim() || password.length < 6) {
      Alert.alert(t.error, t.error);
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, 'client', name.trim(), phone.trim());
    } catch (e: any) {
      Alert.alert(t.error, e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen variant="light" scroll>
      <TopBar variant="light" lang={lang} onToggleLang={toggleLang} />
      <View style={{ paddingHorizontal: 24, paddingTop: 4 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ paddingVertical: 16 }}>
          <Text style={{ color: color.client.textFaint }}>← {t.back}</Text>
        </Pressable>
        <Kicker>{t.clientBadge}</Kicker>
        <Heading style={{ marginTop: 12, marginBottom: 8 }}>{t.clientSignupTitle}</Heading>
        <Body style={{ marginBottom: 22 }}>{t.clientSignupBody}</Body>

        <TextField label={t.fName} value={name} onChangeText={setName} placeholder="Laura Serrano" />
        <TextField label={t.fPhone} value={phone} onChangeText={setPhone} placeholder="+34 600 000 000" keyboardType="phone-pad" />
        <TextField label={t.email} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextField label={t.password} value={password} onChangeText={setPassword} secureTextEntry />

        <View
          style={{
            flexDirection: 'row',
            gap: 11,
            backgroundColor: color.client.chip,
            borderRadius: radius.md,
            padding: 15,
            marginBottom: 20,
          }}
        >
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color.success, marginTop: 5 }} />
          <Text style={{ flex: 1, fontFamily: font.regular, fontSize: 12.5, lineHeight: 18, color: color.client.textMuted }}>
            {t.clientPrivacy}
          </Text>
        </View>

        <Button title={t.createAccount} onPress={onSubmit} loading={loading} />
      </View>
    </Screen>
  );
}
