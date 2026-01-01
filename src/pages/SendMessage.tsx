import { useState, useEffect } from 'react';
import { Send, Users, Calendar, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import  api from '@/lib/api';

interface User {
  id: string;
  displayName: string;
  email: string;
  role: string;
}

interface Event {
  id: string;
  title: string;
  startAt: string;
  _count: {
    registrations: number;
  };
}

export default function SendMessage() {
  const [recipientType, setRecipientType] = useState<'all' | 'users' | 'staff' | 'specific' | 'event'>('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventUsers, setEventUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { toast } = useToast();

  // Load users and events on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, eventsRes] = await Promise.all([
          api.get('/messaging/users'),
          api.get('/messaging/events'),
        ]);
        setUsers(usersRes.data.data);
        setEvents(eventsRes.data.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
      }
    };
    loadData();
  }, []);

  // Load event users when event is selected
  useEffect(() => {
    if (recipientType === 'event' && selectedEvent) {
      const loadEventUsers = async () => {
        setLoadingUsers(true);
        try {
          const res = await api.get(`/messaging/events/${selectedEvent}/users`);
          setEventUsers(res.data.data);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load event users',
            variant: 'destructive',
          });
        } finally {
          setLoadingUsers(false);
        }
      };
      loadEventUsers();
    }
  }, [selectedEvent, recipientType]);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in subject and message',
        variant: 'destructive',
      });
      return;
    }

    if (recipientType === 'specific' && selectedUsers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one user',
        variant: 'destructive',
      });
      return;
    }

    if (recipientType === 'event' && !selectedEvent) {
      toast({
        title: 'Error',
        description: 'Please select an event',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/messaging/send', {
        subject,
        message,
        recipientType,
        ...(recipientType === 'specific' && { userIds: selectedUsers }),
        ...(recipientType === 'event' && { eventId: selectedEvent }),
      });

      toast({
        title: 'Success',
        description: res.data.message,
      });

      // Reset form
      setSubject('');
      setMessage('');
      setSelectedUsers([]);
      setSelectedEvent('');
      setRecipientType('all');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecipientCount = () => {
    if (recipientType === 'all') return users.length;
    if (recipientType === 'users') return users.filter((u) => u.role === 'USER').length;
    if (recipientType === 'staff') return users.filter((u) => u.role === 'STAFF' || u.role === 'ADMIN').length;
    if (recipientType === 'specific') return selectedUsers.length;
    if (recipientType === 'event') return eventUsers.length;
    return 0;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Send Message</h1>

        <Card>
          <CardHeader>
            <CardTitle>Compose Email Message</CardTitle>
            <CardDescription>
              Send emails to all users, specific users, or event attendees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recipient Type Selection */}
            <div className="space-y-3">
              <Label>Select Recipients</Label>
              <RadioGroup value={recipientType} onValueChange={(value: any) => setRecipientType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer">
                    <Users className="w-4 h-4" />
                    Users and Staffs ({users.length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="users" id="users" />
                  <Label htmlFor="users" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Users Only ({users.filter((u) => u.role === 'USER').length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="staff" id="staff" />
                  <Label htmlFor="staff" className="flex items-center gap-2 cursor-pointer">
                    <Users className="w-4 h-4" />
                    Staff Only ({users.filter((u) => u.role === 'STAFF' || u.role === 'ADMIN').length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="specific" />
                  <Label htmlFor="specific" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Specific Users
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="event" id="event" />
                  <Label htmlFor="event" className="flex items-center gap-2 cursor-pointer">
                    <Calendar className="w-4 h-4" />
                    Event Attendees
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Specific Users Selection */}
            {recipientType === 'specific' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Select Users</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllUsers}
                  >
                    {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={user.id}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleUserToggle(user.id)}
                      />
                      <Label
                        htmlFor={user.id}
                        className="flex-1 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Selection */}
            {recipientType === 'event' && (
              <div className="space-y-3">
                <Label>Select Event</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} ({event._count.registrations} attendees)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loadingUsers && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading attendees...
                  </div>
                )}
                {selectedEvent && !loadingUsers && (
                  <div className="text-sm text-gray-600">
                    {eventUsers.length} attendee{eventUsers.length !== 1 ? 's' : ''} will receive this message
                  </div>
                )}
              </div>
            )}

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message here..."
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Recipient Count */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                This message will be sent to <strong>{getRecipientCount()}</strong> recipient
                {getRecipientCount() !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={loading || getRecipientCount() === 0}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
