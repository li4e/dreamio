import { translate } from '@vitalets/google-translate-api'
import axios from 'axios'
import i18n from 'i18next'
import md5 from 'md5'
import { franc } from 'franc'

class Api {
  async generatePrompt() {
    const userLangIsEn = Translator.isEnLang(i18n.language)

    const prompt = `Generate a unique and imaginative image prompt featuring diverse topics, various epochs, distinct landscapes, seasons, dynamic lighting, rich moods, and deep lore elements, inspired by the culture and themes of the ${i18n.language} language. Keep it within 200 characters.`

    const seed = Math.trunc(Math.random() * 1000000000000)
    const generatedPrompt = await axios
      .get(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}?seed=${seed}`
      )
      .then((res) => res.data)

    try {
      return await translator.translate(generatedPrompt, i18n.language)
    } catch {
      return generatedPrompt
    }
  }
}

class Translator {
  private readonly revertionCache = new Map<string, string>()

  async translate(value: string, lang: string): Promise<string> {
    const destLangIsEn = Translator.isEnLang(lang)
    const valueIsEn = franc(value) === 'eng'

    if (destLangIsEn && valueIsEn) {
      return value
    }

    if (Translator.isEnLang(lang)) {
      const revertionValue = this.getCache(value)
      if (revertionValue) {
        return revertionValue
      }
    }

    const { text } = await translate(value, {
      to: lang,
    }).catch((error) => {
      console.error('Error during translation', error)
      throw error
    })

    if (!Translator.isEnLang(lang)) {
      this.setCache(text, value)
    }

    return text
  }

  setCache(translatedString: string, original: string) {
    this.revertionCache.set(md5(translatedString), original)
  }

  getCache(translatedString: string) {
    return this.revertionCache.get(md5(translatedString))
  }

  static isEnLang(locale: string) {
    return locale.startsWith('en')
  }
}

export const translator = new Translator()
export const api = new Api()
