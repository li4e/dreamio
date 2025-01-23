import arSA from './ar-SA.json'
import ca from './ca.json'
import cs from './cs.json'
import da from './da.json'
import deDE from './de-DE.json'
import el from './el.json'
import enUS from './en-US.json'
import enAU from './en-AU.json'
import enCA from './en-CA.json'
import enGB from './en-GB.json'
import esES from './es-ES.json'
import esMX from './es-MX.json'
import fi from './fi.json'
import frCA from './fr-CA.json'
import frFR from './fr-FR.json'
import he from './he.json'
import hi from './hi.json'
import hr from './hr.json'
import hu from './hu.json'
import id from './id.json'
import it from './it.json'
import ja from './ja.json'
import ko from './ko.json'
import ms from './ms.json'
import nlNL from './nl-NL.json'
import no from './no.json'
import pl from './pl.json'
import ptBR from './pt-BR.json'
import ptPT from './pt-PT.json'
import ro from './ro.json'
import ru from './ru.json'
import sk from './sk.json'
import sv from './sv.json'
import th from './th.json'
import tr from './tr.json'
import uk from './uk.json'
import vi from './vi.json'
import zhHans from './zh-Hans.json'
import zhHant from './zh-Hant.json'

export const resources = {
  'ar-SA': { translation: arSA },
  ca: { translation: ca },
  cs: { translation: cs },
  da: { translation: da },
  'de-DE': { translation: deDE },
  el: { translation: el },
  'en-US': { translation: enUS },
  'en-AU': { translation: enAU },
  'en-CA': { translation: enCA },
  'en-GB': { translation: enGB },
  'es-ES': { translation: esES },
  'es-MX': { translation: esMX },
  fi: { translation: fi },
  'fr-CA': { translation: frCA },
  'fr-FR': { translation: frFR },
  he: { translation: he },
  hi: { translation: hi },
  hr: { translation: hr },
  hu: { translation: hu },
  id: { translation: id },
  it: { translation: it },
  ja: { translation: ja },
  ko: { translation: ko },
  ms: { translation: ms },
  'nl-NL': { translation: nlNL },
  no: { translation: no },
  pl: { translation: pl },
  'pt-BR': { translation: ptBR },
  'pt-PT': { translation: ptPT },
  ro: { translation: ro },
  ru: { translation: ru },
  sk: { translation: sk },
  sv: { translation: sv },
  th: { translation: th },
  tr: { translation: tr },
  uk: { translation: uk },
  vi: { translation: vi },
  'zh-Hans': { translation: zhHans },
  'zh-Hant': { translation: zhHant },
}

export const SUPPORTED_LANGUAGES = Object.keys(resources)

export const defaultNS = 'translation'
export const defaultLang = 'en-US'
