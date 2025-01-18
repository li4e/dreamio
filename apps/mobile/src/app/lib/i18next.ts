import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { locales } from "shared/locales";

export const defaultNS = "translation";
export const resources = locales;

i18n.use(initReactI18next).init({
  lng: Localization.locale,
  fallbackLng: "en",
  supportedLngs: Object.keys(resources),
  ns: ["translation"],
  defaultNS,
  resources,

  interpolation: {
    escapeValue: false,
  },
});

export const i18next = i18n;
