const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('./userController');
const { User } = require('../models/User');
const { Task } = require('../models/Task');

// Mock dependencies
jest.mock('../models/User');
jest.mock('../models/Task');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        _id: 'admin123',
        role: 'admin'
      },
      params: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should get all users with task counts', async () => {
      const mockUsers = [
        {
          _doc: {
            _id: 'user1',
            name: 'User 1',
            email: 'user1@test.com',
            role: 'user'
          }
        },
        {
          _doc: {
            _id: 'user2',
            name: 'User 2',
            email: 'user2@test.com',
            role: 'user'
          }
        }
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers)
      });
      Task.countDocuments.mockResolvedValue(5);

      await getUsers(req, res);

      expect(User.find).toHaveBeenCalledWith({ role: 'user' });
      expect(Task.countDocuments).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            pendingTask: expect.any(Number),
            inProgressTask: expect.any(Number),
            completedTask: expect.any(Number)
          })
        ])
      );
    });
  });

  describe('getUserById', () => {
    it('should get user by id with task statistics', async () => {
      req.params.id = 'user1';

      const mockUser = {
        _doc: {
          _id: 'user1',
          name: 'User 1',
          email: 'user1@test.com',
          role: 'user'
        }
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      Task.countDocuments.mockResolvedValue(3);

      await getUserById(req, res);

      expect(User.findById).toHaveBeenCalledWith('user1');
      expect(Task.countDocuments).toHaveBeenCalledTimes(3);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'user1',
          pendingTask: expect.any(Number),
          inProgressTask: expect.any(Number),
          completedTask: expect.any(Number)
        })
      );
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 'nonexistent';

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Utilisateur non trouvé'
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      req.params.id = 'user1';
      req.body = {
        name: 'Updated Name',
        email: 'updated@test.com',
        role: 'admin',
        profile: 'Manager'
      };

      const mockUser = {
        _id: 'user1',
        name: 'Old Name',
        email: 'old@test.com',
        role: 'user',
        profile: 'Developer',
        save: jest.fn().mockResolvedValue({
          _id: 'user1',
          name: 'Updated Name',
          email: 'updated@test.com',
          role: 'admin',
          profile: 'Manager'
        })
      };

      User.findById.mockResolvedValue(mockUser);

      await updateUser(req, res);

      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Utilisateur mis à jour avec succès',
          user: expect.objectContaining({
            name: 'Updated Name',
            email: 'updated@test.com'
          })
        })
      );
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 'nonexistent';
      User.findById.mockResolvedValue(null);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Utilisateur non trouvé'
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user and remove from assigned tasks', async () => {
      req.params.id = 'user1';

      const mockUser = {
        _id: 'user1',
        name: 'User to delete',
        email: 'delete@test.com'
      };

      User.findById.mockResolvedValue(mockUser);
      Task.updateMany.mockResolvedValue({ modifiedCount: 5 });
      User.findByIdAndDelete.mockResolvedValue(mockUser);

      await deleteUser(req, res);

      expect(Task.updateMany).toHaveBeenCalledWith(
        { assignedTo: mockUser._id },
        { $pull: { assignedTo: mockUser._id } }
      );
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user1');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Utilisateur supprimé avec succès'
      });
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 'nonexistent';
      User.findById.mockResolvedValue(null);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Utilisateur non trouvé'
      });
    });
  });
});
