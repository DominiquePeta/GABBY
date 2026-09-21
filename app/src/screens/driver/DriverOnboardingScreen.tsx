import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen, TopBar, Heading, Body, TextField, Button, Kicker, Chip } from '../../components/ui';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../data/AuthContext';
import { AREAS } from '../../i18n/strings';
import {
  updateMyDriverProfile,
  uploadLicencePhoto,
  uploadProfilePhoto,
  submitForVerification,
} from '../../data/api';
import { color, font, radius } from '../../theme/theme';

export default function DriverOnboardingScreen({ onSubmitted }: { onSubmitted: () => void }) {
  const { t, lang, toggleLang } = useI18n();
  const { profile } = useAuth();
  const [bio, setBio] = useState('');
  const [licence, setLicence] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carColour, setCarColour] = useState('');
  const [carPlate, setCarPlate] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [licenceUri, setLicenceUri] = useState<string | null>(null);
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function pickImage(setter: (uri: string) => void) {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true });
    if (!result.canceled && result.assets[0]) setter(result.assets[0].uri);
  }

  function toggleArea(area: string) {
    setAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  }

  async function onSubmit() {
    if (!profile) return;
    if (!licence.trim() || !licenceUri || !carModel.trim() || !carColour.trim() || !carPlate.trim() || areas.length === 0) {
      Alert.alert(t.error, t.error);
      return;
    }
    setSubmitting(true);
    try {
      const profilePhotoPath = profileUri ? await uploadProfilePhoto(profile.id, profileUri) : null;
      const licencePhotoPath = await uploadLicencePhoto(profile.id, licenceUri);
      await updateMyDriverProfile(profile.id, {
        bio: bio.trim(),
        areas,
        car_make_model: carModel.trim(),
        car_colour: carColour.trim(),
        car_plate: carPlate.trim(),
        profile_photo_path: profilePhotoPath,
      });
      await submitForVerification(profile.id, licence.trim(), licencePhotoPath);
      onSubmitted();
    } catch (e: any) {
      Alert.alert(t.error, e.message ?? String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen variant="dark" scroll>
      <TopBar variant="dark" lang={lang} onToggleLang={toggleLang} />
      <View style={{ paddingHorizontal: 22, paddingTop: 8 }}>
        <Kicker tone="amber">{t.driverBadge}</Kicker>
        <Heading variant="dark" style={{ marginTop: 12, marginBottom: 8 }}>
          {t.driverSignupTitle}
        </Heading>
        <Body variant="dark" style={{ marginBottom: 20 }}>
          {t.driverSignupBody}
        </Body>

        <SectionLabel>{t.sectionYou}</SectionLabel>
        <TextField
          variant="dark"
          label={t.fBio}
          value={bio}
          onChangeText={setBio}
          placeholder={t.bioPlaceholder}
          multiline
          numberOfLines={4}
        />

        <SectionLabel>{t.sectionLicence}</SectionLabel>
        <TextField variant="dark" label={t.fLicence} value={licence} onChangeText={setLicence} placeholder="VLC-TX-04182" />
        <View style={{ flexDirection: 'row', gap: 11, marginBottom: 14 }}>
          <UploadTile label={t.licencePhoto} uploaded={!!licenceUri} onPress={() => pickImage(setLicenceUri)} />
          <UploadTile label={t.profilePhoto} uploaded={!!profileUri} onPress={() => pickImage(setProfileUri)} />
        </View>

        <SectionLabel>{t.sectionAreas}</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 8 }}>
          {AREAS.map((a) => (
            <Chip key={a} label={a} active={areas.includes(a)} onPress={() => toggleArea(a)} variant="dark" />
          ))}
        </View>

        <SectionLabel>{t.sectionCar}</SectionLabel>
        <TextField variant="dark" label={t.makeModel} value={carModel} onChangeText={setCarModel} placeholder="Toyota Prius+" />
        <View style={{ flexDirection: 'row', gap: 11 }}>
          <View style={{ flex: 1 }}>
            <TextField variant="dark" label={t.colour} value={carColour} onChangeText={setCarColour} placeholder="Blanco" />
          </View>
          <View style={{ flex: 1 }}>
            <TextField variant="dark" label={t.plate} value={carPlate} onChangeText={setCarPlate} placeholder="8421 KLM" />
          </View>
        </View>

        <Button title={t.submitForVerification} onPress={onSubmit} loading={submitting} tone="amber" style={{ marginTop: 10 }} />
        <Text style={{ textAlign: 'center', fontFamily: font.regular, fontSize: 11.5, color: color.driver.textFaint, marginTop: 12 }}>
          {t.driverSubmitNote}
        </Text>
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
        marginTop: 20,
        marginBottom: 10,
      }}
    >
      {children}
    </Text>
  );
}

function UploadTile({ label, uploaded, onPress }: { label: string; uploaded: boolean; onPress: () => void }) {
  const { lang } = useI18n();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: color.driver.panel,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: uploaded ? 'rgba(127,191,159,.5)' : color.driver.border,
        borderRadius: radius.md,
        padding: 16,
        alignItems: 'center',
        gap: 8,
      }}
    >
      <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: '#2C2932' }} />
      <Text style={{ fontFamily: font.semibold, fontSize: 11.5, color: color.driver.text, textAlign: 'center' }}>{label}</Text>
      <Text style={{ fontFamily: font.mono, fontSize: 9.5, letterSpacing: 0.5, color: uploaded ? '#7FBF9F' : color.driver.textFaint }}>
        {uploaded ? (lang === 'es' ? 'SUBIDA ✓' : 'UPLOADED ✓') : lang === 'es' ? 'TOCA PARA SUBIR' : 'TAP TO UPLOAD'}
      </Text>
    </Pressable>
  );
}
