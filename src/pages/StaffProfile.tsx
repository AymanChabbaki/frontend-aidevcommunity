import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  User, Github, Linkedin, Twitter, Loader2, Camera, 
  Mail, Calendar, Shield, Sparkles, CheckCircle,
  Edit2, Save, X, Award, Briefcase
} from 'lucide-react';
import { userService } from '@/services/user.service';
import { format } from 'date-fns';

const StaffProfile = () => {
  const { user: authUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    staffRole: '',
    bio: '',
    skills: '',
    publicProfile: false,
    linkedin: '',
    github: '',
    twitter: '',
    locale: 'en',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await userService.getMe();
      const userData = response.data;
      setUser(userData);
      setFormData({
        displayName: userData.displayName || '',
        staffRole: userData.staffRole || '',
        bio: userData.bio || '',
        skills: userData.skills?.join(', ') || '',
        publicProfile: userData.publicProfile || false,
        linkedin: userData.linkedin || '',
        github: userData.github || '',
        twitter: userData.twitter || '',
        locale: userData.locale || 'en',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const updateData = {
        displayName: formData.displayName,
        staffRole: formData.staffRole,
        bio: formData.bio,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        publicProfile: formData.publicProfile,
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter,
        locale: formData.locale,
      };

      const response = await userService.updateProfile(updateData);
      setUser(response.data);
      await refreshUser();
      setEditing(false);
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const response = await userService.uploadPhoto(file);
      setUser({ ...user, photoUrl: response.data.photoUrl });
      await refreshUser();
      
      toast.success('Profile photo updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'S';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Staff Badge Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-6 bg-gradient-to-r from-primary via-secondary to-accent text-white">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Staff Profile</h2>
                <p className="text-white/80">Manage your staff information and settings</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 sticky top-6">
              {/* Profile Photo */}
              <div className="relative group mb-4">
                {user?.photoUrl ? (
                  <img
                    src={getImageUrl(user.photoUrl) || ''}
                    alt={user.displayName}
                    className="w-32 h-32 mx-auto rounded-full object-cover ring-4 ring-primary/20"
                  />
                ) : (
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold ring-4 ring-primary/20">
                    {getInitials(user?.displayName)}
                  </div>
                )}
                <label
                  htmlFor="photo-upload"
                  className="absolute inset-0 mx-auto w-32 h-32 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <Camera className="h-8 w-8 text-white" />
                  )}
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </div>

              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold mb-1">{user?.displayName}</h2>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="default" className="bg-gradient-to-r from-primary to-secondary">
                    <Shield className="h-3 w-3 mr-1" />
                    {user?.role}
                  </Badge>
                </div>
                {user?.staffRole && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium">{user.staffRole}</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'Recently'}</span>
                </div>
                {user?.publicProfile && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Public Profile</span>
                  </div>
                )}
              </div>

              {user?.skills && user.skills.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-primary/5">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(user?.linkedin || user?.github || user?.twitter) && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Social Links</h3>
                    <div className="flex gap-2 justify-center">
                      {user?.linkedin && (
                        <a
                          href={user.linkedin.startsWith('http') ? user.linkedin : `https://linkedin.com/in/${user.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {user?.github && (
                        <a
                          href={user.github.startsWith('http') ? user.github : `https://github.com/${user.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-gray-800 hover:bg-gray-900 text-white transition-colors"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {user?.twitter && (
                        <a
                          href={user.twitter.startsWith('http') ? user.twitter : `https://twitter.com/${user.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>

          {/* Right Column - Edit Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </h3>
                <Button
                  onClick={() => setEditing(!editing)}
                  variant={editing ? 'outline' : 'default'}
                >
                  {editing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name *</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staffRole">Staff Role *</Label>
                      <Input
                        id="staffRole"
                        value={formData.staffRole}
                        onChange={(e) => setFormData({ ...formData, staffRole: e.target.value })}
                        placeholder="e.g., Event Coordinator"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="React, Node.js, Python"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Social Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          value={formData.linkedin}
                          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                          placeholder="username or URL"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="github" className="flex items-center gap-2">
                          <Github className="h-4 w-4" />
                          GitHub
                        </Label>
                        <Input
                          id="github"
                          value={formData.github}
                          onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                          placeholder="username or URL"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twitter" className="flex items-center gap-2">
                          <Twitter className="h-4 w-4" />
                          Twitter
                        </Label>
                        <Input
                          id="twitter"
                          value={formData.twitter}
                          onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                          placeholder="username or URL"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="publicProfile">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to other members
                      </p>
                    </div>
                    <Switch
                      id="publicProfile"
                      checked={formData.publicProfile}
                      onCheckedChange={(checked) => setFormData({ ...formData, publicProfile: checked })}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={submitting} className="flex-1">
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <Label className="text-muted-foreground">Bio</Label>
                    <p className="mt-1 text-sm">{user?.bio || 'No bio added yet'}</p>
                  </div>

                  {user?.skills && user.skills.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground">Skills</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-primary/5">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div>
                      <Label className="text-muted-foreground">Public Profile</Label>
                      <p className="mt-1 text-sm font-medium">
                        {user?.publicProfile ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Enabled
                          </span>
                        ) : (
                          <span className="text-gray-500">Disabled</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
