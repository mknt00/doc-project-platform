const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');

// 配置 Multer 用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Controllers
const userController = require('../controllers/userController');
const projectController = require('../controllers/projectController');
const documentController = require('../controllers/documentController');
const taskController = require('../controllers/taskController');

// 公开路由
router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);
router.get('/documents/published', documentController.getPublishedDocuments);

// 需要认证的路由
router.use(authMiddleware);

// 用户路由
router.get('/users/me', userController.getCurrentUser);
router.get('/users', userController.getAllUsers);

// 项目路由
router.post('/projects', projectController.createProject);
router.get('/projects', projectController.getAllProjects);
router.get('/projects/:id', projectController.getProjectById);
router.put('/projects/:id', projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);
router.post('/projects/:id/members', projectController.addProjectMember);
router.delete('/projects/:id/members/:userId', projectController.removeProjectMember);

// 文档路由
router.post('/documents', upload.single('file'), documentController.createDocument);
router.get('/projects/:projectId/documents', documentController.getDocumentsByProject);
router.get('/documents/:id', documentController.getDocumentById);
router.get('/documents/:id/download', documentController.downloadFile);
router.put('/documents/:id', documentController.updateDocument);
router.post('/documents/:id/publish', documentController.publishDocument);
router.delete('/documents/:id', documentController.deleteDocument);

// 任务路由
router.post('/tasks', taskController.createTask);
router.get('/projects/:projectId/tasks', taskController.getTasksByProject);
router.get('/tasks/my', taskController.getTasksByUser);
router.get('/tasks/:id', taskController.getTaskById);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);

module.exports = router;
