import React, { createContext, useContext, useMemo, useState } from 'react';
import { Lang, strings } from './strings';

type I18nValue = {
  lang: Lang;
  t: Record<string, string>;
  toggleLang: () => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('es');
  const value = useMemo<I18nValue>(
    () => ({
      lang,
      t: strings[lang],
      toggleLang: () => setLang((l) => (l === 'es' ? 'en' : 'es')),
    }),
    [lang]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
