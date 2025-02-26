import { useTranslation } from 'react-i18next'
import { FormControl } from '../model/FormControl'
import { UIStateStore, useUIActions } from '../model/UIStateStore'
import { useStoreData } from 'shared/store'
import { useCallback, useEffect } from 'react'
import { useController } from 'react-hook-form'
import {
  FlatList,
  ListRenderItem,
  ListRenderItemInfo,
  View,
} from 'react-native'
import { Button, Dialog, useTheme } from 'react-native-paper'
import { CustomDialog } from 'shared/ui/CustomDialog'
import {
  ArtStyle,
  flatArtStyles,
  StyleCard,
  StylesListStore,
} from './StylesList'
import { useLocalObservable } from 'mobx-react-lite'

export function StyleSelectDialog(props: {
  control: FormControl
  uiStateStore: UIStateStore
}) {
  const { control, uiStateStore } = props
  const { field } = useController({ control, name: 'style' })
  const { t } = useTranslation()
  const isVisible = useStoreData(
    () => uiStateStore.styleSelectorModalOpened,
    [uiStateStore]
  )
  const stylesListStore = useLocalObservable(() => new StylesListStore())
  const { hideStylesDialog } = useUIActions(uiStateStore)

  useEffect(() => {
    stylesListStore.selected = field.value
  }, [stylesListStore, field.value])

  const handleChange = useCallback(
    (value: string | null) => {
      field.onChange(value)
      hideStylesDialog()
    },
    [hideStylesDialog]
  )

  const renderItem: ListRenderItem<ArtStyle> = useCallback(
    ({ item }: ListRenderItemInfo<ArtStyle>) => {
      return (
        <View className="w-1/3 aspect-square">
          <StyleCard
            flex={true}
            disabled={false}
            item={item}
            store={stylesListStore}
            onChange={handleChange}
          />
        </View>
      )
    },
    [field, stylesListStore, handleChange]
  )

  const deselect = () => {
    field.onChange(null)
    hideStylesDialog()
  }

  const { colors } = useTheme()

  return (
    <CustomDialog visible={isVisible} onDismiss={hideStylesDialog} dismissable>
      <Dialog.Title className="text-center">
        {t('screens.generation.styleSelectorDialog.title')}
      </Dialog.Title>
      <Dialog.ScrollArea className="px-0">
        <FlatList
          data={flatArtStyles}
          renderItem={renderItem}
          keyboardShouldPersistTaps="always"
          numColumns={3}
        />
      </Dialog.ScrollArea>
      <Dialog.Actions className="justify-between">
        <Button mode="text" textColor={colors.error} onPress={deselect}>
          {t('screens.generation.styleSelectorDialog.deselect')}
        </Button>
        <Button onPress={hideStylesDialog}>
          {t('screens.generation.styleSelectorDialog.close')}
        </Button>
      </Dialog.Actions>
    </CustomDialog>
  )
}
