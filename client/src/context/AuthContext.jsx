import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')

        if (token && user) {
            setCurrentUser(JSON.parse(user))
            setIsAuthenticated(true)
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }

        setLoading(false)
    }, [])

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            })

            const { token, user } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            setCurrentUser(user)
            setIsAuthenticated(true)
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

            return { success: true }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            }
        }
    }

    const register = async (username, email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                username,
                email,
                password
            })

            const { token, user } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            setCurrentUser(user)
            setIsAuthenticated(true)
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

            return { success: true }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        setCurrentUser(null)
        setIsAuthenticated(false)
        delete axios.defaults.headers.common['Authorization']
    }

    const value = {
        currentUser,
        isAuthenticated,
        loading,
        login,
        register,
        logout
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}