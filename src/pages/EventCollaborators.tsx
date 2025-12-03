import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { collaborationService } from '@/services/collaboration.service';
import { 
  UserPlus, 
  Users, 
  Trash2, 
  Settings, 
  Shield, 
  CheckCircle, 
  XCircle,
  Search,
  Calendar,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';

interface Collaborator {
  id: string;
  role: string;
  permissions: {
    canEdit: boolean;
    canApprove: boolean;
    canManageRegistrations: boolean;
  };
  status: string;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    photoUrl?: string;
    staffRole?: string;
  };
  inviter: {
    displayName: string;
  };
}

interface StaffMember {
  id: string;
  displayName: string;
  email: string;
  photoUrl?: string;
  staffRole?: string;
  role: string;
}

interface Props {
  eventId: string;
  eventTitle: string;
  isOrganizer: boolean;
}

const EventCollaborators = ({ eventId, eventTitle, isOrganizer }: Props) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteData, setInviteData] = useState({
    userId: '',
    role: 'COLLABORATOR',
    canEdit: true,
    canApprove: true,
    canManageRegistrations: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCollaborators();
    if (isOrganizer) {
      fetchStaffMembers();
    }
  }, [eventId, isOrganizer]);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const response = await collaborationService.getEventCollaborators(eventId);
      setCollaborators(response.data.data || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      toast.error('Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const response = await collaborationService.getStaffMembers();
      setStaffMembers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching staff members:', error);
    }
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one staff member');
      return;
    }

    try {
      setSubmitting(true);
      const promises = selectedUsers.map(userId => 
        collaborationService.inviteCollaborator(eventId, {
          userId,
          role: inviteData.role,
          permissions: {
            canEdit: inviteData.canEdit,
            canApprove: inviteData.canApprove,
            canManageRegistrations: inviteData.canManageRegistrations
          }
        })
      );
      await Promise.all(promises);
      toast.success(`Invitation${selectedUsers.length > 1 ? 's' : ''} sent successfully`);
      setInviteDialogOpen(false);
      setSelectedUsers([]);
      setInviteData({
        userId: '',
        role: 'COLLABORATOR',
        canEdit: true,
        canApprove: true,
        canManageRegistrations: true
      });
      fetchCollaborators();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) return;

    try {
      await collaborationService.removeCollaborator(collaboratorId);
      toast.success('Collaborator removed successfully');
      fetchCollaborators();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove collaborator');
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedCollaborator) return;

    try {
      setSubmitting(true);
      await collaborationService.updateCollaboratorPermissions(selectedCollaborator.id, {
        role: inviteData.role,
        permissions: {
          canEdit: inviteData.canEdit,
          canApprove: inviteData.canApprove,
          canManageRegistrations: inviteData.canManageRegistrations
        }
      });
      toast.success('Permissions updated successfully');
      setEditDialogOpen(false);
      setSelectedCollaborator(null);
      fetchCollaborators();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update permissions');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator);
    setInviteData({
      userId: collaborator.user.id,
      role: collaborator.role,
      canEdit: collaborator.permissions.canEdit,
      canApprove: collaborator.permissions.canApprove,
      canManageRegistrations: collaborator.permissions.canManageRegistrations
    });
    setEditDialogOpen(true);
  };

  // Filter available staff members (exclude admins and those already invited)
  const availableStaff = staffMembers.filter(staff => 
    staff.role !== 'ADMIN' &&
    !collaborators.some(collab => collab.user.id === staff.id) &&
    staff.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'PENDING':
        return <Badge variant="secondary"><Bell className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'DECLINED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'CO_ORGANIZER' 
      ? <Badge variant="default"><Shield className="h-3 w-3 mr-1" />Co-Organizer</Badge>
      : <Badge variant="outline"><Users className="h-3 w-3 mr-1" />Collaborator</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Collaborators</h2>
          <p className="text-muted-foreground">{eventTitle}</p>
        </div>
        {isOrganizer && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Collaborator
          </Button>
        )}
      </div>

      {/* Collaborators Table */}
      {collaborators.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Collaborators Yet</h3>
          <p className="text-muted-foreground mb-4">
            Invite staff members to help you manage this event
          </p>
          {isOrganizer && (
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Your First Collaborator
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Invited By</TableHead>
                <TableHead>Date</TableHead>
                {isOrganizer && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborators.map((collaborator) => (
                <TableRow key={collaborator.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={collaborator.user.photoUrl} />
                        <AvatarFallback>
                          {collaborator.user.displayName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{collaborator.user.displayName}</p>
                        <p className="text-sm text-muted-foreground">{collaborator.user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(collaborator.role)}</TableCell>
                  <TableCell>{getStatusBadge(collaborator.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {collaborator.permissions.canEdit && <div>✓ Edit Event</div>}
                      {collaborator.permissions.canApprove && <div>✓ Approve Registrations</div>}
                      {collaborator.permissions.canManageRegistrations && <div>✓ Manage Registrations</div>}
                    </div>
                  </TableCell>
                  <TableCell>{collaborator.inviter.displayName}</TableCell>
                  <TableCell>{format(new Date(collaborator.createdAt), 'PPp')}</TableCell>
                  {isOrganizer && (
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(collaborator)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemove(collaborator.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Invite Collaborator</DialogTitle>
            <DialogDescription>
              Invite a staff member to collaborate on this event
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Select Staff Members */}
            <div className="space-y-2">
              <Label>Staff Members (Select multiple)</Label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="border rounded-md max-h-60 overflow-y-auto">
                {availableStaff.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No available staff members
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {availableStaff.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center space-x-3 p-3 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setSelectedUsers(prev => 
                            prev.includes(staff.id) 
                              ? prev.filter(id => id !== staff.id)
                              : [...prev, staff.id]
                          );
                        }}
                      >
                        <Checkbox
                          checked={selectedUsers.includes(staff.id)}
                          onCheckedChange={(checked) => {
                            setSelectedUsers(prev => 
                              checked 
                                ? [...prev, staff.id]
                                : prev.filter(id => id !== staff.id)
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={staff.photoUrl} />
                          <AvatarFallback className="text-xs">
                            {staff.displayName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{staff.displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">{staff.email}</p>
                        </div>
                        {staff.staffRole && (
                          <Badge variant="secondary" className="text-xs hidden sm:inline-flex">{staff.staffRole}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedUsers.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedUsers.length} staff member{selectedUsers.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteData.role} onValueChange={(value) => setInviteData({ ...inviteData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COLLABORATOR">Collaborator</SelectItem>
                  <SelectItem value="CO_ORGANIZER">Co-Organizer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canEdit"
                    checked={inviteData.canEdit}
                    onCheckedChange={(checked) => setInviteData({ ...inviteData, canEdit: !!checked })}
                  />
                  <label htmlFor="canEdit" className="text-sm font-medium leading-none cursor-pointer">
                    Can edit event details
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canApprove"
                    checked={inviteData.canApprove}
                    onCheckedChange={(checked) => setInviteData({ ...inviteData, canApprove: !!checked })}
                  />
                  <label htmlFor="canApprove" className="text-sm font-medium leading-none cursor-pointer">
                    Can approve registrations
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canManageRegistrations"
                    checked={inviteData.canManageRegistrations}
                    onCheckedChange={(checked) => setInviteData({ ...inviteData, canManageRegistrations: !!checked })}
                  />
                  <label htmlFor="canManageRegistrations" className="text-sm font-medium leading-none cursor-pointer">
                    Can manage registrations
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={submitting || selectedUsers.length === 0} className="w-full sm:w-auto">
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Invitation{selectedUsers.length > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              Update collaborator role and permissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Role */}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteData.role} onValueChange={(value) => setInviteData({ ...inviteData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COLLABORATOR">Collaborator</SelectItem>
                  <SelectItem value="CO_ORGANIZER">Co-Organizer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-canEdit"
                    checked={inviteData.canEdit}
                    onCheckedChange={(checked) => setInviteData({ ...inviteData, canEdit: !!checked })}
                  />
                  <label htmlFor="edit-canEdit" className="text-sm font-medium leading-none cursor-pointer">
                    Can edit event details
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-canApprove"
                    checked={inviteData.canApprove}
                    onCheckedChange={(checked) => setInviteData({ ...inviteData, canApprove: !!checked })}
                  />
                  <label htmlFor="edit-canApprove" className="text-sm font-medium leading-none cursor-pointer">
                    Can approve registrations
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-canManageRegistrations"
                    checked={inviteData.canManageRegistrations}
                    onCheckedChange={(checked) => setInviteData({ ...inviteData, canManageRegistrations: !!checked })}
                  />
                  <label htmlFor="edit-canManageRegistrations" className="text-sm font-medium leading-none cursor-pointer">
                    Can manage registrations
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleUpdatePermissions} disabled={submitting} className="w-full sm:w-auto">
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Update Permissions
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventCollaborators;
