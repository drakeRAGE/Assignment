import { useState } from 'react'

const ConflictModal = ({ yourVersion, serverVersion, onResolve, onCancel }) => {
    const [resolution, setResolution] = useState('merge')
    const [mergedData, setMergedData] = useState({
        title: serverVersion.title,
        description: serverVersion.description,
        status: serverVersion.status,
        priority: serverVersion.priority,
        assignedTo: serverVersion.assignedTo
    })

    const handleInputChange = (field, value) => {
        setMergedData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleResolve = () => {
        if (resolution === 'yours') {
            onResolve('yours', yourVersion)
        } else if (resolution === 'server') {
            onResolve('server', serverVersion)
        } else {
            onResolve('merge', mergedData)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
                <div className="bg-red-600 text-white px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-semibold">Conflict Detected</h2>
                    <p className="text-sm">This task was modified by another user while you were editing it</p>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <div className="flex space-x-4 mb-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="resolution"
                                    value="yours"
                                    checked={resolution === 'yours'}
                                    onChange={() => setResolution('yours')}
                                    className="mr-2"
                                />
                                Use your version
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="resolution"
                                    value="server"
                                    checked={resolution === 'server'}
                                    onChange={() => setResolution('server')}
                                    className="mr-2"
                                />
                                Use server version
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="resolution"
                                    value="merge"
                                    checked={resolution === 'merge'}
                                    onChange={() => setResolution('merge')}
                                    className="mr-2"
                                />
                                Merge changes
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium mb-2 text-purple-700">Your Version</h3>
                                <div className="border rounded-md p-4 bg-purple-50">
                                    <p><strong>Title:</strong> {yourVersion.title}</p>
                                    <p><strong>Description:</strong> {yourVersion.description}</p>
                                    <p><strong>Status:</strong> {yourVersion.status}</p>
                                    <p><strong>Priority:</strong> {yourVersion.priority}</p>
                                    <p><strong>Assigned To:</strong> {yourVersion.assignedTo?.username || 'Unassigned'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2 text-blue-700">Server Version</h3>
                                <div className="border rounded-md p-4 bg-blue-50">
                                    <p><strong>Title:</strong> {serverVersion.title}</p>
                                    <p><strong>Description:</strong> {serverVersion.description}</p>
                                    <p><strong>Status:</strong> {serverVersion.status}</p>
                                    <p><strong>Priority:</strong> {serverVersion.priority}</p>
                                    <p><strong>Assigned To:</strong> {serverVersion.assignedTo?.username || 'Unassigned'}</p>
                                    <p><strong>Last Edited By:</strong> {serverVersion.lastEditedBy?.username || 'Unknown'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {resolution === 'merge' && (
                        <div className="mt-6 border-t pt-4">
                            <h3 className="font-medium mb-4">Merge Changes</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title
                                    </label>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleInputChange('title', yourVersion.title)}
                                            className={`px-2 py-1 text-xs rounded ${mergedData.title === yourVersion.title ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                                        >
                                            Yours
                                        </button>
                                        <button
                                            onClick={() => handleInputChange('title', serverVersion.title)}
                                            className={`px-2 py-1 text-xs rounded ${mergedData.title === serverVersion.title ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                                        >
                                            Server
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={mergedData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleInputChange('description', yourVersion.description)}
                                            className={`px-2 py-1 text-xs rounded ${mergedData.description === yourVersion.description ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                                        >
                                            Yours
                                        </button>
                                        <button
                                            onClick={() => handleInputChange('description', serverVersion.description)}
                                            className={`px-2 py-1 text-xs rounded ${mergedData.description === serverVersion.description ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                                        >
                                            Server
                                        </button>
                                    </div>
                                    <textarea
                                        value={mergedData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                        rows="3"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleInputChange('status', yourVersion.status)}
                                                className={`px-2 py-1 text-xs rounded ${mergedData.status === yourVersion.status ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                                            >
                                                Yours
                                            </button>
                                            <button
                                                onClick={() => handleInputChange('status', serverVersion.status)}
                                                className={`px-2 py-1 text-xs rounded ${mergedData.status === serverVersion.status ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                                            >
                                                Server
                                            </button>
                                        </div>
                                        <select
                                            value={mergedData.status}
                                            onChange={(e) => handleInputChange('status', e.target.value)}
                                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="Todo">Todo</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Priority
                                        </label>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleInputChange('priority', yourVersion.priority)}
                                                className={`px-2 py-1 text-xs rounded ${mergedData.priority === yourVersion.priority ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                                            >
                                                Yours
                                            </button>
                                            <button
                                                onClick={() => handleInputChange('priority', serverVersion.priority)}
                                                className={`px-2 py-1 text-xs rounded ${mergedData.priority === serverVersion.priority ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                                            >
                                                Server
                                            </button>
                                        </div>
                                        <select
                                            value={mergedData.priority}
                                            onChange={(e) => handleInputChange('priority', e.target.value)}
                                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleResolve}
                            className="px-4 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                            Resolve Conflict
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConflictModal