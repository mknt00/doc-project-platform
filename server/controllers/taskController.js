const db = require('../models/database');

// 创建任务
exports.createTask = (req, res) => {
  const { title, description, project_id, assignee_id, priority, due_date } = req.body;

  db.run(
    'INSERT INTO tasks (title, description, project_id, assignee_id, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, project_id, assignee_id, priority || 'medium', due_date],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: 'Task created successfully',
        task: { id: this.lastID, title, description, project_id, assignee_id, priority, due_date }
      });
    }
  );
};

// 获取项目的所有任务
exports.getTasksByProject = (req, res) => {
  const { projectId } = req.params;

  db.all(
    `SELECT t.*, u.username as assignee_name 
     FROM tasks t 
     LEFT JOIN users u ON t.assignee_id = u.id 
     WHERE t.project_id = ? 
     ORDER BY t.created_at DESC`,
    [projectId],
    (err, tasks) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(tasks);
    }
  );
};

// 获取单个任务
exports.getTaskById = (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT t.*, u.username as assignee_name, p.name as project_name
     FROM tasks t 
     LEFT JOIN users u ON t.assignee_id = u.id
     LEFT JOIN projects p ON t.project_id = p.id
     WHERE t.id = ?`,
    [id],
    (err, task) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    }
  );
};

// 更新任务
exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, assignee_id, due_date } = req.body;

  db.run(
    'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, assignee_id = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, description, status, priority, assignee_id, due_date, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task updated successfully' });
    }
  );
};

// 删除任务
exports.deleteTask = (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
};

// 获取用户的所有任务
exports.getTasksByUser = (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT t.*, p.name as project_name
     FROM tasks t 
     LEFT JOIN projects p ON t.project_id = p.id
     WHERE t.assignee_id = ? 
     ORDER BY t.due_date ASC, t.priority DESC`,
    [userId],
    (err, tasks) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(tasks);
    }
  );
};
