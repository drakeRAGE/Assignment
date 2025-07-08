import { createContext, useState, useContext, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        // Check if user has a theme preference in localStorage
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme === 'dark') {
            setDarkMode(true)
            document.documentElement.classList.add('dark')
        }
    }, [])

    const toggleTheme = () => {
        setDarkMode(prevMode => {
            const newMode = !prevMode
            localStorage.setItem('theme', newMode ? 'dark' : 'light')
            
            if (newMode) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
            
            return newMode
        })
    }

    const value = {
        darkMode,
        toggleTheme
    }

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}