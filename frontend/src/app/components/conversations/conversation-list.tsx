import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/store'
import { apiClient } from '../../api/api-client'
import { Button } from '../ui/button'
import { Search, User, Clock, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Conversation {
  id: string
  contactId: string
  instagramUsername: string
  status: 'open' | 'closed' | 'pending_human'
  lastMessageContent: string
  lastMessageTimestamp: string
}

interface ConversationListProps {
  onSelectConversation: (id: string) => void
  selectedConversationId: string | null
}

export default function ConversationList({
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) {
  const { selectedAccount } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedStatus, setSelectedStatus] = useState<'open' | 'closed' | 'pending_human'>('open')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedAccount) {
      loadConversations()
    }
  }, [selectedAccount, selectedStatus])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getConversations(selectedAccount!.id, {
        status: selectedStatus,
      })
      setConversations(response.data.conversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'pending_human':
        return 'bg-yellow-100 text-yellow-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Status Filter */}
      <div className="mb-4 flex space-x-2">
        <Button
          variant={selectedStatus === 'open' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('open')}
        >
          Open
        </Button>
        <Button
          variant={selectedStatus === 'pending_human' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('pending_human')}
        >
          Pending
        </Button>
        <Button
          variant={selectedStatus === 'closed' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('closed')}
        >
          Closed
        </Button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p>Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <MessageSquare className="mb-2 h-12 w-12" />
            <p>No conversations found</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`rounded-lg border bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 cursor-pointer ${
                selectedConversationId === conversation.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">@{conversation.instagramUsername}</h3>
                    <p className="text-sm text-gray-600">
                      {conversation.lastMessageContent}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                      conversation.status
                    )}`}
                  >
                    {conversation.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="mr-1 h-3 w-3" />
                    {formatDistanceToNow(new Date(conversation.lastMessageTimestamp), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 