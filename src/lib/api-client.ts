import { Service, Category, Review, Purchase } from '@/types'

const API_BASE_URL = '/api'

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }

  return response.json()
}

// Services API
export const servicesApi = {
  getAll: (params?: {
    categoryId?: string
    creatorId?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    return fetchApi<Service[]>(`/services?${searchParams.toString()}`)
  },

  getById: (id: string) => {
    return fetchApi<Service>(`/services/${id}`)
  },

  create: (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    return fetchApi<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: Partial<Service>) => {
    return fetchApi<Service>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return fetchApi<void>(`/services/${id}`, {
      method: 'DELETE',
    })
  },
}

// Categories API
export const categoriesApi = {
  getAll: () => {
    return fetchApi<Category[]>('/categories')
  },

  getById: (id: string) => {
    return fetchApi<Category>(`/categories/${id}`)
  },

  create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    return fetchApi<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: Partial<Category>) => {
    return fetchApi<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return fetchApi<void>(`/categories/${id}`, {
      method: 'DELETE',
    })
  },
}

// Reviews API
export const reviewsApi = {
  getAll: (params?: {
    serviceId?: string
    userId?: string
    rating?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    return fetchApi<Review[]>(`/reviews?${searchParams.toString()}`)
  },

  getById: (id: string) => {
    return fetchApi<Review>(`/reviews/${id}`)
  },

  create: (data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
    return fetchApi<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: Partial<Review>) => {
    return fetchApi<Review>(`/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return fetchApi<void>(`/reviews/${id}`, {
      method: 'DELETE',
    })
  },
}

// Purchases API
export const purchasesApi = {
  getAll: (params?: {
    status?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    return fetchApi<Purchase[]>(`/purchases?${searchParams.toString()}`)
  },

  getById: (id: string) => {
    return fetchApi<Purchase>(`/purchases/${id}`)
  },

  create: (data: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => {
    return fetchApi<Purchase>('/purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: Partial<Purchase>) => {
    return fetchApi<Purchase>(`/purchases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
} 