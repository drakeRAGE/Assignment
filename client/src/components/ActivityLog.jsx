import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

const ActivityLog = ({ actions }) => {
    if (!actions || actions.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <p className="text-gray-500 text-center">No recent activity</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {actions.map((action) => (
                    <div key={action._id} className="border-b pb-2">
                        <div className="flex justify-between items-start">
                            <span className="font-medium">{action.user?.username || 'Unknown user'}</span>
                            <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            {getActionDescription(action)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Helper function to generate human-readable action descriptions
const getActionDescription = (action) => {
    // Get task title from either taskId.title, details.task, or fallback
    const taskTitle = action.taskId?.title || action.details?.task || 'a task';
    const username = action.user?.username || 'Unknown user';

    switch (action.actionType) {
        case 'create':
            return `Created task "${taskTitle}"`;
        case 'update':
            return `Updated task "${taskTitle}"`;
        case 'delete':
            return `Deleted task "${taskTitle}"`;
        case 'assign':
            return `Assigned task "${taskTitle}" to ${action.details?.assignee || 'someone'}`;
        case 'move':
            return `Moved task "${taskTitle}" to ${action.details?.newStatus || 'a different status'}`;
        case 'resolve_conflict':
            return `Resolved a conflict on task "${taskTitle}"`;
        default:
            return `Performed action on task "${taskTitle}"`;
    }
}

export default ActivityLog