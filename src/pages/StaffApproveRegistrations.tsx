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
import { useAuth } from '@/context/AuthContext';

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
    organizerId: string;
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

const StaffApproveRegistrations = () => {
  const { user: currentUser } = useAuth();
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
  }, [currentUser?.id]);

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);
      const response = await eventService.getPendingRegistrations();
      
      // Filter to only show registrations for events organized by this staff member
      const staffRegistrations = response.data.filter(
        (reg: Registration) => reg.event.organizerId === currentUser?.id
      );
      
      setRegistrations(staffRegistrations);
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

  // Get unique events for filter (only staff's events)
  const uniqueEvents = useMemo(() => {
    const events = new Map();
    registrations.forEach(reg => {
      if (!events.has(reg.event.id)) {
        events.set(reg.event.id, reg.event.title);
      }
    });
    return Array.from(events.entries()).map(([id, title]) => ({ id, title }));
  }, [registrations]);

  // Get unique study levels for filter
  const uniqueLevels = useMemo(() => {
    const levels = new Set<string>();
    registrations.forEach(reg => {
      if (reg.user.studyLevel) {
        levels.add(reg.user.studyLevel);
      }
    });
    return Array.from(levels);
  }, [registrations]);

  // Filter registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const matchesSearch = 
        reg.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.event.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEvent = selectedEvent === 'all' || reg.event.id === selectedEvent;
      const matchesLevel = selectedLevel === 'all' || reg.user.studyLevel === selectedLevel;

      return matchesSearch && matchesEvent && matchesLevel;
    });
  }, [registrations, searchQuery, selectedEvent, selectedLevel]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedEvent('all');
    setSelectedLevel('all');
  };

  const hasActiveFilters = searchQuery || selectedEvent !== 'all' || selectedLevel !== 'all';

  // Check eligibility
  const checkEligibility = (registration: Registration) => {
    const { event, user } = registration;
    const issues = [];

    if (event.eligibleLevels && event.eligibleLevels.length > 0) {
      if (!user.studyLevel || !event.eligibleLevels.includes(user.studyLevel)) {
        issues.push(`Study level (${user.studyLevel || 'Not specified'}) not eligible`);
      }
    }

    if (event.eligiblePrograms && event.eligiblePrograms.length > 0) {
      if (!user.studyProgram || !event.eligiblePrograms.includes(user.studyProgram)) {
        issues.push(`Study program (${user.studyProgram || 'Not specified'}) not eligible`);
      }
    }

    return {
      isEligible: issues.length === 0,
      issues
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pending registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Approve Registrations</h1>
        <p className="text-muted-foreground">
          Review and approve event registrations for your events ({filteredRegistrations.length} pending)
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Event Filter */}
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by event" />
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

            {/* Level Filter */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {uniqueLevels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Registrations List */}
      {filteredRegistrations.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-xl font-semibold mb-2">No Pending Registrations</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters 
                  ? 'No registrations match your filters. Try adjusting your search criteria.'
                  : 'All registrations for your events have been processed.'}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRegistrations.map((registration, index) => {
            const eligibility = checkEligibility(registration);
            
            return (
              <motion.div
                key={registration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* User Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={registration.user.photoUrl} />
                          <AvatarFallback>
                            {registration.user.displayName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{registration.user.displayName}</h3>
                            {!eligibility.isEligible && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Not Eligible
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {registration.user.email}
                            </div>
                            {registration.user.studyLevel && (
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                {registration.user.studyLevel}
                                {registration.user.studyProgram && ` - ${registration.user.studyProgram}`}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Registered {format(new Date(registration.createdAt), 'PPp')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Event Info */}
                      <div className="pl-16">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{registration.event.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          {format(new Date(registration.event.startAt), 'PPP')}
                        </p>
                      </div>

                      {/* Eligibility Issues */}
                      {!eligibility.isEligible && (
                        <div className="pl-16">
                          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                            <p className="text-sm font-medium text-destructive mb-1">Eligibility Issues:</p>
                            <ul className="text-sm text-destructive/80 space-y-1">
                              {eligibility.issues.map((issue, idx) => (
                                <li key={idx}>• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleAction(registration, 'approve')}
                        className="flex-1 lg:flex-initial"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(registration, 'reject')}
                        className="flex-1 lg:flex-initial"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedRegistration && !!actionType} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Registration' : 'Reject Registration'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedRegistration && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedRegistration.user.photoUrl} />
                    <AvatarFallback>
                      {selectedRegistration.user.displayName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedRegistration.user.displayName}</p>
                    <p className="text-sm text-muted-foreground">{selectedRegistration.event.title}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="comment">
                {actionType === 'approve' ? 'Approval Message (Optional)' : 'Rejection Reason (Optional)'}
              </Label>
              <Textarea
                id="comment"
                placeholder={
                  actionType === 'approve'
                    ? 'Add a welcome message or instructions...'
                    : 'Explain why this registration was rejected...'
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeDialog} disabled={processing}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'approve' ? 'default' : 'destructive'}
                onClick={confirmAction}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    {actionType === 'approve' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Approval
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Confirm Rejection
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffApproveRegistrations;
