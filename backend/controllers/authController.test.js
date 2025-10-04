const {
  registerUser,
  LoginUser,
  logoutUser,
  getUserprofile,
  updateUserProfile,
  forgotPassword,
  resetPassword
} = require('./authController');
const { User } = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: {
        _id: 'user123',
        email: 'test@example.com'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis()
    };
    process.env.JWT_SECRET = 'test-secret';
    process.env.ADMIN_EMAIL = 'admin@example.com';
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        profile: 'Developer'
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        profile: 'Developer',
        role: 'user'
      });
      jwt.sign.mockReturnValue('token123');

      await registerUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          token: 'token123'
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = { email: 'test@example.com' };

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Veuillez fournir tous les champs requis'
      });
    });

    it('should return 400 if user already exists', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Un utilisateur avec cet email existe déjà'
      });
    });
  });

  describe('LoginUser', () => {
    it('should login user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        profile: 'Developer',
        role: 'user'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token123');

      await LoginUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          token: 'token123'
        })
      );
    });

    it('should return 400 if email not found', async () => {
      req.body = {
        email: 'notfound@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null);

      await LoginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email non trouvé' });
    });

    it('should return 400 if password is incorrect', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      User.findOne.mockResolvedValue({
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      bcrypt.compare.mockResolvedValue(false);

      await LoginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Mot de passe incorrect' });
    });
  });

  describe('logoutUser', () => {
    it('should logout user successfully', async () => {
      await logoutUser(req, res);

      expect(res.cookie).toHaveBeenCalledWith('token', '', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Déconnexion réussie' });
    });
  });

  describe('getUserprofile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        profile: 'Developer'
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await getUserprofile(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await getUserprofile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur non trouvé' });
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      req.body = {
        name: 'Updated Name',
        email: 'updated@example.com',
        profile: 'Senior Developer'
      };

      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        profile: 'Developer',
        role: 'user',
        save: jest.fn().mockResolvedValue({
          _id: 'user123',
          name: 'Updated Name',
          email: 'updated@example.com',
          profile: 'Senior Developer',
          role: 'user'
        })
      };

      User.findById.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('newToken123');

      await updateUserProfile(req, res);

      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Name',
          email: 'updated@example.com'
        })
      );
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await updateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur non trouvé' });
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token in development mode', async () => {
      process.env.NODE_ENV = 'development';
      req.body = { email: 'test@example.com' };
      req.protocol = 'http';
      req.get = jest.fn().mockReturnValue('localhost:5000');

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);

      await forgotPassword(req, res);

      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Un email de réinitialisation a été envoyé',
          resetToken: expect.any(String)
        })
      );
    });

    it('should return 404 if user not found', async () => {
      req.body = { email: 'notfound@example.com' };
      User.findOne.mockResolvedValue(null);

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Aucun utilisateur trouvé avec cet email'
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      req.body = {
        token: 'validToken',
        newPassword: 'newPassword123'
      };

      const mockUser = {
        _id: 'user123',
        resetPasswordToken: 'validToken',
        resetPasswordExpires: Date.now() + 3600000,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedNewPassword');

      await resetPassword(req, res);

      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Mot de passe réinitialisé avec succès'
      });
    });

    it('should return 400 if token is invalid or expired', async () => {
      req.body = {
        token: 'invalidToken',
        newPassword: 'newPassword123'
      };

      User.findOne.mockResolvedValue(null);

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token invalide ou expiré' });
    });
  });
});
