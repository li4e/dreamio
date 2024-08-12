import * as admin from 'firebase-admin'

export function initializeAdminSDK() {
  if (admin.apps.length === 0) {
    admin.initializeApp()
  }
}
