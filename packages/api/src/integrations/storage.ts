import {
  FileInfo,
  ICloudStorage,
  ICloudStorageItem,
} from '../types/integrations/cloudStorage'
import { storage } from 'firebase-admin'
import { v4 as uuidv4 } from 'uuid'
import { File, Bucket } from '@google-cloud/storage'
import sharp from 'sharp'
import { UserAvatarSettings } from '../config/settings'

export class CloudStorage implements ICloudStorage {
  private _bucket: Bucket

  constructor() {
    this._bucket = storage().bucket()
  }

  async saveGenerationImageFromBase64(
    base64Image: string
  ): Promise<CloudStorageItem> {
    const buffer = Buffer.from(base64Image, 'base64')
    const fileName = `${uuidv4()}.jpg`
    const filePath = `generation_images/${fileName}`

    const file = this._bucket.file(filePath)

    try {
      await file.save(buffer, {
        metadata: { contentType: 'image/jpeg' },
        public: true,
      })

      return new CloudStorageItem(file)
    } catch (error) {
      console.error('Error saving image to Cloud Storage:', error)
      throw new Error('Failed to save image to Cloud Storage')
    }
  }

  async saveUserAvatar(
    userId: number,
    tempFileName: string
  ): Promise<ICloudStorageItem> {
    const filePath = `users/${userId}/${tempFileName}`
    const file = this._bucket.file(filePath)
    const item = new CloudStorageItem(file)

    try {
      await item.isFileValidAsAvatar()
      const avatarTargetPath = `users/${userId}/avatars/${uuidv4()}.jpg`
      await file.move(avatarTargetPath)
      await file.makePublic()

      return new CloudStorageItem(file)
    } catch (error) {
      await file.delete()
      console.error('Error saving user avatar to Cloud Storage:', error)
      throw new Error('Failed to save user avatar image to Cloud Storage')
    }
  }

  async deleteFile(filePath: string) {
    const file = this._bucket.file(filePath)
    await new CloudStorageItem(file).delete()
  }
}

export class CloudStorageItem implements ICloudStorageItem {
  constructor(private _file: File) {}

  public async delete(): Promise<void> {
    await this._file.delete({ ignoreNotFound: true })
  }

  get imageData(): FileInfo {
    if (!this._file.isPublic()) {
      throw new Error('Image is not public')
    }

    return {
      publicUrl: this._file.publicUrl(),
      filePath: this._file.name,
    }
  }

  async isFileValidAsAvatar(): Promise<void> {
    const fileStream = this._file.createReadStream()
    const image = sharp()
    fileStream.pipe(image)

    return new Promise((resolve, reject) => {
      fileStream.on('error', (err) => {
        reject(new Error(`Error reading the file: ${err.message}`))
      })

      image.on('error', (err) => {
        reject(new Error(`Error processing the image: ${err.message}`))
      })

      image
        .metadata()
        .then((metadata) => {
          if (!metadata || !metadata.width || !metadata.height) {
            throw new Error(`Image's metadata is undefined or incorrect`)
          }

          if (
            metadata.width !== UserAvatarSettings.width ||
            metadata.height !== UserAvatarSettings.height
          ) {
            throw new Error(`Image's dimensions are too large`)
          }

          if (metadata.format !== UserAvatarSettings.format) {
            throw new Error(`Unsupported image format: ${metadata.format}`)
          }

          resolve()
        })
        .catch((err) => {
          reject(err)
        })
        .finally(() => {
          fileStream.destroy()
        })
    })
  }
}
