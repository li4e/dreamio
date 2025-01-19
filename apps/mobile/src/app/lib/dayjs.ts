import "dayjs/locale/ar-sa";
import "dayjs/locale/ca";
import "dayjs/locale/cs";
import "dayjs/locale/da";
import "dayjs/locale/de";
import "dayjs/locale/el";
import "dayjs/locale/en";
import "dayjs/locale/en-au";
import "dayjs/locale/en-ca";
import "dayjs/locale/en-gb";
import "dayjs/locale/es";
import "dayjs/locale/es-mx";
import "dayjs/locale/fi";
import "dayjs/locale/fr-ca";
import "dayjs/locale/fr";
import "dayjs/locale/he";
import "dayjs/locale/hi";
import "dayjs/locale/hr";
import "dayjs/locale/hu";
import "dayjs/locale/id";
import "dayjs/locale/it";
import "dayjs/locale/ja";
import "dayjs/locale/ko";
import "dayjs/locale/ms";
import "dayjs/locale/nl";
import "dayjs/locale/nb";
import "dayjs/locale/pl";
import "dayjs/locale/pt-br";
import "dayjs/locale/pt";
import "dayjs/locale/ru";
import "dayjs/locale/ro";
import "dayjs/locale/sk";
import "dayjs/locale/sv";
import "dayjs/locale/th";
import "dayjs/locale/tr";
import "dayjs/locale/uk";
import "dayjs/locale/vi";
import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-tw";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { i18next } from "./i18next";

export const LOCALE_MAP: Record<string, string> = {
  "ar-SA": "ar-sa",
  ca: "ca",
  cs: "cs",
  da: "da",
  "de-DE": "de",
  el: "el",
  "en-US": "en",
  "en-AU": "en-au",
  "en-CA": "en-ca",
  "en-GB": "en-gb",
  "es-ES": "es",
  "es-MX": "es-mx",
  fi: "fi",
  "fr-CA": "fr-ca",
  "fr-FR": "fr",
  he: "he",
  hi: "hi",
  hr: "hr",
  hu: "hu",
  id: "id",
  it: "it",
  ja: "ja",
  ko: "ko",
  ms: "ms",
  "nl-NL": "nl",
  no: "nb", // Norwegian Bokmål
  pl: "pl",
  "pt-BR": "pt-br",
  "pt-PT": "pt",
  ro: "ro",
  ru: "ru",
  sk: "sk",
  sv: "sv",
  th: "th",
  tr: "tr",
  uk: "uk",
  vi: "vi",
  "zh-Hans": "zh-cn", // Simplified Chinese
  "zh-Hant": "zh-tw", // Traditional Chinese
};

dayjs.extend(relativeTime);

dayjs.locale(LOCALE_MAP[i18next.language] || "en-US");
