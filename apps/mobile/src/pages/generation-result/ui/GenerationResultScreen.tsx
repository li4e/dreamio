import { useNavigation } from '@react-navigation/native'
import * as Clipboard from 'expo-clipboard'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Appbar, Icon, IconButton, Text, useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  GenerationEntity,
  GenerationSettings,
  useGenDelete,
  useShowEnhanceInfoDialog,
  useShowStyleInfoDialog,
} from 'entities/generation'
import { RelativeTime } from 'shared/ui/RelativeTime'
import { useSnackbar } from 'shared/ui/Snackbar'
import { Button } from 'shared/ui/styled'
import { CachedImage, shareImage, useOnSaveImage } from 'shared/ui/CachedImage'
import { getAspectRatioFromSize } from 'shared/ui/AspectedRatioView'
import { AspectedRatioView } from 'shared/ui/AspectedRatioView'
import Animated, {
  useAnimatedRef,
  useScrollViewOffset,
} from 'react-native-reanimated'
import { StickyHeader } from 'shared/ui/StickyHeader'
import { useReportDialog } from 'shared/ui/ReportDialog'

const bottomOffset = 70
export function GenerationResultScreen(
  props: RootScreenProps<'generation_result'>
) {
  const { generation } = props.route.params
  const { goBack } = useNavigation()

  const { t } = useTranslation()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const onDelete = useGenDelete(generation, goBack)
  const onCopy = useOnCopy(generation)
  const onRework = useOnRework(generation)
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>()
  const scrollY = useScrollViewOffset(scrollViewRef)
  const showEnahceInfoDialog = useShowEnhanceInfoDialog()
  const showStyleInfoDialog = useShowStyleInfoDialog()
  const topOffset = StickyHeader.useTopInset()

  return (
    <View className="flex-1">
      <Animated.ScrollView
        scrollIndicatorInsets={{ top: StickyHeader.height }}
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: topOffset,
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
              <Icon source="calendar" size={20} color={colors.secondary} />
              <Text variant="labelLarge" className="ml-2">
                <RelativeTime time={generation.createdAt} />
              </Text>
            </View>
            <IconButton onPress={onDelete} icon="trash-can" />
          </View>
          <View className="px-5">
            <GenerationSettings
              data={generation}
              className="mb-2"
              onEnhancePress={showEnahceInfoDialog}
              onStylePress={showStyleInfoDialog}
            />
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
      </Animated.ScrollView>
      <StickyHeader scrollY={scrollY}>
        <Header generation={generation} />
      </StickyHeader>
      <View
        className="absolute left-0 bottom-0 right-0 flex-row justify-center px-5"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button mode="contained" icon="brush" onPress={onRework}>
          {t('screens.generationResult.reworkButton')}
        </Button>
      </View>
    </View>
  )
}

interface HeaderProps {
  generation: GenerationEntity
}

function Header(props: HeaderProps) {
  const { generation } = props
  const { goBack } = useNavigation()

  const onSaveImage = useOnSaveImage()
  const image = generation.images[0]
  const { openReporDialog } = useReportDialog()

  return (
    <>
      <Appbar.BackAction onPress={goBack} />
      <Appbar.Action
        icon="message-alert"
        onPress={() => {
          openReporDialog(generation.images)
        }}
      />
      <Appbar.Content title="" />

      <Appbar.Action
        icon="share-variant"
        onPress={() => shareImage(image, generation.prompt)}
      />
      <Appbar.Action icon="download" onPress={() => onSaveImage(image)} />
    </>
  )
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
