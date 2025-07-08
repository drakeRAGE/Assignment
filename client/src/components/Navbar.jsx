import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Link } from 'react-router-dom'

const Navbar = () => {
    const { currentUser, logout } = useAuth()
    const { darkMode, toggleTheme } = useTheme()

    return (
        <nav className={`${darkMode ? 'bg-gray-800' : 'bg-purple-700'} shadow-md`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-white text-xl font-bold">CollabTodo</span>
                        <div className="ml-10 flex space-x-4">
                            <Link to="/dashboard" className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium">
                                Dashboard
                            </Link>
                            <Link to="/stats" className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium">
                                Stats
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={toggleTheme}
                            className="mr-4 p-2 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                        >
                            {darkMode ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </button>
                        <span className="text-white mr-4">
                            Welcome, {currentUser?.username}
                        </span>
                        <button
                            onClick={logout}
                            className={`px-3 py-1 text-sm text-white ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-purple-800 hover:bg-purple-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar