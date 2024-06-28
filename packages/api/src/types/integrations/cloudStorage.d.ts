export interface ICloudStorageItem {
  delete: () => Promise<void>
  imageData: {
    filePath: string
    publicUrl: string
  }
}

export interface ICloudStorage {
  saveImageFromBase64: (base64Image: string) => Promise<ICloudStorageItem>
}
