import LottieView from 'lottie-react-native'
import { styled } from 'nativewind'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import {
  Button,
  Divider,
  List,
  // Switch,
  Text,
  useTheme,
} from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export function SettingsScreen() {
  const { t } = useTranslation()
  const hasPremium = false
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: 0,
          paddingHorizontal: 20,
        }}
      >
        <View className="flex-grow">
          <View className="self-center">
            <LottieView
              source={require('./premium_1.json')}
              style={{ width: 150, height: 150 }}
              autoPlay={true}
            />
          </View>
          <View className="flex-grow">
            <List.Section>
              <SubHeader>{t('screens.settings.membership.title')}</SubHeader>
              <List.Item
                title={t('screens.settings.membership.premium.title')}
                right={({ color }) => (
                  <Text variant="labelLarge" style={{ color }}>
                    {hasPremium
                      ? t('screens.settings.membership.premium.active')
                      : t('screens.settings.membership.premium.notActive')}
                  </Text>
                )}
              />
              <List.Item
                title={t('screens.settings.membership.balance')}
                right={({ color }) => <Text style={{ color }}>0</Text>}
              />
              <Button
                icon="crown"
                mode="contained"
                className="self-center my-2"
              >
                {t(
                  hasPremium
                    ? 'screens.settings.membership.topUp'
                    : 'screens.settings.membership.subscribe'
                )}
              </Button>
            </List.Section>

            <SettingsDivider />

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

            <List.Section>
              <SubHeader>{t('screens.settings.about.title')}</SubHeader>
              <List.Item
                onPress={() => {
                  // TODO: Replace to a real one
                }}
                title={t('screens.settings.about.privacy')}
                right={({ color }) => <RightIcon color={color} />}
              />
              <List.Item
                onPress={() => {
                  // TODO: Replace to a real one
                }}
                title={t('screens.settings.about.terms')}
                right={({ color }) => <RightIcon color={color} />}
              />
              <List.Item
                onPress={() => {
                  // TODO: Replace to a real one
                }}
                title={t('screens.settings.about.contact')}
                right={({ color }) => <RightIcon color={color} />}
              />
            </List.Section>
          </View>

          <Button
            textColor={colors.error}
            className="my-5 self-center"
            onPress={() => {
              // TODO: Replace with a real one
            }}
          >
            {t('screens.settings.clearButton')}
          </Button>
        </View>
      </ScrollView>
    </View>
  )
}

const SettingsDivider = styled(Divider, 'my-5')
const SubHeader = styled(List.Subheader, 'text-base font-semibold ')
const RightIcon = (props: { color: string }) => (
  <MaterialCommunityIcons color={props.color} name="arrow-right" size={20} />
)
