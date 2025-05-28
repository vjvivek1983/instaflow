import React, { useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { NodeData, NodeTypes } from '@/app/types/flow';

interface NodeConfigPanelProps {
  node: Node<NodeData>;
  onClose: () => void;
  onSave: (nodeData: NodeData) => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onClose,
  onSave,
}) => {
  const [nodeData, setNodeData] = useState<NodeData>(node.data);

  useEffect(() => {
    setNodeData(node.data);
  }, [node]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNodeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNodeData((prev) => ({
      ...prev,
      content: { ...prev.content, [name]: value },
    }));
  };

  const handleButtonAdd = () => {
    setNodeData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        buttons: [
          ...(prev.content?.buttons || []),
          { type: 'quick_reply', text: '', payload: '' },
        ],
      },
    }));
  };

  const handleButtonChange = (index: number, field: string, value: string) => {
    setNodeData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        buttons: prev.content?.buttons?.map((button, i) =>
          i === index ? { ...button, [field]: value } : button
        ),
      },
    }));
  };

  const handleButtonRemove = (index: number) => {
    setNodeData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        buttons: prev.content?.buttons?.filter((_, i) => i !== index),
      },
    }));
  };

  const renderNodeConfig = () => {
    switch (nodeData.type) {
      case 'message':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Message Text
              </label>
              <textarea
                name="text"
                value={nodeData.content?.text || ''}
                onChange={handleContentChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Buttons
              </label>
              <div className="space-y-2">
                {nodeData.content?.buttons?.map((button, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={button.text}
                      onChange={(e) =>
                        handleButtonChange(index, 'text', e.target.value)
                      }
                      placeholder="Button text"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={button.payload}
                      onChange={(e) =>
                        handleButtonChange(index, 'payload', e.target.value)
                      }
                      placeholder="Payload"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleButtonRemove(index)}
                      className="px-2 py-1 text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleButtonAdd}
                  className="mt-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Add Button
                </button>
              </div>
            </div>
          </div>
        );

      case 'tag_contact':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tag Name
            </label>
            <input
              type="text"
              name="tagName"
              value={nodeData.tagName || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        );

      case 'wait':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration (seconds)
            </label>
            <input
              type="number"
              name="durationSeconds"
              value={nodeData.durationSeconds || ''}
              onChange={handleInputChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        );

      case 'get_input':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Input Type
              </label>
              <select
                name="inputType"
                value={nodeData.inputType || 'text'}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prompt
              </label>
              <input
                type="text"
                name="prompt"
                value={nodeData.prompt || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Configure Node</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Node Name
          </label>
          <input
            type="text"
            name="name"
            value={nodeData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {renderNodeConfig()}

        <div className="pt-4">
          <button
            onClick={() => onSave(nodeData)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeConfigPanel; 