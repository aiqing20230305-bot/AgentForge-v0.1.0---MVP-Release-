import { Request, Response } from 'express';
import { Team } from '../models/Team';
import { hasPermission, getUserPermissions } from '../services/permissions/rbac';

/**
 * Team CRUD Controller
 * v2.2.0 - 团队管理API
 */

// 创建团队
export async function createTeam(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    const userId = req.user?.id; // 来自认证中间件

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const team = await Team.create({
      name,
      description,
      owner: userId,
      members: [{
        userId,
        roleId: 'owner',
        joinedAt: new Date(),
        invitedBy: userId
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({ team });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
}

// 获取团队详情
export async function getTeam(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // 检查权限
    const userPermissions = getUserPermissions(req.user?.roles || []);
    if (!hasPermission(userPermissions, 'team:read')) {
      return res.status(403).json({ error: 'No permission to view team' });
    }

    res.json({ team });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Failed to get team' });
  }
}

// 更新团队
export async function updateTeam(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // 检查权限
    const userPermissions = getUserPermissions(req.user?.roles || []);
    if (!hasPermission(userPermissions, 'team:write')) {
      return res.status(403).json({ error: 'No permission to update team' });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { 
        name: name || team.name,
        description: description || team.description,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({ team: updatedTeam });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
}

// 删除团队
export async function deleteTeam(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // 检查权限（只有owner可以删除）
    const userPermissions = getUserPermissions(req.user?.roles || []);
    if (!hasPermission(userPermissions, 'team:delete') && team.owner !== req.user?.id) {
      return res.status(403).json({ error: 'Only team owner can delete team' });
    }

    await Team.findByIdAndDelete(id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
}

// 添加团队成员
export async function addTeamMember(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId, roleId } = req.body;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // 检查权限
    const userPermissions = getUserPermissions(req.user?.roles || []);
    if (!hasPermission(userPermissions, 'team:write')) {
      return res.status(403).json({ error: 'No permission to add members' });
    }

    // 检查成员是否已存在
    const existingMember = team.members.find(m => m.userId === userId);
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a team member' });
    }

    team.members.push({
      userId,
      roleId: roleId || 'member',
      joinedAt: new Date(),
      invitedBy: req.user?.id || ''
    });
    team.updatedAt = new Date();
    
    await team.save();

    res.json({ team });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
}

// 移除团队成员
export async function removeTeamMember(req: Request, res: Response) {
  try {
    const { id, userId } = req.params;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // 检查权限
    const userPermissions = getUserPermissions(req.user?.roles || []);
    if (!hasPermission(userPermissions, 'team:write')) {
      return res.status(403).json({ error: 'No permission to remove members' });
    }

    // 不能移除owner
    if (team.owner === userId) {
      return res.status(400).json({ error: 'Cannot remove team owner' });
    }

    team.members = team.members.filter(m => m.userId !== userId);
    team.updatedAt = new Date();
    
    await team.save();

    res.json({ team });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
}

// 获取团队列表
export async function listTeams(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
    // 获取用户所属的所有团队
    const teams = await Team.find({
      $or: [
        { owner: userId },
        { 'members.userId': userId }
      ]
    });

    res.json({ teams });
  } catch (error) {
    console.error('List teams error:', error);
    res.status(500).json({ error: 'Failed to list teams' });
  }
}
