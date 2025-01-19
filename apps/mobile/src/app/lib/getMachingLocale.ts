import * as Localization from "expo-localization";
import { SUPPORTED_LANGUAGES } from "shared/translations";

export const getMatchingLocale = (): string => {
  const deviceLocales = Localization.getLocales(); // Get device locale data

  // Extract the language tags from the device locales
  const deviceLanguageTags = deviceLocales.map((locale) => locale.languageTag);

  // 1. First, try to find an exact match with the full language tag (e.g., en-GB)
  for (const tag of deviceLanguageTags) {
    if (SUPPORTED_LANGUAGES.includes(tag)) {
      return tag;
    }
  }

  // 2. If no exact match is found, check for a match using just the language code (first 2 characters)
  for (const tag of deviceLanguageTags) {
    const languageCode = tag.split("-")[0]; // Extract the language code (first 2 characters)
    const matchedLanguage = SUPPORTED_LANGUAGES.find((lang) =>
      lang.startsWith(languageCode)
    );
    if (matchedLanguage) {
      return matchedLanguage;
    }
  }

  // 3. If no match is found, return the default language ('en')
  return "en-US";
};
