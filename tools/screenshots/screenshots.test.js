const { execSync } = require('child_process')

const locales = [
  'ar-SA',
  'ca',
  'cs',
  'da',
  'de-DE',
  'el',
  'en-US',
  'en-AU',
  'en-CA',
  'en-GB',
  'es-ES',
  'es-MX',
  'fi',
  'fr-CA',
  'fr-FR',
  'he',
  'hi',
  'hr',
  'hu',
  'id',
  'it',
  'ja',
  'ko',
  'ms',
  'nl-NL',
  'no',
  'pl',
  'pt-BR',
  'pt-PT',
  'ro',
  'ru',
  'sk',
  'sv',
  'th',
  'tr',
  'uk',
  'vi',
  'zh-Hans',
  'zh-Hant',
]

const RTL_locales = ['ar-SA', 'he']

const screenshotsDir = '../mobile-deploy/fastlane/screenshots'

/**
 * Extracts the text between parentheses in a given string and replaces spaces with underscores.
 *
 * @param input - The input string containing text within parentheses.
 * @returns The formatted text or null if no parentheses are found.
 */
function formatDeviceName(input) {
  const match = input.match(/\(([^)]+)\)/)
  if (!match) {
    throw new Error('Device name is invalid')
  }
  return match[1].replace(/ /g, '_')
}

async function takeScreenshot(name, lang) {
  const path = await device.takeScreenshot(name)
  const deviceName = formatDeviceName(device.name)
  await execSync(
    `cp ${path} ${screenshotsDir}/${lang}/${deviceName}_${name}.png`
  )
}

describe('Taking screenshots', () => {
  beforeAll(async () => {
    await execSync(`rm -rf ${screenshotsDir} && mkdir ${screenshotsDir}`)

    await device.setStatusBar({
      time: '9:41',
      dataNetwork: 'wifi',
      wifiMode: 'active',
      // If specified must be one of 'searching', 'failed', or 'active'.
      wifiBars: '3',
      // If specified must be 0-3.
      cellularMode: 'active',
      // If specified must be one of 'notSupported', 'searching', 'failed', or 'active'.
      cellularBars: '4',
      // If specified must be 0-4.
      operatorName: '',
      // Set the cellular operator/carrier name. Use '' for the empty string.
      batteryState: 'charged',
      // If specified must be one of 'charging', 'charged', or 'discharging'.
      batteryLevel: '100',
      // If specified must be 0-100.
    })

    await device.installApp()
  })

  for (let i = 0; i < locales.length; i++) {
    const lang = locales[i]

    it(lang, async () => {
      await execSync(`mkdir ${screenshotsDir}/${lang}`)

      await device.terminateApp()
      await device.launchApp({
        newInstance: true,
        languageAndLocale: {
          language: lang,
          locale: lang,
        },
        launchArgs: {
          screenshotsMode: true,
        },
      })

      await waitFor(element(by.id('GENERATION_SCREEN'))).toBeVisible()
      await takeScreenshot('1', lang)
      await element(by.id('TAB_BUTTON_HISTORY')).tap()
      if (i === 0) {
        await new Promise((resolve) => setTimeout(() => resolve(), 5000))
      }

      await takeScreenshot('2', lang)

      const historyList = element(by.id('HISTORY_LIST'))

      const elementAttributes = await historyList.getAttributes()
      console.log({ boundWIdth: elementAttributes.elementBounds.width })

      await historyList.tap(
        RTL_locales.includes(lang)
          ? { x: elementAttributes.elementBounds.width - 5, y: 5 }
          : { x: 5, y: 5 }
      )
      await takeScreenshot('3', lang)
    })
  }
})
