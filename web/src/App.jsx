import { BrowserRouter as Router, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Rotas from './rotas'
import './App.css'
import './styles/global.css'
import './styles/theme.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])
  return null
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <Rotas />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
