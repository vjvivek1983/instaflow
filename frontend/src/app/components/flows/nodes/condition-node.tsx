import React from 'react'
import { Handle, Position } from 'reactflow'
import { GitBranch } from 'lucide-react'

interface ConditionNodeData {
  label: string
  condition: {
    type: 'attribute_equals' | 'keyword' | 'button_payload' | 'input_valid'
    attribute?: string
    value: string
  }
}

export function ConditionNode({ data }: { data: ConditionNodeData }) {
  const getConditionText = () => {
    switch (data.condition.type) {
      case 'attribute_equals':
        return `${data.condition.attribute} = ${data.condition.value}`
      case 'keyword':
        return `Contains "${data.condition.value}"`
      case 'button_payload':
        return `Button: ${data.condition.value}`
      case 'input_valid':
        return `Input is ${data.condition.value ? 'valid' : 'invalid'}`
      default:
        return 'No condition'
    }
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center space-x-2">
        <GitBranch className="h-4 w-4 text-primary" />
        <h3 className="font-medium">{data.label}</h3>
      </div>
      
      <div className="mt-2">
        <p className="text-sm text-gray-600">{getConditionText()}</p>
      </div>
      
      <Handle type="source" position={Position.Bottom} id="true" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: '75%' }}
      />
    </div>
  )
} 