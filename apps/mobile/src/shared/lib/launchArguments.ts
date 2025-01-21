import { LaunchArguments } from 'react-native-launch-arguments'
interface MyExpectedArgs {
  screenshotsMode?: boolean
}
export const launchArguments = LaunchArguments.value<MyExpectedArgs>()
