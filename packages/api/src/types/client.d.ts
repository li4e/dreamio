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

export interface IPostExisted {
  id: number
  imageUrl: string
  prompt: string
  likesCount: number
  commentsCount: number
  authorId: number
  createdAt: number
  updatedAt: number
  deleted: false
  blocked?: true
}

export interface IPostDeleted {
  id: number
  updatedAt: number
  deleted: true
}

export type IPost = IPostExisted | IPostDeleted
