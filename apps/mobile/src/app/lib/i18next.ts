import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources, defaultNS, defaultLang } from 'shared/translations'
import { getMatchingLocale } from './getMachingLocale'

i18n.use(initReactI18next).init({
  lng: getMatchingLocale(),
  fallbackLng: defaultLang,
  supportedLngs: Object.keys(resources),
  ns: ['translation'],
  defaultNS,
  resources,

  interpolation: {
    escapeValue: false,
  },
})

export const i18next = i18n
