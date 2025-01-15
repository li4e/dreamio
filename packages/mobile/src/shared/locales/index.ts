import en from './en.json'
import ru from './ru.json'
import uk from './uk.json'
import zhS from './zh-Hans.json'
import zhT from './zh-Hant.json'

export const locales = {
  en: { translation: en },
  ru: { translation: ru },
  uk: { translation: uk },
  zh: { translation: zhT },
  'zh-Hans': { translation: zhS },
} as const
