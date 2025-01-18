import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { GenerationEntity } from "entities/generation";

export type HomeTabsNavigatorParamList = {
  history: undefined;
  generation: undefined;
  settings: undefined;
};

export type RootStackParamList = {
  home_tabs: NavigatorScreenParams<HomeTabsNavigatorParamList>;
  generation_result: {
    generation: GenerationEntity;
  };
  webview: {
    title: string;
    url: string;
  };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends RootStackParamList {}
  }

  type RootScreenProps<T extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, T>;
}
