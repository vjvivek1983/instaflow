import React, { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../store/store'
import { apiClient } from '../../api/api-client'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Send, Image, User, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  messageLogId: string
  direction: 'inbound' | 'outbound'
  type: 'text' | 'image' | 'video' | 'button_response' | 'quick_reply_response'
  content: {
    text?: string
    mediaUrl?: string
  }
  timestamp: string
  isAutomated: boolean
}

interface Contact {
  contactId: string
  instagramUsername: string
  firstName?: string
  lastName?: string
  profilePictureUrl?: string
}

interface ChatProps {
  conversationId: string
  onClose?: () => void
}

export default function Chat({ conversationId, onClose }: ChatProps) {
  const { selectedAccount } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [contact, setContact] = useState<Contact | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversationId && selectedAccount) {
      loadMessages()
    }
  }, [conversationId, selectedAccount])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getConversationMessages(conversationId)
      setMessages(response.data)
      
      // Load contact details
      const contactResponse = await apiClient.getContact(response.data[0].contactId)
      setContact(contactResponse.data)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedAccount) return

    try {
      setSending(true)
      const response = await apiClient.sendMessage(conversationId, {
        text: newMessage,
      })
      setMessages((prev) => [...prev, response.data])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading conversation...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center space-x-3">
          {contact?.profilePictureUrl ? (
            <img
              src={contact.profilePictureUrl}
              alt={contact?.instagramUsername}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <User className="h-4 w-4 text-gray-500" />
            </div>
          )}
          <div>
            <h3 className="font-medium">{contact?.instagramUsername}</h3>
            {contact?.firstName && (
              <p className="text-sm text-gray-500">
                {contact.firstName} {contact.lastName}
              </p>
            )}
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.messageLogId}
            className={`flex ${
              message.direction === 'outbound' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.direction === 'outbound'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.content.text && <p>{message.content.text}</p>}
              {message.content.mediaUrl && (
                <img
                  src={message.content.mediaUrl}
                  alt="Message media"
                  className="mt-2 max-h-48 rounded"
                />
              )}
              <p className="mt-1 text-xs opacity-70">
                {formatDistanceToNow(new Date(message.timestamp), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Type a message..."
            disabled={sending}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // TODO: Implement image upload
            }}
            disabled={sending}
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button onClick={sendMessage} disabled={sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 