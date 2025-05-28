import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

interface InstagramAccount {
  id: string
  instagramUsername: string
  status: string
}

interface AuthState {
  user: User | null
  token: string | null
  selectedAccount: InstagramAccount | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setSelectedAccount: (account: InstagramAccount | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      selectedAccount: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setSelectedAccount: (account) => set({ selectedAccount: account }),
      logout: () => {
        localStorage.removeItem('auth_token')
        set({ user: null, token: null, selectedAccount: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        selectedAccount: state.selectedAccount,
      }),
    }
  )
)

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))

interface Flow {
  id: string
  name: string
  description: string
  status: string
  flowDefinition: any
}

interface FlowState {
  flows: Flow[]
  selectedFlow: Flow | null
  setFlows: (flows: Flow[]) => void
  setSelectedFlow: (flow: Flow | null) => void
  updateFlow: (flow: Flow) => void
}

export const useFlowStore = create<FlowState>((set) => ({
  flows: [],
  selectedFlow: null,
  setFlows: (flows) => set({ flows }),
  setSelectedFlow: (flow) => set({ selectedFlow: flow }),
  updateFlow: (updatedFlow) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === updatedFlow.id ? updatedFlow : flow
      ),
      selectedFlow:
        state.selectedFlow?.id === updatedFlow.id ? updatedFlow : state.selectedFlow,
    })),
}))

interface Contact {
  id: string
  instagramUsername: string
  firstName: string
  lastName: string
  tags: string[]
  lastInteractionAt: string
}

interface ContactState {
  contacts: Contact[]
  selectedContact: Contact | null
  setContacts: (contacts: Contact[]) => void
  setSelectedContact: (contact: Contact | null) => void
  updateContact: (contact: Contact) => void
}

export const useContactStore = create<ContactState>((set) => ({
  contacts: [],
  selectedContact: null,
  setContacts: (contacts) => set({ contacts }),
  setSelectedContact: (contact) => set({ selectedContact: contact }),
  updateContact: (updatedContact) =>
    set((state) => ({
      contacts: state.contacts.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact
      ),
      selectedContact:
        state.selectedContact?.id === updatedContact.id
          ? updatedContact
          : state.selectedContact,
    })),
})) 