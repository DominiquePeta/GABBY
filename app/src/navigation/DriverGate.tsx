import React, { useCallback, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../data/AuthContext';
import { getMyVerification, signOut } from '../data/api';
import { supabase } from '../lib/supabase';
import { DriverVerification } from '../data/types';
import DriverOnboardingScreen from '../screens/driver/DriverOnboardingScreen';
import AwaitingScreen from '../screens/driver/AwaitingScreen';
import DriverNavigator from './DriverNavigator';
import { Screen, TopBar, Heading, Body, Button } from '../components/ui';
import { useI18n } from '../i18n/I18nContext';

export default function DriverGate() {
  const { profile } = useAuth();
  const { t, lang, toggleLang } = useI18n();
  const [verification, setVerification] = useState<DriverVerification | null | 'loading'>('loading');

  const refresh = useCallback(async () => {
    if (!profile) return;
    setVerification(await getMyVerification(profile.id));
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel(`driver_verification_${profile.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'driver_verification', filter: `profile_id=eq.${profile.id}` },
        refresh
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, refresh]);

  if (verification === 'loading') return null;

  if (!verification) {
    return <DriverOnboardingScreen onSubmitted={refresh} />;
  }

  if (verification.status === 'pending') {
    return <AwaitingScreen />;
  }

  if (verification.status === 'rejected') {
    return (
      <Screen variant="dark">
        <TopBar variant="dark" lang={lang} onToggleLang={toggleLang} onSignOut={() => signOut()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 16 }}>
          <Heading variant="dark" style={{ textAlign: 'center' }}>
            {lang === 'es' ? 'Tu licencia no se ha podido verificar' : "We couldn't verify your licence"}
          </Heading>
          <Body variant="dark" style={{ textAlign: 'center' }}>
            {lang === 'es'
              ? 'Ponte en contacto con el equipo para más información.'
              : 'Get in touch with the team for more details.'}
          </Body>
          <Button title={t.signOut} onPress={() => signOut()} tone="outlineDark" />
        </View>
      </Screen>
    );
  }

  return <DriverNavigator />;
}
