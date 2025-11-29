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
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { 
  User, Github, Linkedin, Twitter, Loader2, Camera, 
  Mail, Calendar, Shield, Globe, Sparkles, CheckCircle,
  Edit2, Save, X
} from 'lucide-react';
import { userService } from '@/services/user.service';
import { format } from 'date-fns';

const Profile = () => {
  const { user: authUser, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    displayName: '',
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const response = await userService.uploadPhoto(file);
      // Update only the photoUrl in the user state
      setUser({ ...user, photoUrl: response.data.photoUrl });
      await refreshUser();
      
      toast.success('Profile photo updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const profileUrl = `${window.location.origin}/profile/${user?.id}`;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'STAFF':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const getImageUrl = (photoUrl: string | null | undefined) => {
    if (!photoUrl) return null;
    // If it's already a full URL, return it
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    // Otherwise, prepend the backend URL
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
    <div className="min-h-screen">
      {/* Hero Header with Gradient */}
      <div className="relative h-64 gradient-hero overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
        >
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl -mt-32 relative z-10">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 shadow-2xl border-2 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Photo */}
              <div className="relative group">
                {user?.photoUrl ? (
                  <img
                    src={getImageUrl(user.photoUrl) || ''}
                    alt={user.displayName}
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold ring-4 ring-primary/20">
                    {getInitials(user?.displayName)}
                  </div>
                )}
                <label
                  htmlFor="photo-upload"
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
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

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{user?.displayName}</h1>
                  <Badge variant={getRoleBadgeVariant(user?.role) as any} className="text-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    {user?.role}
                  </Badge>
                </div>
                
                <div className="flex flex-col gap-2 text-muted-foreground mb-4">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'Recently'}</span>
                  </div>
                </div>

                {user?.bio && (
                  <p className="text-muted-foreground mb-4">{user.bio}</p>
                )}

                {user?.skills && user.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {user.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-primary/5">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit Toggle */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setEditing(!editing)}
                  variant={editing ? 'outline' : 'default'}
                  className="w-full"
                >
                  {editing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
                
                {/* Digital Badge */}
                <div className="relative w-full max-w-sm">
                  <Card className="overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary shadow-xl">
                    {/* Header with Logo */}
                    <div className="bg-white/10 backdrop-blur-sm p-4 border-b border-white/20">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-lg">
                          <img 
                            src="/logo.png" 
                            alt="AI Dev Community" 
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%2314b8a6" width="100" height="100"/><text x="50" y="50" font-size="60" text-anchor="middle" dy=".3em" fill="white">AI</text></svg>';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-sm">AI Dev Community</h3>
                          <p className="text-white/70 text-xs">Member Badge</p>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="p-6 flex flex-col items-center">
                      <div className="bg-white p-3 rounded-xl shadow-lg mb-3">
                        <QRCodeSVG 
                          value={profileUrl} 
                          size={120}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <div className="text-center mb-4">
                        <p className="text-white font-semibold text-sm mb-1">{user?.displayName}</p>
                        <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          {user?.role}
                        </Badge>
                      </div>
                    </div>

                    {/* Contact Info Footer */}
                    <div className="bg-white/10 backdrop-blur-sm p-3 border-t border-white/20 space-y-1.5">
                      <div className="flex items-center gap-2 text-white/90 text-xs">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">contactaidevcommunity@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90 text-xs">
                        <Globe className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">aidevcommunity.com</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90 text-xs">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently'}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </Card>

          {/* Edit Form - Only show when editing */}
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-8 shadow-card mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Edit2 className="h-6 w-6 text-primary" />
                  Edit Profile Information
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="displayName">Display Name *</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="Your name"
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="locale">Language</Label>
                      <select
                        id="locale"
                        value={formData.locale}
                        onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                        className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="skills">Skills</Label>
                    <Input
                      id="skills"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="AI, Python, React, Machine Learning"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Separate skills with commas
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base flex items-center gap-2 mb-4">
                      <Globe className="h-5 w-5" />
                      Social Links
                    </Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Linkedin className="h-5 w-5 text-primary" />
                        </div>
                        <Input
                          value={formData.linkedin}
                          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Github className="h-5 w-5 text-primary" />
                        </div>
                        <Input
                          value={formData.github}
                          onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Twitter className="h-5 w-5 text-primary" />
                        </div>
                        <Input
                          value={formData.twitter}
                          onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                          placeholder="https://twitter.com/yourusername"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
                    <div>
                      <Label htmlFor="public" className="text-base font-semibold flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        Public Profile
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Show your profile on the Members page
                      </p>
                    </div>
                    <Switch
                      id="public"
                      checked={formData.publicProfile}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, publicProfile: checked })
                      }
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1 gradient-primary h-12" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditing(false)}
                      className="h-12"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {/* Social Links Display */}
          {!editing && (user?.linkedin || user?.github || user?.twitter) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 shadow-card">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Social Links
                </h3>
                <div className="flex flex-wrap gap-3">
                  {user?.linkedin && (
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                      LinkedIn
                    </a>
                  )}
                  {user?.github && (
                    <a
                      href={user.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500/10 hover:bg-gray-500/20 text-gray-600 dark:text-gray-400 rounded-lg transition-colors"
                    >
                      <Github className="h-5 w-5" />
                      GitHub
                    </a>
                  )}
                  {user?.twitter && (
                    <a
                      href={user.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-lg transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                      Twitter
                    </a>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;