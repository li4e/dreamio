import { useNavigation } from '@react-navigation/native'
import * as Clipboard from 'expo-clipboard'
import { useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, ScrollView, Platform } from 'react-native'
import {
  Appbar,
  Chip,
  Divider,
  Menu,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper'
import { ActivityIndicator } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Share from 'react-native-share'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import {
  GenerationEntity,
  GenerationEntityStatus,
  useGenerationDataService,
} from 'entities/generation'
import { useDialog } from 'shared/ui/Dialog'
import { RelativeTime } from 'shared/ui/RelativeTime'
import { useSnackbar } from 'shared/ui/Snackbar'
import { Button } from 'shared/ui/styled'
import { CachedImage, ImageCache } from 'shared/ui/CachedImage'

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical'

export function GenerationResultScreen(
  props: RootScreenProps<'generation_result'>
) {
  const { generation } = props.route.params

  const { t } = useTranslation()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const onDelete = useGenDelete(generation)
  const onCopy = useOnCopy(generation)

  return (
    <View className="flex-1">
      <Header onCopyPress={onCopy} onDeletePress={onDelete} />
      {generation && generation.status === GenerationEntityStatus.SUCCESS ? (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: insets.bottom + 70,
            }}
          >
            <CachedImage
              source={{ uri: generation.images[0] }}
              className="w-full aspect-square"
            />
            <View className="flex-grow">
              <View className="flex-row items-center justify-between p-5">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="calendar"
                    size={20}
                    color={colors.secondary}
                  />
                  <Text variant="labelLarge" className="ml-2">
                    <RelativeTime time={generation.createdAt} />
                  </Text>
                </View>
                {generation.style && (
                  <Chip mode="outlined" compact icon="palette">
                    <Text variant="titleSmall">{generation.style}</Text>
                  </Chip>
                )}
              </View>
              <Divider className="w-full mb-5" />
              <View className="px-5">
                <Text variant="titleMedium" className="mb-3">
                  {t('screens.generationResult.promptLabel')}
                </Text>
                <TextInput
                  editable={false}
                  mode="flat"
                  multiline
                  className="min-h-[120]"
                  value={generation.prompt}
                />
              </View>
            </View>
          </ScrollView>
          <View
            className="absolute left-0 bottom-0 right-0 flex-row justify-between px-5"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <Button
              mode="contained-tonal"
              icon="share-variant"
              onPress={() => shareImage(generation.images[0])}
            >
              {t('screens.generationResult.shareButton')}
            </Button>
            <Button
              mode="contained"
              icon="download"
              onPress={() => saveImage(generation.images[0])}
            >
              {t('screens.generationResult.saveButton')}
            </Button>
          </View>
        </>
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator animating={true} />
        </View>
      )}
    </View>
  )
}

interface HeaderProps {
  onCopyPress(): void
  onDeletePress(): void
}

function Header(props: HeaderProps) {
  const { onCopyPress, onDeletePress } = props
  const { goBack } = useNavigation()
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const openMenu = () => setVisible(true)
  const closeMenu = () => setVisible(false)

  return (
    <Appbar.Header className="bg-transparent">
      <Appbar.BackAction onPress={goBack} />
      <Appbar.Content title={t('screens.generationResult.title')} />
      <Menu
        anchorPosition="bottom"
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Appbar.Action icon={MORE_ICON} onPress={() => openMenu()} />}
      >
        <Menu.Item
          leadingIcon="content-copy"
          onPress={() => {
            closeMenu()
            onCopyPress()
          }}
          title={t('screens.generationResult.copyButton')}
        />
        <Divider />
        <Menu.Item
          leadingIcon="trash-can-outline"
          onPress={() => {
            closeMenu()
            onDeletePress()
          }}
          title={t('screens.generationResult.deleteButton')}
        />
      </Menu>
    </Appbar.Header>
  )
}

function useGenDelete(genertaion: GenerationEntity) {
  const { showSnackbar } = useSnackbar()
  const genDataService = useGenerationDataService()
  const { t } = useTranslation()
  const { goBack } = useNavigation()
  const { showDialog } = useDialog()
  const { colors } = useTheme()

  return async () => {
    showDialog({
      title: t('screens.generationResult.deleteDialog.title'),
      content: t('screens.generationResult.deleteDialog.description'),
      renderActions(dismissDialog: () => void) {
        return (
          <>
            <Button
              textColor={colors.error}
              onPress={() =>
                genDataService.removeGeneration(genertaion).then((undo) => {
                  goBack()
                  dismissDialog()

                  showSnackbar(
                    { description: t('screens.generationResult.deleted') },
                    {
                      rightAction: {
                        handler: undo,
                        label: t('screens.generationResult.undo'),
                      },
                    }
                  )
                })
              }
            >
              {t('screens.generationResult.deleteDialog.confirm')}
            </Button>
            <Button onPress={dismissDialog}>
              {t('screens.generationResult.deleteDialog.cancel')}
            </Button>
          </>
        )
      },
    })
  }
}

function useOnCopy(generation: GenerationEntity) {
  const { showSnackbar } = useSnackbar()
  const { t } = useTranslation()

  return async () => {
    await Clipboard.setStringAsync(generation.prompt)
    showSnackbar({ description: t('screens.generationResult.promtCopied') }, {})
  }
}

async function shareImage(url: string) {
  try {
    const cache = new ImageCache(url)
    await Share.open({
      url: cache.cachedPath || url,
    })
  } catch (error) {
    console.error('Error sharing image:', error)
  }
}

async function saveImage(url: string) {
  try {
    const cache = new ImageCache(url)
    await Share.open({
      url: cache.cachedPath || url,
      type: 'image/jpeg',
      saveToFiles: true,
    })
  } catch (error) {
    console.error('Error saving image:', error)
  }
}
