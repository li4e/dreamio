import {
  ICloudStorage,
  ICloudStorageItem,
} from '../../../types/integrations/cloudStorage'
import { v4 as uuidv4 } from 'uuid'

export class CloudStorage implements ICloudStorage {
  async saveImageFromBase64(): Promise<ICloudStorageItem> {
    return {
      delete: async () => {
        //
      },
      imageData: {
        filePath: `images/${uuidv4()}.jpg`,
        publicUrl:
          'https://thumb.photo-ac.com/7a/7a706ac91fa3a2330382e7f4c11c6b3e_t.jpeg',
      },
    }
  }
}
