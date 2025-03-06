import { useNavigation } from '@react-navigation/native'
import * as MailComposer from 'expo-mail-composer'
import LottieView from 'lottie-react-native'
import React, { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Linking,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
  Image,
} from 'react-native'
import { Divider, List, useTheme, Text } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useGenerationDataService } from 'entities/generation'
import { BOTTOM_BAR_HEIGHT, SUPPORT_EMAIL, URLS } from 'shared/constants'
import { useDialog } from 'shared/ui/Dialog'
import { SnackBarVariant, useSnackbar } from 'shared/ui/Snackbar'
import { Button } from 'shared/ui/styled'
import { styled } from 'nativewind'
import { useDI } from 'shared/di'
import { useStoreData } from 'shared/store'
import * as Application from 'expo-application'
import RNTestFlight from 'react-native-test-flight'

export function SettingsScreen() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const clearAllData = useClearAllData()
  const contactUs = useContactUs()
  const { navigate } = useNavigation()
  const { showSnackbar } = useSnackbar()

  const pressedCount = useRef(0)
  const { store } = useDI()
  const onSecretPress = useCallback(() => {
    pressedCount.current++
    if (pressedCount.current > 10) {
      pressedCount.current = 0
      store.settings.setCensorship(!store.settings.censorship)

      showSnackbar(
        {
          title: t(
            store.settings.censorship
              ? 'screens.settings.godMode.inactive.title'
              : 'screens.settings.godMode.active.title'
          ),
          description: t(
            store.settings.censorship
              ? 'screens.settings.godMode.inactive.description'
              : 'screens.settings.godMode.active.description'
          ),
        },
        { hideDelay: 5000, position: 'top' }
      )
    }
  }, [pressedCount, showSnackbar, t])
  const censorship = useStoreData(
    () => store.settings.censorship,
    [store.settings]
  )

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingHorizontal: 20,
          paddingBottom: 0,
        }}
      >
        <View className="flex-grow">
          <View className="self-center">
            <TouchableWithoutFeedback onPress={onSecretPress}>
              {censorship ? (
                <Image
                  className="w-[100] h-[100] my-[25]"
                  source={require('../../../../assets/icon_foreground.png')}
                />
              ) : (
                <LottieView
                  source={require('./godmode.json')}
                  style={{ width: 150, height: 150 }}
                  autoPlay={true}
                />
              )}
            </TouchableWithoutFeedback>
          </View>
          <View className="flex-grow justify-center">
            {/* <List.Section>
            <SubHeader>{t('screens.settings.user.title')}</SubHeader>
            <List.Item
              title={t('screens.settings.user.darkMode')}
              right={({ color }) => <Switch value={true} />}
            />
            <List.Item
              title={t('screens.settings.user.language')}
              right={({ color }) => (
                <Text variant="labelLarge" style={{ color }}>
                  English
                </Text>
              )}
            />
          </List.Section>
          <SettingsDivider /> */}

            <View
              className="rounded-2xl pb-1"
              style={{ backgroundColor: colors.inverseOnSurface }}
            >
              <List.Section>
                <SubHeader>{t('screens.settings.about.title')}</SubHeader>
                <List.Item
                  onPress={() => {
                    navigate('webview', {
                      title: t('screens.settings.about.privacy'),
                      url: URLS.PRIVACY,
                    })
                  }}
                  title={t('screens.settings.about.privacy')}
                  right={({ color }) => <RightIcon color={color} />}
                />
                <Divider />
                <List.Item
                  onPress={() => {
                    navigate('webview', {
                      title: t('screens.settings.about.terms'),
                      url: URLS.TERMS,
                    })
                  }}
                  title={t('screens.settings.about.terms')}
                  right={({ color }) => <RightIcon color={color} />}
                />
                <Divider />
                <List.Item
                  onPress={contactUs}
                  title={t('screens.settings.about.contact')}
                  right={({ color }) => <RightIcon color={color} />}
                />
              </List.Section>
            </View>
          </View>

          <View>
            <Button
              textColor={colors.error}
              className="my-5 self-center"
              onPress={clearAllData}
            >
              {t('screens.settings.clear.button')}
            </Button>
            <Text className="text-center mb-5" variant="bodySmall">
              {t('screens.settings.version', {
                version: Application.nativeApplicationVersion,
                build: Application.nativeBuildVersion,
              })}
            </Text>
            {RNTestFlight.isTestFlight === true && (
              <Text className="text-center mb-5" variant="bodySmall">
                App is from Testflight
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const SubHeader = styled(List.Subheader, 'text-base font-semibold ')
const RightIcon = (props: { color: string }) => (
  <MaterialCommunityIcons color={props.color} name="arrow-right" size={20} />
)

function useClearAllData() {
  const genDataService = useGenerationDataService()
  const { showSnackbar } = useSnackbar()
  const { showDialog } = useDialog()
  const { t } = useTranslation()
  const { colors } = useTheme()

  return () => {
    showDialog({
      title: t('screens.settings.clear.dialog.title'),
      content: t('screens.settings.clear.dialog.description'),
      renderActions(dismissDialog) {
        return (
          <>
            <Button
              textColor={colors.error}
              onPress={async () => {
                await genDataService.clear()
                dismissDialog()
                showSnackbar(
                  {
                    description: t('screens.settings.clear.deleted'),
                  },
                  { offset: BOTTOM_BAR_HEIGHT }
                )
              }}
            >
              {t('screens.settings.clear.dialog.confirm')}
            </Button>
            <Button onPress={dismissDialog}>
              {t('screens.settings.clear.dialog.cancel')}
            </Button>
          </>
        )
      },
    })
  }
}

function useContactUs() {
  const { showSnackbar } = useSnackbar()
  const { t } = useTranslation()

  return async () => {
    try {
      const isComposeAvailable = await MailComposer.isAvailableAsync()
      const subject = `Help me with the ${Application.applicationName} app v.${Application.nativeApplicationVersion} b.${Application.nativeBuildVersion}`

      if (isComposeAvailable && Platform.OS === 'ios') {
        await MailComposer.composeAsync({
          recipients: [SUPPORT_EMAIL],
          subject,
        })
      } else {
        await Linking.openURL(
          `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`
        )
      }
    } catch {
      showSnackbar(
        {
          title: t('screens.settings.contactUsError.title'),
          description: t('screens.settings.contactUsError.description', {
            address: SUPPORT_EMAIL,
          }),
        },
        {
          autoHide: false,
          variant: SnackBarVariant.ERROR,
          offset: BOTTOM_BAR_HEIGHT,
        }
      )
    }
  }
}
