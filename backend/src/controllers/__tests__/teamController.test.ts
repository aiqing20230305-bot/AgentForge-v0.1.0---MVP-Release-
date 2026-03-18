import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import { createTeam, getTeam, updateTeam, deleteTeam, addTeamMember, removeTeamMember, listTeams } from '../teamController';

/**
 * Team Controller集成测试
 * v2.2.0 Phase 3.2
 */

// Mock Express app
const app: Express = express();
app.use(express.json());

// Mock auth middleware
app.use((req: any, res, next) => {
  req.user = { id: 'test-user-1', roles: ['owner'] };
  next();
});

// Mount routes
app.post('/api/teams', createTeam);
app.get('/api/teams/:id', getTeam);
app.patch('/api/teams/:id', updateTeam);
app.delete('/api/teams/:id', deleteTeam);
app.post('/api/teams/:id/members', addTeamMember);
app.delete('/api/teams/:id/members/:userId', removeTeamMember);
app.get('/api/teams', listTeams);

describe('Team Controller API', () => {
  let createdTeamId: string;

  describe('POST /api/teams', () => {
    it('should create a new team', async () => {
      const response = await request(app)
        .post('/api/teams')
        .send({
          name: 'Test Team',
          description: 'A test team for integration testing',
        })
        .expect(201);

      expect(response.body.team).toBeDefined();
      expect(response.body.team.name).toBe('Test Team');
      expect(response.body.team.description).toBe('A test team for integration testing');
      expect(response.body.team.owner).toBe('test-user-1');

      createdTeamId = response.body.team.id;
    });

    it('should reject team creation without name', async () => {
      const response = await request(app)
        .post('/api/teams')
        .send({
          description: 'Team without name',
        })
        .expect(400);

      expect(response.body.error).toBe('Team name is required');
    });

    it('should add creator as owner member', async () => {
      const response = await request(app)
        .post('/api/teams')
        .send({
          name: 'Team with Owner',
        })
        .expect(201);

      expect(response.body.team.members).toHaveLength(1);
      expect(response.body.team.members[0].userId).toBe('test-user-1');
      expect(response.body.team.members[0].roleId).toBe('owner');
    });
  });

  describe('GET /api/teams/:id', () => {
    it('should get team by id', async () => {
      const response = await request(app)
        .get(`/api/teams/${createdTeamId}`)
        .expect(200);

      expect(response.body.team).toBeDefined();
      expect(response.body.team.id).toBe(createdTeamId);
      expect(response.body.team.name).toBe('Test Team');
    });

    it('should return 404 for non-existent team', async () => {
      const response = await request(app)
        .get('/api/teams/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Team not found');
    });
  });

  describe('PATCH /api/teams/:id', () => {
    it('should update team name', async () => {
      const response = await request(app)
        .patch(`/api/teams/${createdTeamId}`)
        .send({
          name: 'Updated Team Name',
        })
        .expect(200);

      expect(response.body.team.name).toBe('Updated Team Name');
    });

    it('should update team description', async () => {
      const response = await request(app)
        .patch(`/api/teams/${createdTeamId}`)
        .send({
          description: 'Updated description',
        })
        .expect(200);

      expect(response.body.team.description).toBe('Updated description');
    });

    it('should return 404 for non-existent team', async () => {
      await request(app)
        .patch('/api/teams/non-existent-id')
        .send({ name: 'New Name' })
        .expect(404);
    });
  });

  describe('POST /api/teams/:id/members', () => {
    it('should add a new member', async () => {
      const response = await request(app)
        .post(`/api/teams/${createdTeamId}/members`)
        .send({
          userId: 'test-user-2',
          roleId: 'developer',
        })
        .expect(200);

      expect(response.body.team.members).toHaveLength(2);
      const newMember = response.body.team.members.find((m: any) => m.userId === 'test-user-2');
      expect(newMember).toBeDefined();
      expect(newMember.roleId).toBe('developer');
    });

    it('should reject duplicate member', async () => {
      const response = await request(app)
        .post(`/api/teams/${createdTeamId}/members`)
        .send({
          userId: 'test-user-2',
          roleId: 'developer',
        })
        .expect(400);

      expect(response.body.error).toBe('User is already a team member');
    });

    it('should default to member role if not specified', async () => {
      const response = await request(app)
        .post(`/api/teams/${createdTeamId}/members`)
        .send({
          userId: 'test-user-3',
        })
        .expect(200);

      const newMember = response.body.team.members.find((m: any) => m.userId === 'test-user-3');
      expect(newMember.roleId).toBe('member');
    });
  });

  describe('DELETE /api/teams/:id/members/:userId', () => {
    it('should remove a member', async () => {
      const response = await request(app)
        .delete(`/api/teams/${createdTeamId}/members/test-user-2`)
        .expect(200);

      expect(response.body.team.members).not.toContainEqual(
        expect.objectContaining({ userId: 'test-user-2' })
      );
    });

    it('should not allow removing team owner', async () => {
      const response = await request(app)
        .delete(`/api/teams/${createdTeamId}/members/test-user-1`)
        .expect(400);

      expect(response.body.error).toBe('Cannot remove team owner');
    });

    it('should return 404 for non-existent team', async () => {
      await request(app)
        .delete('/api/teams/non-existent-id/members/test-user-2')
        .expect(404);
    });
  });

  describe('GET /api/teams', () => {
    it('should list all teams for user', async () => {
      const response = await request(app)
        .get('/api/teams')
        .expect(200);

      expect(response.body.teams).toBeDefined();
      expect(Array.isArray(response.body.teams)).toBe(true);
      expect(response.body.teams.length).toBeGreaterThan(0);
    });

    it('should include teams where user is owner', async () => {
      const response = await request(app)
        .get('/api/teams')
        .expect(200);

      const ownedTeams = response.body.teams.filter((t: any) => t.owner === 'test-user-1');
      expect(ownedTeams.length).toBeGreaterThan(0);
    });

    it('should include teams where user is member', async () => {
      // 创建一个新团队并添加当前用户为成员
      const createResponse = await request(app)
        .post('/api/teams')
        .send({ name: 'Member Team' });

      await request(app)
        .post(`/api/teams/${createResponse.body.team.id}/members`)
        .send({ userId: 'test-user-1', roleId: 'developer' });

      const listResponse = await request(app)
        .get('/api/teams')
        .expect(200);

      expect(listResponse.body.teams.some((t: any) =>
        t.members.some((m: any) => m.userId === 'test-user-1')
      )).toBe(true);
    });
  });

  describe('DELETE /api/teams/:id', () => {
    it('should delete team', async () => {
      await request(app)
        .delete(`/api/teams/${createdTeamId}`)
        .expect(200);

      // 验证已删除
      await request(app)
        .get(`/api/teams/${createdTeamId}`)
        .expect(404);
    });

    it('should return 404 for non-existent team', async () => {
      await request(app)
        .delete('/api/teams/non-existent-id')
        .expect(404);
    });
  });
});
