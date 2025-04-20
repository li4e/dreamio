import axios from 'axios'
import i18n from 'i18next'
import md5 from 'md5'
import { franc } from 'franc'
import { retryUntilTimeout } from './utils/retryUntilTimeout'

class Api {
  async generatePrompt(signal: AbortSignal): Promise<string> {
    const userLang = i18n.language
    const seed = Math.trunc(Math.random() * 1000000000000)

    const prompt = `Generate an image prompt featuring topics, epochs, landscapes, seasons, dynamic lighting, moods, lore elements, characters, and actions inspired by the culture and themes of "${userLang}" language code speakers, without mentioning it. Keep it concise within 200 characters.`

    const generatedPrompt = await retryUntilTimeout(
      () =>
        axios
          .get(
            `https://text.pollinations.ai/${encodeURIComponent(prompt)}?seed=${seed}&private=true`
          )
          .then((res) => res.data as string),
      30_000
    )

    try {
      return await translator.translate(generatedPrompt, i18n.language, signal)
    } catch {
      return generatedPrompt
    }
  }

  reportGeneration(urls: string[], description?: string) {
    return axios.post(`https://dreamio.ilsur.me/api/v1/claim`, {
      urls,
      description,
    })
  }
}

class Translator {
  private readonly revertionCache = new Map<string, string>()

  async translate(
    value: string,
    lang: string,
    signal: AbortSignal
  ): Promise<string> {
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

    const { text } = await translate(
      value,
      {
        to: lang,
      },
      signal
    ).catch((error) => {
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

async function translate(
  value: string,
  options: { to: string },
  signal: AbortSignal
): Promise<{ text: string }> {
  const prompt = `Translate the following text into "${options.to}" language without any additional explanation or introductory text: "${value}"`

  const translatedText = await retryUntilTimeout(
    () =>
      axios
        .get(
          `https://text.pollinations.ai/${encodeURIComponent(prompt)}?private=true`,
          {
            signal,
          }
        )
        .catch(() =>
          axios.get(
            `https://text.pollinations.ai/${encodeURIComponent(prompt)}?private=true&model=llama`,
            { signal }
          )
        )
        .then((res) => res.data),
    20_000
  )

  return { text: translatedText }
}
