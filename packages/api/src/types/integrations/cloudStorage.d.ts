export interface FileInfo {
  filePath: string
  publicUrl: string
}

export interface ICloudStorageItem {
  delete(): Promise<void>
  imageData: FileInfo
}

export interface ICloudStorage {
  saveGenerationImageFromBase64(base64Image: string): Promise<ICloudStorageItem>

  saveUserAvatar(
    userId: number,
    tempFilePath: string
  ): Promise<ICloudStorageItem>

  deleteFile(filePath: string): Promise<void>
}
