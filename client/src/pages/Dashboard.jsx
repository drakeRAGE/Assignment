import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import Navbar from '../components/Navbar'
import TaskColumn from '../components/TaskColumn'
import TaskModal from '../components/TaskModal'
import ActivityLog from '../components/ActivityLog'
import ConflictModal from '../components/ConflictModal'

const Dashboard = () => {
  const [tasks, setTasks] = useState([])
  const [actions, setActions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [conflict, setConflict] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const { currentUser } = useAuth()
  const { socket } = useSocket()

  // Fetch tasks and actions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, actionsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tasks'),
          axios.get('http://localhost:5000/api/actions/recent')
        ])

        setTasks(tasksRes.data)
        setActions(actionsRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [setTasks])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    // Task events
    socket.on('taskCreated', (task) => {
      setTasks((prev) => [task, ...prev])
    })

    socket.on('taskUpdated', (updatedTask) => {
      setTasks((prev) =>
        prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
      )
    })

    socket.on('taskDeleted', (taskId) => {
      setTasks((prev) => prev.filter((task) => task._id !== taskId))
    })

    // Action events
    socket.on('actionLogged', (action) => {
      setActions((prev) => [action, ...prev.slice(0, 19)])
    })

    // Task editing events
    socket.on('taskLocked', ({ taskId, user }) => {
      if (user.userId !== currentUser.id) {
        setTasks((prev) =>
          prev.map((task) =>
            task._id === taskId
              ? { ...task, isBeingEdited: true, editingBy: user.userId }
              : task
          )
        )
      }
    })

    socket.on('taskUnlocked', ({ taskId }) => {
      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId
            ? { ...task, isBeingEdited: false, editingBy: null }
            : task
        )
      )
    })

    return () => {
      socket.off('taskCreated')
      socket.off('taskUpdated')
      socket.off('taskDeleted')
      socket.off('actionLogged')
      socket.off('taskLocked')
      socket.off('taskUnlocked')
    }
  }, [socket, currentUser])

  // Handle drag start
  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.setData('taskId', task._id)
  }

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Handle drop
  const handleDrop = async (e, newStatus) => {
    e.preventDefault()

    if (!draggedTask || draggedTask.status === newStatus) {
      return
    }

    // Update task status
    try {
      const updatedTask = {
        ...draggedTask,
        status: newStatus
      }

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === draggedTask._id ? updatedTask : t))
      )

      // Send update to server
      await axios.put(`http://localhost:5000/api/tasks/${draggedTask._id}`, updatedTask)
    } catch (error) {
      console.error('Error updating task status:', error)

      // If there's a conflict
      if (error.response?.status === 409) {
        setConflict({
          yourVersion: draggedTask,
          serverVersion: error.response.data.currentVersion
        })
      } else {
        // Revert optimistic update
        setTasks((prev) =>
          prev.map((t) => (t._id === draggedTask._id ? draggedTask : t))
        )
      }
    } finally {
      setDraggedTask(null)
    }
  }

  // Open task modal
  const handleOpenModal = (task = null) => {
    if (task) {
      // Check if task is being edited by someone else
      if (task.isBeingEdited && task.editingBy !== currentUser.id) {
        alert('This task is currently being edited by another user')
        return
      }

      // Lock task for editing
      socket.emit('startEditing', task._id)
      axios.post(`http://localhost:5000/api/tasks/${task._id}/start-editing`)
    }

    setCurrentTask(task)
    setIsModalOpen(true)
  }

  // Close task modal
  const handleCloseModal = () => {
    if (currentTask) {
      // Unlock task
      socket.emit('stopEditing', currentTask._id)
      axios.post(`http://localhost:5000/api/tasks/${currentTask._id}/cancel-editing`)
    }

    setCurrentTask(null)
    setIsModalOpen(false)
  }

  // Handle task creation/update
  const handleSaveTask = async (taskData) => {
    try {
      if (currentTask) {
        // Update existing task
        const response = await axios.put(
          `http://localhost:5000/api/tasks/${currentTask._id}`,
          taskData
        )

        setTasks((prev) =>
          prev.map((task) =>
            task._id === currentTask._id ? response.data : task
          )
        )
      } else {
        // Create new task
        const response = await axios.post(
          'http://localhost:5000/api/tasks',
          taskData
        )

        setTasks((prev) => [response.data, ...prev])
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error saving task:', error)

      // If there's a conflict
      if (error.response?.status === 409) {
        setConflict({
          yourVersion: { ...currentTask, ...taskData },
          serverVersion: error.response.data.currentVersion
        })
        handleCloseModal()
      } else {
        alert(`Error: ${error.response?.data?.message || 'Something went wrong'}`)
      }
    }
  }

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`)
      setTasks((prev) => prev.filter((task) => task._id !== taskId))
      handleCloseModal()
    } catch (error) {
      console.error('Error deleting task:', error)
      alert(`Error: ${error.response?.data?.message || 'Something went wrong'}`)
    }
  }

  // Handle conflict resolution
  const handleResolveConflict = async (resolution, resolvedData) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${resolvedData._id}/resolve-conflict`,
        {
          resolution,
          task: resolvedData
        }
      )

      setTasks((prev) =>
        prev.map((task) => (task._id === resolvedData._id ? response.data : task))
      )

      setConflict(null)
    } catch (error) {
      console.error('Error resolving conflict:', error)
      alert(`Error: ${error.response?.data?.message || 'Something went wrong'}`)
      setConflict(null)
    }
  }

  // Handle smart assignment
  const handleSmartAssign = async (taskId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/tasks/${taskId}/smart-assign`
      )

      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? response.data : task))
      )
    } catch (error) {
      console.error('Error with smart assignment:', error)
      alert(`Error: ${error.response?.data?.message || 'Something went wrong'}`)
    }
  }

  // Filter tasks by status
  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Task Dashboard</h1>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-white text-purple-600 rounded-md shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Add New Task
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <TaskColumn
            title="Todo"
            tasks={getTasksByStatus('Todo')}
            onTaskClick={handleOpenModal}
            onSmartAssign={handleSmartAssign}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
          <TaskColumn
            title="In Progress"
            tasks={getTasksByStatus('In Progress')}
            onTaskClick={handleOpenModal}
            onSmartAssign={handleSmartAssign}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
          <TaskColumn
            title="Done"
            tasks={getTasksByStatus('Done')}
            onTaskClick={handleOpenModal}
            onSmartAssign={handleSmartAssign}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        </div>

        <div className="bg-white bg-opacity-10 p-4 rounded-lg shadow-md">
          <ActivityLog actions={actions} />
        </div>
      </div>

      {isModalOpen && (
        <TaskModal
          task={currentTask}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}

      {conflict && (
        <ConflictModal
          yourVersion={conflict.yourVersion}
          serverVersion={conflict.serverVersion}
          onResolve={handleResolveConflict}
          onCancel={() => setConflict(null)}
        />
      )}
    </div>
  )
}

export default Dashboard