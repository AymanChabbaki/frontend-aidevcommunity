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
import { Plus, Edit, Trash2, Users, Calendar, MapPin, Search, Eye, Download, ChevronLeft, ChevronRight, Check, X, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { eventService } from '@/services/event.service';
import { collaborationService } from '@/services/collaboration.service';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import EventCollaborators from './EventCollaborators';

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
  const [editFormData, setEditFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

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

  const handleExportRegistrations = async (eventId: string, eventTitle: string) => {
    try {
      const response = await eventService.getEventRegistrations(eventId);
      const registrations = response.data || [];

      const exportData = registrations.map((reg: any) => ({
        Name: reg.user?.displayName || 'N/A',
        Email: reg.user?.email || 'N/A',
        Status: reg.status,
        'Registration Date': format(new Date(reg.createdAt), 'MMM dd, yyyy HH:mm'),
        'Checked In': reg.checkedInAt ? format(new Date(reg.checkedInAt), 'MMM dd, yyyy HH:mm') : 'No',
      }));

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
      startAt: event.startAt ? new Date(event.startAt).toISOString().slice(0, 16) : '',
      endAt: event.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : '',
      capacity: event.capacity,
      category: event.category || '',
      speaker: event.speaker || '',
      imageUrl: event.imageUrl || '',
    });
    setEditDialog({ open: true, event });
  };

  const handleUpdateEvent = async () => {
    if (!editDialog.event) return;

    try {
      setSubmitting(true);
      await eventService.updateEvent(editDialog.event.id, {
        ...editFormData,
        startAt: new Date(editFormData.startAt).toISOString(),
        endAt: new Date(editFormData.endAt).toISOString(),
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Registrations - {registrationsDialog.event?.title}</DialogTitle>
          </DialogHeader>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Checked In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrationsDialog.registrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No registrations found
                    </TableCell>
                  </TableRow>
                ) : (
                  registrationsDialog.registrations.map((reg: any) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.user?.displayName || reg.user?.name || 'Unknown'}</TableCell>
                      <TableCell>{reg.user?.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={reg.status === 'APPROVED' || reg.status === 'REGISTERED' ? 'default' : reg.status === 'PENDING' ? 'secondary' : 'destructive'}>
                          {reg.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(reg.createdAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell>
                        {reg.checkedInAt ? (
                          <Badge variant="default" className="bg-green-500">
                            {format(new Date(reg.checkedInAt), 'MMM dd, yyyy HH:mm')}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Not checked in</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {reg.status === 'PENDING' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveRegistration(reg.id)}
                              className="text-green-600 hover:text-green-700"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectRegistration(reg.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {(reg.status === 'APPROVED' || reg.status === 'REGISTERED') && (
                          <Badge variant="default" className="bg-green-500">Approved</Badge>
                        )}
                        {reg.status === 'REJECTED' && (
                          <Badge variant="destructive">Rejected</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegistrationsDialog({ open: false, event: null, registrations: [] })}>
              Close
            </Button>
            {registrationsDialog.event && (
              <Button onClick={() => handleExportRegistrations(registrationsDialog.event!.id, registrationsDialog.event!.title)}>
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
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editFormData.title || ''}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder="Event title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
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
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editFormData.category || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  placeholder="e.g., Workshop, Conference"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-speaker">Speaker</Label>
                <Input
                  id="edit-speaker"
                  value={editFormData.speaker || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, speaker: e.target.value })}
                  placeholder="Speaker name (optional)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-locationType">Location Type</Label>
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
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={editFormData.locationText || ''}
                onChange={(e) => setEditFormData({ ...editFormData, locationText: e.target.value })}
                placeholder="Event location or meeting link"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startAt">Start Date & Time</Label>
                <Input
                  id="edit-startAt"
                  type="datetime-local"
                  value={editFormData.startAt || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, startAt: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-endAt">End Date & Time</Label>
                <Input
                  id="edit-endAt"
                  type="datetime-local"
                  value={editFormData.endAt || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, endAt: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={editFormData.capacity || ''}
                onChange={(e) => setEditFormData({ ...editFormData, capacity: parseInt(e.target.value) })}
                placeholder="Maximum attendees"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Image URL (optional)</Label>
              <Input
                id="edit-imageUrl"
                value={editFormData.imageUrl || ''}
                onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
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