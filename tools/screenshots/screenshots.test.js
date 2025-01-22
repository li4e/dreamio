const { execSync } = require('child_process')
const locales = ['ru', 'en-US']

const screenshotsDir = '../../fastlane/screenshots'

async function takeScreenshot(name, lang) {
  const path = await device.takeScreenshot(name)
  await execSync(`cp ${path} ${screenshotsDir}/${lang}/${name}.png`)
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
      await element(by.id('HISTORY_LIST')).tap({ x: 5, y: 5 })
      await takeScreenshot('3', lang)
    })
  }
})
