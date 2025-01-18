import { PropsWithChildren } from "react";
import { I18nextProvider } from "react-i18next";
import { StatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DialogProvider } from "shared/ui/Dialog";
import { SnackbarProvider } from "shared/ui/Snackbar";
import { DiProvider } from "./di";
import { i18next } from "./lib/i18next";
import { theme } from "./ui/customTheme";

export function Providers({ children }: PropsWithChildren) {
  return (
    <View className="bg-black flex-1">
      <SafeAreaProvider>
        <GestureHandlerRootView>
          <PaperProvider theme={theme}>
            <SnackbarProvider>
              <DialogProvider>
                <DiProvider>
                  <StatusBar
                    barStyle="dark-content"
                    backgroundColor="transparent"
                    translucent={true}
                  />

                  <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
                </DiProvider>
              </DialogProvider>
            </SnackbarProvider>
          </PaperProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </View>
  );
}
