import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { eventService } from '@/services/event.service';
import { Calendar, MapPin, Users, Image, Shield, X, Plus, FileText, Award, Trash2, GripVertical } from 'lucide-react';

const AdminCreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    locationType: 'PHYSICAL',
    locationText: '',
    startAt: '',
    endAt: '',
    capacity: '',
    imageUrl: '',
    category: '',
    speaker: '',
    tags: '',
    requiresApproval: false,
    allowGuestRegistration: false,
    eligibleLevels: [] as string[],
    eligiblePrograms: [] as string[],
  });

  // Custom registration fields
  interface CustomField {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number' | 'email' | 'phone';
    required: boolean;
    options: string[]; // for 'select' type
    optionsInput: string; // raw comma-separated string for editing
  }
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [useCustomBadge, setUseCustomBadge] = useState(false);

  const addField = () => {
    const newField: CustomField = {
      id: `field_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      options: [],
      optionsInput: ''
    };
    setCustomFields(prev => [...prev, newField]);
  };

  const updateField = (id: string, changes: Partial<CustomField>) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, ...changes } : f));
  };

  const removeField = (id: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage(true);
    try {
      const response = await eventService.uploadEventImage(file);
      if (response.success) {
        setFormData({ ...formData, imageUrl: response.data.imageUrl });
        toast({
          title: 'Success',
          description: 'Image uploaded successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        eligibleLevels: formData.requiresApproval ? formData.eligibleLevels : undefined,
        eligiblePrograms: formData.requiresApproval ? formData.eligiblePrograms : undefined,
        allowGuestRegistration: formData.allowGuestRegistration,
        customFields: customFields.filter(f => f.label.trim()).map(({ optionsInput, ...rest }) => ({
          ...rest,
          options: rest.type === 'select' ? optionsInput.split(',').map(o => o.trim()).filter(Boolean) : []
        })),
        useCustomBadge,
      };

      await eventService.createEvent(eventData);
      
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
      
      navigate('/admin/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create event';
      toast({
        title: 'Error',
        description: typeof errorMessage === 'string' ? errorMessage : 'Failed to create event',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-muted-foreground">Add a new event to the community calendar</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Fill in the information below to create an event</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Workshop, Bootcamp, Competition, etc."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locationType">Location Type *</Label>
                <Select
                  value={formData.locationType}
                  onValueChange={(value) => setFormData({ ...formData, locationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PHYSICAL">Physical</SelectItem>
                    <SelectItem value="VIRTUAL">Virtual</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationText">Location Details *</Label>
                <Input
                  id="locationText"
                  value={formData.locationText}
                  onChange={(e) => setFormData({ ...formData, locationText: e.target.value })}
                  placeholder="Room A, Zoom link, etc."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startAt">Start Date & Time *</Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endAt">End Date & Time *</Label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="speaker">Speaker/Organizer *</Label>
                <Input
                  id="speaker"
                  value={formData.speaker}
                  onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Event Image</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Event preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Or paste image URL below (Max 5MB)
              </p>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="AI, Workshop, Beginner"
              />
            </div>

            {/* Eligibility & Approval Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Eligibility & Approval</h3>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresApproval"
                  checked={formData.requiresApproval}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    requiresApproval: checked as boolean,
                    eligibleLevels: checked ? formData.eligibleLevels : [],
                    eligiblePrograms: checked ? formData.eligiblePrograms : []
                  })}
                />
                <Label htmlFor="requiresApproval" className="cursor-pointer">
                  Require approval for registrations
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowGuestRegistration"
                  checked={formData.allowGuestRegistration}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    allowGuestRegistration: checked as boolean
                  })}
                />
                <div>
                  <Label htmlFor="allowGuestRegistration" className="cursor-pointer">
                    Allow visitor registration (no account required)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Visitors without an account can register and a new account will be created for them automatically.
                  </p>
                </div>
              </div>

              {formData.requiresApproval && (
                <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    Select which study levels and programs are eligible to register for this event.
                  </p>

                  {/* Eligible Study Levels */}
                  <div className="space-y-2">
                    <Label>Eligible Study Levels</Label>
                    <div className="flex flex-wrap gap-2">
                      {['BACHELOR', 'MASTER', 'DOCTORATE'].map((level) => (
                        <Badge
                          key={level}
                          variant={formData.eligibleLevels.includes(level) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const newLevels = formData.eligibleLevels.includes(level)
                              ? formData.eligibleLevels.filter(l => l !== level)
                              : [...formData.eligibleLevels, level];
                            setFormData({ ...formData, eligibleLevels: newLevels });
                          }}
                        >
                          {level === 'BACHELOR' ? 'Bachelor' : level === 'MASTER' ? 'Master' : 'Doctorate'}
                          {formData.eligibleLevels.includes(level) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Eligible Study Programs */}
                  <div className="space-y-2">
                    <Label>Eligible Study Programs</Label>
                    <div className="flex flex-wrap gap-2">
                      {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'M1', 'M2', 'Y1', 'Y2', 'Y3', 'Y4'].map((program) => (
                        <Badge
                          key={program}
                          variant={formData.eligiblePrograms.includes(program) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const newPrograms = formData.eligiblePrograms.includes(program)
                              ? formData.eligiblePrograms.filter(p => p !== program)
                              : [...formData.eligiblePrograms, program];
                            setFormData({ ...formData, eligiblePrograms: newPrograms });
                          }}
                        >
                          {program}
                          {formData.eligiblePrograms.includes(program) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {formData.eligibleLevels.length === 0 && formData.eligiblePrograms.length === 0 && (
                    <p className="text-sm text-amber-600">
                      ⚠️ No eligibility criteria selected. All users will be eligible.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Custom Registration Fields */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Custom Registration Fields</h3>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addField}>
                  <Plus className="h-4 w-4 mr-1" /> Add Field
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add extra questions that attendees must fill out when registering for this event.
              </p>

              {customFields.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-3">No custom fields yet. Click "Add Field" to add one.</p>
              )}

              <div className="space-y-3">
                {customFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-3 space-y-3 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs font-semibold text-muted-foreground">Field {index + 1}</span>
                      <div className="flex-1" />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`req-${field.id}`}
                          checked={field.required}
                          onCheckedChange={(c) => updateField(field.id, { required: !!c })}
                        />
                        <Label htmlFor={`req-${field.id}`} className="text-xs cursor-pointer">Required</Label>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeField(field.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Label *</Label>
                        <Input
                          placeholder="e.g. Company name"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Type</Label>
                        <Select value={field.type} onValueChange={(v: any) => updateField(field.id, { type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="textarea">Long text</SelectItem>
                            <SelectItem value="select">Select (dropdown)</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {field.type === 'select' && (
                      <div className="space-y-1">
                        <Label className="text-xs">Options (comma-separated) *</Label>
                        <Input
                          placeholder="Option A, Option B, Option C"
                          value={field.optionsInput}
                          onChange={(e) => updateField(field.id, { optionsInput: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Badge Settings */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Badge Settings</h3>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="useCustomBadge"
                  checked={useCustomBadge}
                  onCheckedChange={(c) => setUseCustomBadge(!!c)}
                />
                <div>
                  <Label htmlFor="useCustomBadge" className="cursor-pointer">Use custom badge template (badge.png)</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    When enabled, the attendee badge PDF will use the <code className="bg-muted px-1 rounded">badge.png</code> file from <code className="bg-muted px-1 rounded">/public</code> as its A4 background template instead of the default generated layout.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/admin/dashboard')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreateEvent;
