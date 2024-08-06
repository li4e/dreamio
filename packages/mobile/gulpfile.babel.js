import gulp from 'gulp'
import pkg from './package.json'

import { promises as fs } from 'fs'
import path from 'path'

const { exec } = require('child_process')

const { platform } = process
/**
 * Opens the font-server defined in package.json
 *
 * @return {void} logs to terminal.
 */
const iconsEdit = () => {
  const openFont = {
    linux: `/opt/google/chrome/google-chrome --enable-plugins ${pkg.config.iconsServer}/$(cat .fontello)`,
    darwin: `open -a "Google Chrome" ${pkg.config.iconsServer}/$(cat .fontello)`,
    win32: `start chrome "${pkg.config.iconsServer}/$(cat .fontello)"`,
  }

  if (!openFont[platform]) {
    return false
  }

  // Connects to font server to get a fresh token for our editing session.
  // sends current config in the process.
  const getFontToken = `curl --silent --show-error --fail --output .fontello --form "config=@${pkg.config.iconsConfig}" ${pkg.config.iconsServer} \n`

  return exec(getFontToken + openFont[platform], (err, stdout, stderr) => {
    console.log(stdout)
    if (stderr) {
      console.error(err, stderr)
    }
  })
}
/**
 * Downloads and unpacks our updated font from the iconsServer
 *
 * @return {void} logs operations to terminal.
 */
const iconsSave = () => {
  let scripts = [
    'if test ! $(which unzip); then echo "Unzip is installed"; exit 128; fi',
    'rm -rf .fontello.src .fontello.zip',
    `curl --silent --show-error --fail --output .fontello.zip ${pkg.config.iconsServer}/$(cat .fontello)/get`,
    'unzip .fontello.zip -d .fontello.src',
  ]

  // Move typeface to multiple destinations
  for (let i = 0; i < pkg.config.iconsLocation.length; i++) {
    scripts.push(
      `cp $(find ./.fontello.src -maxdepth 1 -name 'fontello-*')/font/*.ttf ${pkg.config.iconsLocation[i]}`
    )
  }

  // Clean up
  scripts = scripts.concat([
    `mv $(find ./.fontello.src -maxdepth 1 -name 'fontello-*')/config.json ${pkg.config.iconsConfig}`,
    'rm -rf .fontello.src .fontello.zip',
  ])

  return exec(scripts.join(' \n '), (err, stdout, stderr) => {
    if (stderr) {
      console.error(err, stderr)
    } else {
      console.log(stdout)
    }
  })
}

const generateIconTypes = async () => {
  try {
    const configPath = pkg.config.iconsConfig // Путь к вашему config.json
    const data = await fs.readFile(configPath, 'utf8')
    const config = JSON.parse(data)
    const iconNames = config.glyphs.map((glyph) => `'${glyph.css}'`).join(' | ')
    const typeContent = `export type IconName = ${iconNames};\n`

    // Путь для сохранения файла с типами
    const outputPath = path.resolve(__dirname, pkg.config.iconTypesPath)
    await fs.writeFile(outputPath, typeContent, 'utf8')
    console.log('IconTypes.ts has been generated successfully.')

    // После успешной записи файла запускаем ESLint
    const eslintCommand = `eslint ${outputPath} --cache --fix`
    exec(eslintCommand, (err, stdout, stderr) => {
      if (err) {
        console.error('ESLint error:', err)
        return
      }
      if (stdout) console.log('ESLint stdout:', stdout)
      if (stderr) console.error('ESLint stderr:', stderr)
    })
  } catch (err) {
    console.error(
      'Error during icon types generation or ESLint execution:',
      err
    )
  }
}

gulp.task('icons-edit', iconsEdit)
gulp.task('icons-save', iconsSave)
gulp.task('generate-icon-types', generateIconTypes)
