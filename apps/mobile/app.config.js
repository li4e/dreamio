module.exports = {
  expo: {
    name: process.env.APP_NAME || "dreamio",
    slug: "Dreamio",
    version: process.env.APP_VERSION || "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    backgroundColor: "#ffffff",
    splash: {
      resizeMode: "cover",
      backgroundColor: "#ffffff",
    },
    ios: {
      appleTeamId: process.env.APPLE_TEAM_ID || "",
      buildNumber: process.env.IOS_BUILD_NUMBER || "1",
      supportsTablet: false,
      infoPlist: {
        CFBundleDisplayName: "AI Art Gen",
        CFBundleAllowMixedLocalizations: true,
        LSApplicationQueriesSchemes: [
          "fb",
          "instagram",
          "twitter",
          "tiktoksharesdk",
        ],
      },
      bundleIdentifier: process.env.IOS_APP_IDENTIFIER || "com.dreamio",
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      backgroundColor: "#ffffff",
      splash: {
        image: "./assets/icon.png",
      },
      versionCode: "1",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff",
      },
      package: "me.ilsur.dreamio",
    },
    web: {
      favicon: "./assets/icon.png",
    },
    plugins: [
      "expo-localization",
      [
        "react-native-share",
        {
          ios: ["fb", "instagram", "twitter", "tiktoksharesdk"],
          android: [
            "com.facebook.katana",
            "com.instagram.android",
            "com.twitter.android",
            "com.zhiliaoapp.musically",
          ],
        },
      ],
    ],
    locales: {
      en: "./src/shared/locales/en.json",
      ru: "./src/shared/locales/ru.json",
      uk: "./src/shared/locales/uk.json",
      "zh-Hans": "./src/shared/locales/zh-Hans.json",
      "zh-Hant": "./src/shared/locales/zh-Hant.json",
    },
  },
};
