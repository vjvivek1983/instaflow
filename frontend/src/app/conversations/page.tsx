'use client'

import React, { useState } from 'react'
import ConversationList from '../components/conversations/conversation-list'
import Chat from '../components/conversations/chat'

export default function ConversationsPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Live Chat</h1>
        <p className="text-sm text-gray-500">
          Manage your Instagram conversations
        </p>
      </div>

      <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Conversation List */}
        <div className="lg:col-span-1">
          <ConversationList
            onSelectConversation={(id) => setSelectedConversationId(id)}
            selectedConversationId={selectedConversationId}
          />
        </div>

        {/* Chat */}
        <div className="lg:col-span-2">
          {selectedConversationId ? (
            <Chat conversationId={selectedConversationId} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border bg-white text-gray-500">
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 