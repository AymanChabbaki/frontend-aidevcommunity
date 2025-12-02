import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { adminService } from '@/services/admin.service';
import { Search, Shield, User as UserIcon, Edit, Trash2, Mail, Calendar, Eye, Github, Linkedin, Twitter, BookOpen, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: any | null }>({
    open: false,
    user: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; user: any | null }>({
    open: false,
    user: null,
  });
  const [editRole, setEditRole] = useState('');
  const [editStaffRole, setEditStaffRole] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter !== 'all') {
        params.role = roleFilter.toUpperCase();
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await adminService.getAllUsers(params);
      setUsers(response.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = () => {
    fetchUsers();
  };

  const handleEditUser = (user: any) => {
    setEditRole(user.role);
    setEditStaffRole(user.staffRole || '');
    setEditDialog({ open: true, user });
  };
  const handleUpdateRole = async () => {
    if (!editDialog.user) return;

    setSubmitting(true);
    try {
      await adminService.updateUserRole(editDialog.user.id, editRole, editStaffRole || undefined);
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
      setEditDialog({ open: false, user: null });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.userId) return;

    try {
      await adminService.deleteUser(deleteDialog.userId);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialog({ open: false, userId: null });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500';
      case 'STAFF':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getImageUrl = (photoUrl: string | null | undefined) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    const API_URL = import.meta.env.VITE_API_URL || 'https://backend-aidevcommunity.vercel.app/api';
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${photoUrl}`;
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <UserIcon className="h-4 w-4 mr-2" />
          {users.length} Total Users
        </Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Loading users...</p>
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <UserIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">No users found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.photoUrl && getImageUrl(user.photoUrl) ? (
                          <img
                            src={getImageUrl(user.photoUrl) || ''}
                            alt={user.displayName}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center ${
                            user.photoUrl && getImageUrl(user.photoUrl) ? 'hidden' : ''
                          }`}
                        >
                          <span className="font-semibold text-white text-sm">
                            {getInitials(user.displayName)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role === 'ADMIN' && <Shield className="h-3 w-3 mr-1" />}
                          {user.role}
                        </Badge>
                        {user.role === 'STAFF' && user.staffRole && (
                          <span className="text-xs text-muted-foreground">{user.staffRole}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewDialog({ open: true, user })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, userId: user.id })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {editDialog.user?.displayName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Email</Label>
              <div className="flex items-center gap-2 p-2 bg-secondary rounded">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{editDialog.user?.email}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {editRole === 'ADMIN' && 'Admins have full access to all features'}
                {editRole === 'STAFF' && 'Staff can manage events, polls, and forms'}
                {editRole === 'USER' && 'Users can participate in events and polls'}
              </p>
            </div>
            {editRole === 'STAFF' && (
              <div className="space-y-2">
                <Label htmlFor="staffRole">Staff Position</Label>
                <Input
                  id="staffRole"
                  placeholder="e.g., Event Coordinator, Content Manager, Technical Lead"
                  value={editStaffRole}
                  onChange={(e) => setEditStaffRole(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Specify the staff member's role or position (e.g., Event Coordinator, Content Manager)
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, user: null })} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open, user: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information for {viewDialog.user?.displayName}
            </DialogDescription>
          </DialogHeader>
          {viewDialog.user && (
            <div className="space-y-6 py-4">
              {/* Profile Section */}
              <div className="flex items-start gap-4">
                {viewDialog.user.photoUrl ? (
                  <img
                    src={viewDialog.user.photoUrl}
                    alt={viewDialog.user.displayName}
                    className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="font-bold text-white text-2xl">
                      {viewDialog.user.displayName?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{viewDialog.user.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{viewDialog.user.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getRoleBadgeColor(viewDialog.user.role)}>
                      {viewDialog.user.role}
                    </Badge>
                    {viewDialog.user.staffRole && (
                      <Badge variant="outline">{viewDialog.user.staffRole}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {viewDialog.user.bio && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Bio</Label>
                  <p className="text-sm text-muted-foreground p-3 bg-secondary rounded-lg">
                    {viewDialog.user.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {viewDialog.user.skills && viewDialog.user.skills.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {viewDialog.user.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Academic Info */}
              {(viewDialog.user.studyLevel || viewDialog.user.studyProgram) && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Academic Information</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {viewDialog.user.studyLevel && (
                      <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Study Level</p>
                          <p className="text-sm font-medium">{viewDialog.user.studyLevel}</p>
                        </div>
                      </div>
                    )}
                    {viewDialog.user.studyProgram && (
                      <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Study Program</p>
                          <p className="text-sm font-medium">{viewDialog.user.studyProgram}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(viewDialog.user.github || viewDialog.user.linkedin || viewDialog.user.twitter) && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Social Links</Label>
                  <div className="flex gap-3">
                    {viewDialog.user.github && (
                      <a
                        href={viewDialog.user.github.startsWith('http') ? viewDialog.user.github : `https://${viewDialog.user.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-secondary rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        <Github className="h-4 w-4" />
                        <span className="text-sm">GitHub</span>
                      </a>
                    )}
                    {viewDialog.user.linkedin && (
                      <a
                        href={viewDialog.user.linkedin.startsWith('http') ? viewDialog.user.linkedin : `https://${viewDialog.user.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-secondary rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                    {viewDialog.user.twitter && (
                      <a
                        href={viewDialog.user.twitter.startsWith('http') ? viewDialog.user.twitter : `https://${viewDialog.user.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-secondary rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        <Twitter className="h-4 w-4" />
                        <span className="text-sm">Twitter</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Account Details */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Account Details</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="text-sm font-mono">{viewDialog.user.id}</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-sm">{format(new Date(viewDialog.user.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-xs text-muted-foreground">Public Profile</p>
                    <p className="text-sm">{viewDialog.user.publicProfile ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-xs text-muted-foreground">Email Verified</p>
                    <p className="text-sm">{viewDialog.user.emailVerified ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog({ open: false, user: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, userId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;