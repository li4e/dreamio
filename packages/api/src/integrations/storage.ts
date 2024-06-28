import { CreateImageDto } from '@choco/db'
import {
  ICloudStorage,
  ICloudStorageItem,
} from '../types/integrations/cloudStorage'
import { storage } from 'firebase-admin'
import { v4 as uuidv4 } from 'uuid'
import { File, Bucket } from '@google-cloud/storage'

export class CloudStorage implements ICloudStorage {
  private _bucket: Bucket

  constructor() {
    this._bucket = storage().bucket()
  }

  async saveImageFromBase64(base64Image: string): Promise<CloudStorageItem> {
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
}

export class CloudStorageItem implements ICloudStorageItem {
  constructor(private _file: File) {}

  public async delete(): Promise<void> {
    await this._file.delete({ ignoreNotFound: true })
  }

  get imageData(): CreateImageDto {
    if (!this._file.isPublic()) {
      throw new Error('Image is not public')
    }

    return {
      publicUrl: this._file.publicUrl(),
      filePath: this._file.name,
    }
  }
}
