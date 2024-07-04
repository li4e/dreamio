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

export interface IPost {
  id: number
  imageUrl: string
  prompt: string
  style: string | null
  likesCount: number
  commentsCount: number
  authorId: number
  createdAt: Date
  updatedAt: Date
}

export interface IPostComment {
  id: string
  content: string
  postId: number
  userId: number
  likesCount: number
  createdAt: Date
  updatedAt: Date
}
