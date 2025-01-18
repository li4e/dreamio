import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { i18next } from './i18next'
import 'dayjs/locale/en'
import 'dayjs/locale/ru'
import 'dayjs/locale/uk'
import 'dayjs/locale/zh'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-tw'
import 'dayjs/locale/zh-hk'

dayjs.extend(relativeTime)

dayjs.locale(i18next.language)
