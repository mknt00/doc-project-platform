const db = require('../models/database');
const marked = require('marked');

// 创建文档
exports.createDocument = (req, res) => {
  const { title, content, project_id, version } = req.body;
  const author_id = req.user.id;
  
  let file_path = null;
  let file_name = null;
  let file_size = null;
  let file_type = null;

  if (req.file) {
    file_path = req.file.path;
    file_name = req.file.originalname;
    file_size = req.file.size;
    file_type = req.file.mimetype;
  }

  db.run(
    'INSERT INTO documents (title, content, project_id, author_id, version, file_path, file_name, file_size, file_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, content, project_id, author_id, version || '1.0', file_path, file_name, file_size, file_type],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: 'Document created successfully',
        document: { id: this.lastID, title, content, project_id, author_id, version, file_name }
      });
    }
  );
};

// 下载文档文件
exports.downloadFile = (req, res) => {
  const { id } = req.params;
  db.get('SELECT file_path, file_name FROM documents WHERE id = ?', [id], (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!doc || !doc.file_path) return res.status(404).json({ error: 'File not found' });
    
    res.download(doc.file_path, doc.file_name);
  });
};

// 获取项目的所有文档
exports.getDocumentsByProject = (req, res) => {
  const { projectId } = req.params;

  db.all(
    `SELECT d.*, u.username as author_name 
     FROM documents d 
     LEFT JOIN users u ON d.author_id = u.id 
     WHERE d.project_id = ? 
     ORDER BY d.updated_at DESC`,
    [projectId],
    (err, documents) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(documents);
    }
  );
};

// 获取单个文档
exports.getDocumentById = (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT d.*, u.username as author_name, p.name as project_name
     FROM documents d 
     LEFT JOIN users u ON d.author_id = u.id
     LEFT JOIN projects p ON d.project_id = p.id
     WHERE d.id = ?`,
    [id],
    (err, document) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // 将Markdown转换为HTML
      if (document.content) {
        document.html_content = marked.parse(document.content);
      }

      res.json(document);
    }
  );
};

// 更新文档
exports.updateDocument = (req, res) => {
  const { id } = req.params;
  const { title, content, version, status } = req.body;

  db.run(
    'UPDATE documents SET title = ?, content = ?, version = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, content, version, status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json({ message: 'Document updated successfully' });
    }
  );
};

// 发布文档
exports.publishDocument = (req, res) => {
  const { id } = req.params;

  db.run(
    'UPDATE documents SET status = ?, published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    ['published', id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json({ message: 'Document published successfully' });
    }
  );
};

// 删除文档
exports.deleteDocument = (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM documents WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  });
};

// 获取已发布的文档（公开访问）
exports.getPublishedDocuments = (req, res) => {
  db.all(
    `SELECT d.id, d.title, d.version, d.published_at, d.project_id,
            u.username as author_name, p.name as project_name
     FROM documents d 
     LEFT JOIN users u ON d.author_id = u.id
     LEFT JOIN projects p ON d.project_id = p.id
     WHERE d.status = 'published' 
     ORDER BY d.published_at DESC`,
    (err, documents) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(documents);
    }
  );
};
