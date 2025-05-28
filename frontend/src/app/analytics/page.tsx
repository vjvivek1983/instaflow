'use client'

import React, { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useParams } from 'next/navigation'
import { useToast } from '@/app/hooks/useToast'

interface Period {
  start: string
  end: string
}

interface AccountSummary {
  totalContacts: number
  newContacts: number
  messagesSent: number
  messagesReceived: number
  automatedMessages: number
  automationRate: number
  period: Period
}

interface ContactGrowth {
  date: string
  newContacts: number
}

interface FlowAnalytics {
  flowId: string
  name: string
  triggers: Array<{
    type: string
    starts: number
  }>
  totalStarts: number
  completions: number
  completionRate: number
  nodeEngagement: Array<{
    nodeId: string
    engagements: number
  }>
  period: Period
}

const AnalyticsDashboard = () => {
  const params = useParams()
  const { showToast } = useToast()
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null)
  const [contactGrowth, setContactGrowth] = useState<ContactGrowth[]>([])
  const [flowAnalytics, setFlowAnalytics] = useState<FlowAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDateRange, setSelectedDateRange] = useState('30')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch account summary
        const summaryResponse = await fetch(
          `/api/v1/instagram-accounts/${params.accountId}/analytics/summary?days=${selectedDateRange}`
        )
        if (!summaryResponse.ok) throw new Error('Failed to fetch account summary')
        const summaryData = await summaryResponse.json()
        setAccountSummary(summaryData)

        // Fetch contact growth
        const growthResponse = await fetch(
          `/api/v1/instagram-accounts/${params.accountId}/analytics/growth?days=${selectedDateRange}`
        )
        if (!growthResponse.ok) throw new Error('Failed to fetch contact growth')
        const growthData = await growthResponse.json()
        setContactGrowth(growthData)

        // Fetch flow analytics
        const flowsResponse = await fetch(`/api/v1/instagram-accounts/${params.accountId}/flows`)
        if (!flowsResponse.ok) throw new Error('Failed to fetch flows')
        const flows = await flowsResponse.json()

        const flowAnalyticsPromises = flows.map((flow: { id: string }) =>
          fetch(`/api/v1/flows/${flow.id}/analytics?days=${selectedDateRange}`)
            .then((res) => res.json())
        )

        const flowAnalyticsData = await Promise.all(flowAnalyticsPromises)
        setFlowAnalytics(flowAnalyticsData)

      } catch (error) {
        showToast('error', 'Failed to load analytics data')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (params.accountId) {
      fetchData()
    }
  }, [params.accountId, selectedDateRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Analytics Dashboard</h1>
        <select
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {accountSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Contacts</h3>
            <p className="text-3xl font-semibold text-gray-900 mt-2">
              {accountSummary.totalContacts.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">New Contacts</h3>
            <p className="text-3xl font-semibold text-gray-900 mt-2">
              {accountSummary.newContacts.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Messages Sent</h3>
            <p className="text-3xl font-semibold text-gray-900 mt-2">
              {accountSummary.messagesSent.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Automation Rate</h3>
            <p className="text-3xl font-semibold text-gray-900 mt-2">
              {accountSummary.automationRate.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Growth</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={contactGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newContacts"
                  name="New Contacts"
                  stroke="#3B82F6"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flow Performance Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Flow Performance</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalStarts" name="Starts" fill="#3B82F6" />
                <Bar dataKey="completions" name="Completions" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Flow Details */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Flow Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flowAnalytics.map((flow) => (
            <div key={flow.flowId} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-800">{flow.name}</h3>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Starts:</span>
                  <span className="font-medium">{flow.totalStarts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Completions:</span>
                  <span className="font-medium">{flow.completions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Completion Rate:</span>
                  <span className="font-medium">{flow.completionRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Triggers</h4>
                <div className="space-y-1">
                  {flow.triggers.map((trigger, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{trigger.type}:</span>
                      <span>{trigger.starts}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard 