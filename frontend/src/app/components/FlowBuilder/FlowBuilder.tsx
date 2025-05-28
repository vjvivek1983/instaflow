import React, { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
  XYPosition,
} from 'reactflow';
import 'reactflow/dist/style.css';
import FlowNode from './FlowNode';
import NodeConfigPanel from './NodeConfigPanel';
import { NodeData, NodeTypes } from '@/app/types/flow';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes = {
  flowNode: FlowNode,
};

interface FlowBuilderProps {
  initialNodes?: Node<NodeData>[];
  initialEdges?: Edge[];
  onSave: (nodes: Node<NodeData>[], edges: Edge[]) => void;
}

const FlowBuilder: React.FC<FlowBuilderProps> = ({
  initialNodes = [],
  initialEdges = [],
  onSave,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [showNodeConfig, setShowNodeConfig] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node as Node<NodeData>);
    },
    []
  );

  const onConfigureNode = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNode(node as Node<NodeData>);
      setShowNodeConfig(true);
    }
  }, [nodes]);

  const onNodeConfigClose = useCallback(() => {
    setShowNodeConfig(false);
    setSelectedNode(null);
  }, []);

  const onNodeConfigSave = useCallback((nodeData: NodeData) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: nodeData }
          : node
      )
    );

    setShowNodeConfig(false);
    setSelectedNode(null);
  }, [selectedNode, setNodes]);

  const addNewNode = useCallback(
    (type: NodeTypes, position: XYPosition) => {
      const newNode: Node<NodeData> = {
        id: uuidv4(),
        type: 'flowNode',
        position,
        data: {
          id: uuidv4(),
          type,
          name: `New ${type} Node`,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeTypes;
      if (!type) return;

      // Get the position relative to the flow canvas
      const reactFlowBounds = document
        .querySelector('.react-flow')
        ?.getBoundingClientRect();
      
      if (reactFlowBounds) {
        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };

        addNewNode(type, position);
      }
    },
    [addNewNode]
  );

  return (
    <div className="h-full flex">
      <div className="w-64 bg-white border-r p-4">
        <h2 className="text-lg font-semibold mb-4">Node Types</h2>
        <div className="space-y-2">
          {Object.values(NodeTypes).map((type) => (
            <div
              key={type}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/reactflow', type);
                e.dataTransfer.effectAllowed = 'move';
              }}
              className="p-2 bg-gray-100 rounded cursor-move hover:bg-gray-200 transition-colors"
            >
              {type}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {showNodeConfig && selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onClose={onNodeConfigClose}
          onSave={onNodeConfigSave}
        />
      )}

      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => onSave(nodes, edges)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Save Flow
        </button>
      </div>
    </div>
  );
};

export default FlowBuilder; 