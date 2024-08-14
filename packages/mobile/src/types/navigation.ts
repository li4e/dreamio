import { NavigatorScreenParams } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type HomeTabsNavigatorParamList = {
  history: undefined
  generation: undefined
  settings: undefined
}

export type RootStackParamList = {
  onboarding: undefined
  sign_in: undefined
  home_tabs: NavigatorScreenParams<HomeTabsNavigatorParamList>
  generation_result: {
    generationId: number
  }
  generations_history: undefined
  settings: undefined
  user: {
    userId: number
  }
  post: undefined
  webview: {
    url: string
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends RootStackParamList {}
  }

  type RootScreenProps<T extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, T>
}
