import React from 'react'
import { Node } from 'reactflow'
import { X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select } from '../ui/select'

interface NodeConfigPanelProps {
  node: Node
  onChange: (data: any) => void
  onClose: () => void
}

export function NodeConfigPanel({ node, onChange, onClose }: NodeConfigPanelProps) {
  const renderConfig = () => {
    switch (node.type) {
      case 'message':
        return (
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                value={node.data.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange({ ...node.data, label: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Message Text</Label>
              <Textarea
                value={node.data.text}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  onChange({ ...node.data, text: e.target.value })
                }
                rows={4}
              />
            </div>
            <div>
              <Label>Media URL (optional)</Label>
              <Input
                value={node.data.mediaUrl || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange({ ...node.data, mediaUrl: e.target.value })
                }
                placeholder="https://"
              />
            </div>
            {/* Quick Reply Buttons */}
            <div>
              <Label>Quick Reply Buttons</Label>
              {node.data.buttons?.map((button: any, index: number) => (
                <div key={index} className="mt-2 flex items-center space-x-2">
                  <Input
                    value={button.text}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const newButtons = [...node.data.buttons]
                      newButtons[index] = {
                        ...button,
                        text: e.target.value,
                      }
                      onChange({ ...node.data, buttons: newButtons })
                    }}
                    placeholder="Button text"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newButtons = node.data.buttons.filter(
                        (_: any, i: number) => i !== index
                      )
                      onChange({ ...node.data, buttons: newButtons })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  const newButtons = [
                    ...(node.data.buttons || []),
                    { type: 'quick_reply', text: '', payload: '' },
                  ]
                  onChange({ ...node.data, buttons: newButtons })
                }}
              >
                Add Button
              </Button>
            </div>
          </div>
        )

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                value={node.data.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange({ ...node.data, label: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Condition Type</Label>
              <select
                value={node.data.condition.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  onChange({
                    ...node.data,
                    condition: {
                      ...node.data.condition,
                      type: e.target.value,
                    },
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="attribute_equals">Attribute Equals</option>
                <option value="keyword">Keyword</option>
                <option value="button_payload">Button Payload</option>
                <option value="input_valid">Input Valid</option>
              </select>
            </div>
            {node.data.condition.type === 'attribute_equals' && (
              <div>
                <Label>Attribute</Label>
                <Input
                  value={node.data.condition.attribute || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onChange({
                      ...node.data,
                      condition: {
                        ...node.data.condition,
                        attribute: e.target.value,
                      },
                    })
                  }
                />
              </div>
            )}
            <div>
              <Label>Value</Label>
              <Input
                value={node.data.condition.value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange({
                    ...node.data,
                    condition: {
                      ...node.data.condition,
                      value: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        )

      case 'wait':
        return (
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                value={node.data.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange({ ...node.data, label: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Duration (seconds)</Label>
              <Input
                type="number"
                value={node.data.duration}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange({
                    ...node.data,
                    duration: parseInt(e.target.value, 10),
                  })
                }
                min={1}
              />
            </div>
          </div>
        )

      case 'tag':
        return (
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                value={node.data.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange({ ...node.data, label: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Tag</Label>
              <Input
                value={node.data.tag}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange({ ...node.data, tag: e.target.value })
                }
              />
            </div>
          </div>
        )

      case 'input':
        return (
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                value={node.data.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange({ ...node.data, label: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Prompt</Label>
              <Textarea
                value={node.data.prompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  onChange({ ...node.data, prompt: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <Label>Input Type</Label>
              <select
                value={node.data.inputType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  onChange({ ...node.data, inputType: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>
            <div>
              <Label>Save To Attribute</Label>
              <Input
                value={node.data.saveToAttribute}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange({
                    ...node.data,
                    saveToAttribute: e.target.value,
                  })
                }
                placeholder="e.g., email, phone, custom_field"
              />
            </div>
          </div>
        )

      default:
        return <p>No configuration available for this node type.</p>
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="font-medium">Configure Node</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4">{renderConfig()}</div>
    </div>
  )
} 