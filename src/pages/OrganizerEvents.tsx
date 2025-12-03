import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents();
      // Filter only events created by this staff member
      const myEvents = response.data?.filter((event: any) => event.organizerId === user?.id) || [];
      setEvents(myEvents);
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

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.locationText || event.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCollaboratorsDialog({ open: true, event })}
                          title="Manage Collaborators"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, eventId: event.id })}
                          title="Delete event"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Collaborators - {collaboratorsDialog.event?.title}</DialogTitle>
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
    </div>
  );
};

export default OrganizerEvents;