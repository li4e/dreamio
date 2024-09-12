export interface IUserPremiumInfo {
  credits: number
  hasPremium: boolean
}

interface IUser {
  id: number
  userName: string
  avatar: string | null
}

export interface IUserAccountInfo extends IUser {
  id: number
  premiumInfo: IUserPremiumInfo
}

export interface IGeneration {
  id: number
  prompt: string
  promptFull: string
  style: string | null
  highQuality: boolean | null
  status: 'processing' | 'completed' | 'error'
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
