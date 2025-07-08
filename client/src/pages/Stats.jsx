import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/Navbar'
import axios from 'axios'

const Stats = () => {
    const [tasks, setTasks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { currentUser } = useAuth()
    const { darkMode } = useTheme()

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/tasks')
                setTasks(response.data)
            } catch (error) {
                console.error('Error fetching tasks:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTasks()
    }, [])

    // Calculate statistics
    const userTasks = tasks.filter(task => task.createdBy?._id === currentUser?.id)
    const totalTasks = tasks.length
    const userTasksCount = userTasks.length
    
    const completedUserTasks = userTasks.filter(task => task.status === 'Done').length
    const pendingUserTasks = userTasks.filter(task => task.status !== 'Done').length
    const overdueUserTasks = 0 // You could implement this with due dates if needed
    
    const completionRate = userTasksCount > 0 ? Math.round((completedUserTasks / userTasksCount) * 100) : 0
    
    // Priority counts for chart
    const highPriorityTasks = userTasks.filter(task => task.priority === 'High').length
    const mediumPriorityTasks = userTasks.filter(task => task.priority === 'Medium').length
    const lowPriorityTasks = userTasks.filter(task => task.priority === 'Low').length

    if (isLoading) {
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className={`text-xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>Loading...</div>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Your Task Statistics</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Summary Cards */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Task Summary</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Total Tasks Created by You</span>
                                <span className="font-semibold text-lg">{userTasksCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Completed Tasks</span>
                                <span className="font-semibold text-lg">{completedUserTasks}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Pending Tasks</span>
                                <span className="font-semibold text-lg">{pendingUserTasks}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Overdue Tasks</span>
                                <span className="font-semibold text-lg">{overdueUserTasks}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Completion Rate</span>
                                <span className="font-semibold text-lg">{completionRate}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Priority Distribution Chart */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Task Priority Distribution</h2>
                        <div className="flex justify-center items-center h-64">
                            {/* Simple Donut Chart */}
                            <div className="relative w-48 h-48">
                                {/* Render segments only if there are tasks */}
                                {userTasksCount > 0 ? (
                                    <>
                                        {/* High Priority Segment */}
                                        <div 
                                            className="absolute inset-0 rounded-full" 
                                            style={{
                                                background: `conic-gradient(#ef4444 0%, #ef4444 ${(highPriorityTasks / userTasksCount) * 100}%, transparent ${(highPriorityTasks / userTasksCount) * 100}%)`,
                                                clipPath: 'circle(50%)',
                                            }}
                                        />
                                        {/* Medium Priority Segment */}
                                        <div 
                                            className="absolute inset-0 rounded-full" 
                                            style={{
                                                background: `conic-gradient(transparent 0%, transparent ${(highPriorityTasks / userTasksCount) * 100}%, #f59e0b ${(highPriorityTasks / userTasksCount) * 100}%, #f59e0b ${((highPriorityTasks + mediumPriorityTasks) / userTasksCount) * 100}%, transparent ${((highPriorityTasks + mediumPriorityTasks) / userTasksCount) * 100}%)`,
                                                clipPath: 'circle(50%)',
                                            }}
                                        />
                                        {/* Low Priority Segment */}
                                        <div 
                                            className="absolute inset-0 rounded-full" 
                                            style={{
                                                background: `conic-gradient(transparent 0%, transparent ${((highPriorityTasks + mediumPriorityTasks) / userTasksCount) * 100}%, #22c55e ${((highPriorityTasks + mediumPriorityTasks) / userTasksCount) * 100}%, #22c55e 100%)`,
                                                clipPath: 'circle(50%)',
                                            }}
                                        />
                                        {/* Inner Circle for Donut Effect */}
                                        <div className={`absolute rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ inset: '25%' }}></div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No tasks created yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="flex justify-center space-x-6 mt-4">
                            <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>High ({highPriorityTasks})</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Medium ({mediumPriorityTasks})</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Low ({lowPriorityTasks})</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Task Status Distribution */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Status Distribution</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Todo</span>
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                        {userTasks.filter(task => task.status === 'Todo').length} tasks
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                        className="bg-blue-600 h-2.5 rounded-full" 
                                        style={{ width: `${userTasksCount > 0 ? (userTasks.filter(task => task.status === 'Todo').length / userTasksCount) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>In Progress</span>
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                        {userTasks.filter(task => task.status === 'In Progress').length} tasks
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                        className="bg-purple-600 h-2.5 rounded-full" 
                                        style={{ width: `${userTasksCount > 0 ? (userTasks.filter(task => task.status === 'In Progress').length / userTasksCount) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Done</span>
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                        {userTasks.filter(task => task.status === 'Done').length} tasks
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                        className="bg-green-600 h-2.5 rounded-full" 
                                        style={{ width: `${userTasksCount > 0 ? (userTasks.filter(task => task.status === 'Done').length / userTasksCount) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task Creation Comparison */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Your Contribution</h2>
                        <div className="flex flex-col items-center justify-center h-40">
                            <div className="relative w-full h-40">
                                <div className="absolute bottom-0 left-0 w-1/2 bg-purple-500 rounded-t-lg" style={{ height: `${totalTasks > 0 ? (userTasksCount / totalTasks) * 100 : 0}%` }}></div>
                                <div className="absolute bottom-0 right-0 w-1/2 bg-gray-400 rounded-t-lg" style={{ height: `${totalTasks > 0 ? ((totalTasks - userTasksCount) / totalTasks) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div className="flex justify-around mt-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>You ({userTasksCount})</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Others ({totalTasks - userTasksCount})</span>
                            </div>
                        </div>
                    </div>

                    {/* Completion Rate */}
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Completion Rate</h2>
                        <div className="flex justify-center items-center h-40">
                            <div className="relative w-36 h-36">
                                {/* Circle background */}
                                <div className="absolute inset-0 rounded-full bg-gray-200"></div>
                                {/* Progress circle */}
                                <div 
                                    className="absolute inset-0 rounded-full" 
                                    style={{
                                        background: `conic-gradient(#8b5cf6 0%, #8b5cf6 ${completionRate}%, transparent ${completionRate}%)`,
                                        clipPath: 'circle(50%)',
                                    }}
                                />
                                {/* Inner circle for donut effect */}
                                <div className={`absolute rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ inset: '20%' }}></div>
                                {/* Percentage text */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold">{completionRate}%</span>
                                </div>
                            </div>
                        </div>
                        <p className={`text-center mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {completionRate < 30 ? 'Keep going!' : completionRate < 70 ? 'Good progress!' : 'Excellent work!'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Stats