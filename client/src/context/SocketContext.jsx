import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null)
    const [activeUsers, setActiveUsers] = useState([])
    const { currentUser, isAuthenticated } = useAuth()

    useEffect(() => {
        if (isAuthenticated && currentUser) {
            // Connect to socket server
            const newSocket = io('http://localhost:5000')
            setSocket(newSocket)

            // Emit login event
            newSocket.emit('userLogin', {
                userId: currentUser.id,
                username: currentUser.username
            })

            // Listen for active users
            newSocket.on('activeUsers', (users) => {
                setActiveUsers(users)
            })

            // Listen for user joined
            newSocket.on('userJoined', (user) => {
                setActiveUsers((prev) => {
                    if (!prev.find((u) => u.userId === user.userId)) {
                        return [...prev, user]
                    }
                    return prev
                })
            })

            // Listen for user left
            newSocket.on('userLeft', (user) => {
                setActiveUsers((prev) => prev.filter((u) => u.userId !== user.userId))
            })

            return () => {
                newSocket.disconnect()
            }
        }
    }, [isAuthenticated, currentUser])

    const value = {
        socket,
        activeUsers
    }

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}