import { useNavigation } from '@react-navigation/native'
import * as Clipboard from 'expo-clipboard'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, ScrollView } from 'react-native'
import {
  Appbar,
  Chip,
  Divider,
  IconButton,
  Text,
  useTheme,
} from 'react-native-paper'
import { ActivityIndicator } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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
import { CachedImage, shareImage, useOnSaveImage } from 'shared/ui/CachedImage'
import { getAspectRatioFromSize } from 'shared/ui/AspectedRatioView'
import { AspectedRatioView } from 'shared/ui/AspectedRatioView'
import { HEADER_HEIGHT } from 'shared/constants'

const bottomOffset = 70

export function GenerationResultScreen(
  props: RootScreenProps<'generation_result'>
) {
  const { generation } = props.route.params

  const { t } = useTranslation()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const onDelete = useGenDelete(generation)
  const onCopy = useOnCopy(generation)
  const onRework = useOnRework(generation)

  return (
    <View className="flex-1">
      <Header onDeletePress={onDelete} generation={generation} />
      {generation && generation.status === GenerationEntityStatus.SUCCESS ? (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: insets.bottom + bottomOffset,
            }}
          >
            <AspectedRatioView ratio={getAspectRatioFromSize(generation)}>
              <CachedImage
                source={generation.images[0]}
                className="flex-1"
                contentFit="contain"
                contentPosition="center"
                style={{ backgroundColor: colors.backdrop }}
              />
            </AspectedRatioView>
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
                <View className="flex-row items-center justify-between mb-1">
                  <Text variant="titleMedium" className="mb-3">
                    {t('screens.generationResult.promptLabel')}
                  </Text>
                  <View className="flex-row items-center">
                    <Text variant="labelMedium" className="mr-2">
                      {t('screens.generationResult.enhancer')}
                    </Text>
                    <MaterialCommunityIcons
                      size={20}
                      name={
                        generation.enhance
                          ? 'checkbox-marked-circle'
                          : 'checkbox-blank-circle-outline'
                      }
                      color={colors.primary}
                    />
                  </View>
                </View>
                <View
                  className="py-5 px-5 rounded-lg pr-10 min-h-[100]"
                  style={{ backgroundColor: colors.inverseOnSurface }}
                >
                  <Text>{generation.prompt}</Text>
                  <IconButton
                    className="absolute right-0 bottom-0"
                    icon="content-copy"
                    size={18}
                    onPress={onCopy}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
          <View
            className="absolute left-0 bottom-0 right-0 flex-row justify-between px-5"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <Button mode="contained-tonal" icon="brush" onPress={onRework}>
              {t('screens.generationResult.reworkButton')}
            </Button>
            <Button
              mode="contained"
              icon="share-variant"
              onPress={() =>
                shareImage(generation.images[0], generation.prompt)
              }
            >
              {t('screens.generationResult.shareButton')}
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
  generation: GenerationEntity
  onDeletePress(): void
}

function Header(props: HeaderProps) {
  const { onDeletePress, generation } = props
  const { goBack } = useNavigation()
  const onSaveImage = useOnSaveImage()

  return (
    <Appbar.Header className="bg-transparent">
      <Appbar.BackAction onPress={goBack} />
      <Appbar.Content title="" />
      <Appbar.Action
        icon="download"
        onPress={() => onSaveImage(generation.images[0])}
      />
      <Appbar.Action icon="trash-can-outline" onPress={onDeletePress} />
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
                      position: 'top',
                      offset: HEADER_HEIGHT,
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
    showSnackbar(
      { description: t('screens.generationResult.promtCopied') },
      { offset: bottomOffset }
    )
  }
}

function useOnRework(generation: GenerationEntity) {
  const { navigate, goBack } = useNavigation()

  return async () => {
    goBack()
    navigate('home_tabs', {
      screen: 'generation',
      params: {
        generation,
      },
    })
  }
}
