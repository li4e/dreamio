import { resources, defaultNS } from '../app/lib/i18next'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: typeof resources.en
  }
}
