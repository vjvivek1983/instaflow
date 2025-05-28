import React from 'react'
import { Handle, Position } from 'reactflow'
import { MessageSquare } from 'lucide-react'

interface MessageNodeData {
  label: string
  text: string
  mediaUrl?: string
  buttons: Array<{
    type: 'quick_reply'
    text: string
    payload: string
  }>
}

export function MessageNode({ data }: { data: MessageNodeData }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="font-medium">{data.label}</h3>
      </div>
      
      <div className="mt-2 space-y-2">
        {data.text && (
          <p className="text-sm text-gray-600">{data.text}</p>
        )}
        
        {data.mediaUrl && (
          <div className="mt-2">
            <img
              src={data.mediaUrl}
              alt="Message media"
              className="max-h-20 rounded"
            />
          </div>
        )}
        
        {data.buttons && data.buttons.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.buttons.map((button, index) => (
              <div
                key={index}
                className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                {button.text}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
} 