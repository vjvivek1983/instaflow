import React from 'react'
import { Handle, Position } from 'reactflow'
import { Tag } from 'lucide-react'

interface TagNodeData {
  label: string
  tag: string
}

export function TagNode({ data }: { data: TagNodeData }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center space-x-2">
        <Tag className="h-4 w-4 text-primary" />
        <h3 className="font-medium">{data.label}</h3>
      </div>
      
      <div className="mt-2">
        {data.tag ? (
          <div className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
            {data.tag}
          </div>
        ) : (
          <p className="text-sm text-gray-600">No tag specified</p>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
} 