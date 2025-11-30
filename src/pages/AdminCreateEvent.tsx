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
import { Calendar, MapPin, Users, Image, Shield, X } from 'lucide-react';

const AdminCreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    eligibleLevels: [] as string[],
    eligiblePrograms: [] as string[],
  });

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
              <Label htmlFor="imageUrl">Image URL</Label>
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
