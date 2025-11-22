import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import crypto from 'crypto';

// Team types
export interface Team {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: 'team' | 'enterprise';
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: 'admin' | 'member';
  token: string;
  expiresAt: Date;
  createdBy: string;
  createdAt: Date;
}

// In-memory storage (in production, use database)
const TEAMS = new Map<string, Team>();
const TEAM_MEMBERS = new Map<string, TeamMember>();
const TEAM_INVITATIONS = new Map<string, TeamInvitation>();

/**
 * Create a new team
 */
export async function createTeam(
  name: string,
  ownerId: string,
  plan: 'team' | 'enterprise' = 'team'
): Promise<Team> {
  const slug = generateSlug(name);

  // Check if slug exists
  const existing = Array.from(TEAMS.values()).find(t => t.slug === slug);
  if (existing) {
    throw new Error('Team name already taken');
  }

  const team: Team = {
    id: `team_${crypto.randomBytes(8).toString('hex')}`,
    name,
    slug,
    ownerId,
    plan,
    maxMembers: plan === 'team' ? 10 : 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  TEAMS.set(team.id, team);

  // Add owner as member
  const ownerMember: TeamMember = {
    id: `tm_${crypto.randomBytes(8).toString('hex')}`,
    teamId: team.id,
    userId: ownerId,
    role: 'owner',
    joinedAt: new Date(),
  };

  TEAM_MEMBERS.set(ownerMember.id, ownerMember);

  log.info('Team created', { teamId: team.id, name, ownerId });

  return team;
}

/**
 * Get team by ID
 */
export async function getTeam(teamId: string): Promise<Team | null> {
  return TEAMS.get(teamId) || null;
}

/**
 * Get user's teams
 */
export async function getUserTeams(userId: string): Promise<Team[]> {
  const userMemberships = Array.from(TEAM_MEMBERS.values())
    .filter(m => m.userId === userId);

  return userMemberships
    .map(m => TEAMS.get(m.teamId))
    .filter((t): t is Team => t !== undefined);
}

/**
 * Get team members
 */
export async function getTeamMembers(teamId: string): Promise<Array<TeamMember & { user: { id: string; name: string; email: string } }>> {
  const members = Array.from(TEAM_MEMBERS.values())
    .filter(m => m.teamId === teamId);

  // In production, join with user data from database
  const membersWithUser = await Promise.all(
    members.map(async (member) => {
      const user = await prisma.user.findUnique({
        where: { id: member.userId },
        select: { id: true, name: true, email: true },
      });

      return {
        ...member,
        user: user || { id: member.userId, name: 'Unknown', email: 'unknown@example.com' },
      };
    })
  );

  return membersWithUser;
}

/**
 * Invite user to team
 */
export async function inviteToTeam(
  teamId: string,
  email: string,
  role: 'admin' | 'member',
  invitedBy: string
): Promise<TeamInvitation> {
  const team = TEAMS.get(teamId);
  if (!team) {
    throw new Error('Team not found');
  }

  // Check if user is already invited
  const existingInvite = Array.from(TEAM_INVITATIONS.values())
    .find(inv => inv.teamId === teamId && inv.email === email && inv.expiresAt > new Date());

  if (existingInvite) {
    throw new Error('User already invited');
  }

  // Check member limit
  const currentMembers = Array.from(TEAM_MEMBERS.values())
    .filter(m => m.teamId === teamId).length;

  if (currentMembers >= team.maxMembers) {
    throw new Error('Team member limit reached');
  }

  const invitation: TeamInvitation = {
    id: `inv_${crypto.randomBytes(8).toString('hex')}`,
    teamId,
    email,
    role,
    token: crypto.randomBytes(32).toString('hex'),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdBy: invitedBy,
    createdAt: new Date(),
  };

  TEAM_INVITATIONS.set(invitation.id, invitation);

  log.info('Team invitation created', { teamId, email, role });

  // In production, send invitation email

  return invitation;
}

/**
 * Accept team invitation
 */
export async function acceptInvitation(token: string, userId: string): Promise<TeamMember> {
  const invitation = Array.from(TEAM_INVITATIONS.values())
    .find(inv => inv.token === token);

  if (!invitation) {
    throw new Error('Invalid invitation');
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error('Invitation expired');
  }

  // Verify user email matches invitation
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user || user.email !== invitation.email) {
    throw new Error('Email mismatch');
  }

  // Check if already a member
  const existing = Array.from(TEAM_MEMBERS.values())
    .find(m => m.teamId === invitation.teamId && m.userId === userId);

  if (existing) {
    throw new Error('Already a team member');
  }

  const member: TeamMember = {
    id: `tm_${crypto.randomBytes(8).toString('hex')}`,
    teamId: invitation.teamId,
    userId,
    role: invitation.role,
    joinedAt: new Date(),
  };

  TEAM_MEMBERS.set(member.id, member);
  TEAM_INVITATIONS.delete(invitation.id);

  log.info('Team invitation accepted', {
    teamId: invitation.teamId,
    userId,
    role: invitation.role,
  });

  return member;
}

