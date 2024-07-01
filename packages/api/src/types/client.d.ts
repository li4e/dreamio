export interface IUserData {
  id: number
  credits: number
  hasPremium: boolean
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
