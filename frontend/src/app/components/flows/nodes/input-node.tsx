import React from 'react'
import { Handle, Position } from 'reactflow'
import { TextCursor } from 'lucide-react'

interface InputNodeData {
  label: string
  prompt: string
  inputType: 'text' | 'email' | 'phone'
  saveToAttribute: string
}

export function InputNode({ data }: { data: InputNodeData }) {
  const getInputTypeIcon = () => {
    switch (data.inputType) {
      case 'email':
        return '@'
      case 'phone':
        return '📱'
      default:
        return 'Aa'
    }
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center space-x-2">
        <TextCursor className="h-4 w-4 text-primary" />
        <h3 className="font-medium">{data.label}</h3>
      </div>
      
      <div className="mt-2 space-y-2">
        <p className="text-sm text-gray-600">{data.prompt || 'No prompt'}</p>
        
        <div className="flex items-center space-x-2">
          <div className="rounded bg-gray-100 px-2 py-1 text-xs">
            {getInputTypeIcon()} {data.inputType}
          </div>
          {data.saveToAttribute && (
            <div className="text-xs text-gray-500">
              → {data.saveToAttribute}
            </div>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
} 