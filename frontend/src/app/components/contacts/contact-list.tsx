import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/store'
import { apiClient } from '../../api/api-client'
import { Button } from '../ui/button'
import { Search, User, Tag, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Contact {
  contactId: string
  instagramUsername: string
  firstName: string
  lastName: string
  tags: string[]
  lastInteractionAt: string
}

export default function ContactList() {
  const { selectedAccount } = useAuthStore()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalContacts, setTotalContacts] = useState(0)
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    if (selectedAccount) {
      loadContacts()
    }
  }, [selectedAccount, searchQuery, selectedTag, page])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getContacts(selectedAccount!.id, {
        page,
        limit: 10,
        search: searchQuery,
        tag: selectedTag || undefined,
      })
      setContacts(response.data.contacts)
      setTotalContacts(response.data.total)

      // Extract unique tags from all contacts
      const tags = response.data.contacts.reduce((acc: string[], contact: Contact) => {
        contact.tags.forEach((tag) => {
          if (!acc.includes(tag)) {
            acc.push(tag)
          }
        })
        return acc
      }, [])
      setAllTags(tags)
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null)
    } else {
      setSelectedTag(tag)
    }
    setPage(1)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1)
  }

  const handleAddTag = async (contactId: string, tag: string) => {
    try {
      await apiClient.addContactTags(contactId, { tags: [tag] })
      loadContacts()
    } catch (error) {
      console.error('Error adding tag:', error)
    }
  }

  const handleRemoveTag = async (contactId: string, tag: string) => {
    try {
      await apiClient.removeContactTags(contactId, { tags: [tag] })
      loadContacts()
    } catch (error) {
      console.error('Error removing tag:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full rounded-lg border pl-10 pr-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Tags Filter */}
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <Button
            key={tag}
            variant={selectedTag === tag ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTagClick(tag)}
          >
            <Tag className="mr-1 h-3 w-3" />
            {tag}
          </Button>
        ))}
      </div>

      {/* Contact List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p>Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <User className="mb-2 h-12 w-12" />
            <p>No contacts found</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.contactId}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">@{contact.instagramUsername}</h3>
                    {(contact.firstName || contact.lastName) && (
                      <p className="text-sm text-gray-600">
                        {[contact.firstName, contact.lastName]
                          .filter(Boolean)
                          .join(' ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Last interaction:{' '}
                  {formatDistanceToNow(new Date(contact.lastInteractionAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {contact.tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(contact.contactId, tag)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const tag = prompt('Enter new tag:')
                    if (tag) {
                      handleAddTag(contact.contactId, tag)
                    }
                  }}
                >
                  Add Tag
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalContacts > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(totalContacts / 10)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(totalContacts / 10)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
} 