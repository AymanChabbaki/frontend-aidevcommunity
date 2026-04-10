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
import { Search, Shield, User as UserIcon, Edit, Trash2, Mail, Calendar, Eye, Github, Linkedin, Twitter, BookOpen, GraduationCap, Globe, User, Sparkles } from 'lucide-react';
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
  const [formData, setFormData] = useState<any>({
    displayName: '',
    email: '',
    role: '',
    staffRole: '',
    bio: '',
    studyLevel: '',
    studyProgram: '',
    publicProfile: true,
    github: '',
    linkedin: '',
    twitter: '',
    locale: 'en'
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; user: any | null }>({
    open: false,
    user: null,
  });
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
    setFormData({
      displayName: user.displayName || '',
      email: user.email || '',
      role: user.role || 'USER',
      staffRole: user.staffRole || '',
      bio: user.bio || '',
      studyLevel: user.studyLevel || '',
      studyProgram: user.studyProgram || '',
      publicProfile: user.publicProfile ?? true,
      github: user.github || '',
      linkedin: user.linkedin || '',
      twitter: user.twitter || '',
      locale: user.locale || 'en'
    });
    setEditDialog({ open: true, user });
  };

  const handleUpdateUser = async () => {
    if (!editDialog.user) return;

    setSubmitting(true);
    try {
      await adminService.updateUser(editDialog.user.id, formData);
      toast({
        title: 'Success',
        description: 'User information updated successfully',
      });
      setEditDialog({ open: false, user: null });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update user',
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
                          onClick={() => {
                            setViewDialog({ open: true, user });
                          }}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
            <DialogDescription>
              Update all information for {editDialog.user?.displayName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Display Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Permissions */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Roles & Permissions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">System Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="STAFF">Staff Member</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role === 'STAFF' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-staffRole">Staff Position</Label>
                    <Input
                      id="edit-staffRole"
                      placeholder="e.g., Content Manager"
                      value={formData.staffRole}
                      onChange={(e) => setFormData({ ...formData, staffRole: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Academic Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Academic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-studyLevel">Study Level</Label>
                  <Select 
                    value={formData.studyLevel} 
                    onValueChange={(value) => setFormData({ ...formData, studyLevel: value })}
                  >
                    <SelectTrigger id="edit-studyLevel">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BACHELOR">Bachelor</SelectItem>
                      <SelectItem value="MASTER">Master</SelectItem>
                      <SelectItem value="DOCTORATE">Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-studyProgram">Study Program / Year</Label>
                  <Select 
                    value={formData.studyProgram} 
                    onValueChange={(value) => setFormData({ ...formData, studyProgram: value })}
                  >
                    <SelectTrigger id="edit-studyProgram">
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BACHELOR_S1">Bachelor S1</SelectItem>
                      <SelectItem value="BACHELOR_S2">Bachelor S2</SelectItem>
                      <SelectItem value="BACHELOR_S3">Bachelor S3</SelectItem>
                      <SelectItem value="BACHELOR_S4">Bachelor S4</SelectItem>
                      <SelectItem value="BACHELOR_S5">Bachelor S5</SelectItem>
                      <SelectItem value="BACHELOR_S6">Bachelor S6</SelectItem>
                      <SelectItem value="MASTER_M1">Master M1</SelectItem>
                      <SelectItem value="MASTER_M2">Master M2</SelectItem>
                      <SelectItem value="DOCTORATE_Y1">Doctorate Y1</SelectItem>
                      <SelectItem value="DOCTORATE_Y2">Doctorate Y2</SelectItem>
                      <SelectItem value="DOCTORATE_Y3">Doctorate Y3</SelectItem>
                      <SelectItem value="DOCTORATE_Y4">Doctorate Y4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 4: Profile & Biography */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Profile Details</h4>
              <div className="space-y-2">
                <Label htmlFor="edit-bio">Biography</Label>
                <textarea
                  id="edit-bio"
                  className="w-full min-h-[100px] p-3 rounded-md bg-secondary/30 border focus:border-primary outline-none text-sm"
                  placeholder="User biography..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Public Profile Visibility</Label>
                  <p className="text-xs text-muted-foreground">Allow user to be found in search</p>
                </div>
                <Button 
                  type="button"
                  variant={formData.publicProfile ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, publicProfile: !formData.publicProfile })}
                >
                  {formData.publicProfile ? "Visible" : "Hidden"}
                </Button>
              </div>
            </div>

            {/* Section 5: Social Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Social Media Links</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-github">GitHub</Label>
                  <Input
                    id="edit-github"
                    placeholder="username"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-linkedin">LinkedIn</Label>
                  <Input
                    id="edit-linkedin"
                    placeholder="username"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-twitter">Twitter</Label>
                  <Input
                    id="edit-twitter"
                    placeholder="username"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, user: null })} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={submitting} className="bg-gradient-to-r from-primary to-secondary">
              {submitting ? 'Saving Changes...' : 'Save All Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open, user: null })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">User Profile</DialogTitle>
            <DialogDescription>
              Complete information and details
            </DialogDescription>
          </DialogHeader>
          {viewDialog.user && (
            <div className="space-y-6 py-4">
              {/* Profile Header */}
              <div className="flex items-start gap-6 p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-xl border">
                <div className="relative flex-shrink-0">
                  {viewDialog.user.photoUrl && getImageUrl(viewDialog.user.photoUrl) ? (
                    <img
                      src={getImageUrl(viewDialog.user.photoUrl) || ''}
                      alt={viewDialog.user.displayName}
                      className="h-24 w-24 rounded-xl object-cover ring-4 ring-primary/20 shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div
                    className={`h-24 w-24 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg ${
                      viewDialog.user.photoUrl && getImageUrl(viewDialog.user.photoUrl) ? 'hidden' : ''
                    }`}
                  >
                    <span className="font-bold text-white text-3xl">
                      {getInitials(viewDialog.user.displayName)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold mb-2">{viewDialog.user.displayName}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground truncate">{viewDialog.user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${getRoleBadgeColor(viewDialog.user.role)} text-sm px-3 py-1`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {viewDialog.user.role}
                    </Badge>
                    {viewDialog.user.staffRole && (
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {viewDialog.user.staffRole}
                      </Badge>
                    )}
                    {viewDialog.user.publicProfile && (
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        <Globe className="h-3 w-3 mr-1" />
                        Public Profile
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-5 w-5 text-primary" />
                    <h4 className="text-lg font-semibold">Personal Information</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-start p-3 bg-secondary/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Full Name</span>
                      <span className="text-sm font-medium text-right">{viewDialog.user.displayName}</span>
                    </div>
                    <div className="flex justify-between items-start p-3 bg-secondary/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Email Address</span>
                      <span className="text-sm font-medium text-right break-all">{viewDialog.user.email}</span>
                    </div>
                    <div className="flex justify-between items-start p-3 bg-secondary/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">User ID</span>
                      <span className="text-xs font-mono text-right break-all">{viewDialog.user.id}</span>
                    </div>
                    <div className="flex justify-between items-start p-3 bg-secondary/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Language</span>
                      <span className="text-sm font-medium uppercase">{viewDialog.user.locale || 'EN'}</span>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h4 className="text-lg font-semibold">Account Status</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-start p-3 bg-secondary/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Join Date</span>
                      <span className="text-sm font-medium">
                        {format(new Date(viewDialog.user.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="flex justify-between items-start p-3 bg-secondary/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <span className="text-sm font-medium">
                        {viewDialog.user.updatedAt ? format(new Date(viewDialog.user.updatedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Email Verified</span>
                      <span className={`text-sm font-semibold ${viewDialog.user.emailVerified ? 'text-green-500' : 'text-orange-500'}`}>
                        {viewDialog.user.emailVerified ? '✓ Verified' : '○ Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Public Profile</span>
                      <span className={`text-sm font-semibold ${viewDialog.user.publicProfile ? 'text-green-500' : 'text-gray-500'}`}>
                        {viewDialog.user.publicProfile ? '✓ Enabled' : '✗ Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {viewDialog.user.bio && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h4 className="text-lg font-semibold">Biography</h4>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg border-l-4 border-primary">
                    <p className="text-sm leading-relaxed">{viewDialog.user.bio}</p>
                  </div>
                </div>
              )}

              {/* Skills */}
              {viewDialog.user.skills && viewDialog.user.skills.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h4 className="text-lg font-semibold">Skills & Expertise</h4>
                  </div>
                  <div className="flex flex-wrap gap-2 p-4 bg-secondary/50 rounded-lg">
                    {viewDialog.user.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Academic Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h4 className="text-lg font-semibold">Academic Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-xs text-muted-foreground mb-2">Study Level</p>
                    <p className="text-base font-semibold">
                      {viewDialog.user.studyLevel ? viewDialog.user.studyLevel.replace('_', ' ') : 'Not set'}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg border-l-4 border-purple-500">
                    <p className="text-xs text-muted-foreground mb-2">Study Program / Year</p>
                    <p className="text-base font-semibold">
                      {viewDialog.user.studyProgram ? viewDialog.user.studyProgram.replace(/_/g, ' ') : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {(viewDialog.user.github || viewDialog.user.linkedin || viewDialog.user.twitter) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <h4 className="text-lg font-semibold">Social Media</h4>
                  </div>
                  <div className="flex flex-wrap gap-3 p-4 bg-secondary/50 rounded-lg">
                    {viewDialog.user.github && (
                      <a
                        href={viewDialog.user.github.startsWith('http') ? viewDialog.user.github : `https://${viewDialog.user.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-background border rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        <Github className="h-4 w-4" />
                        <span className="text-sm font-medium">GitHub</span>
                      </a>
                    )}
                    {viewDialog.user.linkedin && (
                      <a
                        href={viewDialog.user.linkedin.startsWith('http') ? viewDialog.user.linkedin : `https://${viewDialog.user.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-background border rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span className="text-sm font-medium">LinkedIn</span>
                      </a>
                    )}
                    {viewDialog.user.twitter && (
                      <a
                        href={viewDialog.user.twitter.startsWith('http') ? viewDialog.user.twitter : `https://${viewDialog.user.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-background border rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        <Twitter className="h-4 w-4" />
                        <span className="text-sm font-medium">Twitter</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
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