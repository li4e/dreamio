import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import RNLanguageDetector from '@os-team/i18next-react-native-language-detector'
import { locales } from 'shared/locales'

export const defaultNS = 'translation'
export const resources = locales

i18n
  .use(RNLanguageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    supportedLngs: Object.keys(resources),
    ns: ['translation'],
    defaultNS,
    resources,

    interpolation: {
      escapeValue: false,
    },
  })

export const i18next = i18n
