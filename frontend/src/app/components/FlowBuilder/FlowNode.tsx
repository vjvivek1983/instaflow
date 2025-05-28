import React from 'react';
import { Handle, Position } from 'reactflow';
import { NodeData, NodeTypes } from '@/app/types/flow';

interface FlowNodeProps {
  data: NodeData;
  selected: boolean;
  onConfigureNode: (nodeId: string) => void;
}

const FlowNode: React.FC<FlowNodeProps> = ({ data, selected, onConfigureNode }) => {
  const getNodeStyle = () => {
    const baseStyle = 'p-4 rounded-lg shadow-md border-2 w-64';
    const selectedStyle = selected ? 'border-blue-500' : 'border-gray-200';
    const typeStyle = getTypeStyle(data.type);
    return `${baseStyle} ${selectedStyle} ${typeStyle}`;
  };

  const getTypeStyle = (type: NodeTypes) => {
    switch (type) {
      case 'start':
        return 'bg-green-50';
      case 'message':
        return 'bg-blue-50';
      case 'tag_contact':
        return 'bg-purple-50';
      case 'human_takeover':
        return 'bg-red-50';
      case 'wait':
        return 'bg-yellow-50';
      case 'get_input':
        return 'bg-indigo-50';
      case 'condition':
        return 'bg-orange-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getNodeIcon = (type: NodeTypes) => {
    switch (type) {
      case 'start':
        return '🚀';
      case 'message':
        return '💬';
      case 'tag_contact':
        return '🏷️';
      case 'human_takeover':
        return '👤';
      case 'wait':
        return '⏳';
      case 'get_input':
        return '📝';
      case 'condition':
        return '🔀';
      default:
        return '📦';
    }
  };

  const getNodeContent = () => {
    switch (data.type) {
      case 'message':
        return (
          <div className="text-sm text-gray-600 mt-2">
            {data.content?.text ? (
              <p className="truncate">{data.content.text}</p>
            ) : (
              <p className="italic">No message content</p>
            )}
            {data.content?.buttons && data.content.buttons.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {data.content.buttons.length} button(s)
                </p>
              </div>
            )}
          </div>
        );
      case 'tag_contact':
        return (
          <div className="text-sm text-gray-600 mt-2">
            {data.tagName ? (
              <p>Tag: {data.tagName}</p>
            ) : (
              <p className="italic">No tag specified</p>
            )}
          </div>
        );
      case 'wait':
        return (
          <div className="text-sm text-gray-600 mt-2">
            {data.durationSeconds ? (
              <p>Wait: {data.durationSeconds}s</p>
            ) : (
              <p className="italic">No duration specified</p>
            )}
          </div>
        );
      case 'get_input':
        return (
          <div className="text-sm text-gray-600 mt-2">
            <p>Type: {data.inputType || 'text'}</p>
            {data.prompt && <p className="truncate">{data.prompt}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={getNodeStyle()}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400"
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getNodeIcon(data.type)}</span>
          <h3 className="font-medium text-gray-800">{data.name}</h3>
        </div>
        <button
          onClick={() => onConfigureNode(data.id)}
          className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
        >
          ⚙️
        </button>
      </div>

      {getNodeContent()}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400"
      />
    </div>
  );
};

export default FlowNode; 