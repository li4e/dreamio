export interface IUserData {
  id: number
  credits: number
  hasPremium: boolean
}

export interface IGeneration {
  id: number
  prompt: string
  promptFull: string
  style: string | null
  highQuality: boolean | null
  status: 'processing' | 'completed' | 'error'
  enhancer: boolean
  createdAt: number
  updatedAt: number
  images: { id: number; url: string }[] | null
}

export interface IPost {
  id: number
  imageUrl: string
  prompt: string
  likes: number
  comments: number
  deleted: boolean
  authorId: number
  createdAt: number
  updatedAt: number
}
