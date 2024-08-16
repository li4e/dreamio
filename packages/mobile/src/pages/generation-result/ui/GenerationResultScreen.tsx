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
  TextInput,
  useTheme,
} from 'react-native-paper'
import { ActivityIndicator } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { GenerationEntityStatus } from 'entities/generation'
import { Button } from 'shared/ui/styled'

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical'

export function GenerationResultScreen(
  props: RootScreenProps<'generation_result'>
) {
  const { generation } = props.route.params

  const { t } = useTranslation()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1">
      <Header />
      {generation && generation.status === GenerationEntityStatus.SUCCESS ? (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: insets.bottom + 70,
            }}
          >
            <Image
              source={{ uri: generation.images[0] }}
              className="w-full aspect-square"
              style={{ backgroundColor: colors.primaryContainer }}
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
                    20 seconds ago
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
        </>
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator animating={true} />
        </View>
      )}
    </View>
  )
}

function Header() {
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
          onPress={() => {}}
          title={t('screens.generationResult.copyButton')}
        />
        <Divider />
        <Menu.Item
          leadingIcon="trash-can-outline"
          onPress={() => {}}
          title={t('screens.generationResult.deleteButton')}
        />
      </Menu>
    </Appbar.Header>
  )
}