/**
 * Remove team member
 */
export async function removeTeamMember(
  teamId: string,
  userId: string,
  removedBy: string
): Promise<void> {
  const team = TEAMS.get(teamId);
  if (!team) {
    throw new Error('Team not found');
  }

  // Cannot remove owner
  if (userId === team.ownerId) {
    throw new Error('Cannot remove team owner');
  }

  // Check permissions
  const removerMember = Array.from(TEAM_MEMBERS.values())
    .find(m => m.teamId === teamId && m.userId === removedBy);

  if (!removerMember || (removerMember.role !== 'owner' && removerMember.role !== 'admin')) {
    throw new Error('Insufficient permissions');
  }

  const member = Array.from(TEAM_MEMBERS.values())
    .find(m => m.teamId === teamId && m.userId === userId);

  if (!member) {
    throw new Error('Member not found');
  }

  TEAM_MEMBERS.delete(member.id);

  log.info('Team member removed', { teamId, userId, removedBy });
}

/**
 * Update member role
 */
export async function updateMemberRole(
  teamId: string,
  userId: string,
  newRole: 'admin' | 'member',
  updatedBy: string
): Promise<void> {
  const team = TEAMS.get(teamId);
  if (!team) {
    throw new Error('Team not found');
  }

  // Only owner can update roles
  if (updatedBy !== team.ownerId) {
    throw new Error('Only owner can update roles');
  }

  const member = Array.from(TEAM_MEMBERS.values())
    .find(m => m.teamId === teamId && m.userId === userId);

  if (!member) {
    throw new Error('Member not found');
  }

  if (member.role === 'owner') {
    throw new Error('Cannot change owner role');
  }

  member.role = newRole;

  log.info('Member role updated', { teamId, userId, newRole, updatedBy });
}

/**
 * Delete team
 */
export async function deleteTeam(teamId: string, userId: string): Promise<void> {
  const team = TEAMS.get(teamId);
  if (!team) {
    throw new Error('Team not found');
  }

  if (team.ownerId !== userId) {
    throw new Error('Only owner can delete team');
  }

  // Remove all members
  const members = Array.from(TEAM_MEMBERS.values())
    .filter(m => m.teamId === teamId);

  for (const member of members) {
    TEAM_MEMBERS.delete(member.id);
  }

  // Remove all invitations
  const invitations = Array.from(TEAM_INVITATIONS.values())
    .filter(inv => inv.teamId === teamId);

  for (const invitation of invitations) {
    TEAM_INVITATIONS.delete(invitation.id);
  }

  TEAMS.delete(teamId);

  log.info('Team deleted', { teamId, ownerId: userId });
}

/**
 * Generate URL-friendly slug
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}
