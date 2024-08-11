import { useNavigation } from '@react-navigation/native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Image, ScrollView, Platform } from 'react-native'
import {
  Appbar,
  Chip,
  Divider,
  Menu,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper'
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Button } from 'shared/ui/styled'

const generation = {
  url: 'https://i.ibb.co/zVS6L0B/Img.png',
  prompt:
    'A serene sunset in a mystical forest with glowing trees and a calm pond reflecting the colorful sky. Soft light filters through the leaves, creating a peaceful and enchanting atmosphere.',
  style: 'Anime',
}

export function GenerationResultScreen() {
  const { goBack } = useNavigation()
  const [promptExpanded, setPromptExpanded] = useState(true)
  const [visible, setVisible] = useState(false)
  const openMenu = () => setVisible(true)
  const closeMenu = () => setVisible(false)

  const { t } = useTranslation()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1">
      <Appbar.Header>
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title={t('screens.generationResult.title')} />

        <Menu
          anchorPosition="bottom"
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <Appbar.Action
              icon="dots-horizontal"
              onPress={() => {
                openMenu()
              }}
            />
          }
        >
          <Menu.Item
            leadingIcon="content-copy"
            onPress={() => {
              // TODO: Replace to a real one
            }}
            title={t('screens.generationResult.copyButton')}
          />
          <Divider />
          <Menu.Item
            leadingIcon="delete"
            onPress={() => {
              // TODO: Replace to a real one
            }}
            title={t('screens.generationResult.deleteButton')}
          />
        </Menu>
      </Appbar.Header>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 70,
        }}
      >
        <Image
          source={{ uri: generation.url }}
          className="w-full aspect-square rounded-2xl mb-4"
          style={{ backgroundColor: colors.primaryContainer }}
        />
        <View className="flex-row items-center justify-between mb-10">
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={colors.secondary}
            />
            <Text variant="labelMedium" className="ml-2">
              20 seconds ago
            </Text>
          </View>
          <Chip mode="outlined" compact>
            <Text variant="labelSmall" className="text-gray-500">
              {t('screens.generationResult.styleLabel')}:
            </Text>{' '}
            <Text variant="titleSmall">{generation.style}</Text>
          </Chip>
        </View>

        <Animated.View
          className="overflow-hidden rounded-xl mb-2 border border-gray-300"
          layout={LinearTransition.duration(300)}
        >
          <TouchableRipple
            rippleColor={
              Platform.OS === 'android' ? colors.secondaryContainer : undefined
            }
            className="rounded-xl overflow-hidden"
            onPress={() => setPromptExpanded((current) => !current)}
          >
            <View className="flex-row items-center justify-between p-4 ">
              <Text variant="titleMedium" className="mr-5">
                {t('screens.generationResult.promptLabel')}
              </Text>

              <MaterialCommunityIcons
                name={promptExpanded ? 'arrow-down' : 'arrow-right'}
                size={20}
              />
            </View>
          </TouchableRipple>
          {promptExpanded && (
            <Animated.View
              className="p-4 pt-2"
              entering={FadeIn.duration(200).delay(100)}
              exiting={FadeOut.duration(100)}
            >
              <Text variant="bodyMedium">{generation.prompt}</Text>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
      <View
        className="absolute left-0 bottom-0 right-0 flex-row justify-between px-5"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button
          mode="contained-tonal"
          icon="share-variant"
          onPress={() => {
            // TODO: Replace to a real one
          }}
        >
          {t('screens.generationResult.shareButton')}
        </Button>
        <Button
          mode="contained"
          icon="download"
          onPress={() => {
            // TODO: Replace to a real one
          }}
        >
          {t('screens.generationResult.saveButton')}
        </Button>
      </View>
    </View>
  )
}
