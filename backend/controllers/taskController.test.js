const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData
} = require('./taskController');
const { Task } = require('../models/Task');
const { User } = require('../models/User');

// Mock dependencies
jest.mock('../models/Task');
jest.mock('../models/User');

describe('Task Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        _id: 'user123',
        role: 'user'
      },
      params: {},
      query: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should get all tasks for admin', async () => {
      req.user.role = 'admin';
      
      const mockTasks = [
        {
          _doc: {
            _id: 'task1',
            title: 'Task 1',
            status: 'pending',
            todoChecklist: [{ completed: true }, { completed: false }]
          },
          todoChecklist: [{ completed: true }, { completed: false }]
        }
      ];

      Task.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTasks)
      });
      Task.countDocuments.mockResolvedValue(10);

      await getTasks(req, res);

      expect(Task.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          tasks: expect.any(Array),
          statusSummary: expect.any(Object)
        })
      );
    });

    it('should get tasks for regular user', async () => {
      const mockTasks = [
        {
          _doc: {
            _id: 'task1',
            title: 'Task 1',
            status: 'pending',
            todoChecklist: []
          },
          todoChecklist: []
        }
      ];

      Task.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTasks)
      });
      Task.countDocuments.mockResolvedValue(5);

      await getTasks(req, res);

      expect(Task.find).toHaveBeenCalledWith(
        expect.objectContaining({ assignedTo: 'user123' })
      );
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getTaskById', () => {
    it('should get task by id for assigned user', async () => {
      req.params.id = 'task1';

      const mockTask = {
        _id: 'task1',
        title: 'Task 1',
        assignedTo: [{ _id: 'user123' }]
      };

      Task.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTask)
      });

      await getTaskById(req, res);

      expect(Task.findById).toHaveBeenCalledWith('task1');
      expect(res.json).toHaveBeenCalledWith(mockTask);
    });

    it('should return 404 if task not found', async () => {
      req.params.id = 'nonexistent';

      Task.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tâche non trouvée' });
    });

    it('should return 403 if user not authorized', async () => {
      req.params.id = 'task1';

      const mockTask = {
        _id: 'task1',
        title: 'Task 1',
        assignedTo: [{ _id: 'otherUser' }]
      };

      Task.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTask)
      });

      await getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Non autorisé à accéder à cette tâche'
      });
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      req.body = {
        title: 'New Task',
        description: 'Description',
        dueDate: '2025-12-31',
        assignedTo: ['user123'],
        priority: 'high',
        todoChecklist: []
      };

      const mockTask = {
        _id: 'task1',
        ...req.body,
        createdBy: 'user123'
      };

      Task.create.mockResolvedValue(mockTask);

      await createTask(req, res);

      expect(Task.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTask);
    });

    it('should return 400 if assignedTo is not an array', async () => {
      req.body = {
        title: 'New Task',
        assignedTo: 'user123'
      };

      await createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'assignedTo doit être un tableau'
      });
    });
  });

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      req.params.id = 'task1';
      req.body = {
        title: 'Updated Task',
        description: 'Updated Description'
      };

      const mockTask = {
        _id: 'task1',
        title: 'Old Task',
        description: 'Old Description',
        save: jest.fn().mockResolvedValue({
          _id: 'task1',
          title: 'Updated Task',
          description: 'Updated Description'
        })
      };

      Task.findById.mockResolvedValue(mockTask);

      await updateTask(req, res);

      expect(mockTask.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Tâche mise à jour avec succès'
        })
      );
    });

    it('should return 404 if task not found', async () => {
      req.params.id = 'nonexistent';
      Task.findById.mockResolvedValue(null);

      await updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tâche non trouvée' });
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      req.params.id = 'task1';

      const mockTask = {
        _id: 'task1',
        title: 'Task to delete'
      };

      Task.findByIdAndDelete.mockResolvedValue(mockTask);

      await deleteTask(req, res);

      expect(Task.findByIdAndDelete).toHaveBeenCalledWith('task1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Tâche supprimée avec succès'
        })
      );
    });

    it('should return 404 if task not found', async () => {
      req.params.id = 'nonexistent';
      Task.findByIdAndDelete.mockResolvedValue(null);

      await deleteTask(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tâche non trouvée' });
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status successfully', async () => {
      req.params.id = 'task1';
      req.body = { status: 'completed' };

      const mockTask = {
        _id: 'task1',
        status: 'pending',
        assignedTo: ['user123'],
        todoChecklist: [{ completed: false }, { completed: false }],
        save: jest.fn().mockResolvedValue(true)
      };

      Task.findById.mockResolvedValue(mockTask);

      await updateTaskStatus(req, res);

      expect(mockTask.save).toHaveBeenCalled();
      expect(mockTask.status).toBe('completed');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Statut mis à jour avec succès'
        })
      );
    });

    it('should return 403 if user not authorized', async () => {
      req.params.id = 'task1';
      req.body = { status: 'completed' };

      const mockTask = {
        _id: 'task1',
        assignedTo: ['otherUser']
      };

      Task.findById.mockResolvedValue(mockTask);

      await updateTaskStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Non autorisé' });
    });
  });

  describe('updateTaskChecklist', () => {
    it('should update task checklist successfully', async () => {
      req.params.id = 'task1';
      req.body = {
        todoChecklist: [
          { completed: true },
          { completed: true }
        ]
      };

      const mockTask = {
        _id: 'task1',
        assignedTo: ['user123'],
        todoChecklist: [],
        save: jest.fn().mockResolvedValue(true)
      };

      Task.findById
        .mockResolvedValueOnce(mockTask)
        .mockReturnValueOnce({
          populate: jest.fn().mockResolvedValue({
            ...mockTask,
            status: 'completed',
            progress: 100
          })
        });

      await updateTaskChecklist(req, res);

      expect(mockTask.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Checklist mise à jour avec succès'
        })
      );
    });
  });

  describe('getDashboardData', () => {
    it('should get dashboard data for admin', async () => {
      Task.countDocuments.mockResolvedValue(100);
      Task.aggregate.mockResolvedValue([
        { _id: 'pending', count: 30 },
        { _id: 'in-progress', count: 40 },
        { _id: 'completed', count: 30 }
      ]);
      Task.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([])
      });

      await getDashboardData(req, res);

      expect(Task.countDocuments).toHaveBeenCalled();
      expect(Task.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statistics: expect.any(Object),
          charts: expect.any(Object),
          recentTasks: expect.any(Array)
        })
      );
    });
  });

  describe('getUserDashboardData', () => {
    it('should get dashboard data for regular user', async () => {
      Task.countDocuments.mockResolvedValue(10);
      Task.aggregate.mockResolvedValue([
        { _id: 'pending', count: 3 },
        { _id: 'in-progress', count: 4 },
        { _id: 'completed', count: 3 }
      ]);
      Task.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([])
      });

      await getUserDashboardData(req, res);

      expect(Task.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ assignedTo: 'user123' })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statistics: expect.any(Object),
          charts: expect.any(Object),
          recentTasks: expect.any(Array)
        })
      );
    });
  });
});
