import * as fs from 'fs'
import * as path from 'path'

const modelsDir = path.resolve(__dirname, '../../__generated/models')
const indexPath = path.resolve(modelsDir, 'index.ts')

fs.readdir(modelsDir, (err, files) => {
  if (err) throw err

  const exports =
    files
      .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
      .map((file) => `export * from './${file.replace('.ts', '')}'`)
      .join('\n') + '\n'

  fs.writeFile(indexPath, exports, (err) => {
    if (err) throw err
    console.log('Index file has been generated')
  })
})
