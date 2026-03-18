import { Router } from 'express';
import {
  createTeam,
  getTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  listTeams
} from '../controllers/teamController';
import { requirePermission } from '../middleware/permission';

const router = Router();

/**
 * Team Routes
 * v2.2.0 - 团队管理路由
 */

// 获取用户的团队列表
router.get('/teams', listTeams);

// 创建团队
router.post('/teams', createTeam);

// 获取团队详情
router.get('/teams/:id', requirePermission('team:read'), getTeam);

// 更新团队
router.patch('/teams/:id', requirePermission('team:write'), updateTeam);

// 删除团队
router.delete('/teams/:id', requirePermission('team:delete'), deleteTeam);

// 添加团队成员
router.post('/teams/:id/members', requirePermission('team:write'), addTeamMember);

// 移除团队成员
router.delete('/teams/:id/members/:userId', requirePermission('team:write'), removeTeamMember);

export default router;
