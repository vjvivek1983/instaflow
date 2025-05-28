import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/store'
import { apiClient } from '../../api/api-client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { subDays, format } from 'date-fns'
import { Button } from '../ui/button'
import { Download, Users, MessageSquare, Zap } from 'lucide-react'

interface AccountAnalytics {
  totalContacts: number
  newContacts: number
  totalMessagesSent: number
  totalMessagesReceived: number
  flowCompletionRate: number
}

interface FlowAnalytics {
  flowId: string
  starts: number
  completions: number
  completionRate: number
  nodeEngagement: {
    nodeId: string
    engagements: number
  }[]
}

export default function AnalyticsDashboard() {
  const { selectedAccount } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [accountAnalytics, setAccountAnalytics] = useState<AccountAnalytics | null>(null)
  const [flowAnalytics, setFlowAnalytics] = useState<FlowAnalytics[]>([])
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d')

  useEffect(() => {
    if (selectedAccount) {
      loadAnalytics()
    }
  }, [selectedAccount, dateRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const endDate = new Date()
      const startDate = subDays(endDate, dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90)

      // Load account analytics
      const accountResponse = await apiClient.getAccountAnalytics(selectedAccount!.id, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
      setAccountAnalytics(accountResponse.data)

      // Load flow analytics
      const flowsResponse = await apiClient.getFlows(selectedAccount!.id)
      const flowsAnalytics = await Promise.all(
        flowsResponse.data.map((flow: any) =>
          apiClient.getFlowAnalytics(flow.id, {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          })
        )
      )
      setFlowAnalytics(flowsAnalytics.map((res) => res.data))
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    const data = {
      accountAnalytics,
      flowAnalytics,
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `instaflow-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p>Loading analytics...</p>
      </div>
    )
  }

  if (!accountAnalytics) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <p>No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter and Export */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            variant={dateRange === '7d' ? 'default' : 'outline'}
            onClick={() => setDateRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={dateRange === '30d' ? 'default' : 'outline'}
            onClick={() => setDateRange('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={dateRange === '90d' ? 'default' : 'outline'}
            onClick={() => setDateRange('90d')}
          >
            90 Days
          </Button>
        </div>
        <Button variant="outline" onClick={exportData}>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Contacts</p>
              <h3 className="text-2xl font-semibold">{accountAnalytics.totalContacts}</h3>
              <p className="mt-1 text-sm text-gray-500">
                +{accountAnalytics.newContacts} new
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Messages</p>
              <h3 className="text-2xl font-semibold">
                {accountAnalytics.totalMessagesSent + accountAnalytics.totalMessagesReceived}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {accountAnalytics.totalMessagesSent} sent • {accountAnalytics.totalMessagesReceived} received
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Flow Completion Rate</p>
              <h3 className="text-2xl font-semibold">
                {(accountAnalytics.flowCompletionRate * 100).toFixed(1)}%
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Performance Chart */}
      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Flow Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={flowAnalytics}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="flowId" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="starts" fill="#93c5fd" name="Starts" />
              <Bar dataKey="completions" fill="#3b82f6" name="Completions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Node Engagement Chart */}
      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Node Engagement</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={flowAnalytics.flatMap((flow) => flow.nodeEngagement)}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nodeId" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="engagements"
                stroke="#3b82f6"
                name="Engagements"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
} 