import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { Lang, strings } from './strings';

type I18nValue = {
  lang: Lang;
  t: Record<string, string>;
  toggleLang: () => void;
};

const I18nContext = createContext<I18nValue | null>(null);

const LANG_STORAGE_KEY = 'gabby.lang';

function detectDefaultLang(): Lang {
  const deviceLang = Localization.getLocales()[0]?.languageCode;
  return deviceLang === 'en' ? 'en' : 'es';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(LANG_STORAGE_KEY);
        setLangState(stored === 'es' || stored === 'en' ? stored : detectDefaultLang());
      } catch {
        setLangState(detectDefaultLang());
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    AsyncStorage.setItem(LANG_STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      t: strings[lang],
      toggleLang: () => setLang(lang === 'es' ? 'en' : 'es'),
    }),
    [lang, setLang]
  );

  if (!ready) return null;

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
