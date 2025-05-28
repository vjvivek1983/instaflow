'use client'

import React from 'react'
import FlowBuilder from '../components/flows/flow-builder'
import { Button } from '../components/ui/button'
import { Plus } from 'lucide-react'
import { useFlowStore } from '../store/store'

export default function FlowsPage() {
  const { selectedFlow, setSelectedFlow } = useFlowStore()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Automation Flows</h1>
          <p className="text-sm text-gray-500">
            Create and manage your Instagram automation flows
          </p>
        </div>
        <Button onClick={() => setSelectedFlow(null)}>
          <Plus className="mr-2 h-4 w-4" />
          New Flow
        </Button>
      </div>

      <FlowBuilder flowId={selectedFlow?.id} />
    </div>
  )
} 