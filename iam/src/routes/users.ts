import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { database } from '../database';
import { authenticate } from '../middleware/auth';
import { eventService } from '../services/eventService';

const router = Router();

// Get all users
router.get('/', authenticate, async (req, res) => {
  try {
    const users = await database.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await database.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user
router.post('/', authenticate, async (req, res) => {
  try {
    const userData = {
      id: uuidv4(),
      ...req.body
    };
    
    const user = await database.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const user = await database.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Publish event for cache invalidation
    await eventService.publishEvent('user.updated', { userId: req.params.id });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Block/unblock user
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await database.updateUser(req.params.id, { status });
    
    if (status === 'blocked') {
      // Publish user blocked event
      await eventService.publishEvent('user.blocked', { userId: req.params.id });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Delete user
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await database.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export { router as userRoutes };