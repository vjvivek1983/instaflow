'use client'

import React from 'react'
import { Button } from '../components/ui/button'
import { useAuthStore } from '../store/store'
import { Instagram } from 'lucide-react'

export default function SettingsPage() {
  const { selectedAccount, setSelectedAccount } = useAuthStore()

  const handleConnectInstagram = async () => {
    // TODO: Implement Instagram OAuth flow
    console.log('Connect Instagram account')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your account and Instagram connections
        </p>
      </div>

      <div className="space-y-6">
        {/* Instagram Account Section */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Instagram Account</h2>
          <p className="mt-1 text-sm text-gray-500">
            Connect your Instagram business account to start automating
          </p>

          <div className="mt-4">
            {selectedAccount ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Instagram className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">@{selectedAccount.instagramUsername}</p>
                    <p className="text-sm text-gray-500">Connected</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedAccount(null)}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={handleConnectInstagram}>
                <Instagram className="mr-2 h-4 w-4" />
                Connect Instagram Account
              </Button>
            )}
          </div>
        </div>

        {/* Subscription Section */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Subscription</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your subscription plan and billing
          </p>

          <div className="mt-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Free Plan</p>
                  <p className="text-sm text-gray-500">
                    Limited to 1 Instagram account and basic features
                  </p>
                </div>
                <Button>Upgrade</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Account Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your account information and preferences
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Button variant="outline" className="mt-1">
                Change Password
              </Button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
          <p className="mt-1 text-sm text-red-500">
            Permanently delete your account and all associated data
          </p>

          <div className="mt-4">
            <Button variant="destructive">Delete Account</Button>
          </div>
        </div>
      </div>
    </div>
  )
} 