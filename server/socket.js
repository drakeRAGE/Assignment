const User = require('./models/User');

module.exports = (io) => {
  // Store active users
  const activeUsers = new Map();
  
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Store io instance in app for use in routes
    // socket.app.set('io', io);
    
    // User login
    socket.on('userLogin', async (userData) => {
      try {
        const user = await User.findById(userData.userId);
        if (user) {
          // Add user to active users
          activeUsers.set(socket.id, {
            userId: user._id,
            username: user.username
          });
          
          // Broadcast user joined
          io.emit('userJoined', {
            userId: user._id,
            username: user.username
          });
          
          // Send active users list to the new user
          const usersList = Array.from(activeUsers.values());
          socket.emit('activeUsers', usersList);
        }
      } catch (error) {
        console.error('Socket error:', error);
      }
    });
    
    // User starts editing a task
    socket.on('startEditing', (taskId) => {
      const user = activeUsers.get(socket.id);
      if (user) {
        socket.broadcast.emit('taskLocked', {
          taskId,
          user
        });
      }
    });
    
    // User stops editing a task
    socket.on('stopEditing', (taskId) => {
      socket.broadcast.emit('taskUnlocked', { taskId });
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Get user before removing
      const user = activeUsers.get(socket.id);
      
      // Remove from active users
      activeUsers.delete(socket.id);
      
      // Broadcast user left
      if (user) {
        io.emit('userLeft', user);
      }
    });
  });
};