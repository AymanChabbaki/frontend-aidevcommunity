import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { collaborationService } from '@/services/collaboration.service';
import { Calendar, CheckCircle, XCircle, Clock, Users, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Invitation {
  id: string;
  role: string;
  permissions: {
    canEdit: boolean;
    canApprove: boolean;
    canManageRegistrations: boolean;
  };
  status: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    imageUrl?: string;
    status: string;
    organizer: {
      displayName: string;
      photoUrl?: string;
    };
  };
  inviter: {
    displayName: string;
    photoUrl?: string;
  };
}

interface Collaboration {
  id: string;
  role: string;
  permissions: {
    canEdit: boolean;
    canApprove: boolean;
    canManageRegistrations: boolean;
  };
  status: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    imageUrl?: string;
    status: string;
    organizer: {
      displayName: string;
      photoUrl?: string;
    };
    _count: {
      registrations: number;
    };
  };
}

const StaffCollaborations = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invitationsRes, collaborationsRes] = await Promise.all([
        collaborationService.getMyInvitations(),
        collaborationService.getMyCollaborations()
      ]);
      setInvitations(invitationsRes.data);
      setCollaborations(collaborationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load collaborations');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (invitationId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      setResponding(invitationId);
      await collaborationService.respondToInvitation(invitationId, status);
      toast.success(status === 'ACCEPTED' ? 'Invitation accepted!' : 'Invitation declined');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to respond to invitation');
    } finally {
      setResponding(null);
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'CO_ORGANIZER' 
      ? <Badge variant="default"><Shield className="h-3 w-3 mr-1" />Co-Organizer</Badge>
      : <Badge variant="outline"><Users className="h-3 w-3 mr-1" />Collaborator</Badge>;
  };

  const getEventStatusBadge = (status: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading collaborations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Collaborations</h1>
        <p className="text-muted-foreground">
          Manage your event collaboration invitations and active collaborations
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="invitations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invitations">
            Pending Invitations
            {invitations.length > 0 && (
              <Badge variant="secondary" className="ml-2">{invitations.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">
            Active Collaborations
            {collaborations.length > 0 && (
              <Badge variant="secondary" className="ml-2">{collaborations.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Pending Invitations Tab */}
        <TabsContent value="invitations" className="space-y-4">
          {invitations.length === 0 ? (
            <Card className="p-12 text-center">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Pending Invitations</h3>
              <p className="text-muted-foreground">
                You don't have any collaboration invitations at the moment
              </p>
            </Card>
          ) : (
            invitations.map((invitation, index) => (
              <motion.div
                key={invitation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Event Image */}
                      {invitation.event.imageUrl && (
                        <img
                          src={invitation.event.imageUrl}
                          alt={invitation.event.title}
                          className="w-full lg:w-48 h-48 object-cover rounded-lg"
                        />
                      )}

                      {/* Event Details */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-bold">{invitation.event.title}</h3>
                            <div className="flex gap-2">
                              {getRoleBadge(invitation.role)}
                              {getEventStatusBadge(invitation.event.status)}
                            </div>
                          </div>
                          <p className="text-muted-foreground line-clamp-2">
                            {invitation.event.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(new Date(invitation.event.startAt), 'PPP')} - {format(new Date(invitation.event.endAt), 'PPP')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={invitation.event.organizer.photoUrl} />
                              <AvatarFallback className="text-xs">
                                {invitation.event.organizer.displayName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>Organized by {invitation.event.organizer.displayName}</span>
                          </div>
                        </div>

                        {/* Invited By */}
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={invitation.inviter.photoUrl} />
                            <AvatarFallback className="text-xs">
                              {invitation.inviter.displayName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <p className="font-medium">Invited by {invitation.inviter.displayName}</p>
                            <p className="text-muted-foreground">{format(new Date(invitation.createdAt), 'PPp')}</p>
                          </div>
                        </div>

                        {/* Permissions */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Permissions:</p>
                          <div className="flex flex-wrap gap-2">
                            {invitation.permissions.canEdit && (
                              <Badge variant="outline">✓ Edit Event</Badge>
                            )}
                            {invitation.permissions.canApprove && (
                              <Badge variant="outline">✓ Approve Registrations</Badge>
                            )}
                            {invitation.permissions.canManageRegistrations && (
                              <Badge variant="outline">✓ Manage Registrations</Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleRespond(invitation.id, 'ACCEPTED')}
                            disabled={responding === invitation.id}
                          >
                            {responding === invitation.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Accepting...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRespond(invitation.id, 'DECLINED')}
                            disabled={responding === invitation.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>

        {/* Active Collaborations Tab */}
        <TabsContent value="active" className="space-y-4">
          {collaborations.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Collaborations</h3>
              <p className="text-muted-foreground">
                You're not collaborating on any events at the moment
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collaborations.map((collaboration, index) => (
                <motion.div
                  key={collaboration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/staff/events`)}>
                    <CardHeader>
                      {collaboration.event.imageUrl && (
                        <img
                          src={collaboration.event.imageUrl}
                          alt={collaboration.event.title}
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                      )}
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{collaboration.event.title}</CardTitle>
                        {getEventStatusBadge(collaboration.event.status)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {collaboration.event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(collaboration.event.startAt), 'PPP')}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={collaboration.event.organizer.photoUrl} />
                            <AvatarFallback className="text-xs">
                              {collaboration.event.organizer.displayName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{collaboration.event.organizer.displayName}</span>
                        </div>
                        {getRoleBadge(collaboration.role)}
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          {collaboration.event._count.registrations} registrations
                        </p>
                      </div>

                      {/* Permissions */}
                      <div className="flex flex-wrap gap-1">
                        {collaboration.permissions.canEdit && (
                          <Badge variant="outline" className="text-xs">Edit</Badge>
                        )}
                        {collaboration.permissions.canApprove && (
                          <Badge variant="outline" className="text-xs">Approve</Badge>
                        )}
                        {collaboration.permissions.canManageRegistrations && (
                          <Badge variant="outline" className="text-xs">Manage</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffCollaborations;
