import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { eventService } from '@/services/event.service';
import { Search, Plus, Edit, Trash2, Calendar, MapPin, Users, Download, Eye, Check, X, UserCheck, UserX, Shield, Clock, Sparkles, GripVertical, ChevronLeft, ChevronRight, Award, FileText } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { formatDateForInput } from '@/lib/utils';

const AdminManageEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; eventId: string | null }>({
    open: false,
    eventId: null,
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; event: any | null }>({
    open: false,
    event: null,
  });
  const [registrationsDialog, setRegistrationsDialog] = useState<{ open: boolean; event: any | null; registrations: any[] }>({
    open: false,
    event: null,
    registrations: [],
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    locationType: 'PHYSICAL',
    locationText: '',
    startAt: '',
    endAt: '',
    capacity: '',
    speaker: '',
    imageUrl: '',
    tags: '',
    requiresApproval: false,
    allowGuestRegistration: false,
    eligibleLevels: [] as string[],
    eligiblePrograms: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Custom fields for edit dialog
  interface EditCustomField {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number' | 'email' | 'phone';
    required: boolean;
    options: string[];
    optionsInput: string;
  }
  const [editCustomFields, setEditCustomFields] = useState<EditCustomField[]>([]);
  const [editUseCustomBadge, setEditUseCustomBadge] = useState(false);

  // Sub-events (Agenda) for edit modal
  interface EditSubEvent {
    id?: string;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    location: string;
  }
  const [editSubEvents, setEditSubEvents] = useState<EditSubEvent[]>([]);

  const addEditSubEvent = () => {
    setEditSubEvents(prev => [...prev, { title: '', description: '', startAt: '', endAt: '', location: '' }]);
  };

  const updateEditSubEvent = (index: number, changes: Partial<EditSubEvent>) => {
    setEditSubEvents(prev => prev.map((se, i) => i === index ? { ...se, ...changes } : se));
  };

  const removeEditSubEvent = (index: number) => {
    setEditSubEvents(prev => prev.filter((_, i) => i !== index));
  };

  const addEditField = () => {
    setEditCustomFields(prev => [...prev, {
      id: `field_${Date.now()}`,
      label: '', type: 'text', required: false, options: [], optionsInput: ''
    }]);
  };
  const updateEditField = (id: string, changes: Partial<EditCustomField>) => {
    setEditCustomFields(prev => prev.map(f => f.id === id ? { ...f, ...changes } : f));
  };
  const removeEditField = (id: string) => {
    setEditCustomFields(prev => prev.filter(f => f.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

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
        setEditFormData({ ...editFormData, imageUrl: response.data.imageUrl });
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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents();
      const eventsData = response.data || [];
      
      // Check and update event status based on dates
      const now = new Date();
      const updatedEvents = eventsData.map((event: any) => {
        // Don't change CANCELLED status
        if (event.status === 'CANCELLED') {
          return event;
        }
        
        const startDate = new Date(event.startAt);
        const endDate = new Date(event.endAt);
        
        let newStatus = event.status;
        if (now < startDate) {
          newStatus = 'UPCOMING';
        } else if (now >= startDate && now < endDate) {
          newStatus = 'ONGOING';
        } else if (now >= endDate) {
          newStatus = 'COMPLETED';
        }
        
        return { ...event, status: newStatus };
      });
      
      setEvents(updatedEvents);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEdit = (event: any) => {
    setEditFormData({
      title: event.title || '',
      description: event.description || '',
      category: event.category || '',
      locationType: event.locationType || 'PHYSICAL',
      locationText: event.locationText || '',
      startAt: formatDateForInput(event.startAt),
      endAt: formatDateForInput(event.endAt),
      capacity: event.capacity?.toString() || '',
      speaker: event.speaker || '',
      imageUrl: event.imageUrl || '',
      tags: event.tags?.join(', ') || '',
      requiresApproval: event.requiresApproval || false,
      allowGuestRegistration: event.allowGuestRegistration || false,
      eligibleLevels: event.eligibleLevels || [],
      eligiblePrograms: event.eligiblePrograms || [],
    });
    // Load custom fields: convert stored options[] to optionsInput string
    const existingFields = (event.customFields || []).map((f: any) => ({
      ...f,
      optionsInput: Array.isArray(f.options) ? f.options.join(', ') : ''
    }));
    setEditCustomFields(existingFields);
    setEditUseCustomBadge(event.useCustomBadge || false);
    
    // Load sub-events: format dates for input
    const sessions = (event.subEvents || []).map((se: any) => ({
      ...se,
      startAt: formatDateForInput(se.startAt),
      endAt: formatDateForInput(se.endAt)
    }));
    setEditSubEvents(sessions);

    setEditDialog({ open: true, event });
  };

  const handleUpdate = async () => {
    if (!editDialog.event) return;

    setSubmitting(true);
    try {
      const eventData = {
        title: editFormData.title,
        description: editFormData.description,
        category: editFormData.category,
        locationType: editFormData.locationType,
        locationText: editFormData.locationText,
        startAt: new Date(editFormData.startAt).toISOString(),
        endAt: new Date(editFormData.endAt).toISOString(),
        capacity: parseInt(editFormData.capacity),
        speaker: editFormData.speaker || undefined,
        imageUrl: editFormData.imageUrl || undefined,
        tags: editFormData.tags ? editFormData.tags.split(',').map(tag => tag.trim()) : [],
        requiresApproval: editFormData.requiresApproval,
        allowGuestRegistration: editFormData.allowGuestRegistration,
        eligibleLevels: editFormData.requiresApproval ? editFormData.eligibleLevels : undefined,
        eligiblePrograms: editFormData.requiresApproval ? editFormData.eligiblePrograms : undefined,
        customFields: editCustomFields.filter(f => f.label.trim()).map(({ optionsInput, ...rest }) => ({
          ...rest,
          options: rest.type === 'select' ? optionsInput.split(',').map(o => o.trim()).filter(Boolean) : []
        })),
        useCustomBadge: editUseCustomBadge,
        subEvents: editSubEvents.filter(se => se.title.trim()).map(se => ({
          ...se,
          startAt: new Date(se.startAt).toISOString(),
          endAt: new Date(se.endAt).toISOString()
        }))
      };

      await eventService.updateEvent(editDialog.event.id, eventData);

      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });

      setEditDialog({ open: false, event: null });
      fetchEvents();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update event';
      toast({
        title: 'Error',
        description: typeof errorMessage === 'string' ? errorMessage : 'Failed to update event',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.eventId) return;

    try {
      await eventService.deleteEvent(deleteDialog.eventId);
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
      fetchEvents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialog({ open: false, eventId: null });
    }
  };

  const handleViewRegistrations = async (event: any) => {
    try {
      const response = await eventService.getEventRegistrations(event.id);
      setRegistrationsDialog({
        open: true,
        event,
        registrations: response.data || [],
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch registrations',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      await eventService.updateEvent(eventId, { status: newStatus });
      
      toast({
        title: 'Success',
        description: `Event status changed to ${newStatus}`,
      });
      
      fetchEvents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to change event status',
        variant: 'destructive',
      });
    }
  };

  const handleApproveRegistration = async (registrationId: string) => {
    try {
      await eventService.approveRegistration(registrationId);
      toast({
        title: 'Success',
        description: 'Registration approved successfully',
      });
      // Refresh registrations
      if (registrationsDialog.event) {
        handleViewRegistrations(registrationsDialog.event);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to approve registration',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRegistration = async (registrationId: string) => {
    try {
      await eventService.rejectRegistration(registrationId);
      toast({
        title: 'Success',
        description: 'Registration rejected',
      });
      // Refresh registrations
      if (registrationsDialog.event) {
        handleViewRegistrations(registrationsDialog.event);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to reject registration',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    if (!confirm('Delete this registration? This cannot be undone.')) return;
    try {
      await eventService.deleteRegistration(registrationId);
      toast({
        title: 'Success',
        description: 'Registration deleted',
      });
      if (registrationsDialog.event) {
        handleViewRegistrations(registrationsDialog.event);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete registration',
        variant: 'destructive',
      });
    }
  };

  const handleSubEventCheckIn = async (registrationId: string, subEventId: string) => {
    try {
      await eventService.checkInSubEvent(registrationId, subEventId);
      toast({
        title: 'Success',
        description: 'Checked in for session',
      });
      // Refresh registrations to see updated check-in status
      if (registrationsDialog.event) {
        handleViewRegistrations(registrationsDialog.event);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to check in',
        variant: 'destructive',
      });
    }
  };

  const handleExportRegistrations = async (eventId: string, eventTitle: string) => {
    try {
      // Fetch registrations + the event's custom field definitions
      const [regResponse, eventsList] = await Promise.all([
        eventService.getEventRegistrations(eventId),
        eventService.getAllEvents(),
      ]);
      const registrations = regResponse.data || [];
      const theEvent = eventsList.data?.find((e: any) => e.id === eventId);
      const customFields: Array<{ id: string; label: string }> = theEvent?.customFields || [];

      const exportData = registrations.map((reg: any) => {
        const row: Record<string, any> = {
          Name: reg.user?.displayName || 'N/A',
          Email: reg.user?.email || 'N/A',
          'Study Level': reg.user?.studyLevel || '',
          'Study Program': reg.user?.studyProgram || '',
          Status: reg.status,
          'Registration Date': format(new Date(reg.createdAt), 'MMM dd, yyyy HH:mm'),
          'Checked In': reg.checkedInAt ? format(new Date(reg.checkedInAt), 'MMM dd, yyyy HH:mm') : 'No',
        };
        // Append custom field answers with human-readable labels
        customFields.forEach(f => {
          row[f.label] = reg.customFieldValues?.[f.id] || '';
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
      XLSX.writeFile(workbook, `${eventTitle.replace(/[^a-z0-9]/gi, '_')}_registrations.xlsx`);

      toast({
        title: 'Success',
        description: 'Registrations exported successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to export registrations',
        variant: 'destructive',
      });
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-500';
      case 'ONGOING': return 'bg-green-500';
      case 'COMPLETED': return 'bg-gray-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Events</h1>
          <p className="text-muted-foreground">View, edit, and delete events</p>
        </div>
        <Button onClick={() => navigate('/admin/create-event')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Loading events...</p>
          </CardContent>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              {searchQuery ? 'No events found matching your search' : 'No events created yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(event.startAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{event.locationText}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {event._count?.registrations || 0}/{event.capacity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={event.status}
                        onValueChange={(value) => handleStatusChange(event.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue>
                            <Badge className={getStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UPCOMING">UPCOMING</SelectItem>
                          <SelectItem value="ONGOING">ONGOING</SelectItem>
                          <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                          <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRegistrations(event)}
                          title="View Registrations"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportRegistrations(event.id, event.title)}
                          title="Export to Excel"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, eventId: event.id })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {totalPages > 1 && (
            <CardContent className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, event: null })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Input
                  id="edit-category"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-locationType">Location Type *</Label>
                <Select value={editFormData.locationType} onValueChange={(value) => setEditFormData({ ...editFormData, locationType: value })}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-locationText">Location *</Label>
              <Input
                id="edit-locationText"
                value={editFormData.locationText}
                onChange={(e) => setEditFormData({ ...editFormData, locationText: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startAt">Start Date & Time *</Label>
                <Input
                  id="edit-startAt"
                  type="datetime-local"
                  value={editFormData.startAt}
                  onChange={(e) => setEditFormData({ ...editFormData, startAt: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-endAt">End Date & Time *</Label>
                <Input
                  id="edit-endAt"
                  type="datetime-local"
                  value={editFormData.endAt}
                  onChange={(e) => setEditFormData({ ...editFormData, endAt: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Capacity *</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min="1"
                  value={editFormData.capacity}
                  onChange={(e) => setEditFormData({ ...editFormData, capacity: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-speaker">Speaker</Label>
                <Input
                  id="edit-speaker"
                  value={editFormData.speaker}
                  onChange={(e) => setEditFormData({ ...editFormData, speaker: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Event Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {editFormData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={editFormData.imageUrl}
                    alt="Event preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {uploadingImage ? 'Uploading image...' : 'Or paste image URL below (Max 5MB)'}
              </p>
              <Input
                id="edit-imageUrl"
                type="url"
                value={editFormData.imageUrl}
                onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                value={editFormData.tags}
                onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                placeholder="Comma separated"
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
                  id="edit-requiresApproval"
                  checked={editFormData.requiresApproval}
                  onCheckedChange={(checked) => setEditFormData({ 
                    ...editFormData, 
                    requiresApproval: checked as boolean,
                    eligibleLevels: checked ? editFormData.eligibleLevels : [],
                    eligiblePrograms: checked ? editFormData.eligiblePrograms : []
                  })}
                />
                <Label htmlFor="edit-requiresApproval" className="cursor-pointer">
                  Require approval for registrations
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-allowGuestRegistration"
                  checked={editFormData.allowGuestRegistration}
                  onCheckedChange={(checked) => setEditFormData({ 
                    ...editFormData, 
                    allowGuestRegistration: checked as boolean
                  })}
                />
                <div>
                  <Label htmlFor="edit-allowGuestRegistration" className="cursor-pointer">
                    Allow visitor registration (no account required)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Visitors without an account can register and a new account will be created automatically.
                  </p>
                </div>
              </div>

              {editFormData.requiresApproval && (
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
                          variant={editFormData.eligibleLevels.includes(level) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const newLevels = editFormData.eligibleLevels.includes(level)
                              ? editFormData.eligibleLevels.filter(l => l !== level)
                              : [...editFormData.eligibleLevels, level];
                            setEditFormData({ ...editFormData, eligibleLevels: newLevels });
                          }}
                        >
                          {level === 'BACHELOR' ? 'Bachelor' : level === 'MASTER' ? 'Master' : 'Doctorate'}
                          {editFormData.eligibleLevels.includes(level) && (
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
                          variant={editFormData.eligiblePrograms.includes(program) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const newPrograms = editFormData.eligiblePrograms.includes(program)
                              ? editFormData.eligiblePrograms.filter(p => p !== program)
                              : [...editFormData.eligiblePrograms, program];
                            setEditFormData({ ...editFormData, eligiblePrograms: newPrograms });
                          }}
                        >
                          {program}
                          {editFormData.eligiblePrograms.includes(program) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {editFormData.eligibleLevels.length === 0 && editFormData.eligiblePrograms.length === 0 && (
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
                <Button type="button" variant="outline" size="sm" onClick={addEditField}>
                  <Plus className="h-4 w-4 mr-1" /> Add Field
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add extra questions attendees must fill out when registering.
              </p>
              {editCustomFields.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-2">No custom fields yet.</p>
              )}
              <div className="space-y-3">
                {editCustomFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-3 space-y-3 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs font-semibold text-muted-foreground">Field {index + 1}</span>
                      <div className="flex-1" />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`edit-cf-req-${field.id}`}
                          checked={field.required}
                          onCheckedChange={(c) => updateEditField(field.id, { required: !!c })}
                        />
                        <Label htmlFor={`edit-cf-req-${field.id}`} className="text-xs cursor-pointer">Required</Label>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeEditField(field.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Label *</Label>
                        <Input
                          placeholder="e.g. Company name"
                          value={field.label}
                          onChange={(e) => updateEditField(field.id, { label: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Type</Label>
                        <Select value={field.type} onValueChange={(v: any) => updateEditField(field.id, { type: v })}>
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
                          onChange={(e) => updateEditField(field.id, { optionsInput: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>


            {/* Agenda (Sub-events) Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Event Agenda (Sessions/Workshops)</h3>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addEditSubEvent}>
                  <Plus className="h-4 w-4 mr-1" /> Add Session
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Manage sessions, workshops, or activities for this event.
              </p>

              {editSubEvents.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-2">No specific agenda items added yet.</p>
              )}

              <div className="space-y-4">
                {editSubEvents.map((session, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-3 bg-muted/10 relative">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 text-destructive h-7 w-7"
                      onClick={() => removeEditSubEvent(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Session Title *</Label>
                        <Input
                          placeholder="e.g. Keynote Speech"
                          value={session.title}
                          onChange={(e) => updateEditSubEvent(index, { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Location</Label>
                        <Input
                          placeholder="e.g. Main Hall"
                          value={session.location}
                          onChange={(e) => updateEditSubEvent(index, { location: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Start Time *</Label>
                        <Input
                          type="datetime-local"
                          value={session.startAt}
                          onChange={(e) => updateEditSubEvent(index, { startAt: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">End Time *</Label>
                        <Input
                          type="datetime-local"
                          value={session.endAt}
                          onChange={(e) => updateEditSubEvent(index, { endAt: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Description</Label>
                      <Textarea
                        placeholder="Session description..."
                        value={session.description}
                        onChange={(e) => updateEditSubEvent(index, { description: e.target.value })}
                        rows={1}
                        className="min-h-[40px]"
                      />
                    </div>
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
                  id="edit-useCustomBadge"
                  checked={editUseCustomBadge}
                  onCheckedChange={(c) => setEditUseCustomBadge(!!c)}
                />
                <div>
                  <Label htmlFor="edit-useCustomBadge" className="cursor-pointer">Use custom badge template (badge.png)</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    When enabled, the badge PDF will use the <code className="bg-muted px-1 rounded">badge.png</code> in <code className="bg-muted px-1 rounded">/public</code> as its A4 background.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, event: null })} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, eventId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
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

      <Dialog open={registrationsDialog.open} onOpenChange={(open) => setRegistrationsDialog({ open, event: null, registrations: [] })}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#09090b] text-white border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white/90 font-black tracking-tight flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              EVENT DOSSIER: {registrationsDialog.event?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-[#111115]/50 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />
              <Table>
                <TableHeader className="bg-white/[0.03]">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] py-4">Subject</TableHead>
                    <TableHead className="text-primary font-bold uppercase tracking-[0.2em] text-[10px]">Credentials</TableHead>
                    <TableHead className="text-primary font-bold uppercase tracking-[0.2em] text-[10px]">Status</TableHead>
                    <TableHead className="text-primary font-bold uppercase tracking-[0.2em] text-[10px]">Registration</TableHead>
                    <TableHead className="text-primary font-bold uppercase tracking-[0.2em] text-[10px]">Check-In</TableHead>
                    <TableHead className="text-right text-primary font-bold uppercase tracking-[0.2em] text-[10px] pr-6">Commands</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrationsDialog.registrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16 text-muted-foreground/50 italic font-light tracking-widest text-sm">
                        NO DOSSIERS FOUND IN CURRENT SECTOR
                      </TableCell>
                    </TableRow>
                  ) : (
                    registrationsDialog.registrations.map((reg: any) => (
                      <TableRow key={reg.id} className="border-white/5 hover:bg-white/[0.02] transition-all duration-500 group/row">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover/row:border-primary/50 transition-colors">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-bold text-white/90 group-hover/row:text-primary transition-colors">
                              {reg.user?.displayName || 'Unknown Subject'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono opacity-40 group-hover/row:opacity-100 transition-opacity">
                          {reg.user?.email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`
                            ${reg.status === 'APPROVED' || reg.status === 'REGISTERED' ? 'border-green-500/50 text-green-400 bg-green-500/5' : 
                              reg.status === 'PENDING' ? 'border-amber-500/50 text-amber-400 bg-amber-500/5' : 
                              'border-red-500/50 text-red-400 bg-red-500/5'}
                            text-[9px] font-black uppercase tracking-[0.1em] py-0 h-5 px-2
                          `}>
                            {reg.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] tabular-nums opacity-40">
                          {format(new Date(reg.createdAt), 'yyyy.MM.dd')}<br/>
                          <span className="text-[9px] text-muted-foreground/50">{format(new Date(reg.createdAt), 'HH:mm:ss')}</span>
                        </TableCell>
                        <TableCell>
                          {reg.checkedInAt ? (
                            <div className="flex items-center gap-2 text-green-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                              <span className="text-[10px] font-bold tabular-nums">
                                {format(new Date(reg.checkedInAt), 'HH:mm:ss')}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-white/10 italic">
                               <Clock className="w-3 h-3" />
                               <span className="text-[9px] font-medium uppercase tracking-tighter">Standby</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-2 translate-x-4 opacity-0 group-hover/row:translate-x-0 group-hover/row:opacity-100 transition-all duration-300">
                            {reg.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleApproveRegistration(reg.id)}
                                  className="h-8 w-8 rounded-lg text-green-400 hover:text-green-300 hover:bg-green-500/10 border border-green-500/0 hover:border-green-500/20"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRejectRegistration(reg.id)}
                                  className="h-8 w-8 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/0 hover:border-red-500/20"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRegistration(reg.id)}
                              className="h-8 w-8 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 border border-white/0 hover:border-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Sessions check-in grid */}
            {registrationsDialog.event?.subEvents?.length > 0 && registrationsDialog.registrations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/70 flex items-center gap-3">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" /> SESSION SYNC CORE
                  </h3>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {registrationsDialog.event.subEvents.map((se: any) => {
                    const checkedInCount = registrationsDialog.registrations.filter((reg: any) => 
                      reg.subEventCheckIns?.some((check: any) => check.subEventId === se.id)
                    ).length;

                    return (
                      <div key={se.id} className="relative group overflow-hidden rounded-2xl border border-white/5 bg-[#111115]/40 p-5 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.1)]">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-all duration-700 pointer-events-none group-hover:scale-125 transform-gpu">
                          <Calendar className="h-16 w-16" />
                        </div>
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-base text-white/90 group-hover:text-primary transition-colors leading-tight">{se.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin className="h-3 w-3 text-muted-foreground/60" />
                                <span className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest">{se.location || 'Nexus Hall'}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <Badge variant="outline" className="text-[9px] border-primary/30 bg-primary/10 text-primary font-black">
                                {checkedInCount} ACTIVE
                              </Badge>
                              <span className="text-[8px] text-muted-foreground/40 mt-1 uppercase font-bold tracking-widest">Load Meter</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mt-4 max-h-[160px] overflow-y-auto scrollbar-hide pr-1 border-t border-white/5 pt-4">
                            {registrationsDialog.registrations
                              .filter((reg: any) => reg.status === 'APPROVED' || reg.status === 'REGISTERED')
                              .map((reg: any) => {
                                const isCheckedIn = reg.subEventCheckIns?.some((check: any) => check.subEventId === se.id);
                                return (
                                  <div key={reg.id} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-all group/attendee border border-transparent hover:border-white/5">
                                    <span className="text-[11px] font-bold text-white/60 group-hover/attendee:text-white/90 transition-colors truncate flex-1 tracking-tight">
                                      {reg.user?.displayName || 'Unknown Subject'}
                                    </span>
                                    {isCheckedIn ? (
                                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.1)]">
                                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-tighter">SYNCED</span>
                                      </div>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-3 text-[9px] font-black uppercase tracking-widest bg-white/[0.03] hover:bg-primary/20 hover:text-primary border border-white/5 hover:border-primary/20 transition-all rounded-lg"
                                        onClick={() => handleSubEventCheckIn(reg.id, se.id)}
                                      >
                                        INITIALIZE SYNC
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="border-t border-white/5 pt-4">
            <Button variant="outline" onClick={() => setRegistrationsDialog({ open: false, event: null, registrations: [] })} className="border-white/10 text-white hover:bg-white/5">
              Close
            </Button>
            {registrationsDialog.event && (
              <Button onClick={() => handleExportRegistrations(registrationsDialog.event!.id, registrationsDialog.event!.title)} className="bg-primary hover:bg-primary/90 text-white font-bold">
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManageEvents;
