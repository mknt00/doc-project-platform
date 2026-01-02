const db = require('../models/database');

// 创建项目
exports.createProject = (req, res) => {
  const { name, description } = req.body;
  const owner_id = req.user.id;

  db.run(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)',
    [name, description, owner_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // 自动添加创建者为项目成员
      db.run(
        'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
        [this.lastID, owner_id, 'owner'],
        (err) => {
          if (err) {
            console.error('Error adding owner to project members:', err);
          }
        }
      );

      res.status(201).json({
        message: 'Project created successfully',
        project: { id: this.lastID, name, description, owner_id }
      });
    }
  );
};

// 获取所有项目
exports.getAllProjects = (req, res) => {
  const userId = req.user.id;

  // 获取用户参与的所有项目
  const query = `
    SELECT DISTINCT p.*, u.username as owner_name
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    LEFT JOIN project_members pm ON p.id = pm.project_id
    WHERE p.owner_id = ? OR pm.user_id = ?
    ORDER BY p.updated_at DESC
  `;

  db.all(query, [userId, userId], (err, projects) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(projects);
  });
};

// 获取单个项目详情
exports.getProjectById = (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT p.*, u.username as owner_name 
     FROM projects p 
     LEFT JOIN users u ON p.owner_id = u.id 
     WHERE p.id = ?`,
    [id],
    (err, project) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // 获取项目成员
      db.all(
        `SELECT u.id, u.username, u.email, pm.role, pm.joined_at
         FROM project_members pm
         JOIN users u ON pm.user_id = u.id
         WHERE pm.project_id = ?`,
        [id],
        (err, members) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          project.members = members;
          res.json(project);
        }
      );
    }
  );
};

// 更新项目
exports.updateProject = (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;

  db.run(
    'UPDATE projects SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, description, status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ message: 'Project updated successfully' });
    }
  );
};

// 删除项目
exports.deleteProject = (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  });
};

// 添加项目成员
exports.addProjectMember = (req, res) => {
  const { id } = req.params;
  const { user_id, role } = req.body;

  db.run(
    'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
    [id, user_id, role || 'member'],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'User is already a member of this project' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Member added successfully' });
    }
  );
};

// 移除项目成员
exports.removeProjectMember = (req, res) => {
  const { id, userId } = req.params;

  db.run(
    'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
    [id, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }
      res.json({ message: 'Member removed successfully' });
    }
  );
};
