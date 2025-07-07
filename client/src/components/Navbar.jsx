import { useAuth } from '../context/AuthContext'

const Navbar = () => {
    const { currentUser, logout } = useAuth()

    return (
        <nav className="bg-purple-700 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-white text-xl font-bold">CollabTodo</span>
                    </div>

                    <div className="flex items-center">
                        <span className="text-white mr-4">
                            Welcome, {currentUser?.username}
                        </span>
                        <button
                            onClick={logout}
                            className="px-3 py-1 text-sm text-white bg-purple-800 rounded-md hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
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