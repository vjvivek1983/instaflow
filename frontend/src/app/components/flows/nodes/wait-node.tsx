import React from 'react'
import { Handle, Position } from 'reactflow'
import { Clock } from 'lucide-react'

interface WaitNodeData {
  label: string
  duration: number // in seconds
}

export function WaitNode({ data }: { data: WaitNodeData }) {
  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} seconds`
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} minutes`
    } else if (seconds < 86400) {
      return `${Math.floor(seconds / 3600)} hours`
    } else {
      return `${Math.floor(seconds / 86400)} days`
    }
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-primary" />
        <h3 className="font-medium">{data.label}</h3>
      </div>
      
      <div className="mt-2">
        <p className="text-sm text-gray-600">
          Wait for {formatDuration(data.duration)}
        </p>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
} 