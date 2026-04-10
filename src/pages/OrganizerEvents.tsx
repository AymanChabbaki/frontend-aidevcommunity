import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
import {
  Dialog,
  DialogContent,
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
import { Plus, Edit, Trash2, Users, Calendar, MapPin, Search, Eye, Download, ChevronLeft, ChevronRight, Check, X, UserPlus, Shield, FileText, Sparkles, Clock, Award, GripVertical } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { eventService } from '@/services/event.service';
import { collaborationService } from '@/services/collaboration.service';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import EventCollaborators from './EventCollaborators';
import { formatDateForInput } from '@/lib/utils';

interface OrganizerEventsProps {
  onCreateEvent?: () => void;
}

const OrganizerEvents = ({ onCreateEvent }: OrganizerEventsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'organizing' | 'collaborating'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; eventId: string | null }>({
    open: false,
    eventId: null,
  });
  const [registrationsDialog, setRegistrationsDialog] = useState<{ open: boolean; event: any | null; registrations: any[] }>({
    open: false,
    event: null,
    registrations: [],
  });
  const [collaboratorsDialog, setCollaboratorsDialog] = useState<{ open: boolean; event: any | null }>({
    open: false,
    event: null,
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; event: any | null }>({
    open: false,
    event: null,
  });
  const [editFormData, setEditFormData] = useState<any>({
    title: '',
    description: '',
    locationType: 'PHYSICAL',
    locationText: '',
    startAt: '',
    endAt: '',
    capacity: 0,
    category: '',
    speaker: '',
    imageUrl: '',
    tags: '',
    requiresApproval: false,
    allowGuestRegistration: false,
    eligibleLevels: [],
    eligiblePrograms: [],
  });
  const [editCustomFields, setEditCustomFields] = useState<any[]>([]);
  const [editSubEvents, setEditSubEvents] = useState<any[]>([]);
  const [editUseCustomBadge, setEditUseCustomBadge] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const [eventsResponse, collaborationsResponse] = await Promise.all([
        eventService.getAllEvents(),
        collaborationService.getMyCollaborations()
      ]);
      
      const allEventsData = eventsResponse.data || [];
      
      // Check and update event status based on dates
      const now = new Date();
      const updatedEventsData = allEventsData.map((event: any) => {
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
      
      // Get events created by this staff member
      const myEvents = updatedEventsData.filter((event: any) => event.organizerId === user?.id);
      
      // Get events where user is a collaborator
      const collaboratedEvents = collaborationsResponse.data?.data || [];
      const collaboratedEventIds = collaboratedEvents
        .filter((collab: any) => collab.status === 'ACCEPTED')
        .map((collab: any) => collab.event);
      
      // Combine both lists, removing duplicates
      const allEvents = [...myEvents];
      collaboratedEventIds.forEach((event: any) => {
        if (!allEvents.some(e => e.id === event.id)) {
          allEvents.push({ ...event, isCollaborator: true });
        }
      });
      
      setEvents(allEvents);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.eventId) return;

    try {
      await eventService.deleteEvent(deleteDialog.eventId);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error: any) {
      toast.error('Failed to delete event');
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
      toast.error('Failed to fetch registrations');
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      await eventService.updateEvent(eventId, { status: newStatus });
      
      toast.success(`Event status changed to ${newStatus}`);
      
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change event status');
    }
  };

  const handleApproveRegistration = async (registrationId: string) => {
    try {
      await eventService.approveRegistration(registrationId);
      toast.success('Registration approved successfully');
      if (registrationsDialog.event) {
        handleViewRegistrations(registrationsDialog.event);
      }
    } catch (error: any) {
      toast.error('Failed to approve registration');
    }
  };

  const handleRejectRegistration = async (registrationId: string) => {
    try {
      await eventService.rejectRegistration(registrationId);
      toast.success('Registration rejected');
      if (registrationsDialog.event) {
        handleViewRegistrations(registrationsDialog.event);
      }
    } catch (error: any) {
      toast.error('Failed to reject registration');
    }
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    if (!confirm('Delete this registration? This cannot be undone.')) return;
    try {
      await eventService.deleteRegistration(registrationId);
      toast.success('Registration deleted');
      if (registrationsDialog.event) {
        handleViewRegistrations(registrationsDialog.event);
      }
    } catch (error: any) {
      toast.error('Failed to delete registration');
    }
  };

  const handleExportRegistrations = async (eventId: string, eventTitle: string) => {
    try {
      const [regResponse, eventsResp] = await Promise.all([
        eventService.getEventRegistrations(eventId),
        eventService.getAllEvents(),
      ]);
      const registrations = regResponse.data || [];
      const theEvent = eventsResp.data?.find((e: any) => e.id === eventId);
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
        customFields.forEach(f => {
          row[f.label] = reg.customFieldValues?.[f.id] || '';
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
      XLSX.writeFile(workbook, `${eventTitle.replace(/[^a-z0-9]/gi, '_')}_registrations.xlsx`);

      toast.success('Registrations exported successfully');
    } catch (error: any) {
      toast.error('Failed to export registrations');
    }
  };

  const handleEditEvent = (event: any) => {
    setEditFormData({
      title: event.title,
      description: event.description,
      locationType: event.locationType || 'PHYSICAL',
      locationText: event.locationText,
      startAt: formatDateForInput(event.startAt),
      endAt: formatDateForInput(event.endAt),
      capacity: event.capacity,
      category: event.category || '',
      speaker: event.speaker || '',
      imageUrl: event.imageUrl || '',
      tags: Array.isArray(event.tags) ? event.tags.join(', ') : '',
      requiresApproval: event.requiresApproval || false,
      allowGuestRegistration: event.allowGuestRegistration || false,
      eligibleLevels: event.eligibleLevels || [],
      eligiblePrograms: event.eligiblePrograms || [],
    });
    setEditCustomFields(event.customFields?.map((f: any) => ({
      ...f,
      optionsInput: f.options?.join(', ') || ''
    })) || []);
    setEditSubEvents(event.subEvents?.map((se: any) => ({
      ...se,
      startAt: formatDateForInput(se.startAt),
      endAt: formatDateForInput(se.endAt),
    })) || []);
    setEditUseCustomBadge(event.useCustomBadge || false);
    setEditDialog({ open: true, event });
  };
  
  // Helpers for editing sub-events and fields
  const addEditSubEvent = () => {
    setEditSubEvents(prev => [...prev, { title: '', description: '', startAt: '', endAt: '', location: '' }]);
  };
  const updateEditSubEvent = (index: number, changes: any) => {
    setEditSubEvents(prev => prev.map((se, i) => i === index ? { ...se, ...changes } : se));
  };
  const removeEditSubEvent = (index: number) => {
    setEditSubEvents(prev => prev.filter((_, i) => i !== index));
  };
  const addEditField = () => {
    setEditCustomFields(prev => [...prev, { id: `field_${Date.now()}`, label: '', type: 'text', required: false, optionsInput: '' }]);
  };
  const updateEditField = (id: string, changes: any) => {
    setEditCustomFields(prev => prev.map(f => f.id === id ? { ...f, ...changes } : f));
  };
  const removeEditField = (id: string) => {
    setEditCustomFields(prev => prev.filter(f => f.id !== id));
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const response = await eventService.uploadEventImage(file);
      if (response.success) {
        setEditFormData({ ...editFormData, imageUrl: response.data.imageUrl });
        toast.success('Image uploaded');
      }
    } catch (error) {
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editDialog.event) return;

    try {
      setSubmitting(true);
      await eventService.updateEvent(editDialog.event.id, {
        ...editFormData,
        tags: editFormData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        startAt: new Date(editFormData.startAt).toISOString(),
        endAt: new Date(editFormData.endAt).toISOString(),
        customFields: editCustomFields.filter(f => f.label.trim()).map(({ optionsInput, ...rest }) => ({
          ...rest,
          options: rest.type === 'select' ? optionsInput.split(',').map((o: string) => o.trim()).filter(Boolean) : []
        })),
        subEvents: editSubEvents.filter(se => se.title.trim()).map(se => ({
          ...se,
          startAt: new Date(se.startAt).toISOString(),
          endAt: new Date(se.endAt).toISOString(),
        })),
        useCustomBadge: editUseCustomBadge,
      });
      toast.success('Event updated successfully');
      setEditDialog({ open: false, event: null });
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.locationText || event.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'organizing' && event.organizerId === user?.id) ||
      (filterType === 'collaborating' && event.isCollaborator);
    
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case 'ONGOING':
        return <Badge className="bg-green-500">Ongoing</Badge>;
      case 'COMPLETED':
        return <Badge variant="secondary">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Events</h1>
          <p className="text-muted-foreground">Manage events you organize</p>
        </div>
        <Button onClick={onCreateEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="organizing">Organizing</SelectItem>
                <SelectItem value="collaborating">Collaborating</SelectItem>
              </SelectContent>
            </Select>
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
              {searchQuery ? 'No events found matching your search' : 'No events created yet. Create your first event!'}
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
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Registrations</TableHead>
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
                        <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <div>{format(new Date(event.startAt || event.date), 'MMM dd, yyyy p')}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{event.locationText || event.location || 'TBA'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{event._count?.registrations || 0}/{event.capacity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={event.status}
                        onValueChange={(value) => handleStatusChange(event.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue>
                            {getStatusBadge(event.status)}
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
                          onClick={() => handleEditEvent(event)}
                          title="Edit Event"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* Only show Manage Collaborators if user is the organizer */}
                        {event.organizerId === user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCollaboratorsDialog({ open: true, event })}
                            title="Manage Collaborators"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}
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
                          title="Export registrations"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {/* Only show Delete if user is the organizer */}
                        {event.organizerId === user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, eventId: event.id })}
                            title="Delete event"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
            </div>
          )}
        </Card>
      )}

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
                      <TableCell colSpan={6} className="text-center py-16 text-slate-500 italic font-light tracking-widest text-sm">
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
                                        onClick={async () => {
                                          try {
                                            await eventService.checkInSubEvent(reg.id, se.id);
                                            toast.success('Dossier Synchronized');
                                            handleViewRegistrations(registrationsDialog.event);
                                          } catch (err) {
                                            toast.error('Sync Protocol Failed');
                                          }
                                        }}
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

      <Dialog open={collaboratorsDialog.open} onOpenChange={(open) => setCollaboratorsDialog({ open, event: null })}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Manage Collaborators - {collaboratorsDialog.event?.title}</DialogTitle>
          </DialogHeader>
          {collaboratorsDialog.event && (
            <EventCollaborators 
              eventId={collaboratorsDialog.event.id}
              eventTitle={collaboratorsDialog.event.title}
              isOrganizer={true}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, event: null })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Event</DialogTitle>
          </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="Event title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Event description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Input
                    id="edit-category"
                    value={editFormData.category || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    placeholder="e.g., Workshop, Conference"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-speaker">Speaker/Organizer</Label>
                  <Input
                    id="edit-speaker"
                    value={editFormData.speaker || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, speaker: e.target.value })}
                    placeholder="Speaker name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-locationType">Location Type *</Label>
                  <Select
                    value={editFormData.locationType || 'PHYSICAL'}
                    onValueChange={(value) => setEditFormData({ ...editFormData, locationType: value })}
                  >
                    <SelectTrigger id="edit-locationType">
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
                  <Label htmlFor="edit-location">Location Details *</Label>
                  <Input
                    id="edit-location"
                    value={editFormData.locationText || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, locationText: e.target.value })}
                    placeholder="Event location or meeting link"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-startAt">Start Date & Time *</Label>
                  <Input
                    id="edit-startAt"
                    type="datetime-local"
                    value={editFormData.startAt || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, startAt: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-endAt">End Date & Time *</Label>
                  <Input
                    id="edit-endAt"
                    type="datetime-local"
                    value={editFormData.endAt || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, endAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacity *</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    value={editFormData.capacity || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, capacity: parseInt(e.target.value) })}
                    placeholder="Maximum attendees"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                  <Input
                    id="edit-tags"
                    value={editFormData.tags || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                    placeholder="AI, Workshop, Beginner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">Event Image</Label>
                <div className="flex items-center gap-4">
                  {editFormData.imageUrl && (
                    <img src={editFormData.imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded border" />
                  )}
                  <Input id="edit-image" type="file" onChange={handleImageUpload} disabled={uploadingImage} />
                </div>
              </div>
              
              {/* Eligibility Section */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Eligibility & Approval</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-requiresApproval" 
                    checked={editFormData.requiresApproval} 
                    onCheckedChange={(v) => setEditFormData({ ...editFormData, requiresApproval: !!v })}
                  />
                  <Label htmlFor="edit-requiresApproval" className="cursor-pointer">Require approval for registrations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-allowGuestRegistration" 
                    checked={editFormData.allowGuestRegistration} 
                    onCheckedChange={(v) => setEditFormData({ ...editFormData, allowGuestRegistration: !!v })}
                  />
                  <Label htmlFor="edit-allowGuestRegistration" className="cursor-pointer">Allow visitor registration (no account required)</Label>
                </div>
                
                {editFormData.requiresApproval && (
                  <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label>Eligible Study Levels</Label>
                      <div className="flex flex-wrap gap-2">
                        {['BACHELOR', 'MASTER', 'DOCTORATE'].map((level) => (
                          <Badge
                            key={level}
                            variant={editFormData.eligibleLevels?.includes(level) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              const current = editFormData.eligibleLevels || [];
                              const next = current.includes(level) ? current.filter((l: string) => l !== level) : [...current, level];
                              setEditFormData({ ...editFormData, eligibleLevels: next });
                            }}
                          >
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Fields Section */}
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
                <div className="space-y-3">
                  {editCustomFields.map((field, idx) => (
                    <div key={field.id} className="border rounded-lg p-3 space-y-3 bg-muted/20 relative">
                      <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive" onClick={() => removeEditField(field.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Label" value={field.label} onChange={(e) => updateEditField(field.id, { label: e.target.value })} />
                        <Select value={field.type} onValueChange={(v) => updateEditField(field.id, { type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="textarea">Long Text</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {field.type === 'select' && (
                        <Input placeholder="Options (comma-separated)" value={field.optionsInput} onChange={(e) => updateEditField(field.id, { optionsInput: e.target.value })} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Agenda Section */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Event Agenda</h3>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addEditSubEvent}>
                    <Plus className="h-4 w-4 mr-1" /> Add Session
                  </Button>
                </div>
                <div className="space-y-4">
                  {editSubEvents.map((se, idx) => (
                    <div key={idx} className="border rounded-lg p-3 space-y-3 bg-muted/10 relative">
                      <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive" onClick={() => removeEditSubEvent(idx)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Session Title" value={se.title} onChange={(e) => updateEditSubEvent(idx, { title: e.target.value })} />
                        <Input placeholder="Location" value={se.location} onChange={(e) => updateEditSubEvent(idx, { location: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input type="datetime-local" value={se.startAt} onChange={(e) => updateEditSubEvent(idx, { startAt: e.target.value })} />
                        <Input type="datetime-local" value={se.endAt} onChange={(e) => updateEditSubEvent(idx, { endAt: e.target.value })} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badge Section */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Badge Settings</h3>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="edit-useCustomBadge" 
                    checked={editUseCustomBadge} 
                    onCheckedChange={(v) => setEditUseCustomBadge(!!v)}
                  />
                  <Label htmlFor="edit-useCustomBadge">Use custom badge template (badge.png)</Label>
                </div>
              </div>
            </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditDialog({ open: false, event: null })} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleUpdateEvent} disabled={submitting} className="w-full sm:w-auto">
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Event
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizerEvents;