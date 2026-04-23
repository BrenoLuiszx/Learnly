import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Rotas from './rotas'
import './App.css'
import './styles/global.css'
import './styles/theme.css'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Rotas />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
