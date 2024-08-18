import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import i18next from 'i18next'
import 'dayjs/locale/en'

dayjs.extend(relativeTime)

dayjs.locale(i18next.language)
