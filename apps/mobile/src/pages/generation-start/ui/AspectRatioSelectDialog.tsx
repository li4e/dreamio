import { useTranslation } from 'react-i18next'
import { FormControl } from '../model/FormControl'
import { UIStateStore, useUIActions } from '../model/UIStateStore'
import { useStoreData } from 'shared/store'
import { useMemo } from 'react'
import { AspectRatio } from 'shared/ui/AspectedRatioView'
import { Controller } from 'react-hook-form'
import { FlatList, View } from 'react-native'
import { Button, Dialog, Divider, List } from 'react-native-paper'
import { CustomDialog } from 'shared/ui/CustomDialog'

export function AspectRatioSelectDialog(props: {
  control: FormControl
  uiStateStore: UIStateStore
}) {
  const { control, uiStateStore } = props
  const { t } = useTranslation()
  const isVisible = useStoreData(
    () => uiStateStore.aspectRatioModalOpened,
    [uiStateStore]
  )
  const { hideAspectDialog } = useUIActions(uiStateStore)

  const items = useMemo(
    () => [
      {
        value: AspectRatio.classic,
        title: t('screens.generation.aspectRatio.classic'),
      },
      {
        value: AspectRatio.portrait,
        title: t('screens.generation.aspectRatio.portrait'),
      },
      {
        value: AspectRatio.square,
        title: t('screens.generation.aspectRatio.square'),
      },
      {
        value: AspectRatio.vertical,
        title: t('screens.generation.aspectRatio.vertical'),
      },
      {
        value: AspectRatio.widescreen,
        title: t('screens.generation.aspectRatio.widescreen'),
      },
    ],
    [t]
  )

  const renderItem = ({
    item,
    index,
  }: {
    index: number
    item: { value: AspectRatio; title: string }
  }) => {
    return (
      <Controller
        control={control}
        name="aspectRatio"
        render={({ field: { value, onChange } }) => {
          const handlePress = () => {
            onChange(item.value)
            hideAspectDialog()
          }
          return (
            <View>
              <List.Item
                className="pl-5"
                title={item.title}
                onPress={handlePress}
                right={() => (
                  <Button
                    mode={
                      item.value === value ? 'contained' : 'contained-tonal'
                    }
                    className="self-center"
                  >
                    {item.value}
                  </Button>
                )}
              />
              {index !== items.length - 1 && <Divider />}
            </View>
          )
        }}
      />
    )
  }

  return (
    <CustomDialog visible={isVisible} onDismiss={hideAspectDialog} dismissable>
      <Dialog.Title className="text-center">
        {t('screens.generation.aspectRatio.title')}
      </Dialog.Title>
      <Dialog.ScrollArea className="px-0">
        <FlatList
          keyboardShouldPersistTaps="always"
          data={items}
          renderItem={renderItem}
        />
      </Dialog.ScrollArea>
      <Dialog.Actions className="justify-center">
        <Button onPress={hideAspectDialog}>
          {t('screens.generation.aspectRatio.close')}
        </Button>
      </Dialog.Actions>
    </CustomDialog>
  )
}
