const { exportTaskReport, exportUsersReport, exportMyTasksReport } = require('./reportController');
const { User } = require('../models/User');
const { Task } = require('../models/Task');
const ExcelJS = require('exceljs');

// Mock dependencies
jest.mock('../models/User');
jest.mock('../models/Task');
jest.mock('exceljs');

describe('Report Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      end: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('exportTaskReport', () => {
    it('should export all tasks as Excel file', async () => {
      const mockTasks = [
        {
          _id: 'task1',
          title: 'Task 1',
          status: 'Pending',
          priority: 'high',
          description: 'Description 1',
          dueDate: new Date('2025-12-31'),
          assignedTo: [{ name: 'User 1', email: 'user1@test.com' }]
        }
      ];

      Task.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTasks)
      });

      const mockWorkbook = {
        addWorksheet: jest.fn().mockReturnValue({
          columns: [],
          addRow: jest.fn()
        }),
        xlsx: {
          write: jest.fn().mockResolvedValue(true)
        }
      };

      ExcelJS.Workbook.mockImplementation(() => mockWorkbook);

      await exportTaskReport(req, res);

      expect(Task.find).toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(res.end).toHaveBeenCalled();
    });

    it('should handle errors when exporting tasks', async () => {
      Task.find.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await exportTaskReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error exporting tasks',
        error: 'Database error'
      });
    });
  });

  describe('exportUsersReport', () => {
    it('should export users report with task statistics', async () => {
      const mockUsers = [
        { _id: 'user1', name: 'User 1', email: 'user1@test.com' }
      ];

      const mockTasks = [
        {
          assignedTo: [{ _id: 'user1', name: 'User 1', email: 'user1@test.com' }],
          status: 'Pending'
        }
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers)
      });

      Task.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTasks)
      });

      const mockWorkbook = {
        addWorksheet: jest.fn().mockReturnValue({
          columns: [],
          addRow: jest.fn()
        }),
        xlsx: {
          write: jest.fn().mockResolvedValue(true)
        }
      };

      ExcelJS.Workbook.mockImplementation(() => mockWorkbook);

      await exportUsersReport(req, res);

      expect(User.find).toHaveBeenCalled();
      expect(Task.find).toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
    });

    it('should handle errors when exporting users report', async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await exportUsersReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error exporting users report',
        error: 'Database error'
      });
    });
  });

  describe('exportMyTasksReport', () => {
    it('should export current user tasks', async () => {
      const mockTasks = [
        {
          _id: 'task1',
          title: 'My Task',
          status: 'In Progress',
          priority: 'medium',
          description: 'My description',
          dueDate: new Date('2025-12-31'),
          assignedTo: [{ _id: 'user123', name: 'Test User', email: 'test@example.com' }]
        }
      ];

      Task.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTasks)
      });

      const mockWorkbook = {
        addWorksheet: jest.fn().mockReturnValue({
          columns: [],
          addRow: jest.fn()
        }),
        xlsx: {
          write: jest.fn().mockResolvedValue(true)
        }
      };

      ExcelJS.Workbook.mockImplementation(() => mockWorkbook);

      await exportMyTasksReport(req, res);

      expect(Task.find).toHaveBeenCalledWith({ assignedTo: 'user123' });
      expect(res.setHeader).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
    });

    it('should handle errors when exporting my tasks', async () => {
      Task.find.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await exportMyTasksReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error exporting my tasks',
        error: 'Database error'
      });
    });
  });
});
