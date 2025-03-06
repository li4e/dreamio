import { useTranslation } from 'react-i18next'
import { defaultDict } from 'shared/translations'

export type TranslatedStyleName =
  keyof typeof defaultDict.components.styleCard.styles

export function useTranslatedStyle(style: string | null) {
  const { t } = useTranslation()
  const styleKey = style as TranslatedStyleName

  if (style === null) {
    return null
  }

  return t(`components.styleCard.styles.${styleKey}`, {
    defaultValue: style,
  })
}
