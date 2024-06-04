interface PublicFile {
  path: string
  publicUri: string
}

export class CloudStorage {
  static async saveImageFromUrl(_url: string): Promise<PublicFile> {
    // Download file and save to cloud storage
    // then return the path and public url
    return {
      path: '',
      publicUri: '',
    }
  }
}
