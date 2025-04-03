export interface User {
  id: string
  name: string
  email: string
  image?: string
  role: 'USER' | 'ADMIN'
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  title: string
  description: string
  price: number
  thumbnail?: string
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
  creatorId: string
  categoryId?: string
  createdAt: Date
  updatedAt: Date
  creator?: User
  category?: Category
  _count?: {
    reviews: number
  }
  averageRating?: number
}

export interface Category {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  services?: Service[]
}

export interface Review {
  id: string
  rating: number
  comment: string
  userId: string
  serviceId: string
  createdAt: Date
  updatedAt: Date
  user?: User
  service?: Service
}

export interface Purchase {
  id: string
  userId: string
  serviceId: string
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
  paymentMethodId: string
  createdAt: Date
  updatedAt: Date
  user?: User
  service?: Service
} 