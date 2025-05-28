import React, { useCallback, useState } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  Node,
  NodeTypes,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '../ui/button'
import { useAuthStore } from '../../store/store'
import { apiClient } from '../../api/api-client'
import { MessageNode } from './nodes/message-node'
import { ConditionNode } from './nodes/condition-node'
import { WaitNode } from './nodes/wait-node'
import { TagNode } from './nodes/tag-node'
import { InputNode } from './nodes/input-node'
import { NodeConfigPanel } from './node-config-panel'
import { Save, Play, Pause, Plus } from 'lucide-react'

const nodeTypes: NodeTypes = {
  message: MessageNode,
  condition: ConditionNode,
  wait: WaitNode,
  tag: TagNode,
  input: InputNode,
}

interface FlowBuilderProps {
  flowId?: string
}

export default function FlowBuilder({ flowId }: FlowBuilderProps) {
  const { selectedAccount } = useAuthStore()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [loading, setLoading] = useState(false)

  // Load existing flow if flowId is provided
  React.useEffect(() => {
    if (flowId && selectedAccount) {
      loadFlow()
    }
  }, [flowId, selectedAccount])

  const loadFlow = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getFlow(flowId!)
      const flowDefinition = response.data.flowDefinition
      
      // Convert flow definition to nodes and edges
      setNodes(flowDefinition.nodes)
      setEdges(convertConnectionsToEdges(flowDefinition.nodes))
    } catch (error) {
      console.error('Error loading flow:', error)
    } finally {
      setLoading(false)
    }
  }

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `node_${nodes.length + 1}`,
      type,
      position: { x: 100, y: 100 + nodes.length * 100 },
      data: {
        label: `New ${type} Node`,
        // Default data based on node type
        ...(type === 'message' && {
          text: '',
          mediaUrl: null,
          buttons: [],
        }),
        ...(type === 'condition' && {
          condition: { type: 'attribute_equals', attribute: '', value: '' },
        }),
        ...(type === 'wait' && {
          duration: 3600,
        }),
        ...(type === 'tag' && {
          tag: '',
        }),
        ...(type === 'input' && {
          prompt: '',
          inputType: 'text',
          saveToAttribute: '',
        }),
      },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const saveFlow = async () => {
    if (!selectedAccount) return

    try {
      setLoading(true)
      const flowDefinition = {
        nodes,
        edges,
      }

      if (flowId) {
        await apiClient.updateFlow(flowId, {
          flowDefinition,
        })
      } else {
        await apiClient.createFlow(selectedAccount.id, {
          name: 'New Flow',
          description: 'Flow created with visual builder',
          flowDefinition,
        })
      }
    } catch (error) {
      console.error('Error saving flow:', error)
    } finally {
      setLoading(false)
    }
  }

  const convertConnectionsToEdges = (nodes: any[]): Edge[] => {
    const edges: Edge[] = []
    nodes.forEach((node) => {
      if (node.connections) {
        node.connections.forEach((connection: any) => {
          edges.push({
            id: `${node.id}-${connection.targetNodeId}`,
            source: node.id,
            target: connection.targetNodeId,
            label: connection.condition ? JSON.stringify(connection.condition) : undefined,
          })
        })
      }
    })
    return edges
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p>Loading flow builder...</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Flow Canvas */}
      <div className="flex-1 border">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex space-x-2">
            <Button onClick={() => addNode('message')} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Message
            </Button>
            <Button onClick={() => addNode('condition')} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Condition
            </Button>
            <Button onClick={() => addNode('wait')} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Wait
            </Button>
            <Button onClick={() => addNode('tag')} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Tag
            </Button>
            <Button onClick={() => addNode('input')} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Input
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button onClick={saveFlow} variant="outline" size="sm">
              <Save className="mr-1 h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Play className="mr-1 h-4 w-4" />
              Activate
            </Button>
          </div>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* Node Configuration Panel */}
      {selectedNode && (
        <div className="w-80 border-l">
          <NodeConfigPanel
            node={selectedNode}
            onChange={(updatedData) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === selectedNode.id ? { ...n, data: updatedData } : n
                )
              )
            }}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      )}
    </div>
  )
} 