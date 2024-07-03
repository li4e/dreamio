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
  createdAt: Date
  updatedAt: Date
  images: { id: number; url: string }[] | null
}

export interface IPostExisted {
  id: number
  imageUrl: string
  prompt: string
  likesCount: number
  commentsCount: number
  authorId: number
  createdAt: Date
  updatedAt: Date
  deleted: false
  blocked?: true
}

export interface IPostDeleted {
  id: number
  updatedAt: Date
  deleted: true
}

export type IPost = IPostExisted | IPostDeleted
