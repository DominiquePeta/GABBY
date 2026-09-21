import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Screen, TopBar, Heading, Body, TextField, Button, Kicker } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { signIn } from '../../data/api';
import { color } from '../../theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ route, navigation }: Props) {
  const { role } = route.params;
  const { t, lang, toggleLang } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const variant = role === 'driver' ? 'dark' : 'light';

  async function onLogin() {
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // RootNavigator reacts to the auth state change and routes by role.
    } catch (e: any) {
      Alert.alert(t.error, e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen variant={variant}>
      <TopBar variant={variant} lang={lang} onToggleLang={toggleLang} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ paddingVertical: 16 }}>
          <Text style={{ color: variant === 'light' ? color.client.textFaint : color.driver.textMuted }}>← {t.back}</Text>
        </Pressable>
        <Kicker tone={variant === 'light' ? 'accent' : 'amber'}>
          {role === 'client' ? t.clientBadge : role === 'driver' ? t.driverBadge : 'GABBY ADMIN'}
        </Kicker>
        <Heading variant={variant} style={{ marginTop: 12, marginBottom: 20 }}>
          {t.logIn}
        </Heading>

        <TextField
          label={t.email}
          variant={variant}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField label={t.password} variant={variant} value={password} onChangeText={setPassword} secureTextEntry />

        <View style={{ marginTop: 8 }}>
          <Button title={t.logIn} onPress={onLogin} loading={loading} tone={variant === 'light' ? 'accent' : 'amber'} />
        </View>

        {role !== 'admin' ? (
          <Pressable
            onPress={() => navigation.navigate(role === 'client' ? 'ClientSignup' : 'DriverSignup')}
            style={{ paddingVertical: 16, alignItems: 'center' }}
          >
            <Body variant={variant}>{t.needAccount}</Body>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}
