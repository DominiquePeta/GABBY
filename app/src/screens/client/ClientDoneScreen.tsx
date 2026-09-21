import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../navigation/types';
import { Screen, TopBar, Heading, Body, Button } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { color } from '../../theme/theme';

type Props = NativeStackScreenProps<ClientStackParamList, 'ClientDone'>;

export default function ClientDoneScreen({ navigation }: Props) {
  const { t, lang, toggleLang } = useI18n();
  return (
    <Screen variant="light">
      <TopBar variant="light" lang={lang} onToggleLang={toggleLang} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22, paddingHorizontal: 30 }}>
        <View
          style={{
            width: 74,
            height: 74,
            borderRadius: 37,
            backgroundColor: color.successBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 30, color: color.success }}>✓</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Heading style={{ textAlign: 'center' }}>{t.thanksTitle}</Heading>
          <Body style={{ textAlign: 'center', marginTop: 12, maxWidth: 250 }}>{t.thanksBody}</Body>
        </View>
        <Button title={t.backToDirectory} onPress={() => navigation.replace('Browse')} tone="dark" style={{ width: 'auto', paddingHorizontal: 26 }} />
      </View>
    </Screen>
  );
}
