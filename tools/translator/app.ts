import * as fs from 'fs/promises'
import * as path from 'path'
import { OpenAI } from 'openai'
import { flatten } from 'flat'
import { SUPPORTED_LANGUAGES as locales } from './constants'

// Create OpenAI client
const client = new OpenAI()

// Function to load hashes from the file
async function loadHashes(
  hashesFile: string
): Promise<Record<string, { original: string; translations: string[] }>> {
  try {
    const data = await fs.readFile(hashesFile, 'utf-8')
    return JSON.parse(data.trim())
  } catch (error) {
    return {}
  }
}

async function loadTranslation(path: string): Promise<Record<string, string>> {
  try {
    const data = await fs.readFile(path, 'utf-8')
    return JSON.parse(data.trim())
  } catch (error) {
    return {}
  }
}

async function saveTranslation(path: string, content: Record<string, string>) {
  try {
    await fs.writeFile(path, JSON.stringify(content, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error saving translation to ${path}:`, error)
  }
}

// Function to save hashes to the file
async function saveHashes(
  hashesFile: string,
  hashes: Record<string, { original: string; translations: string[] }>
) {
  try {
    await fs.writeFile(hashesFile, JSON.stringify(hashes, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error saving hashes to ${hashesFile}:`, error)
  }
}

// Function to translate text with length limit
async function translateText(
  text: string,
  destLang: string,
  sourceLang: string,
  translationKey: string
) {
  const prompt = `You are a translation assistant specialized in application localization. Translate the following text from ${sourceLang} to ${destLang}, preserving the meaning and ensuring clarity. The translation should fit the context defined by the following key: "${translationKey}". Do not translate or modify placeholder variables enclosed in curly braces (e.g., {{variableName}}). Maintain a professional tone and ensure accuracy in the translation.`

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: text,
      },
    ],
  }

  const chatCompletion: OpenAI.Chat.ChatCompletion =
    await client.chat.completions.create(params)

  if (!chatCompletion.choices[0]?.message?.content) {
    throw new Error('chatCompletion is null')
  }

  return chatCompletion.choices[0]?.message?.content.trim() || ''
}

// Main function for translating metadata
async function translateAppByLocale(
  destLang: string,
  translationsFolder: string,
  sourceLang: string = 'en-US'
) {
  const inputFile = path.resolve(translationsFolder, `${sourceLang}.json`) // Directory for source files
  const outputFile = path.resolve(translationsFolder, `${destLang}.json`) // Directory for translated files

  const hashesFile = path.resolve('.app.hashes.json') // Path to the file storing hashes

  try {
    const hashes = await loadHashes(hashesFile)

    // 3. Get the list of all keys in the source directory
    const original = (await fs
      .readFile(inputFile, 'utf-8')
      .then((data) => flatten(JSON.parse(data)))) as Record<string, string>

    for (const key in original) {
      try {
        const value = original[key]

        // Check if the ket has already been translated for this locale
        const existingHashes = hashes[key]

        if (existingHashes) {
          // If the value has changed, reset the list of translated locales
          if (existingHashes.original !== value) {
            console.log(existingHashes.original, value)
            console.log(`Value has changed, resetting translations for ${key}`)
            existingHashes.original = value
            existingHashes.translations = []
          }

          // If a translation for this locale already exists, skip it
          if (existingHashes.translations.includes(destLang)) {
            console.log(`Key already translated for ${destLang}: ${key}`)
            continue
          }
        } else {
          // If the hash of the original file is not saved, create an entry
          hashes[key] = {
            original: value,
            translations: [],
          }
        }

        // 5. Translate only the keys that need translation
        const content = value
        console.log(`Translating key: ${destLang} - ${key}`)

        const translation = await translateText(
          content,
          destLang,
          sourceLang,
          key
        )
        const currentTranslationFile = await loadTranslation(outputFile)
        currentTranslationFile[key] = translation
        await saveTranslation(outputFile, currentTranslationFile)

        console.log(`Key translated and saved: ${destLang} - ${key}`)

        hashes[key].translations.push(destLang)

        // Save the hashes immediately after translating each file
        await saveHashes(hashesFile, hashes)

        // Check the translated file for length
      } catch (error) {
        console.error(`Error handling key ${key}:`, error)
      }
    }

    console.log(
      `All key have been processed successfully for the language ${destLang}`
    )

    const keys = Object.keys(original)
    const currentTranslationFile = await loadTranslation(outputFile)

    for (const key in currentTranslationFile) {
      if (!keys.includes(key)) {
        console.log(
          `${key} has been deleted from ${sourceLang} file, deleting it from ${destLang} translation file and hashes.`
        )
        delete currentTranslationFile[key]
        delete hashes[key]
      }
    }
    await saveTranslation(outputFile, currentTranslationFile)
    await saveHashes(hashesFile, hashes)
    console.log(
      `All deleted keys have been deleted from translation file and hashes successfully for the language ${destLang}`
    )
  } catch (error) {
    console.error(`Error during translation lang ${destLang}:`, error)
  }
}

export async function translateApp() {
  for (const locale of locales) {
    await translateAppByLocale(
      locale,
      '../../apps/mobile/src/shared/translations'
    )
    await translateAppByLocale(
      locale,
      '../../apps/mobile/src/shared/translations_native'
    )
  }
}
