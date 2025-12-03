import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { settingsService } from '@/services/settings.service';
import { 
  Settings, 
  Globe, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Palette,
  Save,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

const AdminSettings = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'AI Dev Community',
    siteDescription: 'A community for AI and development enthusiasts',
    siteUrl: 'https://aidevcommunity.com',
    contactEmail: 'contact@aidevcommunity.com',
    maintenanceMode: false,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    eventReminders: true,
    pollNotifications: true,
    newsletterEnabled: true,
    adminAlerts: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    allowRegistration: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorEnabled: false,
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@aidevcommunity.com',
    fromName: 'AI Dev Community',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      const data = response.data;

      // Map settings to state
      if (data.general) {
        setGeneralSettings(data.general);
      }
      if (data.notifications) {
        setNotificationSettings(data.notifications);
      }
      if (data.security) {
        setSecuritySettings(data.security);
      }
      if (data.email) {
        setEmailSettings(data.email);
      }
    } catch (error: any) {
      // If no settings exist, they can be initialized
      if (error.response?.status === 404 || !error.response) {
        console.log('No settings found, using defaults');
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to load settings',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setInitializing(true);
      await settingsService.initializeSettings();
      await fetchSettings();
      toast({
        title: 'Success',
        description: 'Default settings initialized successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to initialize settings',
        variant: 'destructive',
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      setSaving(true);
      await settingsService.bulkUpdateSettings('general', generalSettings);
      
      toast({
        title: 'Success',
        description: 'General settings saved successfully',
      });
      await fetchSettings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      await settingsService.bulkUpdateSettings('notifications', notificationSettings);
      
      toast({
        title: 'Success',
        description: 'Notification settings saved successfully',
      });
      await fetchSettings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      setSaving(true);
      await settingsService.bulkUpdateSettings('security', securitySettings);
      
      toast({
        title: 'Success',
        description: 'Security settings saved successfully',
      });
      await fetchSettings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    try {
      setSaving(true);
      await settingsService.bulkUpdateSettings('email', emailSettings);
      
      toast({
        title: 'Success',
        description: 'Email settings saved successfully',
      });
      await fetchSettings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings and configurations</p>
        </div>
        <Button onClick={handleInitialize} disabled={initializing} variant="outline">
          {initializing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Initializing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Initialize Defaults
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="w-full lg:w-auto inline-flex">
            <TabsTrigger value="general">
              <Globe className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
          </TabsList>
        </div>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  value={generalSettings.siteUrl}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                  <div>
                    <Label htmlFor="maintenance" className="text-base">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Disable public access to the site for maintenance
                    </p>
                  </div>
                </div>
                <Switch
                  id="maintenance"
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setGeneralSettings({ ...generalSettings, maintenanceMode: checked })
                  }
                />
              </div>

              <Button onClick={handleSaveGeneral} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="emailNotif" className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable system email notifications
                  </p>
                </div>
                <Switch
                  id="emailNotif"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="eventReminders" className="text-base">Event Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send reminders before events start
                  </p>
                </div>
                <Switch
                  id="eventReminders"
                  checked={notificationSettings.eventReminders}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, eventReminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="pollNotif" className="text-base">Poll Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify users about new polls
                  </p>
                </div>
                <Switch
                  id="pollNotif"
                  checked={notificationSettings.pollNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, pollNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="newsletter" className="text-base">Newsletter</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable newsletter functionality
                  </p>
                </div>
                <Switch
                  id="newsletter"
                  checked={notificationSettings.newsletterEnabled}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, newsletterEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="adminAlerts" className="text-base">Admin Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for important system events
                  </p>
                </div>
                <Switch
                  id="adminAlerts"
                  checked={notificationSettings.adminAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, adminAlerts: checked })
                  }
                />
              </div>

              <Button onClick={handleSaveNotifications} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure authentication and security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="emailVerif" className="text-base">Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require users to verify their email address
                  </p>
                </div>
                <Switch
                  id="emailVerif"
                  checked={securitySettings.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, requireEmailVerification: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="allowReg" className="text-base">Allow Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable new user registration
                  </p>
                </div>
                <Switch
                  id="allowReg"
                  checked={securitySettings.allowRegistration}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, allowRegistration: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="twoFactor" className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable 2FA for admin accounts
                  </p>
                </div>
                <Switch
                  id="twoFactor"
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })
                  }
                />
              </div>

              <Button onClick={handleSaveSecurity} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for email delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  value={emailSettings.smtpUser}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <div className="relative">
                  <Input
                    id="smtpPassword"
                    type={showPassword ? "text" : "password"}
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                    className="pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                />
              </div>

              <Button onClick={handleSaveEmail} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
