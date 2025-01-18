import { useNavigation } from "@react-navigation/native";
import * as MailComposer from "expo-mail-composer";
import LottieView from "lottie-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Linking, ScrollView, View } from "react-native";
import { Divider, List, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useGenerationDataService } from "entities/generation";
import { APP_NAME, SUPPORT_EMAIL, URLS } from "shared/constants";
import { useDialog } from "shared/ui/Dialog";
import { SnackBarVariant, useSnackbar } from "shared/ui/Snackbar";
import { Button } from "shared/ui/styled";
import { styled } from "nativewind";

export function SettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const clearAllData = useClearAllData();
  const contactUs = useContactUs();
  const { navigate } = useNavigation();

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
            <LottieView
              source={require("./premium_1.json")}
              style={{ width: 150, height: 150 }}
              autoPlay={true}
            />
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
                <SubHeader>{t("screens.settings.about.title")}</SubHeader>
                <List.Item
                  onPress={() => {
                    navigate("webview", {
                      title: t("screens.settings.about.privacy"),
                      url: URLS.PRIVACY,
                    });
                  }}
                  title={t("screens.settings.about.privacy")}
                  right={({ color }) => <RightIcon color={color} />}
                />
                <Divider />
                <List.Item
                  onPress={() => {
                    navigate("webview", {
                      title: t("screens.settings.about.terms"),
                      url: URLS.TERMS,
                    });
                  }}
                  title={t("screens.settings.about.terms")}
                  right={({ color }) => <RightIcon color={color} />}
                />
                <Divider />
                <List.Item
                  onPress={contactUs}
                  title={t("screens.settings.about.contact")}
                  right={({ color }) => <RightIcon color={color} />}
                />
              </List.Section>
            </View>
          </View>

          <Button
            textColor={colors.error}
            className="my-5 self-center"
            onPress={clearAllData}
          >
            {t("screens.settings.clear.button")}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const SubHeader = styled(List.Subheader, "text-base font-semibold ");
const RightIcon = (props: { color: string }) => (
  <MaterialCommunityIcons color={props.color} name="arrow-right" size={20} />
);

function useClearAllData() {
  const genDataService = useGenerationDataService();
  const { showSnackbar } = useSnackbar();
  const { showDialog } = useDialog();
  const { t } = useTranslation();
  const { colors } = useTheme();

  return () => {
    showDialog({
      title: t("screens.settings.clear.dialog.title"),
      content: t("screens.settings.clear.dialog.description"),
      renderActions(dismissDialog) {
        return (
          <>
            <Button
              textColor={colors.error}
              onPress={async () => {
                await genDataService.clear();
                dismissDialog();
                showSnackbar({
                  description: t("screens.settings.clear.deleted"),
                });
              }}
            >
              {t("screens.settings.clear.dialog.confirm")}
            </Button>
            <Button onPress={dismissDialog}>
              {t("screens.settings.clear.dialog.cancel")}
            </Button>
          </>
        );
      },
    });
  };
}

function useContactUs() {
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  return async () => {
    try {
      const isComposeAvailable = await MailComposer.isAvailableAsync();

      if (isComposeAvailable) {
        await MailComposer.composeAsync({
          recipients: [SUPPORT_EMAIL],
          subject: `Help me with the ${APP_NAME} app`,
        });
      } else {
        await Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
      }
    } catch {
      showSnackbar(
        {
          title: t("screens.settings.contactUsError.title"),
          description: t("screens.settings.contactUsError.description", {
            address: SUPPORT_EMAIL,
          }),
        },
        { autoHide: false, variant: SnackBarVariant.ERROR }
      );
    }
  };
}
