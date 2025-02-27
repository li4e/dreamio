import { GenerationEntity, GenerationEntityStatus } from './GenerationEntity'
import i18n from 'i18next'

const prompt = i18n.t('promptExample')

export const screenshotsData: GenerationEntity[] = [
  {
    id: 1,
    prompt,
    style: 'Anime',
    status: GenerationEntityStatus.SUCCESS,
    createdAt: Date.now() - 60 * 1000 * 4,
    updatedAt: Date.now() - 60 * 1000 * 4,
    images: ['https://dreamio.ilsur.me/screenshots/4.jpg'],
    enhance: true,
    width: 1280,
    height: 1280,
  },
  {
    id: 2,
    prompt,
    style: 'Anime',
    status: GenerationEntityStatus.SUCCESS,
    createdAt: Date.now() - 60 * 1000 * 3,
    updatedAt: Date.now() - 60 * 1000 * 3,
    images: ['https://dreamio.ilsur.me/screenshots/3.jpg'],
    enhance: true,
    width: 1280,
    height: 1280,
  },
  {
    id: 3,
    prompt,
    style: 'Anime',
    status: GenerationEntityStatus.SUCCESS,
    createdAt: Date.now() - 60 * 1000 * 2,
    updatedAt: Date.now() - 60 * 1000 * 2,
    images: ['https://dreamio.ilsur.me/screenshots/2.jpg'],
    enhance: true,
    width: 1280,
    height: 1280,
  },
  {
    id: 4,
    prompt,
    style: 'Anime',
    status: GenerationEntityStatus.SUCCESS,
    createdAt: Date.now() - 60 * 1000,
    updatedAt: Date.now() - 60 * 1000,
    images: ['https://dreamio.ilsur.me/screenshots/1.jpg'],
    enhance: true,
    width: 1280,
    height: 1280,
  },
]
