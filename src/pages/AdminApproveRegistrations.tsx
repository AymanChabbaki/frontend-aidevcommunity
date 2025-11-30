import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { eventService } from '@/services/event.service';
import { CheckCircle, XCircle, Calendar, User, Mail, GraduationCap, Clock, Search, Filter, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Registration {
  id: string;
  status: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    startAt: string;
    requiresApproval: boolean;
    eligibleLevels?: string[];
    eligiblePrograms?: string[];
  };
  user: {
    id: string;
    displayName: string;
    email: string;
    photoUrl?: string;
    studyLevel?: string;
    studyProgram?: string;
    createdAt: string;
  };
}

const AdminApproveRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);
      const response = await eventService.getPendingRegistrations();
      setRegistrations(response.data);
    } catch (error) {
      toast.error('Failed to load pending registrations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (registration: Registration, type: 'approve' | 'reject') => {
    setSelectedRegistration(registration);
    setActionType(type);
    setComment('');
  };

  const confirmAction = async () => {
    if (!selectedRegistration || !actionType) return;

    try {
      setProcessing(true);
      
      if (actionType === 'approve') {
        await eventService.approveRegistration(selectedRegistration.id, comment);
        toast.success('Registration approved successfully');
      } else {
        await eventService.rejectRegistration(selectedRegistration.id, comment);
        toast.success('Registration rejected');
      }

      // Remove from list
      setRegistrations(prev => prev.filter(r => r.id !== selectedRegistration.id));
      closeDialog();
    } catch (error) {
      toast.error(`Failed to ${actionType} registration`);
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const closeDialog = () => {
    setSelectedRegistration(null);
    setActionType(null);
    setComment('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getImageUrl = (photoUrl?: string) => {
    if (!photoUrl) return '';
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${photoUrl}`;
  };

  const formatStudyInfo = (level?: string, program?: string) => {
    if (!level) return 'Not specified';
    
    const levelMap: Record<string, string> = {
      BACHELOR: 'Bachelor',
      MASTER: 'Master',
      DOCTORATE: 'Doctorate'
    };

    const programMap: Record<string, string> = {
      BACHELOR_S1: 'Semester 1',
      BACHELOR_S2: 'Semester 2',
      BACHELOR_S3: 'Semester 3',
      BACHELOR_S4: 'Semester 4',
      BACHELOR_S5: 'Semester 5',
      BACHELOR_S6: 'Semester 6',
      MASTER_M1: 'Master 1',
      MASTER_M2: 'Master 2',
      DOCTORATE_Y1: 'Year 1',
      DOCTORATE_Y2: 'Year 2',
      DOCTORATE_Y3: 'Year 3',
      DOCTORATE_Y4: 'Year 4'
    };

    const levelText = levelMap[level] || level;
    const programText = program ? programMap[program] || program : '';

    return `${levelText}${programText ? ` - ${programText}` : ''}`;
  };

  const checkEligibility = (registration: Registration) => {
    const { event, user } = registration;
    
    if (!event.eligibleLevels && !event.eligiblePrograms) {
      return { eligible: true, reason: '' };
    }

    const eligibleLevels = event.eligibleLevels || [];
    const eligiblePrograms = event.eligiblePrograms || [];

    if (eligibleLevels.length > 0 && user.studyLevel && !eligibleLevels.includes(user.studyLevel)) {
      return { eligible: false, reason: 'Study level does not match requirements' };
    }

    if (eligiblePrograms.length > 0 && user.studyProgram && !eligiblePrograms.includes(user.studyProgram)) {
      return { eligible: false, reason: 'Study program does not match requirements' };
    }

    return { eligible: true, reason: '' };
  };

  // Get unique events for filter
  const uniqueEvents = useMemo(() => {
    const events = new Map<string, string>();
    registrations.forEach(reg => {
      events.set(reg.event.id, reg.event.title);
    });
    return Array.from(events, ([id, title]) => ({ id, title }));
  }, [registrations]);

  // Filter registrations based on search and filters
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(registration => {
      // Search filter
      const matchesSearch = 
        registration.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        registration.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        registration.event.title.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Event filter
      if (selectedEvent !== 'all' && registration.event.id !== selectedEvent) {
        return false;
      }

      // Study level filter
      if (selectedLevel !== 'all' && registration.user.studyLevel !== selectedLevel) {
        return false;
      }

      return true;
    });
  }, [registrations, searchQuery, selectedEvent, selectedLevel]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pending Registrations</h1>
        <p className="text-muted-foreground">
          Review and approve or reject event registration requests
        </p>
      </div>

      {/* Filters Section */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, email, or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Event Filter */}
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-full lg:w-[220px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="All Events" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {uniqueEvents.map(event => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Study Level Filter */}
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="All Levels" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="BACHELOR">Bachelor</SelectItem>
              <SelectItem value="MASTER">Master</SelectItem>
              <SelectItem value="DOCTORATE">Doctorate</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {(searchQuery !== '' || selectedEvent !== 'all' || selectedLevel !== 'all') && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSearchQuery('');
                setSelectedEvent('all');
                setSelectedLevel('all');
              }}
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
          Showing {filteredRegistrations.length} of {registrations.length} registrations
        </div>
      </Card>

      {registrations.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">All Caught Up!</h2>
          <p className="text-muted-foreground">
            There are no pending registrations to review at this time.
          </p>
        </Card>
      ) : filteredRegistrations.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Matching Results</h2>
          <p className="text-muted-foreground mb-4">
            No registrations match your current filters.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedEvent('all');
              setSelectedLevel('all');
            }}
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredRegistrations.map((registration, index) => {
            const eligibility = checkEligibility(registration);
            
            return (
              <motion.div
                key={registration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* User Info */}
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                          <AvatarImage src={getImageUrl(registration.user.photoUrl)} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg">
                            {getInitials(registration.user.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">
                            {registration.user.displayName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Mail className="h-4 w-4" />
                            {registration.user.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            Member since {format(new Date(registration.user.createdAt), 'MMM yyyy')}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Study Information</p>
                            <p className="text-sm text-muted-foreground">
                              {formatStudyInfo(registration.user.studyLevel, registration.user.studyProgram)}
                            </p>
                          </div>
                        </div>

                        {!eligibility.eligible && (
                          <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              ⚠️ Warning
                            </Badge>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              {eligibility.reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Event Details</h4>
                        <p className="text-lg font-semibold mb-2">{registration.event.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(registration.event.startAt), 'PPP')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Registered {format(new Date(registration.createdAt), 'PPp')}
                        </div>
                      </div>

                      {(registration.event.eligibleLevels || registration.event.eligiblePrograms) && (
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-2">Event Requirements</p>
                          {registration.event.eligibleLevels && registration.event.eligibleLevels.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Levels:</span> {registration.event.eligibleLevels.join(', ')}
                            </p>
                          )}
                          {registration.event.eligiblePrograms && registration.event.eligiblePrograms.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Programs:</span> {registration.event.eligiblePrograms.join(', ')}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={() => handleAction(registration, 'approve')}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleAction(registration, 'reject')}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedRegistration} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Registration' : 'Reject Registration'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">User: {selectedRegistration.user.displayName}</p>
                <p className="text-sm text-muted-foreground">Event: {selectedRegistration.event.title}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">
                  {actionType === 'approve' ? 'Comment (Optional)' : 'Reason (Optional)'}
                </Label>
                <Textarea
                  id="comment"
                  placeholder={
                    actionType === 'approve'
                      ? 'Add a comment for the user...'
                      : 'Explain why this registration is being rejected...'
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={confirmAction}
                  disabled={processing}
                  className={actionType === 'approve' ? 'flex-1 bg-green-600 hover:bg-green-700' : 'flex-1'}
                  variant={actionType === 'reject' ? 'destructive' : 'default'}
                >
                  {processing ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
                </Button>
                <Button onClick={closeDialog} variant="outline" disabled={processing}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApproveRegistrations;
