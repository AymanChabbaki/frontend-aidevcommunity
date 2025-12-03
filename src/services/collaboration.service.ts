import api from '../lib/api';

export const collaborationService = {
  // Get all staff members
  getStaffMembers: () => api.get('/collaborations/staff-members'),

  // Invite collaborator to event
  inviteCollaborator: (eventId: string, data: { userId: string; role?: string; permissions?: any }) =>
    api.post(`/collaborations/events/${eventId}/collaborators`, data),

  // Get event collaborators
  getEventCollaborators: (eventId: string) =>
    api.get(`/collaborations/events/${eventId}/collaborators`),

  // Get my invitations
  getMyInvitations: () =>
    api.get('/collaborations/my-invitations'),

  // Get my collaborations
  getMyCollaborations: () =>
    api.get('/collaborations/my-collaborations'),

  // Respond to invitation
  respondToInvitation: (collaborationId: string, status: 'ACCEPTED' | 'DECLINED') =>
    api.post(`/collaborations/invitations/${collaborationId}/respond`, { status }),

  // Remove collaborator
  removeCollaborator: (collaborationId: string) =>
    api.delete(`/collaborations/collaborators/${collaborationId}`),

  // Update collaborator permissions
  updateCollaboratorPermissions: (collaborationId: string, data: { role?: string; permissions?: any }) =>
    api.patch(`/collaborations/collaborators/${collaborationId}`, data),
};
