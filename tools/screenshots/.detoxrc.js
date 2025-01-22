/** @type {Detox.DetoxConfig} */
module.exports = {
  logger: {
    level: process.env.CI ? 'debug' : undefined,
  },
  testRunner: {
    $0: 'jest',
    args: {
      config: 'jest.config.js',
    },
  },
  artifacts: {
    plugins: {
      log: { enabled: false },
      screenshot: {
        enabled: false,
      },
    },
  },
  apps: {
    'ios.release': {
      type: 'ios.app',
      build:
        'xcodebuild -workspace ../../apps/mobile/ios/dreamio.xcworkspace -scheme dreamio -configuration Release -sdk iphonesimulator -arch x86_64 -derivedDataPath ../../apps/mobile/ios/build',
      binaryPath:
        '../../apps/mobile/ios/build/Build/Products/Release-iphonesimulator/dreamio.app',
    },
    // 'android.release': {
    //   type: 'android.apk',
    //   build:
    //     'cd android && ./gradlew :app:assembleRelease :app:assembleAndroidTest -DtestBuildType=release && cd ..',
    //   binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
    // },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14 Plus',
      },
    },
    // emulator: {
    //   type: 'android.emulator',
    //   device: {
    //     avdName: 'pixel_4',
    //   },
    // },
  },
  configurations: {
    'ios.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    // 'android.release': {
    //   device: 'emulator',
    //   app: 'android.release',
    // },
  },
}
