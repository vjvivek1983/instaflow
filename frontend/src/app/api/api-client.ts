import axios, { AxiosInstance, AxiosResponse } from 'axios'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access (e.g., redirect to login)
          localStorage.removeItem('auth_token')
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AxiosResponse> {
    return this.client.post('/auth/login', { email, password })
  }

  async register(data: {
    email: string
    password: string
    firstName: string
    lastName: string
  }): Promise<AxiosResponse> {
    return this.client.post('/auth/register', data)
  }

  // Instagram account endpoints
  async getInstagramAccounts(): Promise<AxiosResponse> {
    return this.client.get('/instagram-accounts')
  }

  async connectInstagramAccount(data: {
    instagramPageId: string
    instagramUserId: string
    instagramUsername: string
    accessToken: string
    tokenExpiresAt: string
  }): Promise<AxiosResponse> {
    return this.client.post('/instagram-accounts', data)
  }

  // Flow endpoints
  async getFlows(instagramAccountId: string): Promise<AxiosResponse> {
    return this.client.get(`/instagram-accounts/${instagramAccountId}/flows`)
  }

  async createFlow(instagramAccountId: string, data: {
    name: string
    description: string
    flowDefinition: any
  }): Promise<AxiosResponse> {
    return this.client.post(`/instagram-accounts/${instagramAccountId}/flows`, data)
  }

  async updateFlow(flowId: string, data: {
    name?: string
    description?: string
    flowDefinition?: any
    status?: string
  }): Promise<AxiosResponse> {
    return this.client.put(`/flows/${flowId}`, data)
  }

  // Contact endpoints
  async getContacts(instagramAccountId: string, params?: {
    page?: number
    limit?: number
    search?: string
    tag?: string
  }): Promise<AxiosResponse> {
    return this.client.get(`/instagram-accounts/${instagramAccountId}/contacts`, { params })
  }

  async getContact(contactId: string): Promise<AxiosResponse> {
    return this.client.get(`/contacts/${contactId}`)
  }

  async addContactTags(contactId: string, tags: string[]): Promise<AxiosResponse> {
    return this.client.post(`/contacts/${contactId}/tags`, { tags })
  }

  async removeContactTags(contactId: string, tags: string[]): Promise<AxiosResponse> {
    return this.client.delete(`/contacts/${contactId}/tags`, { data: { tags } })
  }

  // Conversation endpoints
  async getConversations(instagramAccountId: string, params?: {
    status?: 'open' | 'closed' | 'pending_human'
    page?: number
    limit?: number
  }): Promise<AxiosResponse> {
    return this.client.get(`/instagram-accounts/${instagramAccountId}/conversations`, { params })
  }

  async getConversationMessages(conversationId: string): Promise<AxiosResponse> {
    return this.client.get(`/conversations/${conversationId}/messages`)
  }

  async sendMessage(conversationId: string, data: {
    text?: string
    mediaUrl?: string
  }): Promise<AxiosResponse> {
    return this.client.post(`/conversations/${conversationId}/messages`, data)
  }

  async updateConversationStatus(
    conversationId: string,
    status: 'open' | 'closed' | 'pending_human'
  ): Promise<AxiosResponse> {
    return this.client.put(`/conversations/${conversationId}/status`, { status })
  }

  // Broadcast endpoints
  async createBroadcast(instagramAccountId: string, data: {
    message: string
    mediaUrl?: string
    tag?: string
    scheduledAt?: string
  }): Promise<AxiosResponse> {
    return this.client.post(
      `/instagram-accounts/${instagramAccountId}/broadcasts`,
      data
    )
  }

  async getBroadcasts(instagramAccountId: string, params?: {
    page?: number
    limit?: number
    status?: 'scheduled' | 'sent' | 'failed'
  }): Promise<AxiosResponse> {
    return this.client.get(
      `/instagram-accounts/${instagramAccountId}/broadcasts`,
      { params }
    )
  }

  async cancelBroadcast(broadcastId: string): Promise<AxiosResponse> {
    return this.client.delete(`/broadcasts/${broadcastId}`)
  }

  // Analytics endpoints
  async getAccountAnalytics(instagramAccountId: string, params: {
    startDate: string
    endDate: string
  }): Promise<AxiosResponse> {
    return this.client.get(`/instagram-accounts/${instagramAccountId}/analytics/summary`, { params })
  }

  async getFlowAnalytics(flowId: string, params: {
    startDate: string
    endDate: string
  }): Promise<AxiosResponse> {
    return this.client.get(`/flows/${flowId}/analytics`, { params })
  }
}

export const apiClient = new ApiClient() 