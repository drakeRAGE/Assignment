const express = require('express');
const Task = require('../models/Task');
const Action = require('../models/Action');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'username')
      .populate('createdBy', 'username')
      .populate('lastEditedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo } = req.body;
    
    // Check if task title is unique
    const existingTask = await Task.findOne({ title });
    if (existingTask) {
      return res.status(400).json({ message: 'Task title must be unique' });
    }
    
    // Check if title matches column names
    if (['Todo', 'In Progress', 'Done'].includes(title)) {
      return res.status(400).json({ message: 'Task title cannot match column names' });
    }
    
    // Create new task
    const task = new Task({
      title,
      description,
      status,
      priority,
      assignedTo,
      createdBy: req.user.userId,
      lastEditedBy: req.user.userId
    });
    
    await task.save();
    
    // Log action
    const action = new Action({
      user: req.user.userId,
      taskId: task._id,
      actionType: 'create',
      details: { task: task.title }
    });
    
    await action.save();
    
    // Populate user data for task
    await task.populate('assignedTo', 'username');
    await task.populate('createdBy', 'username');
    await task.populate('lastEditedBy', 'username');
    
    // Populate action data before emitting
    await action.populate('user', 'username');
    await action.populate('taskId', 'title');
    
    // Emit socket event (handled in socket.js)
    req.app.get('io').emit('taskCreated', task);
    req.app.get('io').emit('actionLogged', action);
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo } = req.body;
    const taskId = req.params.id;
    
    // Find task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if task is being edited by someone else
    if (task.isBeingEdited && task.editingBy.toString() !== req.user.userId) {
      return res.status(409).json({
        message: 'Task is being edited by another user',
        conflict: true,
        currentVersion: task
      });
    }
    
    // Check if title is unique (if changed)
    if (title !== task.title) {
      const existingTask = await Task.findOne({ title });
      if (existingTask) {
        return res.status(400).json({ message: 'Task title must be unique' });
      }
      
      // Check if title matches column names
      if (['Todo', 'In Progress', 'Done'].includes(title)) {
        return res.status(400).json({ message: 'Task title cannot match column names' });
      }
    }
    
    // Update task
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.assignedTo = assignedTo || task.assignedTo;
    task.lastEditedBy = req.user.userId;
    task.lastEditedAt = Date.now();
    task.version += 1;
    task.isBeingEdited = false;
    task.editingBy = null;
    
    await task.save();
    
    // Log action
    const action = new Action({
      user: req.user.userId,
      taskId: task._id,
      actionType: 'update',
      details: { task: task.title }
    });
    
    await action.save();
    
    // Populate user data for task
    await task.populate('assignedTo', 'username');
    await task.populate('createdBy', 'username');
    await task.populate('lastEditedBy', 'username');
    
    // Populate action data before emitting
    await action.populate('user', 'username');
    await action.populate('taskId', 'title');
    
    // Emit socket event
    req.app.get('io').emit('taskUpdated', task);
    req.app.get('io').emit('actionLogged', action);
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    // Log action
    const action = new Action({
      user: req.user.userId,
      taskId: task._id,
      actionType: 'delete',
      details: { task: task.title }
    });
    
    await action.save();
    
    // Populate action data before emitting
    await action.populate('user', 'username');
    await action.populate('taskId', 'title');
    
    // Emit socket event
    req.app.get('io').emit('taskDeleted', req.params.id);
    req.app.get('io').emit('actionLogged', action);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start editing a task (lock it)
router.post('/:id/start-editing', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if task is already being edited
    if (task.isBeingEdited && task.editingBy.toString() !== req.user.userId) {
      return res.status(409).json({
        message: 'Task is being edited by another user',
        conflict: true
      });
    }
    
    // Lock task for editing
    task.isBeingEdited = true;
    task.editingBy = req.user.userId;
    await task.save();
    
    // Emit socket event
    req.app.get('io').emit('taskEditStarted', {
      taskId: task._id,
      editingBy: req.user.userId
    });
    
    res.json({ message: 'Task locked for editing' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel editing a task (unlock it)
router.post('/:id/cancel-editing', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Only the user who locked it can unlock it
    if (task.isBeingEdited && task.editingBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You are not authorized to unlock this task' });
    }
    
    // Unlock task
    task.isBeingEdited = false;
    task.editingBy = null;
    await task.save();
    
    // Emit socket event
    req.app.get('io').emit('taskEditCancelled', {
      taskId: task._id
    });
    
    res.json({ message: 'Task unlocked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Resolve conflict
router.post('/:id/resolve-conflict', auth, async (req, res) => {
  try {
    const { resolution, mergedData } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (resolution === 'merge' && mergedData) {
      // Apply merged data
      task.title = mergedData.title || task.title;
      task.description = mergedData.description || task.description;
      task.status = mergedData.status || task.status;
      task.priority = mergedData.priority || task.priority;
      task.assignedTo = mergedData.assignedTo || task.assignedTo;
    } else if (resolution === 'overwrite') {
      // Current version is kept, nothing to do
    } else {
      return res.status(400).json({ message: 'Invalid resolution type' });
    }
    
    // Update metadata
    task.lastEditedBy = req.user.userId;
    task.lastEditedAt = Date.now();
    task.version += 1;
    task.isBeingEdited = false;
    task.editingBy = null;
    
    await task.save();
    
    // Log action
    const action = new Action({
      user: req.user.userId,
      taskId: task._id,
      actionType: 'resolve_conflict',
      details: { task: task.title, resolution }
    });
    
    await action.save();
    
    // Populate user data for task
    await task.populate('assignedTo', 'username');
    await task.populate('createdBy', 'username');
    await task.populate('lastEditedBy', 'username');
    
    // Populate action data before emitting
    await action.populate('user', 'username');
    await action.populate('taskId', 'title');
    
    // Emit socket event
    req.app.get('io').emit('taskUpdated', task);
    req.app.get('io').emit('actionLogged', action);
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Smart assign
router.post('/:id/smart-assign', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Get all users
    const users = await User.find();
    
    // Count active tasks for each user
    const userTaskCounts = await Promise.all(
      users.map(async (user) => {
        const activeTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: { $ne: 'Done' }
        });
        
        return {
          userId: user._id,
          username: user.username,
          activeTasks
        };
      })
    );
    
    // Find user with fewest active tasks
    const userWithFewestTasks = userTaskCounts.reduce(
      (min, user) => (user.activeTasks < min.activeTasks ? user : min),
      userTaskCounts[0]
    );
    
    // Assign task to user with fewest tasks
    task.assignedTo = userWithFewestTasks.userId;
    task.lastEditedBy = req.user.userId;
    task.lastEditedAt = Date.now();
    
    await task.save();
    
    // Log action
    const action = new Action({
      user: req.user.userId,
      taskId: task._id,
      actionType: 'assign',
      details: {
        task: task.title,
        assignedTo: userWithFewestTasks.username,
        smartAssign: true
      }
    });
    
    await action.save();
    
    // Populate user data for task
    await task.populate('assignedTo', 'username');
    await task.populate('createdBy', 'username');
    await task.populate('lastEditedBy', 'username');
    
    // Populate action data before emitting
    await action.populate('user', 'username');
    await action.populate('taskId', 'title');
    
    // Emit socket event
    req.app.get('io').emit('taskUpdated', task);
    req.app.get('io').emit('actionLogged', action);
    
    res.json({
      task,
      message: `Task assigned to ${userWithFewestTasks.username} (${userWithFewestTasks.activeTasks} active tasks)`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;