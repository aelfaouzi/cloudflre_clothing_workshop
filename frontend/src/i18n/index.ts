import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/common.json'
import fr from './locales/fr/common.json'
import ar from './locales/ar/common.json'

const STORAGE_KEY = 'workshop_lang'
const RTL_LANGS = new Set(['ar'])

function applyDirection(lang: string) {
  document.documentElement.lang = lang
  document.documentElement.dir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr'
}

const savedLang = localStorage.getItem(STORAGE_KEY) ?? 'ar'
applyDirection(savedLang)

void i18next.use(initReactI18next).init({
  resources: {
    en: { common: en },
    fr: { common: fr },
    ar: { common: ar },
  },
  lng: savedLang,
  fallbackLng: 'ar',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

i18next.on('languageChanged', (lang) => {
  localStorage.setItem(STORAGE_KEY, lang)
  applyDirection(lang)
})

export default i18next
