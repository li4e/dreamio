import * as Localization from "expo-localization";
import { SUPPORTED_LANGUAGES } from "shared/translations";

export const getMatchingLocale = (): string => {
  const deviceLocales = Localization.getLocales();

  for (const locale of deviceLocales) {
    const tag = locale.languageTag;
    const code = locale.languageTag.replace(`-${locale.regionCode}`, "");

    if (SUPPORTED_LANGUAGES.includes(tag)) {
      return tag;
    }

    const matchedLanguage = SUPPORTED_LANGUAGES.find((lang) => {
      return lang.startsWith(code);
    });

    if (matchedLanguage) {
      return matchedLanguage;
    }
  }

  return "en-US";
};
