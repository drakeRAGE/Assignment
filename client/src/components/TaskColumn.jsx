const TaskColumn = ({ title, tasks, onTaskClick, onSmartAssign, onDragStart, onDragOver, onDrop }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-purple-600 p-3">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
            </div>

            <div 
                className="p-3 min-h-[300px]"
                onDragOver={(e) => {
                    e.preventDefault()
                    onDragOver && onDragOver(e, title)
                }}
                onDrop={(e) => {
                    e.preventDefault()
                    onDrop && onDrop(e, title)
                }}
            >
                {tasks.length === 0 ? (
                    <div className="text-center text-gray-500 mt-4">
                        No tasks in this column
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task._id}
                            draggable
                            onDragStart={(e) => onDragStart && onDragStart(e, task)}
                            className="bg-gray-50 p-3 mb-2 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-move"
                            onClick={() => onTaskClick(task)}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="font-medium">{task.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                    }`}>
                                    {task.priority}
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {task.description}
                            </p>

                            <div className="flex justify-between items-center mt-3">
                                <div className="text-xs text-gray-500">
                                    {task.assignedTo ? (
                                        <span>Assigned to: {task.assignedTo.username}</span>
                                    ) : (
                                        <span>Unassigned</span>
                                    )}
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onSmartAssign(task._id)
                                    }}
                                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                                >
                                    Smart Assign
                                </button>
                            </div>

                            {task.isBeingEdited && (
                                <div className="mt-2 text-xs text-orange-500">
                                    Currently being edited
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default TaskColumn