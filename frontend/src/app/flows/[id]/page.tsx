'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Node, Edge } from 'reactflow';
import FlowBuilder from '@/app/components/FlowBuilder/FlowBuilder';
import { Flow, NodeData, NodeTypes } from '@/app/types/flow';
import { useToast } from '@/app/hooks/useToast';

interface FlowNode {
  id: string;
  type: NodeTypes;
  name: string;
  connections: {
    targetNodeId: string;
    condition?: {
      type: 'button_payload' | 'input_valid' | 'attribute_equals';
      value: any;
    };
  }[];
}

const FlowPage = () => {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlow = async () => {
      try {
        const response = await fetch(`/api/v1/flows/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch flow');
        const data = await response.json();
        setFlow(data);
      } catch (error) {
        showToast('error', 'Failed to load flow');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchFlow();
    }
  }, [params.id]);

  const handleSave = async (nodes: Node<NodeData>[], edges: Edge[]) => {
    if (!flow) return;

    try {
      // Convert nodes and edges to flow definition format
      const flowDefinition = {
        startNodeId: nodes.find((node) => node.data.type === 'start')?.id || '',
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.data.type,
          name: node.data.name,
          connections: edges
            .filter((edge) => edge.source === node.id)
            .map((edge) => ({
              targetNodeId: edge.target,
              condition: edge.data?.condition,
            })),
        })),
      };

      const response = await fetch(`/api/v1/flows/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...flow,
          flowDefinition,
        }),
      });

      if (!response.ok) throw new Error('Failed to save flow');

      showToast('success', 'Flow saved successfully');
    } catch (error) {
      showToast('error', 'Failed to save flow');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Flow not found
        </h1>
        <button
          onClick={() => router.push('/flows')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Back to Flows
        </button>
      </div>
    );
  }

  // Convert flow definition to nodes and edges
  const initialNodes: Node<NodeData>[] = flow.flowDefinition.nodes.map((node: FlowNode) => ({
    id: node.id,
    type: 'flowNode',
    position: { x: 0, y: 0 }, // Positions will be handled by the layout engine
    data: {
      id: node.id,
      type: node.type,
      name: node.name,
    },
  }));

  const initialEdges: Edge[] = flow.flowDefinition.nodes.flatMap((node: FlowNode) =>
    node.connections.map((connection) => ({
      id: `${node.id}-${connection.targetNodeId}`,
      source: node.id,
      target: connection.targetNodeId,
      data: {
        condition: connection.condition,
      },
    }))
  );

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{flow.name}</h1>
            {flow.description && (
              <p className="text-gray-500 mt-1">{flow.description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <select
              value={flow.status}
              onChange={async (e) => {
                try {
                  const response = await fetch(`/api/v1/flows/${params.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      ...flow,
                      status: e.target.value,
                    }),
                  });

                  if (!response.ok) throw new Error('Failed to update status');

                  setFlow({
                    ...flow,
                    status: e.target.value as Flow['status'],
                  });
                  showToast('success', 'Status updated successfully');
                } catch (error) {
                  showToast('error', 'Failed to update status');
                  console.error(error);
                }
              }}
              className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={() => router.push('/flows')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <FlowBuilder
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default FlowPage; 