import { resources, defaultNS } from 'shared/translations'

const dict = resources['en-US']

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: typeof dict
  }
}
