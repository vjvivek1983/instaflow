import React, { useState } from 'react'
import { useAuthStore } from '../../store/store'
import { apiClient } from '../../api/api-client'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Image } from 'lucide-react'

interface BroadcastFormProps {
  instagramAccountId: string
  onSuccess?: () => void
}

export default function BroadcastForm({
  instagramAccountId,
  onSuccess,
}: BroadcastFormProps) {
  const { selectedAccount } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    message: '',
    mediaUrl: '',
    tag: '',
    scheduledAt: null as Date | null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAccount) return

    try {
      setLoading(true)
      await apiClient.createBroadcast(instagramAccountId, {
        message: formData.message,
        mediaUrl: formData.mediaUrl || undefined,
        tag: formData.tag || undefined,
        scheduledAt: formData.scheduledAt?.toISOString(),
      })
      setFormData({
        message: '',
        mediaUrl: '',
        tag: '',
        scheduledAt: null,
      })
      onSuccess?.()
    } catch (error) {
      console.error('Error creating broadcast:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Message</Label>
        <Textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Enter your broadcast message..."
          rows={4}
          required
        />
      </div>

      <div>
        <Label>Media URL (optional)</Label>
        <div className="flex space-x-2">
          <Input
            value={formData.mediaUrl}
            onChange={(e) =>
              setFormData({ ...formData, mediaUrl: e.target.value })
            }
            placeholder="https://"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              // TODO: Implement media upload
            }}
          >
            <Image className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label>Target Tag (optional)</Label>
        <Select
          value={formData.tag}
          onValueChange={(value) => setFormData({ ...formData, tag: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Contacts</SelectItem>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            {/* TODO: Fetch tags dynamically */}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Schedule (optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${
                !formData.scheduledAt && 'text-muted-foreground'
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.scheduledAt ? (
                format(formData.scheduledAt, 'PPP')
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.scheduledAt}
              onSelect={(date) =>
                setFormData({ ...formData, scheduledAt: date })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" disabled={loading || !formData.message}>
        {loading ? 'Sending...' : 'Send Broadcast'}
      </Button>
    </form>
  )
} 