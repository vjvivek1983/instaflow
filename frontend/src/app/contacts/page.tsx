'use client'

import React from 'react'
import ContactList from '../components/contacts/contact-list'

export default function ContactsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <p className="text-sm text-gray-500">
          Manage your Instagram contacts and their tags
        </p>
      </div>

      <ContactList />
    </div>
  )
} 