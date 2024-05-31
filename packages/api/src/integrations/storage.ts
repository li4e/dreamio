export class CloudStorage {
  static async saveImageFromUrl() {
    return {
      path: `downloaded_image_${String(Date.now())}`,
      publicUri:
        'https://thumb.photo-ac.com/7a/7a706ac91fa3a2330382e7f4c11c6b3e_t.jpeg',
    }
  }
}
