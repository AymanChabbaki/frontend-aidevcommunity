import apiClient from './api.client';

export const collaborationService = {
  // Get all staff members
  getStaffMembers: () => apiClient.get('/collaborations/staff-members'),

  // Invite collaborator to event
  inviteCollaborator: (eventId: string, data: { userId: string; role?: string; permissions?: any }) =>
    apiClient.post(`/collaborations/events/${eventId}/collaborators`, data),

  // Get event collaborators
  getEventCollaborators: (eventId: string) =>
    apiClient.get(`/collaborations/events/${eventId}/collaborators`),

  // Get my invitations
  getMyInvitations: () =>
    apiClient.get('/collaborations/my-invitations'),

  // Get my collaborations
  getMyCollaborations: () =>
    apiClient.get('/collaborations/my-collaborations'),

  // Respond to invitation
  respondToInvitation: (collaborationId: string, status: 'ACCEPTED' | 'DECLINED') =>
    apiClient.post(`/collaborations/invitations/${collaborationId}/respond`, { status }),

  // Remove collaborator
  removeCollaborator: (collaborationId: string) =>
    apiClient.delete(`/collaborations/collaborators/${collaborationId}`),

  // Update collaborator permissions
  updateCollaboratorPermissions: (collaborationId: string, data: { role?: string; permissions?: any }) =>
    apiClient.patch(`/collaborations/collaborators/${collaborationId}`, data),
};
