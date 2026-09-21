import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Screen, TopBar, Heading, Body, TextField, Button, Kicker } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { signUp } from '../../data/api';
import { color } from '../../theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DriverSignup'>;

export default function DriverSignupScreen({ navigation }: Props) {
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
      await signUp(email.trim(), password, 'driver', name.trim(), phone.trim());
      // RootNavigator picks this up and routes into the driver onboarding screen.
    } catch (e: any) {
      Alert.alert(t.error, e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen variant="dark" scroll>
      <TopBar variant="dark" lang={lang} onToggleLang={toggleLang} />
      <View style={{ paddingHorizontal: 22, paddingTop: 4 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ paddingVertical: 16 }}>
          <Text style={{ color: color.driver.textMuted }}>← {t.back}</Text>
        </Pressable>
        <Kicker tone="amber">{t.driverBadge}</Kicker>
        <Heading variant="dark" style={{ marginTop: 12, marginBottom: 8 }}>
          {t.driverSignupTitle}
        </Heading>
        <Body variant="dark" style={{ marginBottom: 22 }}>
          {t.driverSignupBody}
        </Body>

        <TextField variant="dark" label={t.fName} value={name} onChangeText={setName} placeholder="Amparo Ferrer" />
        <TextField
          variant="dark"
          label={t.fPhone}
          value={phone}
          onChangeText={setPhone}
          placeholder="+34 600 000 000"
          keyboardType="phone-pad"
        />
        <TextField
          variant="dark"
          label={t.email}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField variant="dark" label={t.password} value={password} onChangeText={setPassword} secureTextEntry />

        <Button title={t.createAccount} onPress={onSubmit} loading={loading} tone="amber" style={{ marginTop: 8 }} />
      </View>
    </Screen>
  );
}
