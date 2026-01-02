import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, X } from 'lucide-react';
import api from '../lib/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useToast } from '../hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface UserNotificationSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSubject: string;
  defaultMessage: string;
  onSuccess?: () => void;
}

const UserNotificationSelector = ({
  open,
  onOpenChange,
  defaultSubject,
  defaultMessage,
  onSuccess
}: UserNotificationSelectorProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState(defaultMessage);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUsers();
      setEmailMessage(defaultMessage);
    }
  }, [open, defaultMessage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messaging/users');
      setUsers(response.data.data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch users',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSend = async () => {
    if (selectedUsers.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one user',
      });
      return;
    }

    try {
      setSending(true);
      const response = await api.post('/messaging/send', {
        subject: defaultSubject,
        message: emailMessage,
        recipientType: 'specific',
        userIds: selectedUsers
      });

      toast({
        title: 'Success',
        description: response.data.message || `Messages sent to ${selectedUsers.length} user(s)`,
      });

      onOpenChange(false);
      setSelectedUsers([]);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error || 'Failed to send messages',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Send Notifications
          </DialogTitle>
          <DialogDescription>
            Select users and customize the notification message
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Message Editor */}
          <div>
            <Label htmlFor="message">Email Message</Label>
            <Textarea
              id="message"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              rows={4}
              className="mt-2"
              placeholder="Enter your message..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              This message will be sent via email and as an in-app notification
            </p>
          </div>

          {/* User Selection */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <Label>Select Recipients ({selectedUsers.length} selected)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <ScrollArea className="h-48 border rounded-lg p-4">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Users className="h-12 w-12 mb-2" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedUsers.includes(user.id)
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => toggleUser(user.id)}
                    >
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {user.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{user.displayName}</div>
                        <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.role}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || selectedUsers.length === 0}>
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserNotificationSelector;
